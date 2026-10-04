import React from 'react';
import { useToast } from '../context/ToastContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => {
        let icon = <Info className="toast-icon text-blue-500" size={18} />;
        let typeClass = 'toast-info';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="toast-icon text-emerald-500" size={18} />;
          typeClass = 'toast-success';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="toast-icon text-rose-500" size={18} />;
          typeClass = 'toast-error';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="toast-icon text-amber-500" size={18} />;
          typeClass = 'toast-warning';
        }

        return (
          <div key={toast.id} className={`toast-item ${typeClass}`}>
            <div className="toast-icon-wrapper">{icon}</div>
            <div className="toast-message">{toast.message}</div>
            <button
              className="toast-close-btn"
              onClick={() => removeToast(toast.id)}
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
