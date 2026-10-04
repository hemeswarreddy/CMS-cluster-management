import React, { useState } from 'react';
import {
  Activity,
  Cloud,
  Server,
  HardDrive,
  Globe,
  Radio,
  Zap,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Layers,
} from 'lucide-react';
import StatusCard from '../components/StatusCard';
import { APP_CONFIG } from '../config/api';
import { useToast } from '../context/ToastContext';

export default function SystemStatus({ serverHook }) {
  const {
    serverInfo,
    systemStatus,
    loading,
    latency,
    isPinging,
    refreshStatus,
    runPing,
  } = serverHook;

  const { success, error } = useToast();
  const [pingResult, setPingResult] = useState(null);

  const handleTestPing = async () => {
    try {
      const res = await runPing();
      setPingResult(res);
      if (res.ok) {
        success(`Ping successful! Round-trip latency: ${res.latencyMs} ms`);
      } else {
        error(`Ping returned non-OK status: ${res.latencyMs} ms`);
      }
    } catch (err) {
      error(`Ping failed: ${err.message || 'Network error'}`);
    }
  };

  const albData = systemStatus?.alb || {
    name: APP_CONFIG.albName,
    dns: APP_CONFIG.albDns,
    status: 'Active',
    port: 80,
    protocol: 'HTTP',
    targetGroup: 'content-management-tg',
  };

  const instances = systemStatus?.instances || [
    {
      id: 'i-01a2b3c4d5e6f7g8h',
      name: 'EC2 Instance 1',
      hostname: 'ip-172-31-41-246.eu-north-1.compute.internal',
      privateIp: '172.31.41.246',
      status: 'Healthy',
      az: 'eu-north-1a',
      role: 'Web Application Server',
    },
    {
      id: 'i-09z8y7x6w5v4u3t2s',
      name: 'EC2 Instance 2',
      hostname: 'ip-172-31-37-43.eu-north-1.compute.internal',
      privateIp: '172.31.37.43',
      status: 'Healthy',
      az: 'eu-north-1b',
      role: 'Web Application Server',
    },
  ];

  const efsData = systemStatus?.efs || {
    fileSystemId: APP_CONFIG.efsId,
    mountPath: APP_CONFIG.efsMountPath,
    status: 'Connected',
    mountType: 'NFSv4.1',
    accessMode: 'ReadWriteMany (Shared)',
    region: APP_CONFIG.region,
  };

  // Check if current serverInfo matches Instance 1 or 2
  const activeIp = serverInfo?.privateIp || '172.31.41.246';

  return (
    <div className="system-status-page space-y-6">
      {/* Top Banner with Health Overview and Ping Tool */}
      <div className="status-overview-hero">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-system-all-good">
                <span className="status-dot-sm bg-emerald-500 animate-pulse" />
                All Cloud Services Operational
              </span>
              <span className="text-xs text-slate-400 font-mono">AWS Stockholm ({APP_CONFIG.region})</span>
            </div>
            <h2 className="status-hero-title">
              Infrastructure & Node Topology
            </h2>
            <p className="status-hero-desc">
              Real-time operational status for Application Load Balancer, EC2 Target Group instances, and Amazon EFS filesystem.
            </p>
          </div>

          <div className="status-hero-actions">
            <button
              type="button"
              className={`btn btn-primary btn-sm flex items-center gap-2 ${isPinging ? 'is-loading' : ''}`}
              onClick={handleTestPing}
              disabled={isPinging}
            >
              {isPinging ? (
                <>
                  <span className="spinner-xs" /> Pinging ALB...
                </>
              ) : (
                <>
                  <Zap size={15} /> Ping ALB Endpoint
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm flex items-center gap-1.5"
              onClick={refreshStatus}
            >
              <RefreshCw size={14} />
              <span>Refresh Status</span>
            </button>
          </div>
        </div>

        {/* Live Latency Metric Bar */}
        {latency !== null && (
          <div className="latency-bar-widget mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium flex items-center gap-1.5">
                <Radio size={13} className="text-blue-500" />
                Latest API Round-Trip Latency: <strong className="text-slate-900">{latency} ms</strong>
              </span>
              <span className="text-slate-500 font-mono">
                Last Handled by: <strong>{serverInfo?.serverName || 'EC2 Instance 1'}</strong> ({activeIp})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Visual AWS Architecture Flow */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <div>
            <h3 className="card-title">Live Architectural Flow</h3>
            <p className="card-subtitle">End-to-end request distribution and persistent storage pipeline</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
            NFSv4.1 Shared Protocol
          </span>
        </div>

        <div className="card-body">
          <div className="topology-pipeline">
            {/* Step 1: Internet / Client */}
            <div className="pipeline-node node-client">
              <div className="pipeline-icon">
                <Globe size={20} className="text-blue-500" />
              </div>
              <div className="pipeline-title">Client Browser</div>
              <div className="pipeline-sub">React Frontend</div>
            </div>

            <div className="pipeline-arrow">
              <span>HTTP 80</span>
              <div className="arrow-line" />
            </div>

            {/* Step 2: ALB */}
            <div className="pipeline-node node-alb">
              <div className="pipeline-icon">
                <Cloud size={20} className="text-indigo-500" />
              </div>
              <div className="pipeline-title">{albData.name}</div>
              <div className="pipeline-sub font-mono text-2xs">AWS ALB (Port 80)</div>
            </div>

            <div className="pipeline-arrow">
              <span>Target Group</span>
              <div className="arrow-line" />
            </div>

            {/* Step 3: EC2 Instances */}
            <div className="pipeline-group">
              <div className={`pipeline-subnode ${activeIp.includes('41.246') ? 'is-active-target' : ''}`}>
                <div className="flex items-center gap-1.5">
                  <Server size={14} className="text-slate-600" />
                  <span className="font-semibold text-xs">EC2 Instance 1</span>
                </div>
                <span className="font-mono text-2xs text-slate-500">172.31.41.246</span>
              </div>
              <div className={`pipeline-subnode ${activeIp.includes('37.43') ? 'is-active-target' : ''}`}>
                <div className="flex items-center gap-1.5">
                  <Server size={14} className="text-slate-600" />
                  <span className="font-semibold text-xs">EC2 Instance 2</span>
                </div>
                <span className="font-mono text-2xs text-slate-500">172.31.37.43</span>
              </div>
            </div>

            <div className="pipeline-arrow">
              <span>NFS Mount</span>
              <div className="arrow-line" />
            </div>

            {/* Step 4: Amazon EFS */}
            <div className="pipeline-node node-efs">
              <div className="pipeline-icon">
                <HardDrive size={20} className="text-purple-600" />
              </div>
              <div className="pipeline-title">Amazon EFS</div>
              <div className="pipeline-sub font-mono text-2xs">{APP_CONFIG.efsId}</div>
              <div className="pipeline-mount font-mono text-2xs">{APP_CONFIG.efsMountPath}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Nodes Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ALB Status Card */}
        <StatusCard
          title="Application Load Balancer"
          subtitle="AWS Elastic Load Balancing"
          type="alb"
          status={albData.status}
          details={[
            { label: 'ALB Name', value: albData.name },
            { label: 'DNS Endpoint', value: albData.dns, isCode: true, tooltip: albData.dns },
            { label: 'Listener Port', value: `${albData.port} (${albData.protocol})` },
            { label: 'Target Group', value: albData.targetGroup },
            { label: 'Algorithm', value: 'Round Robin' },
          ]}
        />

        {/* Amazon EFS Status Card */}
        <StatusCard
          title="Amazon Elastic File System"
          subtitle="Managed NFS Shared Storage"
          type="efs"
          status={efsData.status}
          details={[
            { label: 'File System ID', value: efsData.fileSystemId, isCode: true },
            { label: 'Mount Path', value: efsData.mountPath, isCode: true },
            { label: 'Mount Protocol', value: efsData.mountType },
            { label: 'Access Mode', value: efsData.accessMode },
            { label: 'Sync Consistency', value: 'Strong Read-After-Write' },
          ]}
        />

        {/* EC2 Instance 1 */}
        <StatusCard
          title={instances[0]?.name || 'EC2 Instance 1'}
          subtitle="Target Group Node #1"
          type="ec2"
          status={instances[0]?.status || 'Healthy'}
          highlight={activeIp.includes('41.246')}
          details={[
            { label: 'Hostname', value: instances[0]?.hostname, isCode: true },
            { label: 'Private IP', value: instances[0]?.privateIp, isCode: true },
            { label: 'Availability Zone', value: instances[0]?.az || 'eu-north-1a' },
            { label: 'EFS Mount', value: 'Mounted at /var/www/html/files', isCode: true },
            { label: 'Active Handler', value: activeIp.includes('41.246') ? '★ Handled last request' : 'Standby' },
          ]}
        />

        {/* EC2 Instance 2 */}
        <StatusCard
          title={instances[1]?.name || 'EC2 Instance 2'}
          subtitle="Target Group Node #2"
          type="ec2"
          status={instances[1]?.status || 'Healthy'}
          highlight={activeIp.includes('37.43')}
          details={[
            { label: 'Hostname', value: instances[1]?.hostname, isCode: true },
            { label: 'Private IP', value: instances[1]?.privateIp, isCode: true },
            { label: 'Availability Zone', value: instances[1]?.az || 'eu-north-1b' },
            { label: 'EFS Mount', value: 'Mounted at /var/www/html/files', isCode: true },
            { label: 'Active Handler', value: activeIp.includes('37.43') ? '★ Handled last request' : 'Standby' },
          ]}
        />
      </div>
    </div>
  );
}
