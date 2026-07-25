import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AuthorityDashboard() {
  const [requests, setRequests] = useState([]);
  const [comment, setComment] = useState('');
  const [activeRequest, setActiveRequest] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await fetch(`${API_URL}/api/permissions/pending`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      setRequests(await res.json());
    }
  };

  const handleAction = async (id, action) => {
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await fetch(`${API_URL}/api/permissions/${id}/action`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ action, comment })
    });

    if (res.ok) {
      alert(`Request ${action}!`);
      setComment('');
      setActiveRequest(null);
      fetchRequests();
    } else {
      alert('Action failed');
    }
  };

  return (
    <div style={{ marginTop: '40px' }}>
      <h2 style={{ marginBottom: '24px' }}>Pending Approvals</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {requests.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No pending requests for your approval.</p>
        ) : (
          requests.map(req => (
            <div key={req._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ marginBottom: '4px', fontSize: '1.1rem' }}>{req.student.name} ({req.student.rollNumber})</h4>
                  <p style={{ color: 'var(--primary-color)', fontWeight: '500', marginBottom: '8px' }}>{req.type}</p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Dates: {new Date(req.fromDate).toLocaleDateString()} to {new Date(req.toDate).toLocaleDateString()}</p>
                  <p style={{ marginTop: '12px' }}><strong>Reason:</strong> {req.reason}</p>
                </div>
              </div>

              {activeRequest === req._id ? (
                <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                  <textarea 
                    placeholder="Add a remark (optional)..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows="2"
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '12px' }}
                  />
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-primary" style={{ background: 'var(--success)' }} onClick={() => handleAction(req._id, 'Approved')}>Approve</button>
                    <button className="btn-primary" style={{ background: 'var(--danger)' }} onClick={() => handleAction(req._id, 'Rejected')}>Reject</button>
                    <button className="btn-secondary" onClick={() => setActiveRequest(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: '8px' }}>
                  <button className="btn-primary" onClick={() => setActiveRequest(req._id)}>Review Request</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AuthorityDashboard;
