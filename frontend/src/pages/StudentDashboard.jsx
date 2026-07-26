import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Clock, CheckCircle, XCircle, PlusCircle, X,
  CalendarDays, AlignLeft, Tag, ChevronRight
} from 'lucide-react';
import { API_URL, getToken, getStoredUser } from '../utils/auth';
import { toastSuccess, toastError } from '../components/Toast';

const TYPE_ICONS = {
  'Leave':       '🏖️',
  'On-Duty':     '💼',
  'Hostel Exit': '🏠',
  'Medical':     '🏥',
};

function StatusBadge({ status }) {
  const cls = status === 'Approved' ? 'badge-approved'
            : status === 'Rejected' ? 'badge-rejected'
            : 'badge-pending';
  const icon = status === 'Approved' ? <CheckCircle size={11} />
             : status === 'Rejected' ? <XCircle size={11} />
             : <Clock size={11} />;
  return <span className={`badge ${cls}`}>{icon} {status}</span>;
}

function StudentDashboard() {
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    type: 'Leave', reason: '', fromDate: '', toDate: ''
  });
  const navigate = useNavigate();
  const user = getStoredUser();

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    const token = getToken();
    if (!token) { navigate('/login'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/permissions/my-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setRequests(await res.json());
      else if (res.status === 401) navigate('/login');
    } catch {
      toastError('Error', 'Failed to load your requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();
    if (!token) { navigate('/login'); return; }

    if (new Date(form.toDate) < new Date(form.fromDate)) {
      toastError('Invalid Dates', '"To Date" must be after "From Date".');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toastSuccess('Request Submitted!', 'Your permission request has been sent for approval.');
        setShowForm(false);
        setForm({ type: 'Leave', reason: '', fromDate: '', toDate: '' });
        fetchRequests();
      } else {
        const data = await res.json();
        toastError('Submission Failed', data.message || 'Please try again.');
      }
    } catch {
      toastError('Error', 'Failed to submit. Check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  /* Derived stats */
  const stats = {
    total:    requests.length,
    pending:  requests.filter((r) => r.status === 'Pending').length,
    approved: requests.filter((r) => r.status === 'Approved').length,
    rejected: requests.filter((r) => r.status === 'Rejected').length,
  };

  return (
    <div className="animate-fade-in">

      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h2 className="page-title">My Dashboard</h2>
          <p className="page-subtitle">
            Welcome back, <strong style={{ color: 'var(--primary-light)' }}>{user?.name || 'Student'}</strong>
          </p>
        </div>
        <button
          className={showForm ? 'btn-secondary' : 'btn-primary'}
          onClick={() => setShowForm(!showForm)}
          id="toggle-form-btn"
        >
          {showForm ? <><X size={16} /> Cancel</> : <><PlusCircle size={16} /> Apply for Permission</>}
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="stats-grid">
        {[
          { label: 'Total Requests', value: stats.total,    icon: '📋', color: 'rgba(108,99,255,0.15)' },
          { label: 'Pending',        value: stats.pending,  icon: '⏳', color: 'rgba(245,158,11,0.15)' },
          { label: 'Approved',       value: stats.approved, icon: '✅', color: 'rgba(16,185,129,0.15)' },
          { label: 'Rejected',       value: stats.rejected, icon: '❌', color: 'rgba(244,63,94,0.15)'  },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
            <div className="stat-number">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── New Request Form ── */}
      {showForm && (
        <div className="card animate-fade-in" style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlusCircle size={18} color="var(--primary-light)" /> New Permission Request
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* Type */}
            <div className="form-group">
              <label className="form-label"><Tag size={12} style={{ display: 'inline', marginRight: '5px' }} />Permission Type</label>
              <select
                className="form-select"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                id="perm-type"
              >
                <option value="Leave">🏖️ Leave</option>
                <option value="On-Duty">💼 On-Duty</option>
                <option value="Hostel Exit">🏠 Hostel Exit</option>
                <option value="Medical">🏥 Medical Leave</option>
              </select>
            </div>

            {/* Date Range */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label"><CalendarDays size={12} style={{ display: 'inline', marginRight: '5px' }} />From Date</label>
                <input
                  type="date"
                  className="form-input"
                  required
                  value={form.fromDate}
                  onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                  id="perm-from"
                />
              </div>
              <div className="form-group">
                <label className="form-label"><CalendarDays size={12} style={{ display: 'inline', marginRight: '5px' }} />To Date</label>
                <input
                  type="date"
                  className="form-input"
                  required
                  value={form.toDate}
                  onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                  id="perm-to"
                />
              </div>
            </div>

            {/* Reason */}
            <div className="form-group">
              <label className="form-label"><AlignLeft size={12} style={{ display: 'inline', marginRight: '5px' }} />Reason</label>
              <textarea
                className="form-textarea"
                required
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Briefly explain the reason for your request…"
                id="perm-reason"
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn-primary" disabled={submitting} id="perm-submit">
                {submitting ? <><div className="spinner" /> Submitting…</> : <><ChevronRight size={16} /> Submit Request</>}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* ── History ── */}
      <p className="section-heading"><FileText size={14} /> My Request History</p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ margin: '0 auto 12px', borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
          Loading your requests…
        </div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No requests yet</h3>
          <p>Hit "Apply for Permission" above to get started.</p>
        </div>
      ) : (
        <div className="request-list">
          {requests.map((req) => (
            <div key={req._id} className="request-card">
              <div className="request-card-info">
                <h4>
                  <span style={{ marginRight: '8px' }}>{TYPE_ICONS[req.type] || '📄'}</span>
                  {req.type}
                </h4>
                <div className="meta">
                  <span>📅 {new Date(req.fromDate).toLocaleDateString('en-IN')} → {new Date(req.toDate).toLocaleDateString('en-IN')}</span>
                  <span>🕐 {new Date(req.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                <p className="reason">"{req.reason}"</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <StatusBadge status={req.status} />
                {req.status === 'Pending' && req.pendingWithRole && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    With <strong>{req.pendingWithRole}</strong>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
