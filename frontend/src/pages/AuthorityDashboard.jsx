import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle, XCircle, Clock, ChevronDown, ChevronUp,
  User, CalendarDays, FileText, MessageSquare, Building,
  ShieldCheck, HelpCircle, PhoneCall
} from 'lucide-react';
import { API_URL, getToken, getStoredUser } from '../utils/auth';
import { toastSuccess, toastError } from '../components/Toast';

const TYPE_COLORS = {
  'Leave':       'rgba(243,112,35,0.18)',
  'On-Duty':     'rgba(56,189,248,0.18)',
  'Hostel Exit': 'rgba(245,158,11,0.18)',
  'Medical':     'rgba(16,185,129,0.18)',
};

const TYPE_ICONS = {
  'Leave':       '🏖️',
  'On-Duty':     '💼',
  'Hostel Exit': '🏠',
  'Medical':     '🏥',
};

function AuthorityDashboard() {
  const [requests,    setRequests]   = useState([]);
  const [loading,     setLoading]    = useState(true);
  const [activeId,    setActiveId]   = useState(null);
  const [comment,     setComment]    = useState('');
  const [acting,      setActing]     = useState(false);
  const navigate = useNavigate();
  const user = getStoredUser();

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    const token = getToken();
    if (!token) { navigate('/login'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/permissions/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setRequests(await res.json());
      else if (res.status === 401) navigate('/login');
    } catch {
      toastError('Error', 'Failed to load pending requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    const token = getToken();
    if (!token) { navigate('/login'); return; }

    setActing(true);
    try {
      const res = await fetch(`${API_URL}/api/permissions/${id}/action`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, comment }),
      });

      if (res.ok) {
        toastSuccess(
          action === 'Approved' ? '✅ Request Approved' : '❌ Request Rejected',
          action === 'Approved'
            ? 'The student will be notified of the approval.'
            : 'The request has been rejected.'
        );
        setComment('');
        setActiveId(null);
        fetchRequests();
      } else {
        toastError('Action Failed', 'Could not process the request. Try again.');
      }
    } catch {
      toastError('Error', 'A network error occurred.');
    } finally {
      setActing(false);
    }
  };

  /* Stats */
  const stats = {
    pending:  requests.length,
    role:     user?.role || 'Authority',
    dept:     user?.department || '',
  };

  return (
    <div className="animate-fade-in">

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Pending Approvals</h2>
          <p className="page-subtitle">
            Logged in as{' '}
            <span className="badge badge-role" style={{ fontSize: '0.78rem' }}>{stats.role}</span>
            {stats.dept && <span style={{ marginLeft: '8px', color: 'var(--text-muted)' }}>• {stats.dept}</span>}
          </p>
        </div>
        <div className="stat-card" style={{ padding: '12px 20px', flexDirection: 'row', gap: '14px', alignItems: 'center', margin: 0 }}>
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.18)', fontSize: '1.2rem', flexShrink: 0 }}>⏳</div>
          <div>
            <div className="stat-number" style={{ fontSize: '1.5rem' }}>{stats.pending}</div>
            <div className="stat-label">Awaiting Review</div>
          </div>
        </div>
      </div>

      {/* ── Grid Layout for Widescreen ── */}
      <div className="dashboard-grid-layout">
        
        {/* ── Main Column ── */}
        <div className="dashboard-main-col">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <div className="spinner" style={{ margin: '0 auto 12px', borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
              Loading pending requests…
            </div>
          ) : requests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎉</div>
              <h3>All Clear!</h3>
              <p>No pending requests for your approval right now.</p>
            </div>
          ) : (
            <div className="request-list">
              {requests.map((req) => {
                const isExpanded = activeId === req._id;
                return (
                  <div
                    key={req._id}
                    className="card"
                    style={{ padding: '0', overflow: 'hidden' }}
                  >
                    {/* Top color accent */}
                    <div style={{
                      height: '3px',
                      background: `linear-gradient(90deg, var(--primary), var(--accent-alt))`,
                    }} />

                    <div style={{ padding: '22px 24px' }}>
                      {/* Header Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1 }}>
                          {/* Student Info */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <div style={{
                              width: '38px', height: '38px', borderRadius: '50%',
                              background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.9rem', fontWeight: '700', color: '#fff', flexShrink: 0,
                              boxShadow: '0 0 12px rgba(243,112,35,0.3)',
                            }}>
                              {req.student?.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <div style={{ fontWeight: '700', fontSize: '1rem' }}>
                                {req.student?.name || 'Unknown Student'}
                              </div>
                              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {req.student?.rollNumber && (
                                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                    <strong>Roll:</strong> {req.student.rollNumber}
                                  </span>
                                )}
                                {req.student?.department && (
                                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                    <Building size={10} style={{ display: 'inline', marginRight: '3px' }} />
                                    {req.student.department}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Request Details */}
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '6px',
                              padding: '5px 12px', borderRadius: 'var(--r-full)',
                              background: TYPE_COLORS[req.type] || 'var(--bg-card)',
                              fontSize: '0.85rem', fontWeight: '600',
                            }}>
                              {TYPE_ICONS[req.type] || '📄'} {req.type}
                            </span>
                            <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <CalendarDays size={13} />
                              {new Date(req.fromDate).toLocaleDateString('en-IN')} → {new Date(req.toDate).toLocaleDateString('en-IN')}
                            </span>
                          </div>

                          <div style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-sub)', lineHeight: 1.6 }}>
                            <strong style={{ color: 'var(--text-main)' }}>Reason: </strong>
                            {req.reason}
                          </div>
                        </div>

                        {/* Action Toggle */}
                        <button
                          id={`review-btn-${req._id}`}
                          className={isExpanded ? 'btn-secondary' : 'btn-primary'}
                          onClick={() => { setActiveId(isExpanded ? null : req._id); setComment(''); }}
                          style={{ flexShrink: 0 }}
                        >
                          {isExpanded ? <><ChevronUp size={15} /> Close</> : <><ChevronDown size={15} /> Review</>}
                        </button>
                      </div>

                      {/* Expanded Action Panel */}
                      {isExpanded && (
                        <div
                          className="animate-fade-in"
                          style={{
                            marginTop: '20px',
                            padding: '18px',
                            background: 'var(--bg-input)',
                            borderRadius: 'var(--r-md)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          <div className="form-group" style={{ marginBottom: '14px' }}>
                            <label className="form-label">
                              <MessageSquare size={12} style={{ display: 'inline', marginRight: '5px' }} />
                              Remark (optional)
                            </label>
                            <textarea
                              className="form-textarea"
                              style={{ minHeight: '70px' }}
                              placeholder="Add a remark for the student (optional)…"
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              id={`remark-${req._id}`}
                            />
                          </div>
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button
                              id={`approve-btn-${req._id}`}
                              className="btn-primary btn-success"
                              onClick={() => handleAction(req._id, 'Approved')}
                              disabled={acting}
                            >
                              {acting ? <div className="spinner" /> : <CheckCircle size={15} />}
                              Approve
                            </button>
                            <button
                              id={`reject-btn-${req._id}`}
                              className="btn-primary btn-danger"
                              onClick={() => handleAction(req._id, 'Rejected')}
                              disabled={acting}
                            >
                              {acting ? <div className="spinner" /> : <XCircle size={15} />}
                              Reject
                            </button>
                            <button
                              className="btn-secondary"
                              onClick={() => { setActiveId(null); setComment(''); }}
                              disabled={acting}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Side Column (Fills Right Side Widescreen Space) ── */}
        <div className="dashboard-side-col">
          
          {/* SRIT Faculty ID Card */}
          <div className="side-card srit-id-card">
            <div className="srit-id-logo">
              <img src="/srit-logo.jpg" alt="SRIT College Logo" />
            </div>
            <div className="srit-id-name">{user?.name || 'Faculty Member'}</div>
            <div className="srit-id-role">SRIT {stats.role}</div>
            
            <div className="srit-id-details">
              <div className="srit-id-row">
                <span>Role:</span>
                <span style={{ color: 'var(--primary-light)' }}>{stats.role}</span>
              </div>
              <div className="srit-id-row">
                <span>Department:</span>
                <span>{user?.department || 'Engineering'}</span>
              </div>
              <div className="srit-id-row">
                <span>Domain:</span>
                <span>@srit.ac.in</span>
              </div>
            </div>
          </div>

          {/* Approval Workflow Info */}
          <div className="side-card">
            <div className="side-card-header">
              <ShieldCheck size={18} color="var(--primary)" />
              <div className="side-card-title">Approval Hierarchy</div>
            </div>

            <div className="guideline-list">
              <div className="guideline-item">
                <div className="guideline-icon">1</div>
                <div><strong>Advisor Approval</strong> forwards normal leave requests to HOD for final signoff.</div>
              </div>
              <div className="guideline-item">
                <div className="guideline-icon">2</div>
                <div><strong>Warden Approval</strong> directly grants Hostel Exit passes to hosteller students.</div>
              </div>
              <div className="guideline-item">
                <div className="guideline-icon">3</div>
                <div>Audit trail records your remarks, timestamp, and digital signature securely.</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default AuthorityDashboard;
