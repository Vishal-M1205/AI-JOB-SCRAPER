import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  UploadCloud, 
  Search, 
  Zap, 
  CheckCircle, 
  ArrowRight, 
  Sparkles,
  LogOut,
  User
} from 'lucide-react';

const LandingPage = () => {
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
const URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/'
  // Scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auth Logic
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`${URL}api/user/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setUser(data.user))
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden font-sans selection:bg-purple-200">
      
      {/* ===== BACKGROUND DECORATION ===== */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] 
        w-125 h-125 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-indigo-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] 
        w-150 h-150 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* ===== NAVBAR ===== */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-linear-to-tr from-purple-600 to-blue-500 p-2 rounded-lg shadow-lg group-hover:scale-105 transition-transform">
              <Briefcase className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-gray-900 to-gray-600">
              AI Job Scraper
            </h1>
          </div>

          <div className="flex items-center gap-4">
  {user ? (
    <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">
      
      {/* --- NEW BUTTON: Link to Tracker --- */}
      <Link 
        to="/tracker" 
        className="text-sm font-semibold text-gray-700 hover:text-purple-600 flex items-center gap-2 transition-colors mr-2"
      >
        <div className="bg-purple-100 p-1 rounded-md">
          <Briefcase className="w-3.5 h-3.5 text-purple-600" />
        </div>
        My Board
      </Link>
      {/* ----------------------------------- */}

      <span className="text-sm font-medium text-gray-700 flex items-center gap-2 border-l border-gray-300 pl-4">
        <User className="w-4 h-4 text-purple-600" />
        {user.username}
      </span>
      
      <button
        onClick={() => {
          localStorage.removeItem('token');
          setUser(null);
        }}
        className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors ml-2"
        title="Logout"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  ) : ((
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-gray-600 font-medium hover:text-purple-600 transition">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-gray-900 text-white px-5 py-2.5 rounded-full font-medium hover:bg-gray-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </div>
            )
  )}
</div>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="relative z-10 pt-40 pb-20 px-6 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 text-purple-700 font-medium text-sm mb-8 animate-fade-in-up">
          <Sparkles className="w-4 h-4" />
          <span>New: AI Resume Analysis v2.0</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
          Let AI Read Your Resume <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 via-blue-600 to-indigo-600">
            and Find Your Dream Job
          </span>
        </h1>

        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Stop searching manually. Upload your resume, let our Gemini-powered AI analyze your skills, and instantly match you with global opportunities.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/upload"
            className="group relative bg-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:bg-purple-700 transition-all flex items-center gap-2 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <UploadCloud className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Upload Resume</span>
          </Link>

          {user ? (
            <Link
              to="/ats-check" // Assuming you have this route, or link to dashboard
              className="bg-white text-gray-800 px-8 py-4 rounded-full font-bold text-lg border border-gray-200 shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5 text-green-500" />
              Check ATS Score
            </Link>
          ) : (
            <Link
              to="/signup"
              className="bg-white text-gray-800 px-8 py-4 rounded-full font-bold text-lg border border-gray-200 shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              Get Started Free
            </Link>
          )}
        </div>

        {/* Floating Stats/Trusted By (Optional Polish) */}
        <div className="mt-16 pt-8 border-t border-gray-200/60 flex flex-wrap justify-center gap-8 md:gap-16 opacity-70">
          <div className="flex items-center gap-2">
            <span className="font-bold text-2xl text-gray-800">10k+</span>
            <span className="text-sm text-gray-500 text-left leading-tight">Jobs<br/>Scraped</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-2xl text-gray-800">5s</span>
            <span className="text-sm text-gray-500 text-left leading-tight">AI Analysis<br/>Speed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-2xl text-gray-800">95%</span>
            <span className="text-sm text-gray-500 text-left leading-tight">Match<br/>Accuracy</span>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">We combine advanced LLMs with real-time web scraping to give you an unfair advantage.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8 text-yellow-500" />,
                title: "AI Resume Analysis",
                desc: "Gemini AI breaks down your resume to understand your true potential beyond keywords."
              },
              {
                icon: <Search className="w-8 h-8 text-blue-500" />,
                title: "Smart Job Search",
                desc: "Powered by JSearch API to fetch real-time listing from LinkedIn, Indeed, and Glassdoor."
              },
              {
                icon: <Briefcase className="w-8 h-8 text-purple-500" />,
                title: "Career Tailored",
                desc: "Whether you are a fresher or a senior dev, we filter the noise and find roles that fit."
              }
            ].map((item, i) => (
              <div key={i} className="group bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-50 transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="relative z-10 py-24 bg-white/50 backdrop-blur-sm border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">How It Works</h2>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>

            {[
              { title: "Sign Up", desc: "Create your free account." },
              { title: "Upload PDF", desc: "Drop your resume." },
              { title: "AI Analysis", desc: "We extract your skills." },
              { title: "Get Hired", desc: "Apply to matched jobs." }
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg mb-6 ring-4 ring-white">
                  {i + 1}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA FOOTER ===== */}
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-purple-400" />
            <span className="text-xl font-bold">AI Job Scraper</span>
          </div>
          
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Built with React & Gemini AI.
          </p>

          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-white transition">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-white transition">Terms</a>
            <a href="#" className="text-gray-400 hover:text-white transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;