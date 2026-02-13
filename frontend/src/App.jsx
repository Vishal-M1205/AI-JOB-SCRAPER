import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UploadResume from './pages/UploadResume';
import JobSearch from './pages/JobSearch';
import ATSCheck from './pages/ATSCheck';
import ApplicationBoard from "./components/ApplicationBoard";


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/upload" element={<UploadResume />} />
        <Route path="/jobs" element={<JobSearch />} />
        <Route path="/ats-check" element={<ATSCheck/>} />
<Route path="/tracker" element={<ApplicationBoard />} />
      </Routes>
    </Router>
  );
};

export default App;