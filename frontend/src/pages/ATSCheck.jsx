import React, { useState, useEffect, useRef } from "react";
import { 
  UploadCloud, FileText, Trash2, CheckCircle, 
  AlertTriangle, X, Loader2, BarChart3, TrendingUp 
} from "lucide-react";

const API = "http://localhost:3000/api/jobs";

const ATSCheck = () => {
  // State
  const [resumes, setResumes] = useState([]);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzingId, setAnalyzingId] = useState(null);
  
  // ATS Result State
  const [atsResult, setAtsResult] = useState(null);

  const fileInputRef = useRef(null);
  const token = localStorage.getItem("token");

  // --- 1. FETCH RESUMES ---
  useEffect(() => {
    if (!token) return;
    fetch(`${API}/resume`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : [])
      .then(data => setResumes(Array.isArray(data) ? data : []));
  }, [token]);

  // --- 2. UPLOAD HANDLER (Reused logic) ---
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

      setResumes(prev => [data, ...prev]);
      setResumeFile(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  // --- 3. CALCULATE ATS SCORE HANDLER ---
  const handleCheckATS = async (resumeId) => {
    try {
      setAnalyzingId(resumeId);
      setAtsResult(null); // Clear previous result
      
      const res = await fetch(`${API}/resume/${resumeId}/ats`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      setAtsResult(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setAnalyzingId(null);
    }
  };

  // --- 4. DELETE HANDLER ---
  const handleDelete = async (resumeId) => {
    if (!window.confirm("Delete this resume?")) return;
    await fetch(`${API}/resume/${resumeId}`, { 
        method: "DELETE", 
        headers: { Authorization: `Bearer ${token}` } 
    });
    setResumes(prev => prev.filter(r => r._id !== resumeId));
  };

  // --- UI COMPONENTS ---
  
  // Score Color Helper
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 border-green-500";
    if (score >= 50) return "text-yellow-600 border-yellow-500";
    return "text-red-600 border-red-500";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            ATS Score <span className="text-purple-600">Checker</span>
          </h1>
          <p className="text-gray-500">Optimize your resume to pass the bots and get hired.</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: MANAGING RESUMES (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* UPLOAD CARD */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-purple-600" /> Upload New
              </h3>
              
              <div 
                onClick={() => fileInputRef.current.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept=".pdf" 
                  className="hidden" 
                  onChange={(e) => setResumeFile(e.target.files[0])} 
                />
                
                {resumeFile ? (
                  <div className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
                    <span className="text-sm font-medium text-purple-700 truncate
                     max-w-37.5">
                        {resumeFile.name}
                    </span>
                    <X className="w-4 h-4 text-purple-500 hover:text-red-500" onClick={(e) => {e.stopPropagation(); setResumeFile(null)}}/>
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">
                    <p>Click to select PDF</p>
                  </div>
                )}
              </div>

              <button 
                onClick={handleUpload}
                disabled={!resumeFile || uploading}
                className="w-full mt-4 bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {uploading ? "Uploading..." : "Add to List"}
              </button>
            </div>

            {/* RESUME LIST */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-125 overflow-y-auto">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" /> Select Resume
              </h3>
              
              <div className="space-y-3">
                {resumes.map(resume => (
                  <div key={resume._id} className="p-4 border rounded-xl bg-gray-50 hover:border-purple-300 transition-all">
                    <p className="font-semibold text-gray-800 truncate mb-2">{resume.fileName}</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleCheckATS(resume._id)}
                        disabled={analyzingId === resume._id}
                        className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 flex justify-center items-center gap-2"
                      >
                         {analyzingId === resume._id ? <Loader2 className="animate-spin w-4 h-4"/> : <BarChart3 className="w-4 h-4"/>}
                         Check Score
                      </button>
                      <button 
                        onClick={() => handleDelete(resume._id)}
                        className="p-2 bg-white border border-red-100 text-red-500 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: RESULTS (8 Cols) */}
          <div className="lg:col-span-8">
            {analyzingId ? (
              // LOADING STATE
              <div className="h-full flex flex-col items-center justify-center bg-white rounded-3xl shadow-xl p-12 animate-pulse">
                <Loader2 className="w-16 h-16 text-purple-600 animate-spin mb-6" />
                <h3 className="text-xl font-bold text-gray-800">Analyzing Resume...</h3>
                <p className="text-gray-500 mt-2">Checking keywords, formatting, and impact.</p>
              </div>
            ) : atsResult ? (
              // RESULT STATE
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-fade-in-up">
                
                {/* Top Banner */}
                <div className="bg-gray-900 text-white p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Analysis Complete</h2>
                    <p className="text-gray-400 max-w-lg">{atsResult.summary}</p>
                  </div>
                  
                  {/* Score Circle */}
                  <div className={`relative w-32 h-32 rounded-full border-8 flex items-center justify-center bg-white ${getScoreColor(atsResult.score)}`}>
                    <div className="text-center">
                      <span className={`text-3xl font-bold ${getScoreColor(atsResult.score).split(' ')[0]}`}>
                        {atsResult.score}
                      </span>
                      <span className="block text-xs text-gray-500 font-bold uppercase">ATS Score</span>
                    </div>
                  </div>
                </div>

                <div className="p-8 grid md:grid-cols-2 gap-8">
                  {/* Strengths */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-green-700 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" /> Strengths
                    </h3>
                    <ul className="space-y-3">
                      {atsResult.strengths.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 bg-green-50 p-3 rounded-lg text-green-900 text-sm">
                          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" /> Improvements Needed
                    </h3>
                    <ul className="space-y-3">
                      {atsResult.weaknesses.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 bg-red-50 p-3 rounded-lg text-red-900 text-sm">
                          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Suggestions Footer */}
                <div className="bg-purple-50 p-8 border-t border-purple-100">
                  <h3 className="text-lg font-bold text-purple-800 flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5" /> Recommended Actions
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {atsResult.suggestions.map((sugg, i) => (
                      <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-purple-100 text-sm text-gray-600">
                        {sugg}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              // EMPTY STATE
              <div className="h-full flex flex-col items-center justify-center bg-white rounded-3xl shadow-lg border border-dashed border-gray-200 p-12 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <BarChart3 className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">No Analysis Yet</h3>
                <p className="text-gray-500 mt-2 max-w-sm">
                  Select a resume from the list on the left and click "Check Score" to see your ATS report here.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ATSCheck;