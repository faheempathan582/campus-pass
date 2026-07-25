import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'Student'
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        alert('Registration successful! Please login.');
        navigate('/login');
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (err) {
      alert('Error connecting to server');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', marginTop: '60px' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--primary-color)' }}>Create Account</h2>
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Name</label>
            <input name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Password</label>
            <input name="password" type="password" value={formData.password} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Role</label>
            <select name="role" value={formData.role} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <option value="Student">Student</option>
              <option value="Advisor">Class Advisor</option>
              <option value="HOD">HOD</option>
              <option value="Warden">Warden</option>
            </select>
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>Register</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '16px', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
