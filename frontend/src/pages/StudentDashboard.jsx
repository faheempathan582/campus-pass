import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function StudentDashboard() {
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Leave', reason: '', fromDate: '', toDate: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await fetch(`${API_URL}/api/permissions/my-requests`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      setRequests(await res.json());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await fetch(`${API_URL}/api/permissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      alert('Permission requested successfully!');
      setShowForm(false);
      fetchRequests(); // Refresh the list
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Approved') return 'var(--success)';
    if (status === 'Rejected') return 'var(--danger)';
    return 'var(--warning)';
  };

  return (
    <div style={{ marginTop: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>My Dashboard</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Apply for Permission'}
        </button>
      </div>

      {showForm && (
        <div className="card animate-fade-in" style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '16px' }}>New Request</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Permission Type</label>
              <select 
                value={formData.type} 
                onChange={e => setFormData({...formData, type: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
              >
                <option value="Leave">Leave</option>
                <option value="On-Duty">On-Duty</option>
                <option value="Hostel Exit">Hostel Exit</option>
                <option value="Medical">Medical Leave</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>From Date</label>
                <input type="date" required value={formData.fromDate} onChange={e => setFormData({...formData, fromDate: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>To Date</label>
                <input type="date" required value={formData.toDate} onChange={e => setFormData({...formData, toDate: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Reason</label>
              <textarea 
                required 
                value={formData.reason} 
                onChange={e => setFormData({...formData, reason: e.target.value})}
                rows="4" 
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
              />
            </div>
            
            <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>Submit Request</button>
          </form>
        </div>
      )}

      <h3>My History</h3>
      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {requests.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No requests found.</p>
        ) : (
          requests.map(req => (
            <div key={req._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ marginBottom: '4px' }}>{req.type}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{new Date(req.fromDate).toLocaleDateString()} - {new Date(req.toDate).toLocaleDateString()}</p>
                <p style={{ marginTop: '8px', fontSize: '0.95rem' }}>"{req.reason}"</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ 
                  display: 'inline-block', 
                  padding: '6px 12px', 
                  borderRadius: '20px', 
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  backgroundColor: getStatusColor(req.status) + '20', // 20 hex for 12% opacity
                  color: getStatusColor(req.status) 
                }}>
                  {req.status}
                </span>
                {req.status === 'Pending' && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>With {req.pendingWithRole}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;
