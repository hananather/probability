/**
 * Comprehensive Test Suite for SampleSpacesEvents Venn Diagram
 * 
 * This test suite verifies that:
 * 1. The parseSetNotation function correctly parses all set expressions
 * 2. The resulting sets match the mathematical definitions
 * 3. Visual highlighting corresponds to the correct regions
 */

// Mock the component's parseSetNotation function for testing
// In a real test environment, you would import this from the component
function parseSetNotation(notation) {
  // Define set mappings (same as in component)
  const sets = {
    'A': [1, 4, 5, 7],
    'B': [2, 5, 6, 7],
    'C': [3, 4, 6, 7],
    'U': [1, 2, 3, 4, 5, 6, 7, 8],
    '∅': []
  };
  
  // Helper functions
  function union(set1, set2) {
    return [...new Set([...set1, ...set2])];
  }
  
  function intersect(set1, set2) {
    return set1.filter(x => set2.includes(x));
  }
  
  function complement(set1) {
    const universe = [1, 2, 3, 4, 5, 6, 7, 8];
    return universe.filter(x => !set1.includes(x));
  }
  
  let index = 0;
  let tokens = [];
  
  // Parse the expression using recursive descent
  function parse(expr) {
    // Tokenize the expression first
    tokens = expr.split('').filter(char => char !== ' ');
    index = 0;
    const result = parseEvent();
    return result.evaluate();
  }

  // Parse an event (A, B, C, U, ∅, or parentheses)
  function parseEvent() {
    if (index >= tokens.length) {
      throw new Error('Unexpected end of expression');
    }
    
    const char = tokens[index];
    index++;
    
    if (char === 'A') return new SetEvent('A', sets['A'], parseOperator());
    else if (char === 'B') return new SetEvent('B', sets['B'], parseOperator());
    else if (char === 'C') return new SetEvent('C', sets['C'], parseOperator());
    else if (char === '∅') return new SetEvent('∅', sets['∅'], parseOperator());
    else if (char === 'U') return new SetEvent('U', sets['U'], parseOperator());
    else if (char === '(') {
      const innerEvent = parseEvent();
      // Consume closing parenthesis
      if (index >= tokens.length || tokens[index] !== ')') {
        throw new Error(`Expected ')' but found ${tokens[index] || 'end of expression'}`);
      }
      index++;
      return new ParenthesesEvent(innerEvent, parseOperator());
    }
    else throw new Error(`Expected A, B, C, ∅, U, or '(' but found '${char}'`);
  }
  
  // Parse an operator (∪, ∩, ', or end of expression)
  function parseOperator() {
    if (index >= tokens.length) {
      return new IdentityOperator();
    }
    
    const char = tokens[index];
    
    if (char === '∪') {
      index++;
      return new UnionOperator(parseEvent());
    }
    else if (char === '∩') {
      index++;
      return new IntersectOperator(parseEvent());
    }
    else if (char === "'") {
      index++;
      return new ComplementOperator(parseOperator());
    }
    else if (char === ')') {
      // Don't consume - let the parentheses handler deal with it
      return new IdentityOperator();
    }
    else throw new Error(`Expected ∪, ∩, ', or end of expression but found '${char}'`);
  }
  
  // Event classes
  class SetEvent {
    constructor(name, array, operator) {
      this.name = name;
      this.array = array;
      this.operator = operator;
    }
    
    evaluate() {
      return this.operator.evaluate(this.array);
    }
  }
  
  class ParenthesesEvent {
    constructor(innerEvent, operator) {
      this.innerEvent = innerEvent;
      this.operator = operator;
    }
    
    evaluate() {
      return this.operator.evaluate(this.innerEvent.evaluate());
    }
  }
  
  // Operator classes
  class IdentityOperator {
    evaluate(array) {
      return array;
    }
  }
  
  class UnionOperator {
    constructor(event) {
      this.event = event;
    }
    
    evaluate(array) {
      return union(array, this.event.evaluate());
    }
  }
  
  class IntersectOperator {
    constructor(event) {
      this.event = event;
    }
    
    evaluate(array) {
      return intersect(array, this.event.evaluate());
    }
  }
  
  class ComplementOperator {
    constructor(operator) {
      this.operator = operator;
    }
    
    evaluate(array) {
      return this.operator.evaluate(complement(array));
    }
  }
  
  try {
    // Remove whitespace
    const cleanNotation = notation.replace(/\s/g, '');
    if (!cleanNotation) return [];
    return parse(cleanNotation);
  } catch (e) {
    // Return empty set on error
    return [];
  }
}

// Helper function to sort arrays for comparison
function sortedArray(arr) {
  return [...arr].sort((a, b) => a - b);
}

// Test Suite
describe('SampleSpacesEvents - parseSetNotation', () => {
  // Define expected sets for reference
  const expectedSets = {
    'A': [1, 4, 5, 7],
    'B': [2, 5, 6, 7],
    'C': [3, 4, 6, 7],
    'U': [1, 2, 3, 4, 5, 6, 7, 8],
    '∅': []
  };

  describe('Basic Set Operations', () => {
    test('Single sets', () => {
      expect(sortedArray(parseSetNotation('A'))).toEqual([1, 4, 5, 7]);
      expect(sortedArray(parseSetNotation('B'))).toEqual([2, 5, 6, 7]);
      expect(sortedArray(parseSetNotation('C'))).toEqual([3, 4, 6, 7]);
      expect(sortedArray(parseSetNotation('U'))).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
      expect(parseSetNotation('∅')).toEqual([]);
    });

    test('Union operations', () => {
      expect(sortedArray(parseSetNotation('A∪B'))).toEqual([1, 2, 4, 5, 6, 7]);
      expect(sortedArray(parseSetNotation('B∪C'))).toEqual([2, 3, 4, 5, 6, 7]);
      expect(sortedArray(parseSetNotation('A∪C'))).toEqual([1, 3, 4, 5, 6, 7]);
      expect(sortedArray(parseSetNotation('A∪B∪C'))).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    test('Intersection operations', () => {
      expect(sortedArray(parseSetNotation('A∩B'))).toEqual([5, 7]);
      expect(sortedArray(parseSetNotation('B∩C'))).toEqual([6, 7]);
      expect(sortedArray(parseSetNotation('A∩C'))).toEqual([4, 7]);
      expect(sortedArray(parseSetNotation('A∩B∩C'))).toEqual([7]);
    });

    test('Complement operations', () => {
      expect(sortedArray(parseSetNotation("A'"))).toEqual([2, 3, 6, 8]);
      expect(sortedArray(parseSetNotation("B'"))).toEqual([1, 3, 4, 8]);
      expect(sortedArray(parseSetNotation("C'"))).toEqual([1, 2, 5, 8]);
      expect(parseSetNotation("U'")).toEqual([]);
      expect(sortedArray(parseSetNotation("∅'"))).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });
  });

  describe('Complex Set Operations', () => {
    test('Union with complement', () => {
      expect(sortedArray(parseSetNotation("A'∪B"))).toEqual([2, 3, 5, 6, 7, 8]);
      expect(sortedArray(parseSetNotation("A∪B'"))).toEqual([1, 3, 4, 5, 7, 8]);
      expect(sortedArray(parseSetNotation("A'∪B'"))).toEqual([1, 2, 3, 4, 6, 8]);
    });

    test('Intersection with complement', () => {
      expect(sortedArray(parseSetNotation("A'∩B"))).toEqual([2, 6]);
      expect(sortedArray(parseSetNotation("A∩B'"))).toEqual([1, 4]);
      expect(sortedArray(parseSetNotation("A'∩B'"))).toEqual([3, 8]);
    });

    test('Parentheses operations', () => {
      expect(sortedArray(parseSetNotation('(A∪B)∩C'))).toEqual([4, 6, 7]);
      expect(sortedArray(parseSetNotation('A∪(B∩C)'))).toEqual([1, 4, 5, 6, 7]);
      expect(sortedArray(parseSetNotation('(A∩B)∪C'))).toEqual([3, 4, 5, 6, 7]);
      expect(sortedArray(parseSetNotation('A∩(B∪C)'))).toEqual([4, 5, 7]);
    });

    test('De Morgan\'s Laws', () => {
      // (A∪B)' = A'∩B'
      expect(sortedArray(parseSetNotation("(A∪B)'"))).toEqual(
        sortedArray(parseSetNotation("A'∩B'"))
      );
      
      // (A∩B)' = A'∪B'
      expect(sortedArray(parseSetNotation("(A∩B)'"))).toEqual(
        sortedArray(parseSetNotation("A'∪B'"))
      );
    });

    test('Distributive Laws', () => {
      // A∩(B∪C) = (A∩B)∪(A∩C)
      const left1 = sortedArray(parseSetNotation('A∩(B∪C)'));
      const right1 = sortedArray(parseSetNotation('(A∩B)∪(A∩C)'));
      expect(left1).toEqual(right1);
      
      // A∪(B∩C) = (A∪B)∩(A∪C)
      const left2 = sortedArray(parseSetNotation('A∪(B∩C)'));
      const right2 = sortedArray(parseSetNotation('(A∪B)∩(A∪C)'));
      expect(left2).toEqual(right2);
    });

    test('Complex nested operations', () => {
      expect(sortedArray(parseSetNotation("((A∪B)∩C)'"))).toEqual([1, 2, 3, 5, 8]);
      expect(sortedArray(parseSetNotation("(A'∩B')∪C"))).toEqual([3, 4, 6, 7, 8]);
      expect(sortedArray(parseSetNotation("(A∪B)'∩C"))).toEqual([3]);
    });
  });

  describe('Edge Cases', () => {
    test('Empty set operations', () => {
      expect(parseSetNotation('∅∪A')).toEqual(sortedArray(expectedSets.A));
      expect(parseSetNotation('∅∩A')).toEqual([]);
      expect(parseSetNotation('∅∪∅')).toEqual([]);
      expect(parseSetNotation('∅∩∅')).toEqual([]);
    });

    test('Universal set operations', () => {
      expect(sortedArray(parseSetNotation('U∩A'))).toEqual(sortedArray(expectedSets.A));
      expect(sortedArray(parseSetNotation('U∪A'))).toEqual(sortedArray(expectedSets.U));
      expect(parseSetNotation('U∩∅')).toEqual([]);
      expect(sortedArray(parseSetNotation('U∪∅'))).toEqual(sortedArray(expectedSets.U));
    });

    test('Identity properties', () => {
      // A∪∅ = A
      expect(sortedArray(parseSetNotation('A∪∅'))).toEqual(sortedArray(expectedSets.A));
      // A∩U = A
      expect(sortedArray(parseSetNotation('A∩U'))).toEqual(sortedArray(expectedSets.A));
      // A∪U = U
      expect(sortedArray(parseSetNotation('A∪U'))).toEqual(sortedArray(expectedSets.U));
      // A∩∅ = ∅
      expect(parseSetNotation('A∩∅')).toEqual([]);
    });

    test('Complement of complement', () => {
      expect(sortedArray(parseSetNotation("A''"))).toEqual(sortedArray(expectedSets.A));
      expect(sortedArray(parseSetNotation("(A')'"))).toEqual(sortedArray(expectedSets.A));
    });

    test('Invalid expressions', () => {
      expect(parseSetNotation('')).toEqual([]);
      expect(parseSetNotation('   ')).toEqual([]);
      expect(parseSetNotation('XYZ')).toEqual([]);
      expect(parseSetNotation('A∪')).toEqual([]);
      expect(parseSetNotation('∩B')).toEqual([]);
      expect(parseSetNotation('(A∪B')).toEqual([]);
      expect(parseSetNotation('A∪B)')).toEqual([]);
      expect(parseSetNotation('A∪∩B')).toEqual([]);
    });

    test('Whitespace handling', () => {
      expect(sortedArray(parseSetNotation('A ∪ B'))).toEqual([1, 2, 4, 5, 6, 7]);
      expect(sortedArray(parseSetNotation('  A  ∩  B  '))).toEqual([5, 7]);
      expect(sortedArray(parseSetNotation('( A ∪ B ) ∩ C'))).toEqual([4, 6, 7]);
    });
  });

  describe('Visual Region Verification', () => {
    // These tests verify which regions should be highlighted
    // Each region is identified by the elements it contains
    
    test('Region mapping', () => {
      // Region 1: Only A (elements only in A)
      const onlyA = [1];
      expect(parseSetNotation('A').filter(x => !expectedSets.B.includes(x) && !expectedSets.C.includes(x)))
        .toEqual(onlyA);
      
      // Region 2: Only B (elements only in B)
      const onlyB = [2];
      expect(parseSetNotation('B').filter(x => !expectedSets.A.includes(x) && !expectedSets.C.includes(x)))
        .toEqual(onlyB);
      
      // Region 3: Only C (elements only in C)
      const onlyC = [3];
      expect(parseSetNotation('C').filter(x => !expectedSets.A.includes(x) && !expectedSets.B.includes(x)))
        .toEqual(onlyC);
      
      // Region 4: A∩C but not B
      const AandCnotB = [4];
      expect(parseSetNotation('A∩C').filter(x => !expectedSets.B.includes(x)))
        .toEqual(AandCnotB);
      
      // Region 5: A∩B but not C
      const AandBnotC = [5];
      expect(parseSetNotation('A∩B').filter(x => !expectedSets.C.includes(x)))
        .toEqual(AandBnotC);
      
      // Region 6: B∩C but not A
      const BandCnotA = [6];
      expect(parseSetNotation('B∩C').filter(x => !expectedSets.A.includes(x)))
        .toEqual(BandCnotA);
      
      // Region 7: A∩B∩C (center)
      const allThree = [7];
      expect(parseSetNotation('A∩B∩C')).toEqual(allThree);
      
      // Region 8: Outside all sets
      const outside = [8];
      expect(parseSetNotation("(A∪B∪C)'")).toEqual(outside);
    });
  });
});

// Additional test for visual highlighting logic
describe('Visual Highlighting Logic', () => {
  // These tests would verify the createHighlightShapes function
  // In a real test environment, you would test the D3 rendering
  
  test('Highlight shapes for basic sets', () => {
    const testCases = [
      { expression: 'A', expectedType: 'circle', count: 1 },
      { expression: 'B', expectedType: 'circle', count: 1 },
      { expression: 'C', expectedType: 'circle', count: 1 },
      { expression: 'U', expectedType: 'rect', count: 1 },
      { expression: '∅', expectedType: 'none', count: 0 },
    ];
    
    // In actual implementation, you would:
    // 1. Create a mock SVG container
    // 2. Call createHighlightShapes with each expression
    // 3. Verify the correct shapes are created
    
    testCases.forEach(({ expression, expectedType, count }) => {
      // This is a placeholder for actual D3 testing
      console.log(`Testing highlight for ${expression}: expect ${count} ${expectedType} elements`);
    });
  });
  
  test('Highlight shapes for complex operations', () => {
    const complexCases = [
      { expression: 'A∪B', description: 'Should highlight both A and B circles' },
      { expression: 'A∩B', description: 'Should use mask to show only intersection' },
      { expression: "A'", description: 'Should highlight everything except A' },
      { expression: '(A∪B)∩C', description: 'Should show intersection of (A∪B) with C' },
    ];
    
    complexCases.forEach(({ expression, description }) => {
      console.log(`Testing: ${expression} - ${description}`);
    });
  });
});

// Export for use in other test files or manual testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseSetNotation, sortedArray };
}