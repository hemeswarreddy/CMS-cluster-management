import React, { useState } from 'react';
import {
  Download,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Check,
  Copy,
} from 'lucide-react';
import FileIcon from './FileIcon';
import { formatFileSize, formatShortDate, getFileTypeLabel, getCategoryStyles, getFileCategory } from '../utils/fileUtils';
import { downloadFile } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function FileTable({
  files = [],
  sortBy,
  sortOrder,
  onSort,
  onOpenDeleteModal,
  loading = false,
}) {
  const { success, error } = useToast();
  const [downloadingFile, setDownloadingFile] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const handleDownload = async (file) => {
    setDownloadingFile(file.name);
    try {
      await downloadFile(file.name);
      success(`Downloading "${file.name}"`);
    } catch (err) {
      error(`Download failed: ${err.message || 'Server error'}`);
    } finally {
      setDownloadingFile(null);
    }
  };

  const handleCopyName = (file) => {
    navigator.clipboard.writeText(file.name);
    setCopiedId(file.id || file.name);
    success(`Copied "${file.name}" to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderSortIcon = (column) => {
    if (sortBy !== column) {
      return <ArrowUpDown size={14} className="text-slate-400 opacity-50 group-hover:opacity-100" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp size={14} className="text-blue-600 font-bold" />
    ) : (
      <ArrowDown size={14} className="text-blue-600 font-bold" />
    );
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="file-table-container">
      <div className="table-responsive">
        <table className="file-table" aria-label="EFS Shared Files List">
          <thead>
            <tr>
              <th
                scope="col"
                className="th-name cursor-pointer group"
                onClick={() => onSort('name')}
              >
                <div className="flex items-center gap-1.5">
                  <span>File Name</span>
                  {renderSortIcon('name')}
                </div>
              </th>
              <th
                scope="col"
                className="th-type cursor-pointer group"
                onClick={() => onSort('type')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Type</span>
                  {renderSortIcon('type')}
                </div>
              </th>
              <th
                scope="col"
                className="th-size cursor-pointer group"
                onClick={() => onSort('size')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Size</span>
                  {renderSortIcon('size')}
                </div>
              </th>
              <th
                scope="col"
                className="th-date cursor-pointer group"
                onClick={() => onSort('lastModified')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Last Modified</span>
                  {renderSortIcon('lastModified')}
                </div>
              </th>
              <th scope="col" className="th-actions text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => {
              const category = getFileCategory(file.name, file.type);
              const typeLabel = getFileTypeLabel(file.name, file.type);
              const isDownloading = downloadingFile === file.name;
              const isCopied = copiedId === (file.id || file.name);

              return (
                <tr key={file.id || file.name} className="file-row">
                  {/* Name column */}
                  <td className="td-name">
                    <div className="file-name-cell">
                      <div className="file-icon-wrapper">
                        <FileIcon filename={file.name} type={file.type} size={20} />
                      </div>
                      <div className="file-title-group">
                        <span className="file-display-name" title={file.name}>
                          {file.name}
                        </span>
                        <span className="file-mobile-meta">
                          {typeLabel} • {formatFileSize(file.size)} • {formatShortDate(file.lastModified)}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Type column */}
                  <td className="td-type">
                    <span className={`file-type-badge cat-${category}`}>
                      {typeLabel}
                    </span>
                  </td>

                  {/* Size column */}
                  <td className="td-size font-mono text-xs text-slate-600">
                    {formatFileSize(file.size)}
                  </td>

                  {/* Date column */}
                  <td className="td-date text-xs text-slate-500">
                    {formatShortDate(file.lastModified)}
                  </td>

                  {/* Actions column */}
                  <td className="td-actions">
                    <div className="action-buttons-group">
                      <button
                        type="button"
                        className="btn-table-action btn-action-copy"
                        onClick={() => handleCopyName(file)}
                        title="Copy filename"
                        aria-label={`Copy filename ${file.name}`}
                      >
                        {isCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>

                      <button
                        type="button"
                        className={`btn-table-action btn-action-download ${isDownloading ? 'is-loading' : ''}`}
                        onClick={() => handleDownload(file)}
                        disabled={isDownloading}
                        title="Download file from EFS"
                        aria-label={`Download ${file.name}`}
                      >
                        {isDownloading ? (
                          <span className="spinner-xs" />
                        ) : (
                          <Download size={14} />
                        )}
                        <span className="action-text">Download</span>
                      </button>

                      <button
                        type="button"
                        className="btn-table-action btn-action-delete"
                        onClick={() => onOpenDeleteModal(file)}
                        title="Delete file from EFS"
                        aria-label={`Delete ${file.name}`}
                      >
                        <Trash2 size={14} />
                        <span className="action-text">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
