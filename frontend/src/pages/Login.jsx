import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';
import { isValidCollegeEmail, setAuth, API_URL, ALLOWED_DOMAIN } from '../utils/auth';
import { toastSuccess, toastError } from '../components/Toast';

function Login() {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [emailError, setEmailErr] = useState('');
  const navigate = useNavigate();

  /* Live email validation */
  const handleEmailChange = (val) => {
    setEmail(val);
    if (val && !val.endsWith(ALLOWED_DOMAIN)) {
      setEmailErr(`Only ${ALLOWED_DOMAIN} emails are allowed`);
    } else {
      setEmailErr('');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    /* Frontend guard */
    if (!isValidCollegeEmail(email)) {
      setEmailErr(`Only ${ALLOWED_DOMAIN} emails are allowed`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();

      if (res.ok) {
        setAuth(data.token, data.user);
        toastSuccess('Welcome back!', `Logged in as ${data.user.name}`);
        navigate(data.user.role === 'Student' ? '/student-dashboard' : '/authority-dashboard');
      } else {
        toastError('Login Failed', data.message || 'Invalid credentials');
      }
    } catch {
      toastError('Connection Error', 'Unable to reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

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
          <h2>CampusPass Login</h2>
          <p>Sign in with your official <strong>@srit.ac.in</strong> email</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">College Email</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                id="login-email"
                type="email"
                className={`form-input${emailError ? ' error' : ''}`}
                style={{ paddingLeft: '42px' }}
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder={`yourrollno${ALLOWED_DOMAIN}`}
                required
                autoComplete="email"
              />
            </div>
            {emailError && (
              <span className="form-error">
                <AlertCircle size={12} /> {emailError}
              </span>
            )}
            {!emailError && (
              <span className="form-hint">Must be an @srit.ac.in address</span>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '42px', paddingRight: '42px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-muted)',
                  padding: '4px', borderRadius: '4px',
                }}
                aria-label="Toggle password visibility"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '13px', marginTop: '4px', fontSize: '1rem' }}
            disabled={loading || !!emailError}
          >
            {loading ? (
              <><div className="spinner" /> Signing in…</>
            ) : (
              <><ShieldCheck size={17} /> Sign In to SRIT Pass</>
            )}
          </button>
        </form>

        {/* Security Badge */}
        <div className="email-domain-hint" style={{ marginTop: '20px' }}>
          <ShieldCheck size={14} />
          <span>Restricted to <strong>{ALLOWED_DOMAIN}</strong> college emails only</span>
        </div>

        {/* Footer Link */}
        <p className="auth-footer-text">
          Don't have an account?{' '}
          <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
