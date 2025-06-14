/**
 * Minimal Verification Script for Set Operations
 * 
 * Quick verification of critical mathematical operations.
 * Can be run standalone or integrated into the build process.
 */

import { parseSetExpression, elementsToRegions, areExpressionsEquivalent } from '../integrated/setExpressionParser';

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

// Test runner
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

console.log('\n🔍 Running Minimal Set Operations Verification...\n');

let passed = 0;
let total = 0;

// Critical Test 1: Verify Set Mappings
total++;
if (test('Set A contains [1,4,5,7]', () => {
  expect(parseSetExpression('A'), [1, 4, 5, 7]);
})) passed++;

total++;
if (test('Set B contains [2,5,6,7]', () => {
  expect(parseSetExpression('B'), [2, 5, 6, 7]);
})) passed++;

total++;
if (test('Set C contains [3,4,6,7]', () => {
  expect(parseSetExpression('C'), [3, 4, 6, 7]);
})) passed++;

// Critical Test 2: Verify All 8 Regions
total++;
if (test('All 8 regions map correctly', () => {
  expect(elementsToRegions([1]), [1], 'Region 1 (only A)');
  expect(elementsToRegions([2]), [2], 'Region 2 (only B)');
  expect(elementsToRegions([3]), [3], 'Region 3 (only C)');
  expect(elementsToRegions([4]), [4], 'Region 4 (A∩C only)');
  expect(elementsToRegions([5]), [5], 'Region 5 (A∩B only)');
  expect(elementsToRegions([6]), [6], 'Region 6 (B∩C only)');
  expect(elementsToRegions([7]), [7], 'Region 7 (A∩B∩C)');
  expect(elementsToRegions([8]), [8], 'Region 8 (outside all)');
})) passed++;

// Critical Test 3: Basic Operations
total++;
if (test('Union: A∪B = [1,2,4,5,6,7]', () => {
  expect(parseSetExpression('A∪B'), [1, 2, 4, 5, 6, 7]);
})) passed++;

total++;
if (test('Intersection: A∩B = [5,7]', () => {
  expect(parseSetExpression('A∩B'), [5, 7]);
})) passed++;

total++;
if (test('Complement: A\' = [2,3,6,8]', () => {
  expect(parseSetExpression("A'"), [2, 3, 6, 8]);
})) passed++;

// Critical Test 4: De Morgan's Laws
total++;
if (test('De Morgan\'s First Law: (A∪B)\' = A\'∩B\'', () => {
  const lhs = parseSetExpression("(A∪B)'");
  const rhs = parseSetExpression("A'∩B'");
  expect(lhs, [3, 8]);
  expect(rhs, [3, 8]);
  if (!areExpressionsEquivalent("(A∪B)'", "A'∩B'")) {
    throw new Error('Expressions not equivalent');
  }
})) passed++;

total++;
if (test('De Morgan\'s Second Law: (A∩B)\' = A\'∪B\'', () => {
  const lhs = parseSetExpression("(A∩B)'");
  const rhs = parseSetExpression("A'∪B'");
  expect(lhs, [1, 2, 3, 4, 6, 8]);
  expect(rhs, [1, 2, 3, 4, 6, 8]);
  if (!areExpressionsEquivalent("(A∩B)'", "A'∪B'")) {
    throw new Error('Expressions not equivalent');
  }
})) passed++;

// Critical Test 5: Complex Expressions
total++;
if (test('Complex: (A∪B)∩C = [4,6,7]', () => {
  expect(parseSetExpression('(A∪B)∩C'), [4, 6, 7]);
})) passed++;

total++;
if (test('Distributive: A∩(B∪C) = (A∩B)∪(A∩C)', () => {
  const lhs = parseSetExpression('A∩(B∪C)');
  const rhs = parseSetExpression('(A∩B)∪(A∩C)');
  expect(lhs, [4, 5, 7]);
  expect(rhs, [4, 5, 7]);
})) passed++;

// Critical Test 6: Edge Cases
total++;
if (test('Empty set: ∅ = []', () => {
  expect(parseSetExpression('∅'), []);
})) passed++;

total++;
if (test('Universal set: U = [1,2,3,4,5,6,7,8]', () => {
  expect(parseSetExpression('U'), [1, 2, 3, 4, 5, 6, 7, 8]);
})) passed++;

total++;
if (test('Identity: A∪∅ = A', () => {
  expect(parseSetExpression('A∪∅'), [1, 4, 5, 7]);
})) passed++;

// Critical Test 7: Region Isolation
total++;
if (test('Region 5 only: A∩B∩C\' = [5]', () => {
  expect(parseSetExpression('A∩B∩C\''), [5]);
})) passed++;

// Summary
console.log('\n' + '='.repeat(50));
console.log(`${colors.yellow}Summary:${colors.reset} ${passed}/${total} tests passed`);

if (passed === total) {
  console.log(`${colors.green}✨ All critical tests passed! Mathematical operations are correct.${colors.reset}`);
} else {
  console.log(`${colors.red}⚠️  Some tests failed. Please review the implementation.${colors.reset}`);
}

// Export verification status
export const verificationPassed = passed === total;
export const verificationResults = { passed, total };

// Quick verification function for other components to use
export function verifySetOperation(expression, expectedElements) {
  try {
    const result = parseSetExpression(expression);
    return JSON.stringify(result) === JSON.stringify(expectedElements);
  } catch (error) {
    return false;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(passed === total ? 0 : 1);
}