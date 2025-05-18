const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create a temp directory for building GitHub Pages version
const tempDir = path.join(__dirname, 'github-build-temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

console.log('Setting up GitHub Pages build environment...');

// Copy GitHub-specific files
console.log('Copying GitHub-specific files...');
fs.copyFileSync(
  path.join(__dirname, 'client/src/App.github.tsx'),
  path.join(__dirname, 'client/src/App.github.temp.tsx')
);
fs.copyFileSync(
  path.join(__dirname, 'client/src/main.github.tsx'),
  path.join(__dirname, 'client/src/main.github.temp.tsx')
);
fs.copyFileSync(
  path.join(__dirname, 'vite.github.config.ts'),
  path.join(__dirname, 'vite.github.temp.config.ts')
);

// Temporarily rename the original files
console.log('Backing up original files...');
if (fs.existsSync(path.join(__dirname, 'client/src/App.tsx'))) {
  fs.copyFileSync(
    path.join(__dirname, 'client/src/App.tsx'),
    path.join(__dirname, 'client/src/App.original.tsx')
  );
}

if (fs.existsSync(path.join(__dirname, 'client/src/main.tsx'))) {
  fs.copyFileSync(
    path.join(__dirname, 'client/src/main.tsx'),
    path.join(__dirname, 'client/src/main.original.tsx')
  );
}

if (fs.existsSync(path.join(__dirname, 'vite.config.ts'))) {
  fs.copyFileSync(
    path.join(__dirname, 'vite.config.ts'),
    path.join(__dirname, 'vite.config.original.ts')
  );
}

// Replace with GitHub-specific files
console.log('Setting up GitHub-specific files...');
fs.copyFileSync(
  path.join(__dirname, 'client/src/App.github.temp.tsx'),
  path.join(__dirname, 'client/src/App.tsx')
);
fs.copyFileSync(
  path.join(__dirname, 'client/src/main.github.temp.tsx'),
  path.join(__dirname, 'client/src/main.tsx')
);
fs.copyFileSync(
  path.join(__dirname, 'vite.github.temp.config.ts'),
  path.join(__dirname, 'vite.config.ts')
);

// Build the application
try {
  console.log('Building the application for GitHub Pages...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
} finally {
  // Restore original files
  console.log('Restoring original files...');
  if (fs.existsSync(path.join(__dirname, 'client/src/App.original.tsx'))) {
    fs.copyFileSync(
      path.join(__dirname, 'client/src/App.original.tsx'),
      path.join(__dirname, 'client/src/App.tsx')
    );
    fs.unlinkSync(path.join(__dirname, 'client/src/App.original.tsx'));
  }

  if (fs.existsSync(path.join(__dirname, 'client/src/main.original.tsx'))) {
    fs.copyFileSync(
      path.join(__dirname, 'client/src/main.original.tsx'),
      path.join(__dirname, 'client/src/main.tsx')
    );
    fs.unlinkSync(path.join(__dirname, 'client/src/main.original.tsx'));
  }

  if (fs.existsSync(path.join(__dirname, 'vite.config.original.ts'))) {
    fs.copyFileSync(
      path.join(__dirname, 'vite.config.original.ts'),
      path.join(__dirname, 'vite.config.ts')
    );
    fs.unlinkSync(path.join(__dirname, 'vite.config.original.ts'));
  }

  // Clean up temp files
  console.log('Cleaning up temporary files...');
  if (fs.existsSync(path.join(__dirname, 'client/src/App.github.temp.tsx'))) {
    fs.unlinkSync(path.join(__dirname, 'client/src/App.github.temp.tsx'));
  }
  if (fs.existsSync(path.join(__dirname, 'client/src/main.github.temp.tsx'))) {
    fs.unlinkSync(path.join(__dirname, 'client/src/main.github.temp.tsx'));
  }
  if (fs.existsSync(path.join(__dirname, 'vite.github.temp.config.ts'))) {
    fs.unlinkSync(path.join(__dirname, 'vite.github.temp.config.ts'));
  }
}

console.log('GitHub Pages build process completed.');
console.log('---------------------------------------');
console.log('Your static files are ready in the "dist" directory.');
console.log('To deploy to GitHub Pages:');
console.log('1. Create a GitHub repository if you haven\'t already');
console.log('2. Push your code to the repository');
console.log('3. Go to the repository settings > Pages');
console.log('4. Select "GitHub Actions" as the source');
console.log('5. Create a new workflow to deploy your dist folder');
console.log('Or follow GitHub\'s documentation for more details.');