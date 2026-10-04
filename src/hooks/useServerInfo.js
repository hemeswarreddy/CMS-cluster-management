import { useState, useEffect, useCallback } from 'react';
import { getServerInfo, getSystemStatus, pingHealth } from '../services/api';

export function useServerInfo() {
  const [serverInfo, setServerInfo] = useState({
    serverName: 'EC2 Instance 1',
    hostname: 'ip-172-31-41-246.eu-north-1.compute.internal',
    privateIp: '172.31.41.246',
    region: 'eu-north-1',
    efsId: 'fs-04d3bc3c56af5a861',
  });
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [latency, setLatency] = useState(null);
  const [isPinging, setIsPinging] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const [info, status] = await Promise.allSettled([
        getServerInfo(),
        getSystemStatus(),
      ]);

      if (info.status === 'fulfilled' && info.value) {
        setServerInfo(info.value);
      }
      if (status.status === 'fulfilled' && status.value) {
        setSystemStatus(status.value);
      }
    } catch (err) {
      console.warn('[useServerInfo] Error fetching status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const runPing = useCallback(async () => {
    setIsPinging(true);
    try {
      const res = await pingHealth();
      setLatency(res.latencyMs);
      if (res.serverInfo) {
        setServerInfo(res.serverInfo);
      }
      return res;
    } catch {
      setLatency(null);
    } finally {
      setIsPinging(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    runPing();
  }, [fetchStatus, runPing]);

  return {
    serverInfo,
    systemStatus,
    loading,
    latency,
    isPinging,
    refreshStatus: fetchStatus,
    runPing,
  };
}
