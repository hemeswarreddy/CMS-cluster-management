import React, { useState } from 'react';
import { Download, Trash2, Copy, Check } from 'lucide-react';
import FileIcon from './FileIcon';
import { formatFileSize, formatShortDate, getFileTypeLabel, getFileCategory } from '../utils/fileUtils';
import { downloadFile } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function FileCard({ file, onOpenDeleteModal }) {
  const { success, error } = useToast();
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const category = getFileCategory(file.name, file.type);
  const typeLabel = getFileTypeLabel(file.name, file.type);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadFile(file.name);
      success(`Downloading "${file.name}"`);
    } catch (err) {
      error(`Download failed: ${err.message || 'Server error'}`);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyName = () => {
    navigator.clipboard.writeText(file.name);
    setCopied(true);
    success(`Copied "${file.name}" to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="file-grid-card">
      <div className="file-grid-card-top">
        <div className="file-icon-box">
          <FileIcon filename={file.name} type={file.type} size={28} />
        </div>
        <span className={`file-type-badge cat-${category}`}>
          {typeLabel}
        </span>
      </div>

      <div className="file-grid-card-body">
        <h4 className="file-grid-name" title={file.name}>
          {file.name}
        </h4>
        <div className="file-grid-meta">
          <span>{formatFileSize(file.size)}</span>
          <span>•</span>
          <span>{formatShortDate(file.lastModified)}</span>
        </div>
      </div>

      <div className="file-grid-card-actions">
        <button
          type="button"
          className="btn-card-action"
          onClick={handleCopyName}
          title="Copy file name"
        >
          {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
        </button>

        <button
          type="button"
          className="btn-card-action btn-card-download"
          onClick={handleDownload}
          disabled={downloading}
          title="Download file"
        >
          {downloading ? <span className="spinner-xs" /> : <Download size={14} />}
          <span>Download</span>
        </button>

        <button
          type="button"
          className="btn-card-action btn-card-delete"
          onClick={() => onOpenDeleteModal(file)}
          title="Delete file"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
