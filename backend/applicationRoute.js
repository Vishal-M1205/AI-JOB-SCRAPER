import express from "express";
import Application from "./applicationModel.js";
import auth from "./auth.js";

const router = express.Router();

// GET ALL APPLICATIONS
router.get("/", auth, async (req, res) => {
  try {
    const apps = await Application.find({ userId: req.userData.userId });
    res.status(200).json(apps);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// ADD NEW APPLICATION
router.post("/", auth, async (req, res) => {
  try {
    const newApp = await Application.create({
      userId: req.userData.userId,
      ...req.body, // jobTitle, company, etc.
    });
    res.status(201).json(newApp);
  } catch (err) {
    res.status(500).json({ error: "Failed to add application" });
  }
});

// UPDATE STATUS (Drag & Drop)
router.patch("/:id", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const updatedApp = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.userData.userId },
      { status },
      { new: true }
    );
    res.status(200).json(updatedApp);
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

// DELETE APPLICATION
router.delete("/:id", auth, async (req, res) => {
  try {
    await Application.deleteOne({ _id: req.params.id, userId: req.userData.userId });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete" });
  }
});

export default router;