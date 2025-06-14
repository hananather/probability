/**
 * Standalone Test Runner for Venn Diagram Tests
 * 
 * This can be run directly with Node.js without Jest setup:
 * node runTests.js
 */

// Import the parseSetNotation function (copy from component for standalone testing)
function parseSetNotation(notation) {
  const sets = {
    'A': [1, 4, 5, 7],
    'B': [2, 5, 6, 7],
    'C': [3, 4, 6, 7],
    'U': [1, 2, 3, 4, 5, 6, 7, 8],
    '∅': []
  };
  
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
  
  function parse(expr) {
    // Tokenize the expression first
    tokens = expr.split('').filter(char => char !== ' ');
    index = 0;
    const result = parseEvent();
    return result.evaluate();
  }

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
      if (index >= tokens.length || tokens[index] !== ')') {
        throw new Error(`Expected ')' but found ${tokens[index] || 'end of expression'}`);
      }
      index++;
      return new ParenthesesEvent(innerEvent, parseOperator());
    }
    else throw new Error(`Expected A, B, C, ∅, U, or '(' but found '${char}'`);
  }
  
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
    const cleanNotation = notation.replace(/\s/g, '');
    if (!cleanNotation) return [];
    return parse(cleanNotation);
  } catch (e) {
    return [];
  }
}

// Test runner
class TestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.results = [];
  }

  sortArray(arr) {
    return [...arr].sort((a, b) => a - b);
  }

  arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    const sortedA = this.sortArray(a);
    const sortedB = this.sortArray(b);
    return sortedA.every((val, idx) => val === sortedB[idx]);
  }

  test(description, expression, expected) {
    try {
      const result = parseSetNotation(expression);
      const pass = this.arraysEqual(result, expected);
      
      if (pass) {
        this.passed++;
        this.results.push({ description, expression, status: '✓', result: 'PASS' });
      } else {
        this.failed++;
        this.results.push({ 
          description, 
          expression, 
          status: '✗', 
          result: `FAIL - Expected: {${expected.join(', ')}}, Got: {${result.join(', ')}}` 
        });
      }
    } catch (error) {
      this.failed++;
      this.results.push({ 
        description, 
        expression, 
        status: '✗', 
        result: `ERROR - ${error.message}` 
      });
    }
  }

  runAllTests() {
    console.log('🧪 Running Venn Diagram Tests...\n');

    // Basic Sets
    console.log('📁 Basic Sets');
    this.test('Set A', 'A', [1, 4, 5, 7]);
    this.test('Set B', 'B', [2, 5, 6, 7]);
    this.test('Set C', 'C', [3, 4, 6, 7]);
    this.test('Universal Set', 'U', [1, 2, 3, 4, 5, 6, 7, 8]);
    this.test('Empty Set', '∅', []);

    // Union Operations
    console.log('\n📁 Union Operations');
    this.test('A∪B', 'A∪B', [1, 2, 4, 5, 6, 7]);
    this.test('B∪C', 'B∪C', [2, 3, 4, 5, 6, 7]);
    this.test('A∪C', 'A∪C', [1, 3, 4, 5, 6, 7]);
    this.test('A∪B∪C', 'A∪B∪C', [1, 2, 3, 4, 5, 6, 7]);

    // Intersection Operations
    console.log('\n📁 Intersection Operations');
    this.test('A∩B', 'A∩B', [5, 7]);
    this.test('B∩C', 'B∩C', [6, 7]);
    this.test('A∩C', 'A∩C', [4, 7]);
    this.test('A∩B∩C', 'A∩B∩C', [7]);

    // Complement Operations
    console.log('\n📁 Complement Operations');
    this.test("A'", "A'", [2, 3, 6, 8]);
    this.test("B'", "B'", [1, 3, 4, 8]);
    this.test("C'", "C'", [1, 2, 5, 8]);
    this.test("U'", "U'", []);
    this.test("∅'", "∅'", [1, 2, 3, 4, 5, 6, 7, 8]);

    // Complex Operations
    console.log('\n📁 Complex Operations');
    this.test('(A∪B)∩C', '(A∪B)∩C', [4, 6, 7]);
    this.test('A∪(B∩C)', 'A∪(B∩C)', [1, 4, 5, 6, 7]);
    this.test('(A∩B)∪C', '(A∩B)∪C', [3, 4, 5, 6, 7]);
    this.test('A∩(B∪C)', 'A∩(B∪C)', [4, 5, 7]);

    // De Morgan's Laws
    console.log('\n📁 De Morgan\'s Laws');
    this.test("(A∪B)'", "(A∪B)'", [3, 8]);
    this.test("A'∩B'", "A'∩B'", [3, 8]);
    this.test("(A∩B)'", "(A∩B)'", [1, 2, 3, 4, 6, 8]);
    this.test("A'∪B'", "A'∪B'", [1, 2, 3, 4, 6, 8]);

    // Edge Cases
    console.log('\n📁 Edge Cases');
    this.test('∅∪A', '∅∪A', [1, 4, 5, 7]);
    this.test('∅∩A', '∅∩A', []);
    this.test('U∩A', 'U∩A', [1, 4, 5, 7]);
    this.test('U∪A', 'U∪A', [1, 2, 3, 4, 5, 6, 7, 8]);
    this.test("A''", "A''", [1, 4, 5, 7]);

    // Complex Nested
    console.log('\n📁 Complex Nested Operations');
    this.test("((A∪B)∩C)'", "((A∪B)∩C)'", [1, 2, 3, 5, 8]);
    this.test("(A'∩B')∪C", "(A'∩B')∪C", [3, 4, 6, 7, 8]);
    this.test("(A∪B)'∩C", "(A∪B)'∩C", [3]);

    // Display results
    this.displayResults();
  }

  displayResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    
    // Show failed tests
    const failedTests = this.results.filter(r => r.status === '✗');
    if (failedTests.length > 0) {
      console.log('\n❌ FAILED TESTS:');
      failedTests.forEach(test => {
        console.log(`  ${test.status} ${test.description} (${test.expression})`);
        console.log(`     ${test.result}`);
      });
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📋 Total:  ${this.passed + this.failed}`);
    console.log(`📈 Success Rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);
    console.log('='.repeat(60));

    // Visual representation
    if (this.failed === 0) {
      console.log('\n🎉 All tests passed! The Venn diagram implementation is correct.');
    } else {
      console.log('\n⚠️  Some tests failed. Please check the implementation.');
    }
  }
}

// Run the tests
const runner = new TestRunner();
runner.runAllTests();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseSetNotation, TestRunner };
}