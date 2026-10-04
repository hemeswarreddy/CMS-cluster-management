import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderOpen,
  HardDrive,
  Server,
  Activity,
  UploadCloud,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import FileTable from '../components/FileTable';
import DeleteModal from '../components/DeleteModal';
import UploadZone from '../components/UploadZone';
import { TableSkeleton, StatCardSkeleton } from '../components/LoadingSkeleton';
import { formatFileSize } from '../utils/fileUtils';
import { APP_CONFIG } from '../config/api';
import { useToast } from '../context/ToastContext';

export default function Dashboard({ filesHook, serverHook }) {
  const {
    files,
    filteredFiles,
    loading,
    refreshing,
    error,
    stats,
    fetchFiles,
    deleteFile,
  } = filesHook;

  const { serverInfo, latency } = serverHook;
  const { success, error: toastError } = useToast();

  const [selectedFileForDelete, setSelectedFileForDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Top 5 recent files for quick preview
  const recentFiles = [...files]
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
    .slice(0, 5);

  const handleDeleteConfirm = async () => {
    if (!selectedFileForDelete) return;
    setIsDeleting(true);
    try {
      await deleteFile(selectedFileForDelete.name);
      success(`File "${selectedFileForDelete.name}" deleted from shared EFS`);
      setSelectedFileForDelete(null);
    } catch (err) {
      toastError(`Failed to delete file: ${err.message || 'Server error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="dashboard-page space-y-6">
      {/* Error banner if backend has connection issues */}
      {error && (
        <div className="alert-banner alert-banner-warning">
          <div className="flex items-center gap-3">
            <Activity className="text-amber-600 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-semibold text-amber-900 text-sm">Connection Warning</h4>
              <p className="text-xs text-amber-700 mt-0.5">
                {error} (Make sure your EC2 backend REST API is running and ALB is routing to port 80).
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-xs whitespace-nowrap"
            onClick={() => fetchFiles(false)}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Primary Metrics Grid */}
      <section className="stats-grid" aria-label="System Metrics Overview">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Files"
              value={stats.totalFiles}
              subtitle="Files stored across EFS"
              icon={<FolderOpen size={24} />}
              color="blue"
              badgeText="Shared Volume"
            />
            <StatCard
              title="Storage Used"
              value={formatFileSize(stats.totalStorageBytes)}
              subtitle={`Mounted at ${APP_CONFIG.efsMountPath}`}
              icon={<HardDrive size={24} />}
              color="purple"
              badgeText="Amazon EFS"
            />
            <StatCard
              title="EFS Status"
              value="Connected"
              subtitle={`ID: ${APP_CONFIG.efsId}`}
              icon={<Layers size={24} />}
              color="emerald"
              badgeText="ReadWriteMany"
            />
            <StatCard
              title="Active Server"
              value={serverInfo?.serverName || 'EC2 Instance 1'}
              subtitle={serverInfo?.privateIp || '172.31.41.246'}
              icon={<Server size={24} />}
              color="indigo"
              badgeText={latency ? `${latency}ms ALB` : 'ALB Target'}
            />
          </>
        )}
      </section>

      {/* Cluster Storage & Load Balance Overview */}
      <section className="dashboard-grid-2col">
        {/* Storage Distribution Visualizer */}
        <div className="card dashboard-card">
          <div className="card-header flex justify-between items-center">
            <div>
              <h3 className="card-title">EFS Storage Distribution</h3>
              <p className="card-subtitle">File composition on {APP_CONFIG.efsId}</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full font-mono">
              {formatFileSize(stats.totalStorageBytes)} Total
            </span>
          </div>

          <div className="card-body">
            <div className="storage-distribution-bar">
              <div
                className="dist-segment bg-blue-500"
                style={{
                  width: `${stats.totalFiles > 0 ? (stats.categoryCounts.documents / stats.totalFiles) * 100 : 0}%`,
                }}
                title={`Documents: ${stats.categoryCounts.documents}`}
              />
              <div
                className="dist-segment bg-pink-500"
                style={{
                  width: `${stats.totalFiles > 0 ? (stats.categoryCounts.images / stats.totalFiles) * 100 : 0}%`,
                }}
                title={`Images: ${stats.categoryCounts.images}`}
              />
              <div
                className="dist-segment bg-purple-500"
                style={{
                  width: `${stats.totalFiles > 0 ? (stats.categoryCounts.videos / stats.totalFiles) * 100 : 0}%`,
                }}
                title={`Videos: ${stats.categoryCounts.videos}`}
              />
              <div
                className="dist-segment bg-amber-500"
                style={{
                  width: `${stats.totalFiles > 0 ? (stats.categoryCounts.archives / stats.totalFiles) * 100 : 0}%`,
                }}
                title={`Archives: ${stats.categoryCounts.archives}`}
              />
              <div
                className="dist-segment bg-emerald-500"
                style={{
                  width: `${stats.totalFiles > 0 ? (stats.categoryCounts.code / stats.totalFiles) * 100 : 0}%`,
                }}
                title={`Code: ${stats.categoryCounts.code}`}
              />
              <div
                className="dist-segment bg-slate-400"
                style={{
                  width: `${stats.totalFiles > 0 ? (stats.categoryCounts.other / stats.totalFiles) * 100 : 0}%`,
                }}
                title={`Other: ${stats.categoryCounts.other}`}
              />
            </div>

            <div className="storage-legend-grid">
              <div className="legend-item">
                <span className="legend-dot bg-blue-500" />
                <span className="legend-label">Docs ({stats.categoryCounts.documents})</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot bg-pink-500" />
                <span className="legend-label">Images ({stats.categoryCounts.images})</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot bg-purple-500" />
                <span className="legend-label">Videos ({stats.categoryCounts.videos})</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot bg-amber-500" />
                <span className="legend-label">Archives ({stats.categoryCounts.archives})</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot bg-emerald-500" />
                <span className="legend-label">Code ({stats.categoryCounts.code})</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot bg-slate-400" />
                <span className="legend-label">Other ({stats.categoryCounts.other})</span>
              </div>
            </div>

            <div className="efs-info-box mt-4">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle size={14} className="text-emerald-500" />
                <span>
                  Amazon EFS automatically scales file storage capacity up or down as you add and remove files.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AWS Architecture Summary Card */}
        <div className="card dashboard-card">
          <div className="card-header flex justify-between items-center">
            <div>
              <h3 className="card-title">Cluster Architecture</h3>
              <p className="card-subtitle">Active Load Balancer & Nodes</p>
            </div>
            <Link to="/status" className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
              <span>View Architecture</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="card-body">
            <div className="arch-flow-diagram">
              <div className="arch-step">
                <span className="arch-step-badge">ALB</span>
                <span className="arch-step-title">{APP_CONFIG.albName}</span>
                <span className="arch-step-sub font-mono">Port 80 HTTP</span>
              </div>
              <div className="arch-connector">➔</div>
              <div className="arch-step">
                <span className="arch-step-badge">EC2 Target</span>
                <span className="arch-step-title">{serverInfo?.serverName || 'EC2 Instance 1'}</span>
                <span className="arch-step-sub font-mono">{serverInfo?.privateIp || '172.31.41.246'}</span>
              </div>
              <div className="arch-connector">➔</div>
              <div className="arch-step is-final">
                <span className="arch-step-badge badge-efs">Amazon EFS</span>
                <span className="arch-step-title">{APP_CONFIG.efsId}</span>
                <span className="arch-step-sub font-mono">{APP_CONFIG.efsMountPath}</span>
              </div>
            </div>

            <div className="cluster-info-pills">
              <div className="info-pill">
                <span className="pill-key">Region:</span>
                <span className="pill-val font-mono">{APP_CONFIG.region}</span>
              </div>
              <div className="info-pill">
                <span className="pill-key">Targets:</span>
                <span className="pill-val">2 Healthy EC2s</span>
              </div>
              <div className="info-pill">
                <span className="pill-key">Sync:</span>
                <span className="pill-val text-emerald-600">Immediate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Upload Widget */}
      <section className="card dashboard-card">
        <div className="card-header flex justify-between items-center">
          <div>
            <h3 className="card-title">Quick Upload</h3>
            <p className="card-subtitle">Directly upload files into shared EFS storage</p>
          </div>
          <Link to="/upload" className="btn btn-secondary btn-sm flex items-center gap-1.5">
            <UploadCloud size={14} />
            <span>Full Upload Page</span>
          </Link>
        </div>
        <div className="card-body">
          <UploadZone onUploadSuccess={() => fetchFiles(true)} compact={true} />
        </div>
      </section>

      {/* Recent Files Table */}
      <section className="card dashboard-card">
        <div className="card-header flex justify-between items-center">
          <div>
            <h3 className="card-title">Recent Files</h3>
            <p className="card-subtitle">Latest content synchronized across both EC2 servers</p>
          </div>
          <Link to="/files" className="btn btn-primary btn-sm flex items-center gap-1.5">
            <span>View All Files ({files.length})</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <TableSkeleton rows={4} />
          ) : recentFiles.length > 0 ? (
            <FileTable
              files={recentFiles}
              sortBy="lastModified"
              sortOrder="desc"
              onSort={() => {}}
              onOpenDeleteModal={(file) => setSelectedFileForDelete(file)}
            />
          ) : (
            <div className="empty-state-container">
              <div className="empty-state-icon">
                <FolderOpen size={36} className="text-slate-400" />
              </div>
              <h4 className="empty-state-title">No files stored in EFS yet</h4>
              <p className="empty-state-desc">
                Files uploaded here will automatically be available to both EC2 instances via Amazon EFS.
              </p>
              <Link to="/upload" className="btn btn-primary btn-sm mt-3">
                Upload Your First File
              </Link>
            </div>
          )}
        </div>
      </section>

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
