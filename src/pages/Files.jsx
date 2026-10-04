import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderOpen,
  Search,
  Filter,
  RefreshCw,
  Upload,
  LayoutGrid,
  List,
  SlidersHorizontal,
  HardDrive,
  Clock,
  ArrowUpDown,
  CheckCircle2,
  FileQuestion,
  RotateCw,
} from 'lucide-react';
import FileTable from '../components/FileTable';
import FileCard from '../components/FileCard';
import DeleteModal from '../components/DeleteModal';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { formatFileSize } from '../utils/fileUtils';
import { APP_CONFIG } from '../config/api';
import { useToast } from '../context/ToastContext';

export default function Files({ filesHook }) {
  const {
    files,
    filteredFiles,
    loading,
    refreshing,
    error,
    stats,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    sortOrder,
    toggleSort,
    autoRefresh,
    setAutoRefresh,
    lastFetchedAt,
    fetchFiles,
    deleteFile,
  } = filesHook;

  const { success, error: toastError } = useToast();
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [selectedFileForDelete, setSelectedFileForDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const categories = [
    { id: 'all', label: 'All Files', count: stats.categoryCounts.all },
    { id: 'documents', label: 'Documents', count: stats.categoryCounts.documents },
    { id: 'images', label: 'Images', count: stats.categoryCounts.images },
    { id: 'videos', label: 'Videos', count: stats.categoryCounts.videos },
    { id: 'audio', label: 'Audio', count: stats.categoryCounts.audio },
    { id: 'archives', label: 'Archives', count: stats.categoryCounts.archives },
    { id: 'code', label: 'Code', count: stats.categoryCounts.code },
    { id: 'other', label: 'Other', count: stats.categoryCounts.other },
  ];

  const handleDeleteConfirm = async () => {
    if (!selectedFileForDelete) return;
    setIsDeleting(true);
    try {
      await deleteFile(selectedFileForDelete.name);
      success(`File "${selectedFileForDelete.name}" deleted from shared EFS`);
      setSelectedFileForDelete(null);
    } catch (err) {
      toastError(`Failed to delete: ${err.message || 'Server error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="files-page space-y-5">
      {/* Top Controls Bar */}
      <div className="files-control-panel">
        <div className="search-box-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by file name or extension..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search files"
          />
          {searchTerm && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchTerm('')}
            >
              Clear
            </button>
          )}
        </div>

        <div className="files-actions-group">
          {/* View Mode Switcher */}
          <div className="view-mode-toggle">
            <button
              type="button"
              className={`btn-view-mode ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table view"
              aria-label="Table view"
            >
              <List size={16} />
            </button>
            <button
              type="button"
              className={`btn-view-mode ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
              aria-label="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          {/* Auto Refresh Toggle */}
          <div className="auto-refresh-pill">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              <span className="toggle-slider round" />
            </label>
            <span className="text-xs font-medium text-slate-600 select-none">
              Auto-sync (15s)
            </span>
          </div>

          {/* Manual Refresh Button */}
          <button
            type="button"
            className={`btn btn-secondary btn-sm flex items-center gap-1.5 ${refreshing ? 'is-spinning' : ''}`}
            onClick={() => fetchFiles(false)}
            disabled={refreshing}
            title="Fetch latest file list from shared EFS volume"
          >
            <RotateCw size={14} />
            <span>Refresh</span>
          </button>

          {/* Upload Button */}
          <Link to="/upload" className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-sm">
            <Upload size={14} />
            <span>Upload New</span>
          </Link>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="category-tabs-container">
        <div className="category-tabs-list">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`cat-tab-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span className="cat-tab-label">{cat.label}</span>
              <span className="cat-tab-count">{cat.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Meta Bar: Count & EFS Mount reminder */}
      <div className="files-meta-bar">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span>
            Showing <strong className="text-slate-900">{filteredFiles.length}</strong> of{' '}
            <strong className="text-slate-900">{files.length}</strong> files
          </span>
          {searchTerm && (
            <span className="text-blue-600 font-medium">matching "{searchTerm}"</span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1 font-mono">
            <HardDrive size={13} className="text-purple-600" />
            {APP_CONFIG.efsMountPath}
          </span>
          {lastFetchedAt && (
            <span className="hidden-mobile flex items-center gap-1 text-slate-400">
              <Clock size={12} /> Last synced {lastFetchedAt.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Main Files View */}
      <div className="card files-content-card">
        {loading ? (
          <div className="p-4">
            <TableSkeleton rows={8} />
          </div>
        ) : filteredFiles.length > 0 ? (
          viewMode === 'table' ? (
            <FileTable
              files={filteredFiles}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={toggleSort}
              onOpenDeleteModal={(file) => setSelectedFileForDelete(file)}
            />
          ) : (
            <div className="file-grid-container p-5">
              {filteredFiles.map((file) => (
                <FileCard
                  key={file.id || file.name}
                  file={file}
                  onOpenDeleteModal={(f) => setSelectedFileForDelete(f)}
                />
              ))}
            </div>
          )
        ) : (
          <div className="empty-state-container p-12 text-center">
            <div className="empty-state-icon">
              {searchTerm || selectedCategory !== 'all' ? (
                <FileQuestion size={44} className="text-slate-400 mx-auto" />
              ) : (
                <FolderOpen size={44} className="text-slate-400 mx-auto" />
              )}
            </div>
            <h4 className="empty-state-title mt-3">
              {searchTerm || selectedCategory !== 'all'
                ? 'No matching files found'
                : 'No files yet'}
            </h4>
            <p className="empty-state-desc max-w-md mx-auto">
              {searchTerm || selectedCategory !== 'all'
                ? `No files in category "${selectedCategory}" matched "${searchTerm}". Try resetting filters or search.`
                : 'Upload your first file to get started with Amazon EFS shared storage.'}
            </p>

            <div className="mt-5 flex items-center justify-center gap-3">
              {searchTerm || selectedCategory !== 'all' ? (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                >
                  Clear All Filters
                </button>
              ) : (
                <Link to="/upload" className="btn btn-primary btn-sm flex items-center gap-1.5">
                  <Upload size={14} />
                  <span>Upload File</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={!!selectedFileForDelete}
        file={selectedFileForDelete}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setSelectedFileForDelete(null)}
      />
    </div>
  );
}
