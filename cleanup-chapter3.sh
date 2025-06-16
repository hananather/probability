#!/bin/bash

# Chapter 3 Cleanup Script
# This script removes unnecessary files from the Chapter 3 components

echo "Starting Chapter 3 cleanup..."

# Remove backup/old files
echo "Removing backup files..."
rm -f src/components/03-continuous-random-variables/3-2-1-ContinuousExpectationVariance-OLD.jsx
rm -f src/components/03-continuous-random-variables/3-4-2-ExponentialDistributionWorkedExample-OLD.jsx
rm -f src/components/03-continuous-random-variables/3-5-1-GammaDistribution-ORIGINAL.jsx

# Remove unused graphStyles.js
echo "Removing unused graphStyles.js..."
rm -f src/components/03-continuous-random-variables/graphStyles.js

# Remove unused-archive folder
echo "Removing unused-archive folder..."
rm -rf src/components/03-continuous-random-variables/unused-archive

echo "Cleanup complete!"
echo ""
echo "Files removed:"
echo "- 3-2-1-ContinuousExpectationVariance-OLD.jsx"
echo "- 3-4-2-ExponentialDistributionWorkedExample-OLD.jsx"
echo "- 3-5-1-GammaDistribution-ORIGINAL.jsx"
echo "- graphStyles.js"
echo "- unused-archive/ (entire folder)"
echo ""
echo "Note: The worked example components (3-1-2, 3-3-2) were kept as they may be referenced in the MDX content."