import express from "express";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import path from "path";

import Role from "./roleModel.js";
import Resume from "./resumeModel.js";
import auth from "./auth.js";

import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* =========================
   MULTER CONFIG (disk storage)
========================= */
// We use process.cwd() to ensure we point to the root 'uploads' folder
const uploadDir = path.join(process.cwd(), "uploads");

// Ensure directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // Sanitize filename to remove spaces if needed, but keeping it simple here
    // Format: userId_timestamp_originalname
    const uniqueName = `${req.userData.userId}_${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Only PDF files are allowed"));
    } else cb(null, true);
  }
});

/* =========================
   HELPER: Read resume buffer
========================= */
function bufferToGenerativePart(buffer, mimeType) {
  if (!buffer) throw new Error("Resume buffer is empty!");
  return { inlineData: { data: buffer.toString("base64"), mimeType } };
}

/* =========================
   GET ALL RESUMES
========================= */
router.get("/resume", auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.userData.userId }).sort({ uploadedAt: -1 });
    res.status(200).json(resumes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch resumes" });
  }
});

/* =========================
   UPLOAD NEW RESUME
========================= */
router.post("/resume", auth, upload.single("resume"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No resume uploaded" });

  try {
    console.log(`[UPLOAD] File saved at: ${req.file.path}`);

    // Create new record
    const resume = await Resume.create({
      userId: req.userData.userId,
      fileName: req.file.originalname, // Display name (e.g., "Sanjay Resume.pdf")
      filePath: req.file.path,         // Full system path
      mimeType: req.file.mimetype
    });

    res.status(201).json(resume);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

/* =========================
   ANALYZE RESUME (Fixed & Robust)
========================= */
router.post("/resume/:id/analyze", auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.userData.userId });
    
    if (!resume) return res.status(404).json({ error: "Resume not found in DB" });

    // --- SMART PATH FINDING LOGIC ---
    let finalPath = resume.filePath;

    // 1. Check if the stored path works immediately
    if (!fs.existsSync(finalPath)) {
      console.log(`[DEBUG] Path from DB not found: ${finalPath}`);
      
      // 2. Fallback: Try to construct the path using the filename inside the 'uploads' folder
      // We extract the generated filename (e.g., "697..._resume.pdf") from the stored path
      const justFileName = path.basename(resume.filePath); 
      const recoveredPath = path.join(process.cwd(), "uploads", justFileName);

      console.log(`[DEBUG] Attempting recovered path: ${recoveredPath}`);

      if (fs.existsSync(recoveredPath)) {
        finalPath = recoveredPath; // Found it!
      } else {
        // 3. Failed: File is truly gone
        console.error(`[ERROR] File missing. Searched at: ${finalPath} AND ${recoveredPath}`);
        
        // Delete the ghost record so the user can't click it again
        await Resume.deleteOne({ _id: resume._id });
        return res.status(400).json({ error: "File missing on server. Record deleted. Please upload again." });
      }
    }
    // --------------------------------

    const buffer = fs.readFileSync(finalPath);
    const resumePart = bufferToGenerativePart(buffer, resume.mimeType);

    // Use a valid model name
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt =
      "Analyze the resume and return ONLY the top 5 suitable job roles as a comma-separated list. Do not add numbering or bullet points.";

    const result = await model.generateContent([prompt, resumePart]);
    const response = await result.response;
    const text = response.text();

    const roles = text ? text.split(",").map(r => r.trim()).filter(Boolean) : [];

    if (roles.length) {
      await Role.findOneAndUpdate(
        { userId: resume.userId },
        { suggestedRoles: roles },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({ suggestedRoles: roles });
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    res.status(500).json({ error: error.message || "Analysis failed" });
  }
});

/* =========================
   DELETE RESUME
========================= */
router.delete("/resume/:id", auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.userData.userId });
    if (!resume) return res.status(404).json({ error: "Resume not found" });

    // Try to find the file using our robust method to delete it
    let fileToDelete = resume.filePath;
    if (!fs.existsSync(fileToDelete)) {
       const justFileName = path.basename(resume.filePath);
       fileToDelete = path.join(process.cwd(), "uploads", justFileName);
    }

    if (fs.existsSync(fileToDelete)) {
        fs.unlinkSync(fileToDelete);
    }
    
    await Resume.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: "Resume deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete resume" });
  }
});

router.post("/search", auth, async (req, res) => {
  const {
    role,
    city = "india",
    country = "IN",
    page = 1,
    date_posted = "all",
    employment_types = "FULLTIME",
    job_requirements = "no_experience"
  } = req.body;

  if (!role) {
    return res.status(400).json({
      error: "Job role is required"
    });
  }

  try {
    // Build search query
    const query = `${role} jobs in ${city}`;

    const url =
      `https://jsearch.p.rapidapi.com/search?` +
      `query=${encodeURIComponent(query)}` +
      `&page=${page}` +
      `&num_pages=${page}` +
      `&country=${country}` +
      `&date_posted=${date_posted}` +
      `&employment_types=${employment_types}` +
      `&job_requirements=${job_requirements}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": process.env.JAPI,
        "x-rapidapi-host": "jsearch.p.rapidapi.com"
      }
    });

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error("JSearch Error:", error);
    res.status(500).json({ error: "Job search failed" });
  }
});

/* =========================
   CHECK ATS SCORE
========================= */
router.post("/resume/:id/ats", auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.userData.userId });
    
    if (!resume) return res.status(404).json({ error: "Resume not found" });

    // --- ROBUST PATH FINDING (Same as before) ---
    let finalPath = resume.filePath;
    if (!fs.existsSync(finalPath)) {
      const justFileName = path.basename(resume.filePath); 
      finalPath = path.join(process.cwd(), "uploads", justFileName);
      if (!fs.existsSync(finalPath)) {
        return res.status(400).json({ error: "File missing on server. Please re-upload." });
      }
    }
    // --------------------------------------------

    const buffer = fs.readFileSync(finalPath);
    const resumePart = bufferToGenerativePart(buffer, resume.mimeType);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // Strict JSON Prompt
    const prompt = `
      Act as a strict Applicant Tracking System (ATS) and professional resume writer. 
      Analyze the attached resume.
      Return a RAW JSON object (do not wrap in markdown or code blocks) with the following structure:
      {
        "score": number (0-100),
        "summary": "A 2 sentence professional summary of the candidate",
        "strengths": ["string", "string", "string"],
        "weaknesses": ["string", "string", "string"],
        "suggestions": ["string", "string", "string"]
      }
    `;

    const result = await model.generateContent([prompt, resumePart]);
    const response = await result.response;
    let text = response.text();

    // Cleanup JSON if Gemini adds markdown formatting
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const analysis = JSON.parse(text);

    res.status(200).json(analysis);
  } catch (error) {
    console.error("ATS Analysis Error:", error);
    res.status(500).json({ error: "Failed to generate ATS score" });
  }
});

/* =========================
   GENERATE COVER LETTER
========================= */
router.post("/generate-cover-letter", auth, async (req, res) => {
  const { jobTitle, company, jobDescription } = req.body;

  try {
    // 1. Find the user's latest resume
    const resume = await Resume.findOne({ userId: req.userData.userId }).sort({ uploadedAt: -1 });
    
    if (!resume) return res.status(404).json({ error: "No resume found. Please upload one first." });

    // 2. Locate the file
    let finalPath = resume.filePath;
    if (!fs.existsSync(finalPath)) {
      const justFileName = path.basename(resume.filePath); 
      finalPath = path.join(process.cwd(), "uploads", justFileName);
      if (!fs.existsSync(finalPath)) {
        return res.status(400).json({ error: "Resume file missing on server." });
      }
    }

    // 3. Prepare for Gemini
    const buffer = fs.readFileSync(finalPath);
    const resumePart = bufferToGenerativePart(buffer, resume.mimeType);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 4. The Magic Prompt
    const prompt = `
      Act as a professional candidate. Write a concise, compelling cover letter for the position of "${jobTitle}" at "${company}".
      
      ${jobDescription ? `Refer to these job requirements: ${jobDescription}` : ""}
      
      Use the attached resume to highlight my relevant skills and experience that match this specific role.
      Keep the tone professional, enthusiastic, and confident. 
      Do not include placeholders like "[Your Name]" or "[Address]" at the top; start directly with "Dear Hiring Manager,".
    `;

    const result = await model.generateContent([prompt, resumePart]);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ coverLetter: text });

  } catch (error) {
    console.error("Cover Letter Error:", error);
    res.status(500).json({ error: "Failed to generate cover letter" });
  }
});

export default router;

