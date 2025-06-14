/**
 * Comprehensive Verification Strategy for Set Operations
 * 
 * This test suite ensures mathematical accuracy of all set operations
 * in the Venn diagram implementation.
 */

import { parseSetExpression, elementsToRegions, areExpressionsEquivalent, testParser } from '../integrated/setExpressionParser';

const { SET_DEFINITIONS, union, intersect, complement, difference } = testParser;

// Verify set mappings
describe('Set Definitions Verification', () => {
  test('Sets A, B, C have correct elements', () => {
    expect(SET_DEFINITIONS.A).toEqual([1, 4, 5, 7]);
    expect(SET_DEFINITIONS.B).toEqual([2, 5, 6, 7]);
    expect(SET_DEFINITIONS.C).toEqual([3, 4, 6, 7]);
  });

  test('Universal set contains all elements', () => {
    expect(SET_DEFINITIONS.U).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  test('Empty set is empty', () => {
    expect(SET_DEFINITIONS['∅']).toEqual([]);
  });

  test('Each element belongs to correct sets', () => {
    // Element 1: Only in A
    expect(SET_DEFINITIONS.A.includes(1)).toBe(true);
    expect(SET_DEFINITIONS.B.includes(1)).toBe(false);
    expect(SET_DEFINITIONS.C.includes(1)).toBe(false);

    // Element 5: In A and B, not C
    expect(SET_DEFINITIONS.A.includes(5)).toBe(true);
    expect(SET_DEFINITIONS.B.includes(5)).toBe(true);
    expect(SET_DEFINITIONS.C.includes(5)).toBe(false);

    // Element 7: In all three sets
    expect(SET_DEFINITIONS.A.includes(7)).toBe(true);
    expect(SET_DEFINITIONS.B.includes(7)).toBe(true);
    expect(SET_DEFINITIONS.C.includes(7)).toBe(true);

    // Element 8: In none of the sets (only in U)
    expect(SET_DEFINITIONS.A.includes(8)).toBe(false);
    expect(SET_DEFINITIONS.B.includes(8)).toBe(false);
    expect(SET_DEFINITIONS.C.includes(8)).toBe(false);
  });
});

// Verify region mapping
describe('Region Mapping Verification', () => {
  test('All 8 regions are correctly identified', () => {
    expect(elementsToRegions([1])).toEqual([1]); // Only A
    expect(elementsToRegions([2])).toEqual([2]); // Only B
    expect(elementsToRegions([3])).toEqual([3]); // Only C
    expect(elementsToRegions([4])).toEqual([4]); // A∩C, not B
    expect(elementsToRegions([5])).toEqual([5]); // A∩B, not C
    expect(elementsToRegions([6])).toEqual([6]); // B∩C, not A
    expect(elementsToRegions([7])).toEqual([7]); // A∩B∩C
    expect(elementsToRegions([8])).toEqual([8]); // Outside all
  });

  test('Multiple elements map to multiple regions', () => {
    expect(elementsToRegions([1, 2, 3])).toEqual([1, 2, 3]);
    expect(elementsToRegions([4, 5, 6, 7])).toEqual([4, 5, 6, 7]);
  });
});

// Verify basic set operations
describe('Basic Set Operations', () => {
  test('Union operations', () => {
    expect(union([1, 2], [2, 3])).toEqual([1, 2, 3]);
    expect(union([], [1, 2])).toEqual([1, 2]);
    expect(union([1, 2], [])).toEqual([1, 2]);
  });

  test('Intersection operations', () => {
    expect(intersect([1, 2, 3], [2, 3, 4])).toEqual([2, 3]);
    expect(intersect([1, 2], [3, 4])).toEqual([]);
    expect(intersect([], [1, 2])).toEqual([]);
  });

  test('Complement operations', () => {
    expect(complement([1, 2, 3]).sort()).toEqual([4, 5, 6, 7, 8]);
    expect(complement([]).sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(complement([1, 2, 3, 4, 5, 6, 7, 8])).toEqual([]);
  });

  test('Difference operations', () => {
    expect(difference([1, 2, 3], [2, 3])).toEqual([1]);
    expect(difference([1, 2], [3, 4])).toEqual([1, 2]);
    expect(difference([], [1, 2])).toEqual([]);
  });
});

// Critical test cases for expression parsing
describe('Critical Expression Tests', () => {
  // Basic sets
  test('Single sets parse correctly', () => {
    expect(parseSetExpression('A')).toEqual([1, 4, 5, 7]);
    expect(parseSetExpression('B')).toEqual([2, 5, 6, 7]);
    expect(parseSetExpression('C')).toEqual([3, 4, 6, 7]);
    expect(parseSetExpression('U')).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(parseSetExpression('∅')).toEqual([]);
  });

  // Union operations
  test('Union operations parse correctly', () => {
    expect(parseSetExpression('A∪B')).toEqual([1, 2, 4, 5, 6, 7]);
    expect(parseSetExpression('B∪C')).toEqual([2, 3, 4, 5, 6, 7]);
    expect(parseSetExpression('A∪C')).toEqual([1, 3, 4, 5, 6, 7]);
    expect(parseSetExpression('A∪B∪C')).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  // Intersection operations
  test('Intersection operations parse correctly', () => {
    expect(parseSetExpression('A∩B')).toEqual([5, 7]);
    expect(parseSetExpression('B∩C')).toEqual([6, 7]);
    expect(parseSetExpression('A∩C')).toEqual([4, 7]);
    expect(parseSetExpression('A∩B∩C')).toEqual([7]);
  });

  // Complement operations
  test('Complement operations parse correctly', () => {
    expect(parseSetExpression("A'")).toEqual([2, 3, 6, 8]);
    expect(parseSetExpression("B'")).toEqual([1, 3, 4, 8]);
    expect(parseSetExpression("C'")).toEqual([1, 2, 5, 8]);
    expect(parseSetExpression("(A∪B∪C)'")).toEqual([8]);
  });

  // Complex expressions
  test('Complex expressions parse correctly', () => {
    // (A∪B)∩C = elements in (A or B) and C
    expect(parseSetExpression('(A∪B)∩C')).toEqual([4, 6, 7]);
    
    // A∪(B∩C) = A or (both B and C)
    expect(parseSetExpression('A∪(B∩C)')).toEqual([1, 4, 5, 6, 7]);
    
    // (A∩B)' = not (both A and B)
    expect(parseSetExpression("(A∩B)'")).toEqual([1, 2, 3, 4, 6, 8]);
    
    // A'∩B' = not A and not B
    expect(parseSetExpression("A'∩B'")).toEqual([3, 8]);
  });

  // De Morgan's Laws
  test("De Morgan's Laws hold", () => {
    // First law: (A∪B)' = A'∩B'
    expect(areExpressionsEquivalent("(A∪B)'", "A'∩B'")).toBe(true);
    expect(parseSetExpression("(A∪B)'")).toEqual([3, 8]);
    expect(parseSetExpression("A'∩B'")).toEqual([3, 8]);

    // Second law: (A∩B)' = A'∪B'
    expect(areExpressionsEquivalent("(A∩B)'", "A'∪B'")).toBe(true);
    expect(parseSetExpression("(A∩B)'")).toEqual([1, 2, 3, 4, 6, 8]);
    expect(parseSetExpression("A'∪B'")).toEqual([1, 2, 3, 4, 6, 8]);
  });

  // Distributive laws
  test('Distributive laws hold', () => {
    // A∩(B∪C) = (A∩B)∪(A∩C)
    expect(areExpressionsEquivalent('A∩(B∪C)', '(A∩B)∪(A∩C)')).toBe(true);
    expect(parseSetExpression('A∩(B∪C)')).toEqual([4, 5, 7]);
    expect(parseSetExpression('(A∩B)∪(A∩C)')).toEqual([4, 5, 7]);

    // A∪(B∩C) = (A∪B)∩(A∪C)
    expect(areExpressionsEquivalent('A∪(B∩C)', '(A∪B)∩(A∪C)')).toBe(true);
  });

  // Identity laws
  test('Identity laws hold', () => {
    // A∪∅ = A
    expect(areExpressionsEquivalent('A∪∅', 'A')).toBe(true);
    expect(parseSetExpression('A∪∅')).toEqual([1, 4, 5, 7]);

    // A∩U = A
    expect(areExpressionsEquivalent('A∩U', 'A')).toBe(true);
    expect(parseSetExpression('A∩U')).toEqual([1, 4, 5, 7]);
  });

  // Complement laws
  test('Complement laws hold', () => {
    // A∪A' = U
    expect(parseSetExpression("A∪A'")).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    
    // A∩A' = ∅
    expect(parseSetExpression("A∩A'")).toEqual([]);
  });
});

// Edge cases
describe('Edge Cases', () => {
  test('Empty set operations', () => {
    expect(parseSetExpression('∅∪A')).toEqual([1, 4, 5, 7]);
    expect(parseSetExpression('∅∩A')).toEqual([]);
    expect(parseSetExpression("∅'")).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  test('Universal set operations', () => {
    expect(parseSetExpression('U∩A')).toEqual([1, 4, 5, 7]);
    expect(parseSetExpression('U∪A')).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(parseSetExpression("U'")).toEqual([]);
  });

  test('Invalid expressions return null', () => {
    expect(parseSetExpression('')).toEqual([]);
    expect(parseSetExpression('X')).toEqual([]); // Unknown set
    expect(parseSetExpression('A∪∪B')).toBe(null); // Invalid syntax
    expect(parseSetExpression('(A∪B')).toBe(null); // Unmatched parenthesis
  });

  test('Complex nested expressions', () => {
    // ((A∪B)∩C)' 
    expect(parseSetExpression("((A∪B)∩C)'")).toEqual([1, 2, 5, 8]);
    
    // (A'∩B')∪(B'∩C')
    expect(parseSetExpression("(A'∩B')∪(B'∩C')")).toEqual([1, 3, 8]);
  });
});

// Visual highlighting verification
describe('Visual Highlighting Verification', () => {
  test('Region highlighting matches mathematical results', () => {
    // Test that each expression highlights the correct regions
    const testCases = [
      { expr: 'A', regions: [1, 4, 5, 7] },
      { expr: 'B', regions: [2, 5, 6, 7] },
      { expr: 'C', regions: [3, 4, 6, 7] },
      { expr: 'A∩B', regions: [5, 7] },
      { expr: 'A∩B∩C', regions: [7] },
      { expr: "(A∪B)'", regions: [3, 8] },
      { expr: "A'∩B'", regions: [3, 8] },
    ];

    testCases.forEach(({ expr, regions }) => {
      const elements = parseSetExpression(expr);
      const actualRegions = elementsToRegions(elements);
      expect(actualRegions).toEqual(regions);
    });
  });

  test('Specific region isolation', () => {
    // Region 5: Elements in A and B but not C
    expect(parseSetExpression('(A∩B)∩C\'')).toEqual([5]);
    expect(parseSetExpression('A∩B∩C\'')).toEqual([5]);
    
    // Region 4: Elements in A and C but not B
    expect(parseSetExpression('(A∩C)∩B\'')).toEqual([4]);
    
    // Region 6: Elements in B and C but not A
    expect(parseSetExpression('(B∩C)∩A\'')).toEqual([6]);
  });
});

// Educational examples verification
describe('Educational Examples Verification', () => {
  test('Challenge answers are mathematically correct', () => {
    // From the challenges in SetTheoryChallenges
    const challenges = [
      { expr: 'A∪B', expected: [1, 2, 4, 5, 6, 7] },
      { expr: 'A∩B', expected: [5, 7] },
      { expr: "A'", expected: [2, 3, 6, 8] },
      { expr: 'A∩B∩C', expected: [7] },
      { expr: "(A∪B)'", expected: [3, 8] },
      { expr: "A'∩B'", expected: [3, 8] },
      { expr: 'A∩(B∪C)', expected: [4, 5, 7] },
      { expr: '(A∩B)∪(A∩C)', expected: [4, 5, 7] },
    ];

    challenges.forEach(({ expr, expected }) => {
      expect(parseSetExpression(expr)).toEqual(expected);
    });
  });

  test('Symmetric difference is correct', () => {
    // Symmetric difference: (A∪B)∖(A∩B) or (A∩B')∪(A'∩B)
    const symDiff1 = parseSetExpression('(A∪B)∩(A∩B)\'');
    const symDiff2 = parseSetExpression('(A∩B\')∪(A\'∩B)');
    
    expect(symDiff1).toEqual([1, 2, 4, 6]);
    // Note: The parser doesn't support ∖ directly, but we can verify the alternative
    expect(areExpressionsEquivalent('(A∪B)∩(A∩B)\'', '(A∩B\')∪(B∩A\')')).toBe(true);
  });

  test('Elements in exactly two sets', () => {
    // This is regions 4, 5, 6
    const result = parseSetExpression('((A∩B)∩C\')∪((A∩C)∩B\')∪((B∩C)∩A\')');
    expect(result).toEqual([4, 5, 6]);
  });
});

// Summary of verification approach
describe('Verification Summary', () => {
  test('All critical operations verified', () => {
    const criticalTests = [
      // 1. Set definitions are correct
      () => expect(SET_DEFINITIONS.A).toEqual([1, 4, 5, 7]),
      
      // 2. Region mapping is accurate
      () => expect(elementsToRegions([1, 2, 3, 4, 5, 6, 7, 8])).toEqual([1, 2, 3, 4, 5, 6, 7, 8]),
      
      // 3. Basic operations work
      () => expect(union([1, 2], [2, 3])).toEqual([1, 2, 3]),
      () => expect(intersect([1, 2], [2, 3])).toEqual([2]),
      () => expect(complement([1, 2]).sort()).toEqual([3, 4, 5, 6, 7, 8]),
      
      // 4. De Morgan's laws hold
      () => expect(areExpressionsEquivalent("(A∪B)'", "A'∩B'")).toBe(true),
      
      // 5. Complex expressions parse correctly
      () => expect(parseSetExpression('(A∪B)∩C')).toEqual([4, 6, 7]),
      
      // 6. Edge cases handled
      () => expect(parseSetExpression('∅')).toEqual([]),
      () => expect(parseSetExpression("U'")).toEqual([]),
    ];

    criticalTests.forEach(test => test());
    expect(criticalTests.length).toBe(9); // Ensure we're running all tests
  });
});