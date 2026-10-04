import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const ALB_TARGET = process.env.ALB_TARGET || 'http://content-management-alb-941224789.eu-north-1.elb.amazonaws.com';

// 1. Proxy /api requests to AWS Application Load Balancer
app.use(
  '/api',
  createProxyMiddleware({
    target: ALB_TARGET,
    changeOrigin: true,
    secure: false,
    logLevel: 'debug',
  })
);

// 2. Serve static React files from dist/
app.use(express.static(path.join(__dirname, 'dist')));

// 3. Fallback all client routes to index.html for Single Page Application routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Render Web Service] Running on port ${PORT}`);
  console.log(`[Render Web Service] Proxying /api/* -> ${ALB_TARGET}/api/*`);
});
