const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create necessary directories
const distDir = path.resolve(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Create a root index.html file that redirects to the actual app
const rootIndexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profile Manager</title>
    <script>
      window.location.href = "./dist/index.html";
    </script>
  </head>
  <body>
    <p>Redirecting to the Profile Manager app...</p>
    <p>If you are not redirected automatically, <a href="./dist/index.html">click here</a>.</p>
  </body>
</html>`;

// Create a .nojekyll file to prevent GitHub Pages from using Jekyll
fs.writeFileSync(path.join(__dirname, '.nojekyll'), '');

// Create root index.html file to prevent 404
fs.writeFileSync(path.join(__dirname, 'index.html'), rootIndexHtml);

console.log('GitHub Pages deployment files created successfully.');
console.log('To deploy:');
console.log('1. Run the build process: npm run build');
console.log('2. Commit all files, including dist/ folder, index.html, and .nojekyll');
console.log('3. Push to GitHub repository');
console.log('4. Enable GitHub Pages in repository settings (use main branch)');