#!/bin/bash
set -e

echo "Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

echo "Building Admin Panel..."
cd admin-panel
npm install
npm run build
cd ..

echo "Building Mini App..."
cd miniapp/frontend
npm install
npm run build
cd ../..

echo "Build complete!"
