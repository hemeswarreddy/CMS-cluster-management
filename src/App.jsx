import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ToastContainer from './components/Toast';
import { ToastProvider } from './context/ToastContext';
import { useFiles } from './hooks/useFiles';
import { useServerInfo } from './hooks/useServerInfo';

// Pages
import Dashboard from './pages/Dashboard';
import Files from './pages/Files';
import Upload from './pages/Upload';
import SystemStatus from './pages/SystemStatus';

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Central state management for EFS files & AWS Server Info
  const filesHook = useFiles(true);
  const serverHook = useServerInfo();

  // Page title mapping based on current route
  const getPageInfo = () => {
    switch (location.pathname) {
      case '/dashboard':
        return {
          title: 'Cloud Dashboard',
          subtitle: 'Overview of Amazon EFS storage volume & active load balanced instances',
        };
      case '/files':
        return {
          title: 'File Manager',
          subtitle: 'All files synchronized on shared EFS volume (/var/www/html/files)',
        };
      case '/upload':
        return {
          title: 'File Ingestion',
          subtitle: 'Upload files directly into Amazon EFS through Application Load Balancer',
        };
      case '/status':
        return {
          title: 'Infrastructure Health',
          subtitle: 'Live cluster health, ALB listener status, and target EC2 node topology',
        };
      default:
        return {
          title: 'Online Content Management',
          subtitle: 'Cloud-based file management powered by AWS EC2 + EFS',
        };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <div className="app-container">
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        totalStorageBytes={filesHook.stats.totalStorageBytes}
        totalFiles={filesHook.stats.totalFiles}
      />

      {/* Main Content Area */}
      <div className="app-main-wrapper">
        <Header
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onRefresh={() => filesHook.fetchFiles(false)}
          isRefreshing={filesHook.refreshing}
          serverInfo={serverHook.serverInfo}
          lastFetchedAt={filesHook.lastFetchedAt}
        />

        <main className="app-content-body">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <Dashboard
                  filesHook={filesHook}
                  serverHook={serverHook}
                />
              }
            />
            <Route
              path="/files"
              element={
                <Files
                  filesHook={filesHook}
                />
              }
            />
            <Route
              path="/upload"
              element={
                <Upload
                  filesHook={filesHook}
                  serverHook={serverHook}
                />
              }
            />
            <Route
              path="/status"
              element={
                <SystemStatus
                  serverHook={serverHook}
                />
              }
            />
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </ToastProvider>
  );
}
