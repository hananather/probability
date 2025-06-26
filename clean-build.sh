#!/bin/bash

# Clean build script for Next.js project
# This helps avoid intermittent build errors

echo "🧹 Cleaning Next.js cache..."
rm -rf .next

echo "🔨 Running fresh build..."
npm run build

echo "✅ Build complete!"