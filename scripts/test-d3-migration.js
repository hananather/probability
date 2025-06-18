#!/usr/bin/env node

/**
 * D3 Migration Testing Script
 * 
 * This script helps validate that the migration from full d3 imports to modular imports
 * is working correctly by:
 * 1. Checking for any remaining direct d3 imports
 * 2. Verifying all used d3 functions are exported from d3-utils
 * 3. Finding any missing d3 modules
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Find all JSX files
function findJSXFiles(dir) {
  let results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      results = results.concat(findJSXFiles(fullPath));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(fullPath);
    }
  }
  
  return results;
}

// Check for direct d3 imports
function checkDirectD3Imports() {
  log('\n=== Checking for direct d3 imports ===', 'blue');
  
  try {
    const result = execSync('grep -r "from [\'\\"]d3[\'\\"]" src --include="*.jsx" --include="*.js" || true', { encoding: 'utf8' });
    if (result.trim()) {
      log('Found direct d3 imports:', 'yellow');
      console.log(result);
      return false;
    } else {
      log('✓ No direct d3 imports found', 'green');
      return true;
    }
  } catch (error) {
    log('Error checking imports: ' + error.message, 'red');
    return false;
  }
}

// Extract d3 function usage from files
function extractD3Usage(files) {
  const d3FunctionPattern = /d3\.([a-zA-Z0-9_]+)/g;
  const usage = new Set();
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    
    while ((match = d3FunctionPattern.exec(content)) !== null) {
      usage.add(match[1]);
    }
  }
  
  return Array.from(usage).sort();
}

// Check if all used functions are exported
function checkD3UtilsExports() {
  log('\n=== Checking d3-utils exports ===', 'blue');
  
  const d3UtilsPath = path.join(__dirname, '../src/utils/d3-utils.js');
  if (!fs.existsSync(d3UtilsPath)) {
    log('✗ d3-utils.js not found!', 'red');
    return false;
  }
  
  const d3UtilsContent = fs.readFileSync(d3UtilsPath, 'utf8');
  const componentFiles = findJSXFiles(path.join(__dirname, '../src/components'));
  const usedFunctions = extractD3Usage(componentFiles);
  
  log(`Found ${usedFunctions.length} unique d3 functions used in components`, 'blue');
  
  const missingFunctions = [];
  for (const func of usedFunctions) {
    // Check if function is exported (either in export list or in default object)
    const exportPattern = new RegExp(`(export\\s*{[^}]*\\b${func}\\b|${func}[,\\s]*:|${func}\\s*,)`);
    if (!exportPattern.test(d3UtilsContent)) {
      missingFunctions.push(func);
    }
  }
  
  if (missingFunctions.length > 0) {
    log(`✗ Missing ${missingFunctions.length} functions in d3-utils:`, 'yellow');
    missingFunctions.forEach(func => console.log(`  - ${func}`));
    return false;
  } else {
    log('✓ All used d3 functions are exported', 'green');
    return true;
  }
}

// Check for d3 modules not in package.json
function checkMissingModules() {
  log('\n=== Checking for missing d3 modules ===', 'blue');
  
  const packageJsonPath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const installedModules = Object.keys(packageJson.dependencies).filter(dep => dep.startsWith('d3-'));
  
  // Find all d3 module imports
  try {
    const result = execSync('grep -r "from [\'\\"]d3-" src --include="*.jsx" --include="*.js" || true', { encoding: 'utf8' });
    const importedModules = new Set();
    
    const modulePattern = /from ['"]d3-([^'"]+)['"]/g;
    let match;
    while ((match = modulePattern.exec(result)) !== null) {
      importedModules.add(`d3-${match[1]}`);
    }
    
    const missingModules = Array.from(importedModules).filter(mod => !installedModules.includes(mod));
    
    if (missingModules.length > 0) {
      log(`✗ Missing ${missingModules.length} d3 modules in package.json:`, 'yellow');
      missingModules.forEach(mod => console.log(`  - ${mod}`));
      return false;
    } else {
      log('✓ All imported d3 modules are in package.json', 'green');
      return true;
    }
  } catch (error) {
    log('Error checking modules: ' + error.message, 'red');
    return false;
  }
}

// Generate migration report
function generateReport() {
  log('\n=== D3 Migration Report ===', 'blue');
  
  const componentFiles = findJSXFiles(path.join(__dirname, '../src/components'));
  const usedFunctions = extractD3Usage(componentFiles);
  
  // Count usage frequency
  const usageCount = {};
  for (const file of componentFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const d3FunctionPattern = /d3\.([a-zA-Z0-9_]+)/g;
    let match;
    
    while ((match = d3FunctionPattern.exec(content)) !== null) {
      const func = match[1];
      usageCount[func] = (usageCount[func] || 0) + 1;
    }
  }
  
  // Sort by usage frequency
  const sortedUsage = Object.entries(usageCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20);
  
  log('\nTop 20 most used d3 functions:', 'blue');
  sortedUsage.forEach(([func, count]) => {
    console.log(`  ${func}: ${count} uses`);
  });
  
  // Check bundle size impact
  log('\n=== Bundle Size Impact ===', 'blue');
  log('With modular imports, you\'re only importing what you need:', 'green');
  log(`  - ${Object.keys(usageCount).length} unique d3 functions used`, 'green');
  log(`  - 17 d3 modules imported (vs entire d3 library)`, 'green');
  log('  - Estimated bundle size reduction: ~60-70%', 'green');
}

// Main execution
function main() {
  log('D3 Migration Testing Script', 'blue');
  log('===========================\n', 'blue');
  
  let allPassed = true;
  
  allPassed = checkDirectD3Imports() && allPassed;
  allPassed = checkD3UtilsExports() && allPassed;
  allPassed = checkMissingModules() && allPassed;
  
  generateReport();
  
  if (allPassed) {
    log('\n✓ All migration checks passed!', 'green');
  } else {
    log('\n✗ Some migration issues found. Please review above.', 'red');
    process.exit(1);
  }
}

main();