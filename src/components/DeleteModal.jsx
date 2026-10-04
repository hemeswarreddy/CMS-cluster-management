import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { formatFileSize } from '../utils/fileUtils';

export default function DeleteModal({
  isOpen,
  file,
  isDeleting,
  onConfirm,
  onCancel,
}) {
  if (!isOpen || !file) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        <div className="modal-header">
          <div className="modal-warning-icon">
            <AlertTriangle size={24} className="text-rose-600" />
          </div>
          <button
            className="modal-close-btn"
            onClick={onCancel}
            disabled={isDeleting}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <h3 id="delete-dialog-title" className="modal-title">
            Delete File from EFS?
          </h3>
          <p className="modal-description">
            Are you sure you want to permanently delete{' '}
            <strong className="text-slate-900 break-all">{file.name}</strong>?
          </p>
          <div className="modal-file-preview">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>File size:</span>
              <span className="font-semibold text-slate-700">{formatFileSize(file.size)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
              <span>EFS Mount:</span>
              <span className="font-mono text-slate-600">/var/www/html/files/{file.name}</span>
            </div>
          </div>
          <p className="modal-subtext">
            ⚠️ This will remove the file from the shared Amazon EFS volume across both EC2 instances. This action cannot be undone.
          </p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger flex items-center gap-2"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="spinner-sm" /> Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} /> Delete Permanently
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
