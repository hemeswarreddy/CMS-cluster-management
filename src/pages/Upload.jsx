import React from 'react';
import {
  UploadCloud,
  CheckCircle2,
  HardDrive,
  Server,
  Cloud,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import UploadZone from '../components/UploadZone';
import { APP_CONFIG } from '../config/api';

export default function Upload({ filesHook, serverHook }) {
  const { fetchFiles } = filesHook;
  const { serverInfo } = serverHook;

  return (
    <div className="upload-page space-y-6">
      {/* Upload Architecture Callout */}
      <div className="upload-info-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="upload-info-icon-box">
              <Layers size={22} className="text-blue-600" />
            </div>
            <div>
              <h3 className="upload-info-title">
                Direct Cloud Ingestion to Amazon EFS
              </h3>
              <p className="upload-info-desc">
                Files uploaded here are processed by the active EC2 instance ({serverInfo?.serverName || 'EC2 Instance 1'}) and stored persistently on EFS volume <code className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-xs">{APP_CONFIG.efsId}</code>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <span className="status-dot-sm bg-emerald-500" />
            <span>Dual-Instance Sync Active</span>
          </div>
        </div>
      </div>

      {/* Main Drag & Drop Zone */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Upload Files</h3>
          <p className="card-subtitle">
            Select or drag files to upload directly into <span className="font-mono text-slate-700">{APP_CONFIG.efsMountPath}</span>
          </p>
        </div>
        <div className="card-body">
          <UploadZone
            onUploadSuccess={() => {
              // Refresh files list so the dashboard/files pages are updated
              fetchFiles(true);
            }}
          />
        </div>
      </div>

      {/* Technical Highlights / Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 feature-highlight-card">
          <div className="flex items-center gap-2.5 text-blue-600 mb-2">
            <ShieldCheck size={18} />
            <h4 className="font-semibold text-sm text-slate-900">EFS Shared Volume</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Content is saved to <code className="font-mono text-2xs">/var/www/html/files</code>. Any file uploaded via EC2 Instance 1 is immediately accessible to EC2 Instance 2.
          </p>
        </div>

        <div className="card p-4 feature-highlight-card">
          <div className="flex items-center gap-2.5 text-indigo-600 mb-2">
            <Zap size={18} />
            <h4 className="font-semibold text-sm text-slate-900">Load Balanced API</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Upload requests route through <code className="font-mono text-2xs">{APP_CONFIG.albName}</code>, optimizing bandwidth and handling multipart streams reliably.
          </p>
        </div>

        <div className="card p-4 feature-highlight-card">
          <div className="flex items-center gap-2.5 text-emerald-600 mb-2">
            <CheckCircle2 size={18} />
            <h4 className="font-semibold text-sm text-slate-900">Multi-Format Ready</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Supports PDF, DOCX, XLSX, TXT, images (PNG, JPG), audio/video (MP3, MP4), and compressed archives (ZIP, TAR).
          </p>
        </div>
      </div>
    </div>
  );
}
