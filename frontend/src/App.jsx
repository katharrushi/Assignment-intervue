import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import StudentPage from "./pages/StudentPage";
import TeacherPage from "./pages/TeacherPage";
import KickedOut from "./components/KickedOut";
import PollHistoryPage from './pages/PollHistoryPage';
import LiveResults from "./components/LiveResults";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/student" element={<StudentPage />} />
        <Route path="/teacher" element={<TeacherPage />} />
        <Route path="/poll-history" element={<PollHistoryPage />} />
        <Route path="/live-results" element={<LiveResults />} />
        <Route path="/kicked" element={<KickedOut />} />
      </Routes>
    </Router>
  );
};

export default App;

// 👇 Redesigned Home Component (Figma Style)
const Home = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("");

  const handleContinue = () => {
    if (selectedRole === "student") {
      navigate("/student");
    } else {
      localStorage.setItem('userRole', "teacher");
      navigate("/teacher");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white text-dark">
      {/* Badge */}
      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary text-white mb-4">
        ✨ Intervue Poll
      </span>

      {/* Heading */}
      <h1 className="text-3xl sm:text-4xl font-semibold text-center mb-2">
        Welcome to the <span className="font-bold text-black">Live Polling System</span>
      </h1>
      <p className="text-muted text-center mb-8 max-w-lg">
        Please select the role that best describes you to begin using the live polling system
      </p>

      {/* Role Selection Cards */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div
          onClick={() => setSelectedRole("student")}
          className={`w-72 border rounded-xl p-5 cursor-pointer transition-all duration-300 transform
            ${selectedRole === "student"
              ? "border-primary shadow-md scale-105"
              : "border-muted bg-white hover:border-primary hover:shadow-md hover:scale-105"
            }`}
        >
          <h3 className="font-bold text-lg mb-1">I’m a Student</h3>
          <p className="text-sm text-muted">
            Submit answers and view live poll results in real-time.
          </p>
        </div>

        <div
          onClick={() => setSelectedRole("teacher")}
          className={`w-72 border rounded-xl p-5 cursor-pointer transition-all duration-300 transform
            ${selectedRole === "teacher"
              ? "border-primary shadow-md scale-105"
              : "border-muted bg-white hover:border-primary hover:shadow-md hover:scale-105"
            }`}
        >
          <h3 className="font-bold text-lg mb-1">I’m a Teacher</h3>
          <p className="text-sm text-muted">
            Create questions and manage the poll results effectively.
          </p>
        </div>
      </div>

      
      <button
        onClick={handleContinue}
        className="bg-primary hover:bg-secondary text-white px-8 py-3 rounded-full text-base font-semibold transition-all duration-300 transform hover:scale-105"
      >
        Continue
      </button>
    </div>
  );
};
