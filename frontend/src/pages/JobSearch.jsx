import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Filter, 
  Globe, 
  Clock, 
  ChevronDown, 
  ExternalLink,
  Building2,
  Sparkles,
  Loader2,
  X,
  Plus
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/jobs";

const JobSearch = () => {
  // ===== GEMINI ROLES =====
  const storedRoles = JSON.parse(localStorage.getItem("allSuggestedRoles")) || [];

  // ===== STATE =====
  const [selectedRole, setSelectedRole] = useState(storedRoles[0] || "");
  const [customRole, setCustomRole] = useState("");
  const [selectedCity, setSelectedCity] = useState("Bangalore");
  const [customCity, setCustomCity] = useState("");
  
  // Filters
  const [country, setCountry] = useState("IN");
  const [employmentType, setEmploymentType] = useState("FULLTIME");
  const [jobRequirement, setJobRequirement] = useState("no_experience");
  const [datePosted, setDatePosted] = useState("all");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Results
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Derived values
  const role = customRole.trim() || selectedRole;
  const city = customCity.trim() || selectedCity;

  // ===== SEARCH HANDLER =====
  const handleSearch = async () => {
    if (!role) {
      setError("Please select or enter a job role.");
      return;
    }

    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          role,
          city,
          country,
          page,
          date_posted: datePosted,
          employment_types: employmentType,
          job_requirements: jobRequirement
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Job search failed");
      setJobs(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
   
  const handleSaveJob = async (job) => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}api/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        jobTitle: job.job_title,
        company: job.employer_name,
        location: `${job.job_city}, ${job.job_country}`,
        link: job.job_apply_link,
        status: "Saved", // Default status
      }),
    });

    if (res.ok) {
      alert("Job saved to your tracker!");
    } else {
      alert("Failed to save job");
    }
  } catch (error) {
    console.error(error);
  }
};
  // Trigger search on mount if we have a role
  useEffect(() => {
    if (storedRoles.length > 0 && !hasSearched) {
      handleSearch();
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden">
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] 
        w-125 h-125 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-125 h-125 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        
        {/* ===== HEADER SECTION ===== */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Job <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-indigo-600">Discovery</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">Found {jobs.length} opportunities for you</p>
          </div>
          <Link to="/" className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors">
            Back to Home
          </Link>
        </div>

        {/* ===== SEARCH BAR CARD ===== */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-purple-500 via-pink-500 to-orange-500"></div>
          
          <div className="grid lg:grid-cols-12 gap-4 items-end">
            
            {/* Role Input */}
            <div className="lg:col-span-4 relative group">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">What</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                <div className="relative">
                   <select 
                    value={selectedRole} 
                    onChange={(e) => { setSelectedRole(e.target.value); setCustomRole(""); }}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none appearance-none transition-all font-medium text-gray-800"
                   >
                     {storedRoles.length > 0 ? storedRoles.map((r, i) => <option key={i} value={r}>{r}</option>) : <option>Software Engineer</option>}
                     <option value="">Custom Role...</option>
                   </select>
                   <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                {selectedRole === "" && (
                  <input 
                    type="text" 
                    placeholder="Type role (e.g. Designer)"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    className="absolute inset-0 w-full pl-10 pr-4 py-3 bg-white border border-purple-500 rounded-xl focus:ring-2 focus:ring-purple-500/20 outline-none"
                    autoFocus
                  />
                )}
              </div>
            </div>

            {/* Location Input */}
            <div className="lg:col-span-3 relative group">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Where</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                <input
                  type="text"
                  value={customCity || (selectedCity !== "custom" ? selectedCity : "")}
                  onChange={(e) => { setCustomCity(e.target.value); setSelectedCity("custom"); }}
                  placeholder="City, State"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-medium text-gray-800 capitalize"
                />
              </div>
            </div>

            {/* Country Dropdown */}
            <div className="lg:col-span-2 relative">
               <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Country</label>
               <div className="relative">
                 <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                 <select 
                   value={country} 
                   onChange={(e) => setCountry(e.target.value)}
                   className="w-full pl-10 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none appearance-none font-medium text-gray-800"
                 >
                   <option value="US">USA</option>
                   <option value="IN">India</option>
                   <option value="GB">UK</option>
                   <option value="CA">Canada</option>
                   <option value="AU">Australia</option>
                 </select>
                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
               </div>
            </div>

            {/* Search Button */}
            <div className="lg:col-span-3 flex gap-2">
               <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-xl border transition-all flex items-center justify-center ${showFilters ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
               >
                 <Filter className="w-5 h-5" />
               </button>
               <button 
                onClick={handleSearch}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
               >
                 {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
                 Search Jobs
               </button>
            </div>
          </div>

          {/* Collapsible Filters */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-96 opacity-100 mt-6 pt-6 border-t border-gray-100' : 'max-h-0 opacity-0'}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {/* Filter Group 1 */}
               <div>
                  <label className="text-xs font-semibold text-gray-500 mb-2 block">Employment Type</label>
                  <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                    <option value="FULLTIME">Full Time</option>
                    <option value="PARTTIME">Part Time</option>
                    <option value="CONTRACTOR">Contract</option>
                    <option value="INTERN">Internship</option>
                  </select>
               </div>
               {/* Filter Group 2 */}
               <div>
                  <label className="text-xs font-semibold text-gray-500 mb-2 block">Experience Level</label>
                  <select value={jobRequirement} onChange={(e) => setJobRequirement(e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                    <option value="no_experience">No Experience</option>
                    <option value="under_3_years_experience">Under 3 Years</option>
                    <option value="more_than_3_years_experience">3+ Years</option>
                  </select>
               </div>
               {/* Filter Group 3 */}
               <div>
                  <label className="text-xs font-semibold text-gray-500 mb-2 block">Date Posted</label>
                  <select value={datePosted} onChange={(e) => setDatePosted(e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                    <option value="all">Any time</option>
                    <option value="today">Today</option>
                    <option value="3days">Last 3 Days</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
               </div>
               {/* Filter Group 4 */}
               <div>
                  <label className="text-xs font-semibold text-gray-500 mb-2 block">Page</label>
                  <select value={page} onChange={(e) => setPage(e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                    {[...Array(5)].map((_, i) => <option key={i} value={i + 1}>Page {i + 1}</option>)}
                  </select>
               </div>
            </div>
          </div>
        </div>

        {/* ===== ERROR STATE ===== */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-xl flex items-center gap-3 animate-fade-in">
            <X className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        {/* ===== CONTENT GRID ===== */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-64 animate-pulse flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                       <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                       <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded-xl w-full"></div>
              </div>
            ))}
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
            {jobs.map((job) => (
              <div 
                key={job.job_id} 
                className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:border-purple-200 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden"
              >
                {/* Top: Icon & Company */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-3 items-center">
                    {job.employer_logo ? (
                      <img src={job.employer_logo} alt="logo" className="w-12 h-12 rounded-lg object-contain bg-gray-50 p-1 border border-gray-100" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-linear-to-br from-purple-100 to-blue-50 flex items-center justify-center text-purple-600 font-bold text-lg border border-purple-100">
                        <Building2 className="w-6 h-6" />
                      </div>
                    )}
                    <div className="max-w-45]">
                      <h3 className="font-bold text-gray-900 leading-tight line-clamp-2" title={job.job_title}>
                        {job.job_title}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium truncate">{job.employer_name}</p>
                    </div>
                  </div>
                </div>

                {/* Middle: Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex flex-wrap gap-2">
                     <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        <MapPin className="w-3 h-3" /> {job.job_city || "Remote"}, {job.job_country}
                     </span>
                     <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 capitalize">
                        <Clock className="w-3 h-3" /> {job.job_employment_type?.toLowerCase() || "Full Time"}
                     </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                     {job.job_description ? job.job_description.substring(0, 120) + "..." : "No description available. Check the official listing for details."}
                  </p>
                </div>

                {/* Bottom: Action */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-evenly mt-auto">
                   <span className="text-xs text-gray-400">Posted recently</span>
                   <a 
                     href={job.job_apply_link} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-md shadow-purple-200"
                   >
                     Apply Now <ExternalLink className="w-3.5 h-3.5" />
                   </a>
                    <button
  onClick={() => handleSaveJob(job)}
  className="p-2 bg-gray-100 hover:bg-purple-100 text-gray-600 hover:text-purple-600 rounded-lg transition-colors"
  title="Save to Board"
>
  <Plus className="w-5 h-5" /> {/* Ensure you import Plus from lucide-react */}
</button>
                </div>
               
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          !loading && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm col-span-full">
              <div className="bg-purple-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                We couldn't find any jobs matching your criteria. Try adjusting your filters or search for a different role.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default JobSearch;