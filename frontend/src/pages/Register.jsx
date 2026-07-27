import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, BookOpen, Hash, AlertCircle, ShieldCheck, Home } from 'lucide-react';
import { isValidCollegeEmail, API_URL, ALLOWED_DOMAIN } from '../utils/auth';
import { toastSuccess, toastError } from '../components/Toast';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Artificial Intelligence & Machine Learning',
  'Data Science',
];

const ROLES = [
  { value: 'Student',  label: '🎓 Student' },
  { value: 'Advisor',  label: '📚 Class Advisor' },
  { value: 'HOD',      label: '🏛️ Head of Department (HOD)' },
  { value: 'Warden',   label: '🏠 Hostel Warden' },
];

function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'Student',
    rollNumber: '', department: '', isHosteller: false,
  });
  const [showPass,    setShowPass]   = useState(false);
  const [loading,     setLoading]    = useState(false);
  const [emailError,  setEmailErr]   = useState('');
  const navigate = useNavigate();

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleEmailChange = (val) => {
    set('email', val);
    if (val && !val.endsWith(ALLOWED_DOMAIN)) {
      setEmailErr(`Only ${ALLOWED_DOMAIN} emails are allowed`);
    } else {
      setEmailErr('');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    /* Frontend guard */
    if (!isValidCollegeEmail(form.email)) {
      setEmailErr(`Only ${ALLOWED_DOMAIN} emails are allowed`);
      return;
    }

    if (form.role === 'Student' && !form.rollNumber.trim()) {
      toastError('Missing Field', 'Roll number is required for students.');
      return;
    }

    if (form.role === 'Student' && !form.department) {
      toastError('Missing Field', 'Please select your department.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          email: form.email.trim().toLowerCase(),
        }),
      });
      const data = await res.json();

      if (res.ok) {
        toastSuccess('Account Created!', 'You can now sign in with your SRIT email.');
        navigate('/login');
      } else {
        toastError('Registration Failed', data.message || 'Please check your details and try again.');
      }
    } catch {
      toastError('Connection Error', 'Unable to reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStudent = form.role === 'Student';

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '500px' }}>

        {/* SRIT College Logo & Header */}
        <div className="auth-srit-header">
          <div className="auth-logo-box">
            <img src="/srit-logo.jpg" alt="SRIT College Logo" />
          </div>
          <div className="auth-college-title">SRIT Autonomous</div>
          <div className="auth-college-sub">Empowering Knowledge</div>
        </div>

        {/* Heading */}
        <div className="auth-heading">
          <h2>Create Account</h2>
          <p>Join CampusPass with your official SRIT email</p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="reg-name"
                type="text"
                className="form-input"
                style={{ paddingLeft: '42px' }}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Your full name"
                required
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">College Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="reg-email"
                type="email"
                className={`form-input${emailError ? ' error' : ''}`}
                style={{ paddingLeft: '42px' }}
                value={form.email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder={`yourrollno${ALLOWED_DOMAIN}`}
                required
                autoComplete="email"
              />
            </div>
            {emailError ? (
              <span className="form-error"><AlertCircle size={12} /> {emailError}</span>
            ) : (
              <span className="form-hint">Must end with {ALLOWED_DOMAIN}</span>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="reg-password"
                type={showPass ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '42px', paddingRight: '42px' }}
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                placeholder="Choose a strong password"
                required
                minLength={6}
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', padding: '4px', borderRadius: '4px' }}
                aria-label="Toggle password"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Role */}
          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              id="reg-role"
              className="form-select"
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Student-only fields */}
          {isStudent && (
            <>
              {/* Roll Number */}
              <div className="form-group">
                <label className="form-label">Roll Number</label>
                <div style={{ position: 'relative' }}>
                  <Hash size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="reg-roll"
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '42px' }}
                    value={form.rollNumber}
                    onChange={(e) => set('rollNumber', e.target.value)}
                    placeholder="e.g. 254G1A4734"
                    required={isStudent}
                  />
                </div>
              </div>

              {/* Department */}
              <div className="form-group">
                <label className="form-label">Department</label>
                <div style={{ position: 'relative' }}>
                  <BookOpen size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <select
                    id="reg-dept"
                    className="form-select"
                    style={{ paddingLeft: '42px' }}
                    value={form.department}
                    onChange={(e) => set('department', e.target.value)}
                    required={isStudent}
                  >
                    <option value="">Select department</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Hosteller */}
              <label className="form-checkbox-group">
                <Home size={16} color="var(--text-muted)" />
                <input
                  id="reg-hosteller"
                  type="checkbox"
                  checked={form.isHosteller}
                  onChange={(e) => set('isHosteller', e.target.checked)}
                />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-sub)' }}>
                  I am a <strong style={{ color: 'var(--text-main)' }}>hosteller</strong>
                </span>
              </label>
            </>
          )}

          {/* Submit */}
          <button
            id="reg-submit"
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '13px', marginTop: '4px', fontSize: '1rem' }}
            disabled={loading || !!emailError}
          >
            {loading ? (
              <><div className="spinner" /> Creating Account…</>
            ) : (
              <><ShieldCheck size={17} /> Create Account</>
            )}
          </button>
        </form>

        {/* Security hint */}
        <div className="email-domain-hint" style={{ marginTop: '20px' }}>
          <ShieldCheck size={14} />
          <span>Restricted to <strong>{ALLOWED_DOMAIN}</strong> college emails only</span>
        </div>

        {/* Footer */}
        <p className="auth-footer-text">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
