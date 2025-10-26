#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3000;
const host = 'localhost';

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let filePath = '.' + req.url;

  if (filePath === './') {
    filePath = './react-demo.html';
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code == 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
      }
    } else {
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(port, host, () => {
  console.log(`🎁 Hyperfocus Gift Engine React Demo running at http://${host}:${port}/`);
  console.log('📊 Open your browser and navigate to the URL above');
  console.log('🔗 This demo shows the React 18 web application interface');
  console.log('🚀 To use with real TikTok data, start the Python backend server');
});
