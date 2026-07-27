import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { API_URL, getToken } from '../utils/auth';
import { toastSuccess, toastError, toastInfo } from './Toast';

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const seenIdsRef = useRef(new Set());
  const initialLoadRef = useRef(true);

  const fetchNotifications = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.notifications || [];
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        // Check for new unread notifications to trigger on-screen toast popup
        list.forEach((n) => {
          const isUnread = !n.readBy?.some((id) => id === user.id || id._id === user.id);
          
          if (isUnread && !seenIdsRef.current.has(n._id)) {
            seenIdsRef.current.add(n._id);

            // Trigger on-screen real-time toast popup (don't popup on very first page load)
            if (!initialLoadRef.current) {
              if (n.message.includes('Approved') || n.message.includes('Granted')) {
                toastSuccess('Permission Granted! 🎉', n.message, 6000);
              } else if (n.message.includes('Rejected')) {
                toastError('Permission Update ❌', n.message, 6000);
              } else {
                toastInfo('New Campus Alert 🔔', n.message, 6000);
              }
            }
          }
        });

        if (initialLoadRef.current) {
          initialLoadRef.current = false;
        }

        setNotifications(list);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      /* ignore fetch errors */
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 5 seconds for fast real-time live alerts
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    const token = getToken();
    await fetch(`${API_URL}/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchNotifications();
  };

  const markAllRead = async () => {
    const token = getToken();
    await fetch(`${API_URL}/api/notifications/read-all`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchNotifications();
  };

  const isUnread = (n) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return !n.readBy?.some((id) => id === user.id || id._id === user.id);
  };

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button
        type="button"
        className="bell-btn"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && <span className="bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button type="button" className="mark-all-btn" onClick={markAllRead}>
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="notification-empty">No notifications yet</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`notification-item ${isUnread(n) ? 'unread' : ''}`}
                  onClick={() => isUnread(n) && markAsRead(n._id)}
                  onKeyDown={(e) => e.key === 'Enter' && isUnread(n) && markAsRead(n._id)}
                  role="button"
                  tabIndex={0}
                >
                  <p>{n.message}</p>
                  <span className="notification-time">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
