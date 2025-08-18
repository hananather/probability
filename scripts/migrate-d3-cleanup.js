#!/usr/bin/env node

/**
 * Migration script to refactor D3 components to use useD3Cleanup hook
 * This script helps automate the conversion of D3.js components to use proper cleanup
 */

const fs = require('fs');
const path = require('path');

// Pattern to identify D3 useEffect blocks
const D3_USEEFFECT_PATTERN = /useEffect\s*\(\s*\(\)\s*=>\s*\{[\s\S]*?d3\.select[\s\S]*?\},\s*\[[^\]]*\]\)/g;
const SVG_REF_PATTERN = /const\s+(\w+Ref)\s*=\s*useRef\s*\(\s*null\s*\)/g;
const D3_IMPORT_PATTERN = /import\s+\*\s+as\s+d3\s+from\s+["'][@/]utils\/d3-utils["'];?/;

/**
 * Check if a file needs migration
 */
function needsMigration(content) {
  // Check if it uses D3
  if (!content.includes('d3.select')) return false;
  
  // Check if already using useD3Cleanup
  if (content.includes('useD3Cleanup')) return false;
  
  // Check if it has D3 in useEffect
  if (D3_USEEFFECT_PATTERN.test(content)) return true;
  
  return false;
}

/**
 * Extract D3 drawing logic from useEffect
 */
function extractDrawFunction(useEffectBlock) {
  // Find the D3 drawing code within the useEffect
  const match = useEffectBlock.match(/useEffect\s*\(\s*\(\)\s*=>\s*\{([\s\S]*?)\},\s*\[([^\]]*)\]\)/);
  if (!match) return null;
  
  const body = match[1];
  const dependencies = match[2];
  
  // Clean up the body to create a drawing function
  let drawingCode = body
    .replace(/^\s*if\s*\(!svgRef\.current[^)]*\)\s*return;?\s*/gm, '')
    .replace(/^\s*const\s+svg\s*=\s*d3\.select\(svgRef\.current\);?\s*/gm, '')
    .replace(/^\s*svg\.selectAll\("\*"\)\.remove\(\);?\s*/gm, '')
    .trim();
  
  return { drawingCode, dependencies };
}

/**
 * Generate the refactored code using useD3Cleanup
 */
function generateRefactoredCode(content, componentName) {
  let refactored = content;
  
  // Add useD3Cleanup import if not present
  if (!refactored.includes('useD3Cleanup')) {
    if (refactored.includes("import { ") && refactored.includes("} from '@/hooks/")) {
      // Add to existing hooks import
      refactored = refactored.replace(
        /(import\s*\{[^}]*)\}\s*from\s*['"]@\/hooks[^'"]*['"]/,
        "$1, useD3Cleanup } from '@/hooks/useD3Cleanup'"
      );
    } else {
      // Add new import after React import
      refactored = refactored.replace(
        /(import\s+React[^;]*;)/,
        "$1\nimport { useD3Cleanup } from '@/hooks/useD3Cleanup';"
      );
    }
  }
  
  // Find all D3 useEffect blocks
  const useEffectMatches = [...refactored.matchAll(D3_USEEFFECT_PATTERN)];
  
  if (useEffectMatches.length === 0) return null;
  
  // Process each useEffect block
  useEffectMatches.forEach((match, index) => {
    const extracted = extractDrawFunction(match[0]);
    if (!extracted) return;
    
    const { drawingCode, dependencies } = extracted;
    
    // Create the drawing function
    const drawFunctionName = `draw${componentName}Visualization${index > 0 ? index + 1 : ''}`;
    const drawFunction = `
  const ${drawFunctionName} = (svg, { width, height }) => {
    ${drawingCode}
  };`;
    
    // Create the useD3Cleanup hook call
    const hookCall = `
  const { ref: svgRef${index > 0 ? index + 1 : ''}, error, isReady } = useD3Cleanup(
    ${drawFunctionName},
    [${dependencies}]
  );`;
    
    // Replace the old useEffect with the new pattern
    // Find a good place to insert the draw function (before the old useEffect)
    const useEffectIndex = refactored.indexOf(match[0]);
    const beforeUseEffect = refactored.substring(0, useEffectIndex);
    const afterUseEffect = refactored.substring(useEffectIndex + match[0].length);
    
    refactored = beforeUseEffect + drawFunction + hookCall + afterUseEffect;
  });
  
  // Clean up old svgRef declarations if they exist
  refactored = refactored.replace(/const\s+svgRef\s*=\s*useRef\s*\(\s*null\s*\);?\s*/g, '');
  
  return refactored;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  if (!needsMigration(content)) {
    console.log(`  ✓ Skipped (no migration needed)`);
    return false;
  }
  
  // Extract component name from file path
  const componentName = path.basename(filePath, '.jsx').replace(/[-_]/g, '');
  
  const refactored = generateRefactoredCode(content, componentName);
  
  if (!refactored) {
    console.log(`  ⚠ Could not automatically migrate (manual intervention needed)`);
    return false;
  }
  
  // Create backup
  const backupPath = filePath + '.backup';
  fs.writeFileSync(backupPath, content);
  
  // Write refactored code
  fs.writeFileSync(filePath, refactored);
  
  console.log(`  ✓ Migrated successfully (backup: ${backupPath})`);
  return true;
}

/**
 * Find all JSX files in components directory
 */
function findComponentFiles(dir) {
  const files = [];
  
  function walk(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (item.endsWith('.jsx') && !item.endsWith('.backup')) {
        files.push(fullPath);
      }
    });
  }
  
  walk(dir);
  return files;
}

/**
 * Main migration function
 */
function migrate() {
  const componentsDir = path.join(__dirname, '..', 'src', 'components');
  
  console.log('D3.js Memory Leak Migration Script');
  console.log('===================================\n');
  console.log(`Scanning directory: ${componentsDir}\n`);
  
  const files = findComponentFiles(componentsDir);
  console.log(`Found ${files.length} component files\n`);
  
  let migrated = 0;
  let skipped = 0;
  let failed = 0;
  
  files.forEach(file => {
    try {
      if (processFile(file)) {
        migrated++;
      } else {
        skipped++;
      }
    } catch (error) {
      console.error(`  ✗ Error: ${error.message}`);
      failed++;
    }
  });
  
  console.log('\n===================================');
  console.log('Migration Summary:');
  console.log(`  ✓ Migrated: ${migrated} files`);
  console.log(`  - Skipped: ${skipped} files`);
  console.log(`  ✗ Failed: ${failed} files`);
  
  if (migrated > 0) {
    console.log('\n⚠️  Please review the changes and test all visualizations');
    console.log('💡 Backup files created with .backup extension');
  }
}

// Run migration if called directly
if (require.main === module) {
  migrate();
}

module.exports = { needsMigration, generateRefactoredCode, processFile };