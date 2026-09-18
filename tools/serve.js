/* Tiny zero-dependency static file server for local preview during development.
   Not required for deployment — any static host (or opening index.html directly) works fine.
   Usage: node tools/serve.js [port]   (defaults to port 5173) */
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const port = parseInt(process.argv[2] || '5173', 10);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json'
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  let filePath = path.join(root, urlPath);

  if (!filePath.startsWith(root)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      // Clean-URL fallback: /services -> /services.html (matches how most static hosts behave)
      const withHtml = filePath + '.html';
      fs.readFile(withHtml, (errHtml, dataHtml) => {
        if (errHtml) { res.writeHead(404); res.end('Not found: ' + urlPath); return; }
        res.writeHead(200, { 'Content-Type': types['.html'], 'Cache-Control': 'no-store' });
        res.end(dataHtml);
      });
      return;
    }
    if (stats.isDirectory()) filePath = path.join(filePath, 'index.html');
    fs.readFile(filePath, (err2, data) => {
      if (err2) { res.writeHead(404); res.end('Not found: ' + urlPath); return; }
      const ext = path.extname(filePath).toLowerCase();
      // Dev server: never let the browser cache a stale copy while files are changing.
      res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(data);
    });
  });
});

server.listen(port, () => {
  console.log(`ECOSG site preview running at http://localhost:${port}`);
});
