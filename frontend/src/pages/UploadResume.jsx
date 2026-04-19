import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  Sparkles, 
  CheckCircle, 
  X, 
  Loader2,
  LogIn
} from "lucide-react";
const URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/'

const API = `${URL}api/jobs`;

const UploadResume = () => {
  const [resumes, setResumes] = useState([]);
  const [resumeFile, setResumeFile] = useState(null);
  const [loadingId, setLoadingId] = useState(null); // analyze button loading
  const [uploading, setUploading] = useState(false); // upload button loading
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  /* ================================
     VERIFY TOKEN
  ================================ */
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${URL}api/user/verify`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      }
    };
    verifyToken();
  }, [token]);

  /* ================================
     FETCH RESUMES
  ================================ */
  useEffect(() => {
    if (!token) return;
    const fetchResumes = async () => {
      try {
        const res = await fetch(`${API}/resume`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setResumes(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch resumes", err);
      }
    };
    fetchResumes();
  }, [token]);

  /* ================================
     DRAG & DROP HANDLERS
  ================================ */
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setResumeFile(file);
      } else {
        alert("Only PDF files are allowed.");
      }
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  /* ================================
     UPLOAD LOGIC
  ================================ */
  const handleUpload = async () => {
    if (!resumeFile) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("resume", resumeFile);

      const res = await fetch(`${API}/resume`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setResumes((prev) => (Array.isArray(prev) ? [data, ...prev] : [data]));
      setResumeFile(null); // Clear selection after success
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  /* ================================
     ANALYZE LOGIC
  ================================ */
  const handleAnalyze = async (resumeId) => {
    try {
      setLoadingId(resumeId);
      const res = await fetch(`${API}/resume/${resumeId}/analyze`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      localStorage.setItem("allSuggestedRoles", JSON.stringify(data.suggestedRoles));
      localStorage.setItem("selectedRole", data.suggestedRoles[0]);
      navigate("/jobs");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  /* ================================
     DELETE LOGIC
  ================================ */
  const handleDelete = async (resumeId) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;
    try {
      const res = await fetch(`${API}/resume/${resumeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete resume");
      setResumes((prev) => prev.filter((r) => r._id !== resumeId));
    } catch (err) {
      alert(err.message);
    }
  };

  /* ================================
     NOT AUTHENTICATED STATE
  ================================ */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100">
          <div className="mx-auto bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <LogIn className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Restricted</h1>
          <p className="text-gray-500 mb-6">Please login to manage your resumes.</p>
          <Link
            to="/login"
            className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-xl transition-all"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  /* ================================
     MAIN UI
  ================================ */
  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            Resume <span className="text-purple-600">Manager</span>
          </h1>
          <p className="text-gray-500 text-lg">
            Upload your resume and let AI find your perfect job role.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: UPLOAD AREA */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-purple-600" />
                Upload New
              </h2>
              
              {/* Drag & Drop Zone */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer
                  ${dragActive ? "border-purple-500 bg-purple-50" : "border-gray-300 hover:border-purple-400 hover:bg-gray-50"}
                  ${resumeFile ? "bg-purple-50 border-purple-200" : ""}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleChange}
                />

                {!resumeFile ? (
                  <>
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-3">
                      <FileText className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      Click to upload or drag & drop
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PDF only (Max 5MB)</p>
                  </>
                ) : (
                  <div className="w-full">
                    <div className="flex justify-between items-start mb-2">
                      <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                        <FileText className="w-8 h-8 text-red-500" />
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setResumeFile(null); }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 truncate text-left">{resumeFile.name}</p>
                    <p className="text-xs text-gray-500 text-left">Ready to upload</p>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={!resumeFile || uploading}
                className={`w-full mt-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all
                  ${!resumeFile || uploading 
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                    : "bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  }
                `}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Uploading...
                  </>
                ) : (
                  "Upload Resume"
                )}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: RESUME LIST */}
          <div className="md:col-span-2">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 
            min-h-100
            ">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Your Documents
              </h2>

              {resumes.length > 0 ? (
                <div className="space-y-4">
                  {resumes.map((resume) => (
                    <div
                      key={resume._id}
                      className="group p-4 border border-gray-100 rounded-xl bg-gray-50 hover:bg-white hover:border-purple-200 hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="w-10 h-10 
                        shrink-0 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100">
                          <FileText className="w-6 h-6 text-red-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 truncate 
                          max-w-50 sm:max-w-xs">
                            {resume.fileName}
                          </p>
                          <p className="text-xs text-gray-500">
                            Uploaded {new Date(resume.uploadedAt || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                          onClick={() => handleAnalyze(resume._id)}
                          disabled={loadingId === resume._id}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {loadingId === resume._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                          {loadingId === resume._id ? "Analyzing..." : "Analyze"}
                        </button>

                        <button
                          onClick={() => handleDelete(resume._id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Resume"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-gray-100 rounded-xl">
                  <div className="bg-gray-50 p-4 rounded-full mb-3">
                    <FileText className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">No resumes found</p>
                  <p className="text-sm text-gray-400">Upload a PDF to get started</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UploadResume;