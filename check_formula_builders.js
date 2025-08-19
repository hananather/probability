#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Find all formula builder files
const componentsDir = '/Users/hananather/Desktop/Javascript/prob-lab/src/components';
const chapters = ['01-introduction-to-probabilities', '02-discrete-random-variables', 
                  '03-continuous-random-variables', '04-descriptive-statistics-sampling',
                  '05-estimation', '06-hypothesis-testing', '07-linear-regression'];

const results = [];

function analyzeFormulaBuilder(filePath, chapterName) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  
  // Skip hub files
  if (fileName.includes('Hub')) return null;
  
  // Extract understanding states
  const understandingMatch = content.match(/const \[understanding.*useState\(\{([^}]+)\}/s);
  if (!understandingMatch) return null;
  
  const understandingStates = understandingMatch[1]
    .split(',')
    .map(line => line.trim())
    .filter(line => line)
    .map(line => line.split(':')[0].trim());
  
  // Find all setUnderstanding calls with specific keys
  const setUnderstandingCalls = [];
  const regex = /setUnderstanding\([^)]+\[['"]?(\w+)['"]?\]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    setUnderstandingCalls.push(match[1]);
  }
  
  // Also check for direct setUnderstanding calls
  const directSetRegex = /setUnderstanding\(\{[^}]*(\w+):\s*true/g;
  while ((match = directSetRegex.exec(content)) !== null) {
    setUnderstandingCalls.push(match[1]);
  }
  
  // Find onClick handlers that might trigger understanding
  const onClickRegex = /onClick=\{[^}]*handlePartClick\([^,)]+,\s*['"](\w+)['"]\)/g;
  while ((match = onClickRegex.exec(content)) !== null) {
    setUnderstandingCalls.push(match[1]);
  }
  
  // Check which states are orphaned
  const orphanedStates = understandingStates.filter(state => 
    !setUnderstandingCalls.includes(state)
  );
  
  return {
    file: filePath,
    chapter: chapterName,
    component: fileName,
    understandingStates,
    triggeredStates: [...new Set(setUnderstandingCalls)],
    orphanedStates,
    severity: orphanedStates.length > 0 ? 'HIGH' : 'OK'
  };
}

// Analyze all chapters
chapters.forEach(chapter => {
  const builderDir = path.join(componentsDir, chapter, 'formula-builders');
  
  if (fs.existsSync(builderDir)) {
    const files = fs.readdirSync(builderDir)
      .filter(f => f.endsWith('.jsx') && !f.includes('Hub'));
    
    files.forEach(file => {
      const result = analyzeFormulaBuilder(path.join(builderDir, file), chapter);
      if (result) results.push(result);
    });
  }
});

// Output results
console.log('\n=== FORMULA BUILDER ANALYSIS REPORT ===\n');

const chapterMap = {
  '01-introduction-to-probabilities': 'Chapter 1',
  '02-discrete-random-variables': 'Chapter 2',
  '03-continuous-random-variables': 'Chapter 3',
  '04-descriptive-statistics-sampling': 'Chapter 4',
  '05-estimation': 'Chapter 5',
  '06-hypothesis-testing': 'Chapter 6',
  '07-linear-regression': 'Chapter 7'
};

// Group by chapter
chapters.forEach(chapter => {
  const chapterResults = results.filter(r => r.chapter === chapter);
  if (chapterResults.length === 0) return;
  
  console.log(`\n${chapterMap[chapter]} Formula Builders:`);
  console.log('─'.repeat(60));
  
  chapterResults.forEach(result => {
    console.log(`\n• ${result.component}`);
    console.log(`  File: ${result.file}`);
    console.log(`  Understanding states: [${result.understandingStates.join(', ')}]`);
    
    if (result.orphanedStates.length > 0) {
      console.log(`  ⚠️  Orphaned states (can't be clicked): [${result.orphanedStates.join(', ')}]`);
      console.log(`  Severity: ${result.severity}`);
    } else {
      console.log(`  ✅ All states can be triggered`);
      console.log(`  Severity: ${result.severity}`);
    }
  });
});

// Summary
console.log('\n\n=== SUMMARY ===\n');
const problemComponents = results.filter(r => r.severity === 'HIGH');
console.log(`Total formula builders analyzed: ${results.length}`);
console.log(`Components with orphaned states: ${problemComponents.length}`);

if (problemComponents.length > 0) {
  console.log('\n⚠️  Components requiring fixes:');
  problemComponents.forEach(comp => {
    console.log(`  - ${chapterMap[comp.chapter]} / ${comp.component}`);
    console.log(`    Orphaned: [${comp.orphanedStates.join(', ')}]`);
  });
} else {
  console.log('\n✅ All formula builders have clickable elements for all understanding states!');
}