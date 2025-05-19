import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Check if dist directory exists
if (fs.existsSync('./dist')) {
  // Serve static files from the dist directory
  app.use(express.static('./dist'));
  
  // For SPA routing, serve index.html for all non-file requests
  app.get('*', (req, res) => {
    if (!req.path.includes('.')) {
      res.sendFile(path.resolve('./dist/index.html'));
    }
  });
} else {
  // Handle case where dist directory doesn't exist
  app.get('*', (req, res) => {
    res.send('Application is being built. Please check back shortly.');
  });
}

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
