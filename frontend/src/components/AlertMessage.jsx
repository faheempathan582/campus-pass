import { CheckCircle, AlertCircle, Info } from 'lucide-react';

function AlertMessage({ type = 'error', message, onClose }) {
  if (!message) return null;

  const icons = {
    error: <AlertCircle size={18} />,
    success: <CheckCircle size={18} />,
    info: <Info size={18} />
  };

  return (
    <div className={`alert alert-${type}`} role="alert">
      {icons[type]}
      <span>{message}</span>
      {onClose && (
        <button type="button" className="alert-close" onClick={onClose} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  );
}

export default AlertMessage;
