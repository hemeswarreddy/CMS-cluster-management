import React, { useState, useRef, useCallback } from 'react';
import {
  UploadCloud,
  File as FileIcon,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Plus,
  ArrowRight,
  HardDrive,
} from 'lucide-react';
import { uploadFile } from '../services/api';
import { formatFileSize, getFileTypeLabel } from '../utils/fileUtils';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';

export default function UploadZone({ onUploadSuccess, compact = false }) {
  const { success, error } = useToast();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([]); // [{ id, file, progress, status: 'queued'|'uploading'|'completed'|'error', errorMsg }]
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle files dropped or selected
  const handleFilesAdded = useCallback((selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newItems = Array.from(selectedFiles).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${file.name}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'queued', // 'queued' | 'uploading' | 'completed' | 'error'
      errorMsg: null,
    }));

    setUploadQueue((prev) => [...prev, ...newItems]);
  }, []);

  // Process and upload a single queue item
  const uploadSingleItem = async (item) => {
    setUploadQueue((prev) =>
      prev.map((q) => (q.id === item.id ? { ...q, status: 'uploading', progress: 5 } : q))
    );

    try {
      await uploadFile(item.file, (percent) => {
        setUploadQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, progress: percent } : q))
        );
      });

      setUploadQueue((prev) =>
        prev.map((q) =>
          q.id === item.id ? { ...q, status: 'completed', progress: 100 } : q
        )
      );

      success(`"${item.name}" uploaded successfully to EFS`);
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      console.error('Upload error for item:', item.name, err);
      const errMsg = err.message || 'Upload failed. Check ALB or EC2 backend.';
      setUploadQueue((prev) =>
        prev.map((q) =>
          q.id === item.id ? { ...q, status: 'error', errorMsg: errMsg } : q
        )
      );
      error(`Failed to upload "${item.name}": ${errMsg}`);
    }
  };

  // Start uploading all queued files
  const startUploads = async () => {
    const queuedItems = uploadQueue.filter((item) => item.status === 'queued' || item.status === 'error');
    if (queuedItems.length === 0) return;

    setIsProcessing(true);

    for (const item of queuedItems) {
      await uploadSingleItem(item);
    }

    setIsProcessing(false);
  };

  // Drag & drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer && e.dataTransfer.files) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const removeItem = (id) => {
    setUploadQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCompleted = () => {
    setUploadQueue((prev) => prev.filter((item) => item.status !== 'completed'));
  };

  const retryItem = (item) => {
    uploadSingleItem(item);
  };

  const pendingCount = uploadQueue.filter((i) => i.status === 'queued').length;
  const completedCount = uploadQueue.filter((i) => i.status === 'completed').length;
  const errorCount = uploadQueue.filter((i) => i.status === 'error').length;

  return (
    <div className={`upload-zone-wrapper ${compact ? 'compact' : ''}`}>
      {/* Drag & Drop Area */}
      <div
        className={`dropzone-box ${isDragging ? 'is-dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload files to shared Amazon EFS"
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden-input"
          multiple
          onChange={(e) => {
            handleFilesAdded(e.target.files);
            e.target.value = null; // Reset to allow same file re-selection
          }}
        />

        <div className="dropzone-content">
          <div className="dropzone-icon-circle">
            <UploadCloud size={32} className="text-blue-600" />
          </div>
          <div className="dropzone-text-group">
            <h3 className="dropzone-heading">
              {isDragging ? 'Drop your files to upload' : 'Upload your files to Amazon EFS'}
            </h3>
            <p className="dropzone-subtext">
              Drag & Drop files here, or{' '}
              <span className="dropzone-browse-link">Choose Files</span> from your computer
            </p>
          </div>
          <div className="dropzone-badges">
            <span className="dropzone-badge">
              <HardDrive size={12} className="text-slate-500" /> Shared EFS: /var/www/html/files
            </span>
            <span className="dropzone-badge">All file formats supported</span>
          </div>
        </div>
      </div>

      {/* Upload Queue List */}
      {uploadQueue.length > 0 && (
        <div className="upload-queue-card">
          <div className="queue-header">
            <div className="queue-title-group">
              <h4 className="queue-title">Upload Queue ({uploadQueue.length})</h4>
              <div className="queue-summary-tags">
                {pendingCount > 0 && (
                  <span className="tag tag-queued">{pendingCount} ready</span>
                )}
                {completedCount > 0 && (
                  <span className="tag tag-success">{completedCount} uploaded</span>
                )}
                {errorCount > 0 && (
                  <span className="tag tag-error">{errorCount} failed</span>
                )}
              </div>
            </div>

            <div className="queue-actions">
              {completedCount > 0 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={clearCompleted}
                >
                  Clear Completed
                </button>
              )}
              {pendingCount > 0 && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm flex items-center gap-1.5"
                  onClick={startUploads}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="spinner-xs" /> Uploading...
                    </>
                  ) : (
                    <>
                      <UploadCloud size={15} /> Upload All ({pendingCount})
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="queue-list">
            {uploadQueue.map((item) => (
              <div key={item.id} className={`queue-item status-${item.status}`}>
                <div className="queue-item-icon">
                  <FileIcon size={20} className="text-slate-600" />
                </div>

                <div className="queue-item-info">
                  <div className="queue-item-header">
                    <span className="queue-item-name" title={item.name}>
                      {item.name}
                    </span>
                    <span className="queue-item-size font-mono">
                      {formatFileSize(item.size)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {item.status === 'uploading' && (
                    <div className="upload-progress-container">
                      <div className="progress-bar-track">
                        <div
                          className="progress-bar-fill animated"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <span className="progress-percent font-mono">{item.progress}%</span>
                    </div>
                  )}

                  {/* Status Badges */}
                  <div className="queue-item-status-row">
                    {item.status === 'queued' && (
                      <span className="status-label text-slate-500">
                        Ready to upload
                      </span>
                    )}
                    {item.status === 'uploading' && (
                      <span className="status-label text-blue-600 flex items-center gap-1">
                        <span className="spinner-xs" /> Uploading to EFS...
                      </span>
                    )}
                    {item.status === 'completed' && (
                      <span className="status-label text-emerald-600 flex items-center gap-1 font-medium">
                        <CheckCircle2 size={14} /> Uploaded successfully
                      </span>
                    )}
                    {item.status === 'error' && (
                      <span className="status-label text-rose-600 flex items-center gap-1">
                        <AlertCircle size={14} /> {item.errorMsg || 'Upload failed'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Queue Item Action Buttons */}
                <div className="queue-item-actions">
                  {item.status === 'queued' && (
                    <button
                      type="button"
                      className="btn-item-action"
                      onClick={() => uploadSingleItem(item)}
                      title="Upload this file now"
                    >
                      <UploadCloud size={15} />
                    </button>
                  )}
                  {item.status === 'error' && (
                    <button
                      type="button"
                      className="btn-item-action text-blue-600"
                      onClick={() => retryItem(item)}
                      title="Retry upload"
                    >
                      <RefreshCw size={15} />
                    </button>
                  )}
                  {item.status !== 'uploading' && (
                    <button
                      type="button"
                      className="btn-item-action text-slate-400 hover:text-slate-600"
                      onClick={() => removeItem(item.id)}
                      title="Remove from queue"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom link to view files */}
          {completedCount > 0 && (
            <div className="queue-footer">
              <span className="text-xs text-slate-500">
                {completedCount} file(s) saved to shared EFS directory.
              </span>
              <Link to="/files" className="btn btn-secondary btn-sm flex items-center gap-1">
                <span>View in Files Manager</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
