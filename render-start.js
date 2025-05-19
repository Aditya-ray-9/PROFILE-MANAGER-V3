import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// API routes
app.use('/api', (req, res, next) => {
  // Backend API handling
  next();
});

// Serve static files from the root directory
app.use(express.static(__dirname));

// Check if the main page exists in various locations
const possibleIndexPaths = [
  path.join(__dirname, 'dist', 'index.html'),
  path.join(__dirname, 'index.html'),
  path.join(__dirname, 'client', 'index.html'),
  path.join(__dirname, 'client', 'src', 'index.html'),
  path.join(__dirname, 'public', 'index.html')
];

// Find the first index.html that exists
let indexPath = null;
for (const indexFilePath of possibleIndexPaths) {
  if (fs.existsSync(indexFilePath)) {
    indexPath = indexFilePath;
    break;
  }
}

// If no index.html found, create a simple one
if (!indexPath) {
  indexPath = path.join(__dirname, 'index.html');
  const fallbackHtml = `
    <html>
      <head>
        <title>Profile Manager</title>
        <meta http-equiv="refresh" content="0;url=/" />
      </head>
      <body>
        <p>Redirecting to application...</p>
        <script>window.location.href = '/';</script>
      </body>
    </html>
  `;
  fs.writeFileSync(indexPath, fallbackHtml);
}

// Serve all routes with the index.html
app.get('*', (req, res) => {
  res.sendFile(indexPath);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Serving index from: ${indexPath}`);
});
