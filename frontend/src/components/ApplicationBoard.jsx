import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { 
  Trash2, ExternalLink, MapPin, Building2, 
  Loader2, Sparkles, X, Copy, Check 
} from "lucide-react";

const API = "http://localhost:3000/api/applications";
const JOB_API = "http://localhost:3000/api/jobs"; // To call the generator
const COLUMNS = ["Saved", "Applied", "Interviewing", "Offer", "Rejected"];

const ApplicationBoard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [copied, setCopied] = useState(false);

  const token = localStorage.getItem("token");

  // --- FETCH DATA ---
  useEffect(() => {
    fetch(API, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        setApplications(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  // --- DRAG END ---
  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { destination, draggableId } = result;
    const updatedApps = applications.map((app) =>
      app._id === draggableId ? { ...app, status: destination.droppableId } : app
    );
    setApplications(updatedApps);
    await fetch(`${API}/${draggableId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: destination.droppableId }),
    });
  };

  // --- DELETE ---
  const handleDelete = async (id) => {
    if (!window.confirm("Remove this application?")) return;
    setApplications((prev) => prev.filter((app) => app._id !== id));
    await fetch(`${API}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  // --- GENERATE COVER LETTER ---
  const handleGenerateLetter = async (app) => {
    setSelectedJob(app);
    setIsModalOpen(true);
    setGenerating(true);
    setCoverLetter("");
    setCopied(false);

    try {
      const res = await fetch(`${JOB_API}/generate-cover-letter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          jobTitle: app.jobTitle,
          company: app.company
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setCoverLetter(data.coverLetter);
    } catch (err) {
      setCoverLetter("Failed to generate. Please ensure you have a resume uploaded.");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- STYLES ---
  const getColumnColor = (status) => {
    switch (status) {
      case "Saved": return "bg-gray-50 border-gray-200";
      case "Applied": return "bg-blue-50/50 border-blue-100";
      case "Interviewing": return "bg-purple-50/50 border-purple-100";
      case "Offer": return "bg-green-50/50 border-green-100";
      case "Rejected": return "bg-red-50/50 border-red-100";
      default: return "bg-gray-50";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Saved": return "bg-gray-200 text-gray-700";
      case "Applied": return "bg-blue-100 text-blue-700";
      case "Interviewing": return "bg-purple-100 text-purple-700";
      case "Offer": return "bg-green-100 text-green-700";
      case "Rejected": return "bg-red-100 text-red-700";
      default: return "bg-gray-100";
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600"/>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden relative">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0 z-10 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Application Tracker</h1>
        <div className="text-xs font-medium bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-100">
           Total: {applications.length}
        </div>
      </div>
      
      {/* Board Area */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto overflow-y-hidden bg-slate-50 p-5">
          <div className="flex h-full gap-5 min-w-full w-max">
            {COLUMNS.map((columnId) => (
              <div key={columnId} className={`w-72 shrink-0 flex flex-col rounded-xl border ${getColumnColor(columnId)} h-full max-h-full transition-colors`}>
                
                <div className="p-3 flex justify-between items-center border-b border-gray-100/50 bg-white/50 rounded-t-xl backdrop-blur-sm">
                  <h2 className={`font-bold uppercase tracking-wider text-[11px] px-2.5 py-1 rounded-md ${getStatusBadge(columnId)}`}>
                      {columnId}
                  </h2>
                  <span className="text-xs font-semibold text-gray-400">
                    {applications.filter(a => a.status === columnId).length}
                  </span>
                </div>

                <Droppable droppableId={columnId}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 p-3 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-200 ${snapshot.isDraggingOver ? "bg-white/50" : ""}`}
                    >
                      {applications
                        .filter((app) => app.status === columnId)
                        .map((app, index) => (
                          <Draggable key={app._id} draggableId={app._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{ ...provided.draggableProps.style }}
                                className={`bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all group relative ${snapshot.isDragging ? "shadow-2xl ring-2 ring-purple-500 rotate-1 scale-105 z-50" : ""}`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-bold text-gray-800 text-sm line-clamp-2 leading-tight">{app.jobTitle}</h3>
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 flex gap-1 bg-white p-1 rounded shadow-sm border border-gray-100">
                                    <button onClick={() => handleDelete(app._id)} className="text-gray-400 hover:text-red-500 p-1" title="Delete">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1.5">
                                  <Building2 className="w-3.5 h-3.5 text-gray-400" /> 
                                  <span className="truncate max-w-45">{app.company}</span>
                                </div>
                                
                                {app.location && (
                                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                                      <MapPin className="w-3.5 h-3.5" /> 
                                      <span className="truncate 
                                      max-w-45">{app.location}</span>
                                  </div>
                                )}

                                <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-1">
                                  <span className="text-[10px] font-medium text-gray-400 uppercase">
                                      {new Date(app.dateApplied).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                  </span>
                                  <div className="flex gap-2">
                                    {/* GENERATE BUTTON */}
                                    <button 
                                      onClick={() => handleGenerateLetter(app)}
                                      className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 p-1 rounded transition-colors"
                                      title="Generate Cover Letter"
                                    >
                                      <Sparkles className="w-3.5 h-3.5" />
                                    </button>
                                    
                                    {app.link && (
                                        <a href={app.link} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 p-1 rounded transition-colors">
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </div>
      </DragDropContext>

      {/* --- COVER LETTER MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI Cover Letter
                </h2>
                <p className="text-sm text-gray-500">
                  For {selectedJob?.jobTitle} at {selectedJob?.company}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
              {generating ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
                  <p className="text-gray-500 font-medium">Reading resume & writing letter...</p>
                </div>
              ) : (
                <textarea 
                  value={coverLetter}
                  readOnly
                  className="w-full h-full min-h-75 p-4 bg-white border border-gray-200 rounded-xl text-gray-700 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-white rounded-b-2xl">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
              <button 
                onClick={copyToClipboard}
                disabled={generating || !coverLetter}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Text"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationBoard;