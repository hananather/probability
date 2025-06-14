#!/usr/bin/env node

/**
 * Standalone verification runner for set operations
 * Run with: node runVerification.mjs
 */

// Import the parser functions
import { parseSetExpression, elementsToRegions, areExpressionsEquivalent, testParser } from '../integrated/setExpressionParser.js';

const { SET_DEFINITIONS } = testParser;

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Test helper
function test(description, fn) {
  try {
    fn();
    console.log(`${colors.green}✓${colors.reset} ${description}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} ${description}`);
    console.log(`  ${colors.red}${error.message}${colors.reset}`);
    return false;
  }
}

// Assertion helper
function expect(actual, expected, message = '') {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    throw new Error(`Expected ${expectedStr} but got ${actualStr}. ${message}`);
  }
}

console.log(`\n${colors.blue}🔍 Set Operations Verification${colors.reset}`);
console.log('='.repeat(50) + '\n');

let passed = 0;
let total = 0;

// Section 1: Set Definitions
console.log(`${colors.yellow}1. Verifying Set Definitions${colors.reset}`);
total++;
if (test('Set A = [1,4,5,7]', () => {
  expect(parseSetExpression('A'), [1, 4, 5, 7]);
})) passed++;

total++;
if (test('Set B = [2,5,6,7]', () => {
  expect(parseSetExpression('B'), [2, 5, 6, 7]);
})) passed++;

total++;
if (test('Set C = [3,4,6,7]', () => {
  expect(parseSetExpression('C'), [3, 4, 6, 7]);
})) passed++;

// Section 2: Region Mapping
console.log(`\n${colors.yellow}2. Verifying Region Mapping${colors.reset}`);
total++;
if (test('8 regions correctly identified', () => {
  const regions = [
    { elem: [1], region: [1], desc: 'Only A' },
    { elem: [2], region: [2], desc: 'Only B' },
    { elem: [3], region: [3], desc: 'Only C' },
    { elem: [4], region: [4], desc: 'A∩C only' },
    { elem: [5], region: [5], desc: 'A∩B only' },
    { elem: [6], region: [6], desc: 'B∩C only' },
    { elem: [7], region: [7], desc: 'A∩B∩C' },
    { elem: [8], region: [8], desc: 'Outside all' }
  ];
  
  regions.forEach(({ elem, region, desc }) => {
    expect(elementsToRegions(elem), region, desc);
  });
})) passed++;

// Section 3: Basic Operations
console.log(`\n${colors.yellow}3. Verifying Basic Operations${colors.reset}`);
total++;
if (test('Union: A∪B', () => {
  expect(parseSetExpression('A∪B'), [1, 2, 4, 5, 6, 7]);
})) passed++;

total++;
if (test('Intersection: A∩B', () => {
  expect(parseSetExpression('A∩B'), [5, 7]);
})) passed++;

total++;
if (test('Complement: A\'', () => {
  expect(parseSetExpression("A'"), [2, 3, 6, 8]);
})) passed++;

// Section 4: Mathematical Laws
console.log(`\n${colors.yellow}4. Verifying Mathematical Laws${colors.reset}`);
total++;
if (test('De Morgan\'s First Law: (A∪B)\' = A\'∩B\'', () => {
  expect(parseSetExpression("(A∪B)'"), [3, 8]);
  expect(parseSetExpression("A'∩B'"), [3, 8]);
  if (!areExpressionsEquivalent("(A∪B)'", "A'∩B'")) {
    throw new Error('Not equivalent');
  }
})) passed++;

total++;
if (test('De Morgan\'s Second Law: (A∩B)\' = A\'∪B\'', () => {
  expect(parseSetExpression("(A∩B)'"), [1, 2, 3, 4, 6, 8]);
  expect(parseSetExpression("A'∪B'"), [1, 2, 3, 4, 6, 8]);
})) passed++;

total++;
if (test('Distributive Law: A∩(B∪C) = (A∩B)∪(A∩C)', () => {
  expect(parseSetExpression('A∩(B∪C)'), [4, 5, 7]);
  expect(parseSetExpression('(A∩B)∪(A∩C)'), [4, 5, 7]);
})) passed++;

// Section 5: Complex Expressions
console.log(`\n${colors.yellow}5. Verifying Complex Expressions${colors.reset}`);
total++;
if (test('(A∪B)∩C', () => {
  expect(parseSetExpression('(A∪B)∩C'), [4, 6, 7]);
})) passed++;

total++;
if (test('Region isolation: A∩B∩C\'', () => {
  expect(parseSetExpression('A∩B∩C\''), [5]);
})) passed++;

total++;
if (test('Elements in exactly 2 sets', () => {
  const expr = '((A∩B)∩C\')∪((A∩C)∩B\')∪((B∩C)∩A\')';
  expect(parseSetExpression(expr), [4, 5, 6]);
})) passed++;

// Section 6: Edge Cases
console.log(`\n${colors.yellow}6. Verifying Edge Cases${colors.reset}`);
total++;
if (test('Empty set operations', () => {
  expect(parseSetExpression('∅'), []);
  expect(parseSetExpression('A∪∅'), [1, 4, 5, 7]);
  expect(parseSetExpression('A∩∅'), []);
})) passed++;

total++;
if (test('Universal set operations', () => {
  expect(parseSetExpression('U'), [1, 2, 3, 4, 5, 6, 7, 8]);
  expect(parseSetExpression('A∩U'), [1, 4, 5, 7]);
})) passed++;

// Summary
console.log('\n' + '='.repeat(50));
console.log(`${colors.blue}Verification Summary${colors.reset}`);
console.log(`Tests passed: ${passed}/${total}`);

if (passed === total) {
  console.log(`\n${colors.green}✨ SUCCESS: All mathematical operations are correct!${colors.reset}`);
  console.log('The Venn diagram implementation is mathematically sound.\n');
  process.exit(0);
} else {
  console.log(`\n${colors.red}⚠️  FAILURE: Some tests failed.${colors.reset}`);
  console.log('Please review the implementation for mathematical errors.\n');
  process.exit(1);
}