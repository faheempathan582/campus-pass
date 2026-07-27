import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import './App.css';
import { LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import AuthorityDashboard from './pages/AuthorityDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import NotificationBell from './components/NotificationBell';
import { ToastContainer } from './components/Toast';
import { getStoredUser, logout, getDashboardPath, isAuthority } from './utils/auth';

/* ── Navbar ─────────────────────────────────────────────── */
function Navbar() {
  const [user, setUser] = useState(getStoredUser());
  const navigate = useNavigate();

  useEffect(() => {
    const sync = () => setUser(getStoredUser());
    window.addEventListener('auth-change', sync);
    return () => window.removeEventListener('auth-change', sync);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container nav-content">
        {/* Brand with official SRIT Logo */}
        <Link to={user ? getDashboardPath(user.role) : '/'} className="brand">
          <div className="brand-logo-container">
            <img src="/srit-logo.jpg" alt="SRIT Logo" className="brand-logo-img" />
          </div>
          <div className="brand-title-wrap">
            <h1>CampusPass</h1>
            <span className="brand-subtitle">SRIT AUTONOMOUS</span>
          </div>
        </Link>

        {/* Right Side */}
        <div className="nav-links">
          {user ? (
            <div className="nav-user-info">
              {/* Notification Bell — only for authorities */}
              {isAuthority(user.role) && <NotificationBell />}

              {/* Dashboard shortcut */}
              <Link to={getDashboardPath(user.role)} className="btn-ghost" title="Dashboard">
                <LayoutDashboard size={17} />
                <span style={{ display: 'none' }}>Dashboard</span>
              </Link>

              {/* User chip */}
              <div className="nav-user-chip">
                <div className="nav-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                </div>
                <span>{user.name?.split(' ')[0] || user.email}</span>
                <span className="badge badge-role" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                  {user.role}
                </span>
              </div>

              {/* Logout */}
              <button onClick={handleLogout} className="btn-logout" title="Logout">
                <LogOut size={15} />
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">Login</Link>
              <Link to="/register" className="btn-primary">
                <ShieldCheck size={15} />
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

/* ── App ─────────────────────────────────────────────────── */
function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />

        <main className="container animate-fade-in" style={{ marginTop: '24px' }}>
          <Routes>
            {/* Public Home */}
            <Route path="/" element={<Home />} />

            {/* Guest-only (redirect logged-in users) */}
            <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

            {/* Protected — Student only */}
            <Route
              path="/student-dashboard"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected — Authority roles only */}
            <Route
              path="/authority-dashboard"
              element={
                <ProtectedRoute allowedRoles={['Advisor', 'HOD', 'Warden', 'Principal']}>
                  <AuthorityDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Toast Notifications */}
        <ToastContainer />
      </div>
    </BrowserRouter>
  );
}

/* ── Home Page ───────────────────────────────────────────── */
function Home() {
  const user = getStoredUser();
  return (
    <div className="hero-section">
      <div className="hero-college-badge">
        <img src="/srit-logo.jpg" alt="SRIT Logo" />
        <span>SRIT AUTONOMOUS — Empowering Knowledge</span>
      </div>

      <h2>Digital Permissions,<br />Simplified.</h2>
      <p>
        Apply for leaves, on-duty, and hostel exits — entirely online.
        No paperwork, no chasing faculty. Exclusive for <strong>SRIT College</strong> students and staff.
      </p>
      {user ? (
        <Link to={getDashboardPath(user.role)} className="btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
          Go to Dashboard
        </Link>
      ) : (
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
            <ShieldCheck size={18} /> Get Started
          </Link>
          <Link to="/login" className="btn-secondary" style={{ fontSize: '1rem', padding: '14px 28px' }}>
            Login
          </Link>
        </div>
      )}

      <div className="hero-cards">
        <div className="hero-feature-card">
          <div className="hero-feature-icon">🎓</div>
          <h3>For SRIT Students</h3>
          <p>Apply for leave, on-duty, medical, or hostel exit permissions from anywhere — no more running after faculty.</p>
        </div>
        <div className="hero-feature-card">
          <div className="hero-feature-icon">🔔</div>
          <h3>For Advisors & HOD</h3>
          <p>Get instant notifications when students apply. Review and approve requests digitally with a full audit trail.</p>
        </div>
        <div className="hero-feature-card">
          <div className="hero-feature-icon">🔒</div>
          <h3>Secured by Design</h3>
          <p>Only <strong>@srit.ac.in</strong> email addresses are allowed. All routes are protected and verified via JWT.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
