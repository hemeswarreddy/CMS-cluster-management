# Online Content Management System - React Frontend

A production-grade, cloud-native React frontend for an AWS architecture powered by **Amazon EC2**, **Application Load Balancer (ALB)**, and **Amazon Elastic File System (EFS)**.

---

## 🏗️ Architecture Overview

The React frontend communicates exclusively with backend REST APIs exposed through the AWS Application Load Balancer. The shared Amazon EFS filesystem is the single source of truth for all persistent file data across both EC2 instances.

```text
React Frontend (Vite)
         |
         | HTTP REST API (Port 80)
         v
AWS Application Load Balancer (content-management-alb)
         |
         +-----------------------+
         |                       |
         v                       v
  EC2 Instance 1          EC2 Instance 2
(172.31.41.246)         (172.31.37.43)
         |                       |
         +-----------+-----------+
                     |
                     v
             Amazon EFS (fs-04d3bc3c56af5a861)
                     |
            /var/www/html/files
```

---

## 📁 Project Structure

```text
frontend/
├── index.html                  # HTML entrypoint with Google Fonts (Inter & Outfit)
├── vite.config.js              # Vite bundler configuration
├── package.json                # React 18, React Router, Lucide-react
├── .env                        # Local / production environment configuration
├── .env.example                # Example environment template
├── src/
│   ├── main.jsx                # React DOM root render
│   ├── App.jsx                 # Router, global state, layout scaffold
│   ├── index.css               # Production CSS design system & responsive styling
│   ├── config/
│   │   └── api.js              # API endpoints, AWS metadata, and base URL resolution
│   ├── services/
│   │   └── api.js              # REST service abstraction (fetch, XHR upload progress)
│   ├── context/
│   │   └── ToastContext.jsx    # Toast notification system (success, error, warning)
│   ├── hooks/
│   │   ├── useFiles.js         # Files fetching, 15s auto-polling, category filters, sorting
│   │   └── useServerInfo.js    # Active EC2 node tracker & round-trip ping tester
│   ├── utils/
│   │   └── fileUtils.js        # File size formatting, type badges, category detector
│   ├── components/
│   │   ├── Sidebar.jsx         # Responsive sidebar with EFS storage bar & AWS metadata
│   │   ├── Header.jsx          # Header with active EC2 instance badge & quick actions
│   │   ├── ServerBadge.jsx     # Active EC2 instance & IP indicator
│   │   ├── StatCard.jsx        # Metric cards with gradient accents
│   │   ├── FileTable.jsx       # Responsive file table with sorting, download & delete
│   │   ├── FileCard.jsx        # Grid card layout for file gallery
│   │   ├── FileIcon.jsx        # Specialized file type icons (PDF, DOCX, TXT, PNG, etc.)
│   │   ├── UploadZone.jsx      # Drag-and-drop zone with multi-file queue & progress bars
│   │   ├── StatusCard.jsx      # Cluster node cards (ALB, EC2-1, EC2-2, EFS)
│   │   ├── DeleteModal.jsx     # Permanent deletion confirmation modal dialog
│   │   ├── LoadingSkeleton.jsx # Shimmer skeleton loading placeholders
│   │   └── Toast.jsx           # Animated toast notification container
│   └── pages/
│       ├── Dashboard.jsx       # Overview metrics, storage breakdown, recent files
│       ├── Files.jsx           # Main file manager, search, filters, table/grid views
│       ├── Upload.jsx          # Ingestion workspace with upload guidelines
│       └── SystemStatus.jsx    # AWS architecture flow & live latency ping tester
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### 2. Install Dependencies
```bash
cd frontend
npm install
```

### 3. Configure Environment Variables
Create or verify `.env` in the `frontend/` directory:

```ini
# Backend API Base URL
# If hosting the frontend on the EC2 instances behind the ALB, you can leave this empty (uses same origin)
# For local development against your ALB:
VITE_API_BASE_URL=http://content-management-alb-941224789.eu-north-1.elb.amazonaws.com

# Auto-polling interval in milliseconds (default: 15 seconds)
VITE_AUTO_REFRESH_INTERVAL=15000

# AWS Metadata
VITE_AWS_REGION=eu-north-1
VITE_EFS_ID=fs-04d3bc3c56af5a861
VITE_EFS_MOUNT_PATH=/var/www/html/files
```

### 4. Run Locally
```bash
npm run dev
```
The application will start at `http://localhost:3000`.

---

## 📡 Backend REST APIs Required

The backend on EC2 handles the filesystem operations on `/var/www/html/files`. The React frontend connects to the following endpoints:

| Method | Endpoint | Description | Request / Response Format |
|---|---|---|---|
| `GET` | `/api/files` | Lists all files from `/var/www/html/files` | `[{"name": "test.txt", "size": 1024, "lastModified": "2026-10-04T00:30:00", "type": "text/plain"}]` |
| `POST` | `/api/files/upload` | Uploads a file to shared EFS | `multipart/form-data` with `file=<data>` |
| `GET` | `/api/files/download/:filename` | Downloads a specific file | Binary stream with `Content-Disposition: attachment` |
| `DELETE` | `/api/files/:filename` | Deletes a file from EFS | JSON `{ "success": true, "message": "File deleted" }` |
| `GET` | `/api/server-info` *(optional)* | Reports current EC2 node info | `{"serverName": "EC2 Instance 1", "privateIp": "172.31.41.246", "hostname": "..."}` |
| `GET` | `/api/status` *(optional)* | Reports cluster status | JSON node metadata |
| `GET` | `/api/health` *(optional)* | Health check for latency ping | HTTP 200 OK |

> **Note:** The frontend also automatically captures `X-Server-Name` and `X-Server-IP` response headers from ANY API request to identify which EC2 instance served the request.

---

## 📦 Building for Production

To create an optimized production build:

```bash
cd frontend
npm run build
```

This compiles static assets into the `frontend/dist/` directory.

---

## 🌐 Deploying with Existing AWS Infrastructure

There are two recommended ways to deploy this frontend alongside your current EC2 + ALB + EFS setup:

### Option A: Serve directly from the EC2 instances (Recommended)
1. Build the production files:
   ```bash
   npm run build
   ```
2. Copy the contents of `frontend/dist/*` to `/var/www/html/` on both EC2 instances (excluding the `/var/www/html/files/` directory which is mounted to EFS).
3. When served from `/var/www/html/`, set `VITE_API_BASE_URL=` (empty string in `.env` before building) so all API requests use relative paths directly to the ALB.

### Option B: Host on AWS S3 + CloudFront
1. Build with `VITE_API_BASE_URL=http://content-management-alb-941224789.eu-north-1.elb.amazonaws.com`.
2. Upload `frontend/dist/` to an Amazon S3 static website bucket.
3. Configure CORS on the backend/ALB to allow requests from your S3 / CloudFront origin.
