# Venn Diagram Test Setup Guide

This guide explains how to set up and run the comprehensive test suite for the SampleSpacesEvents Venn diagram component.

## Test Files Created

1. **SampleSpacesEvents.test.js** - Comprehensive unit tests for the parseSetNotation function
2. **VennDiagramTestHarness.jsx** - Visual test harness for manual verification
3. **TEST_SETUP_GUIDE.md** - This setup guide

## Setting Up Jest Testing

### 1. Install Jest and Testing Dependencies

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

### 2. Create Jest Configuration

Create `jest.config.js` in the project root:

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
};
```

### 3. Create Jest Setup File

Create `jest.setup.js` in the project root:

```javascript
import '@testing-library/jest-dom';
```

### 4. Update package.json

Add test script to package.json:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## Running the Tests

### Unit Tests

Run the comprehensive test suite:

```bash
npm test -- SampleSpacesEvents.test.js
```

Run with coverage:

```bash
npm run test:coverage
```

### Visual Test Harness

To use the visual test harness:

1. Create a test page in your app:

```jsx
// pages/test-venn-diagram.js
import VennDiagramTestHarness from '@/components/01-introduction-to-probabilities/__tests__/VennDiagramTestHarness';

export default function TestPage() {
  return <VennDiagramTestHarness />;
}
```

2. Run the development server:

```bash
npm run dev
```

3. Navigate to `http://localhost:3000/test-venn-diagram`

## Test Coverage

The test suite covers:

### 1. Basic Operations
- Single sets: A, B, C, U, ∅
- Union operations: A∪B, B∪C, A∪C, A∪B∪C
- Intersection operations: A∩B, B∩C, A∩C, A∩B∩C
- Complement operations: A', B', C', U', ∅'

### 2. Complex Operations
- Union with complement: A'∪B, A∪B', A'∪B'
- Intersection with complement: A'∩B, A∩B', A'∩B'
- Parentheses operations: (A∪B)∩C, A∪(B∩C), (A∩B)∪C, A∩(B∪C)
- De Morgan's Laws verification
- Distributive Laws verification
- Complex nested operations: ((A∪B)∩C)', (A'∩B')∪C, (A∪B)'∩C

### 3. Edge Cases
- Empty set operations
- Universal set operations
- Identity properties
- Complement of complement
- Invalid expressions
- Whitespace handling

### 4. Visual Region Verification
The tests verify that each of the 8 regions in the Venn diagram are correctly identified:

| Region | Elements | Description |
|--------|----------|-------------|
| 1 | {1} | Only in A |
| 2 | {2} | Only in B |
| 3 | {3} | Only in C |
| 4 | {4} | A∩C but not B |
| 5 | {5} | A∩B but not C |
| 6 | {6} | B∩C but not A |
| 7 | {7} | A∩B∩C (center) |
| 8 | {8} | Outside all sets |

## Manual Testing Checklist

When manually testing with the visual harness:

1. **Basic Sets**
   - [ ] Verify A highlights regions 1, 4, 5, 7
   - [ ] Verify B highlights regions 2, 5, 6, 7
   - [ ] Verify C highlights regions 3, 4, 6, 7
   - [ ] Verify U highlights entire rectangle
   - [ ] Verify ∅ highlights nothing

2. **Intersections**
   - [ ] Verify A∩B highlights regions 5, 7
   - [ ] Verify B∩C highlights regions 6, 7
   - [ ] Verify A∩C highlights regions 4, 7
   - [ ] Verify A∩B∩C highlights only region 7

3. **Complements**
   - [ ] Verify A' highlights regions 2, 3, 6, 8
   - [ ] Verify (A∪B∪C)' highlights only region 8

4. **Complex Operations**
   - [ ] Verify (A∪B)∩C correctly shows intersection
   - [ ] Verify De Morgan's Laws visually

## Debugging Tips

1. **If tests fail:**
   - Check the console for parser errors
   - Verify the set definitions match expected values
   - Use the visual harness to see what's actually highlighted

2. **Common issues:**
   - Parser not handling nested parentheses correctly
   - Complement operations not excluding the correct regions
   - Edge cases with empty or universal sets

3. **Visual verification:**
   - The yellow highlighting should exactly match the expected regions
   - Use the region reference to identify which areas should be highlighted
   - Test with drag enabled/disabled to ensure consistency

## Extending the Tests

To add new test cases:

1. Add to the test arrays in `SampleSpacesEvents.test.js`
2. Add visual test cases to `VennDiagramTestHarness.jsx`
3. Document any new edge cases discovered

## Performance Testing

For performance testing, you can add:

```javascript
test('Performance: Complex expressions', () => {
  const start = performance.now();
  for (let i = 0; i < 1000; i++) {
    parseSetNotation('((A∪B)∩C)\'∪(A\'∩B\')');
  }
  const end = performance.now();
  expect(end - start).toBeLessThan(100); // Should parse 1000 complex expressions in < 100ms
});
```

## Integration with CI/CD

Add to your CI/CD pipeline:

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
```