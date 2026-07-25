import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css'; // This is empty now
import { GraduationCap } from 'lucide-react';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import AuthorityDashboard from './pages/AuthorityDashboard';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Navigation Bar */}
        <nav className="navbar">
          <div className="container nav-content">
            <div className="brand">
              <GraduationCap size={32} color="var(--primary-color)" />
              <h1>CampusPass</h1>
            </div>
            <div className="nav-links">
              <Link to="/login" className="btn-secondary">Login</Link>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="container animate-fade-in" style={{ marginTop: '40px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/authority-dashboard" element={<AuthorityDashboard />} />
            {/* Add more routes here later */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

// Temporary Home Component
function Home() {
  return (
    <div className="hero-section text-center">
      <h2 style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--text-main)' }}>
        Digital Permissions, Simplified.
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '32px' }}>
        Apply for leaves, on-duty, and hostel exits in seconds.
      </p>
      <Link to="/register" className="btn-primary" style={{ fontSize: '1.1rem', padding: '12px 24px' }}>
        Get Started
      </Link>

      <div style={{ marginTop: '60px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
         <div className="card text-left">
            <h3 style={{ marginBottom: '8px' }}>For Students</h3>
            <p style={{ color: 'var(--text-muted)' }}>Apply for permissions from anywhere without chasing faculty.</p>
         </div>
         <div className="card text-left">
            <h3 style={{ marginBottom: '8px' }}>For Faculty</h3>
            <p style={{ color: 'var(--text-muted)' }}>Review and approve requests digitally with a complete audit trail.</p>
         </div>
      </div>
    </div>
  );
}

export default App;
