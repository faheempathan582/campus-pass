import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

/* ── Global Toast Context ───────────────────────────────── */
let _addToast = null;

export function toast(type, title, message, duration = 4000) {
  if (_addToast) _addToast({ type, title, message, duration });
}

export const toastSuccess = (title, msg, d) => toast('success', title, msg, d);
export const toastError   = (title, msg, d) => toast('error',   title, msg, d);
export const toastWarning = (title, msg, d) => toast('warning', title, msg, d);
export const toastInfo    = (title, msg, d) => toast('info',    title, msg, d);

/* ── Toast Provider / Container ─────────────────────────── */
const ICONS = {
  success: <CheckCircle size={14} />,
  error:   <XCircle     size={14} />,
  warning: <AlertTriangle size={14} />,
  info:    <Info        size={14} />,
};

let uid = 0;

function ToastItem({ item, onRemove }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(item.id), 260);
    }, item.duration);
    return () => clearTimeout(timer);
  }, [item, onRemove]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => onRemove(item.id), 260);
  };

  return (
    <div className={`toast toast-${item.type}${exiting ? ' exiting' : ''}`}>
      <div className="toast-icon">{ICONS[item.type]}</div>
      <div className="toast-body">
        {item.title   && <div className="toast-title">{item.title}</div>}
        {item.message && <div className="toast-message">{item.message}</div>}
      </div>
      <button className="toast-close" onClick={handleClose} aria-label="Close">
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    _addToast = (item) => {
      setToasts((prev) => [...prev, { ...item, id: ++uid }]);
    };
    return () => { _addToast = null; };
  }, []);

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <ToastItem key={t.id} item={t} onRemove={remove} />
      ))}
    </div>
  );
}
