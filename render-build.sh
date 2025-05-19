#!/bin/bash
# Install dependencies
npm install

# Copy the client files to dist
mkdir -p dist
cp -r client/src/* dist/
cp index.html dist/

# Build the server
npm install -g esbuild
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Build completed successfully!"
