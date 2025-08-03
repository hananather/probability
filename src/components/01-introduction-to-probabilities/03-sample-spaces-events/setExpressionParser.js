/**
 * Set Expression Parser
 * Parses and evaluates set theory expressions like "A∪B", "(A∩B)'", etc.
 * Uses recursive descent parsing to handle complex expressions with proper precedence
 */

// Set definitions
const SET_DEFINITIONS = {
  'A': [1, 4, 5, 7],
  'B': [2, 5, 6, 7],
  'C': [3, 4, 6, 7],
  'U': [1, 2, 3, 4, 5, 6, 7, 8],
  '∅': []
};

// Set operations
function union(set1, set2) {
  return [...new Set([...set1, ...set2])];
}

function intersect(set1, set2) {
  return set1.filter(x => set2.includes(x));
}

function complement(set) {
  return SET_DEFINITIONS['U'].filter(x => !set.includes(x));
}

function difference(set1, set2) {
  return set1.filter(x => !set2.includes(x));
}

/**
 * Token types for lexical analysis
 */
const TokenType = {
  SET: 'SET',
  UNION: 'UNION',
  INTERSECT: 'INTERSECT',
  COMPLEMENT: 'COMPLEMENT',
  DIFFERENCE: 'DIFFERENCE',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  EOF: 'EOF'
};

/**
 * Tokenizer - converts string to tokens
 */
class Tokenizer {
  constructor(input) {
    this.input = input.replace(/\s/g, ''); // Remove whitespace
    this.position = 0;
    this.tokens = [];
    this.tokenize();
  }
  
  tokenize() {
    while (this.position < this.input.length) {
      const char = this.input[this.position];
      
      if (char === 'A' || char === 'B' || char === 'C' || char === 'U') {
        this.tokens.push({ type: TokenType.SET, value: char });
      } else if (char === '∅') {
        this.tokens.push({ type: TokenType.SET, value: char });
      } else if (char === '∪') {
        this.tokens.push({ type: TokenType.UNION });
      } else if (char === '∩') {
        this.tokens.push({ type: TokenType.INTERSECT });
      } else if (char === "'") {
        this.tokens.push({ type: TokenType.COMPLEMENT });
      } else if (char === '\\' || char === '∖' || char === '-') {
        this.tokens.push({ type: TokenType.DIFFERENCE });
      } else if (char === '(') {
        this.tokens.push({ type: TokenType.LPAREN });
      } else if (char === ')') {
        this.tokens.push({ type: TokenType.RPAREN });
      } else {
        throw new Error(`Unexpected character: ${char}`);
      }
      
      this.position++;
    }
    
    this.tokens.push({ type: TokenType.EOF });
  }
}

/**
 * Parser - builds abstract syntax tree from tokens
 * Grammar:
 * expression := term (('∪' | '∖') term)*
 * term := factor ('∩' factor)*
 * factor := atom complement*
 * atom := SET | '(' expression ')'
 */
class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
  }
  
  currentToken() {
    return this.tokens[this.position];
  }
  
  consume(expectedType) {
    const token = this.currentToken();
    if (token.type !== expectedType) {
      throw new Error(`Expected ${expectedType} but got ${token.type}`);
    }
    this.position++;
    return token;
  }
  
  parse() {
    const ast = this.parseExpression();
    if (this.currentToken().type !== TokenType.EOF) {
      throw new Error('Unexpected tokens after expression');
    }
    return ast;
  }
  
  // Parse union and difference (lowest precedence)
  parseExpression() {
    let left = this.parseTerm();
    
    while (this.currentToken().type === TokenType.UNION || 
           this.currentToken().type === TokenType.DIFFERENCE) {
      const op = this.currentToken().type;
      this.position++;
      const right = this.parseTerm();
      left = { type: op, left, right };
    }
    
    return left;
  }
  
  // Parse intersection (medium precedence)
  parseTerm() {
    let left = this.parseFactor();
    
    while (this.currentToken().type === TokenType.INTERSECT) {
      this.position++;
      const right = this.parseFactor();
      left = { type: TokenType.INTERSECT, left, right };
    }
    
    return left;
  }
  
  // Parse complement (highest precedence)
  parseFactor() {
    let atom = this.parseAtom();
    
    while (this.currentToken().type === TokenType.COMPLEMENT) {
      this.position++;
      atom = { type: TokenType.COMPLEMENT, operand: atom };
    }
    
    return atom;
  }
  
  // Parse atomic expressions
  parseAtom() {
    const token = this.currentToken();
    
    if (token.type === TokenType.SET) {
      this.position++;
      return { type: TokenType.SET, value: token.value };
    } else if (token.type === TokenType.LPAREN) {
      this.position++;
      const expr = this.parseExpression();
      this.consume(TokenType.RPAREN);
      return expr;
    } else {
      throw new Error(`Unexpected token: ${token.type}`);
    }
  }
}

/**
 * Evaluator - evaluates abstract syntax tree to get result set
 */
class Evaluator {
  evaluate(ast) {
    switch (ast.type) {
      case TokenType.SET:
        return SET_DEFINITIONS[ast.value] || [];
        
      case TokenType.UNION:
        return union(this.evaluate(ast.left), this.evaluate(ast.right));
        
      case TokenType.INTERSECT:
        return intersect(this.evaluate(ast.left), this.evaluate(ast.right));
        
      case TokenType.COMPLEMENT:
        return complement(this.evaluate(ast.operand));
        
      case TokenType.DIFFERENCE:
        return difference(this.evaluate(ast.left), this.evaluate(ast.right));
        
      default:
        throw new Error(`Unknown AST node type: ${ast.type}`);
    }
  }
}

/**
 * Main parse function
 * @param {string} expression - Set expression to parse
 * @returns {number[]} - Array of elements in the resulting set
 */
export function parseSetExpression(expression) {
  try {
    if (!expression || typeof expression !== 'string') {
      return [];
    }
    
    // Handle empty set
    if (expression.trim() === '∅') {
      return [];
    }
    
    // Tokenize
    const tokenizer = new Tokenizer(expression);
    
    // Parse
    const parser = new Parser(tokenizer.tokens);
    const ast = parser.parse();
    
    // Evaluate
    const evaluator = new Evaluator();
    const result = evaluator.evaluate(ast);
    
    // Sort for consistency
    return result.sort((a, b) => a - b);
  } catch (error) {
    // Only log parse errors in development mode
    if (process.env.NODE_ENV === 'development') {
      console.error('Set expression parse error:', error.message);
    }
    return null;
  }
}

/**
 * Convert elements to Venn diagram regions
 * @param {number[]} elements - Array of elements
 * @returns {number[]} - Array of region numbers
 */
export function elementsToRegions(elements) {
  const REGION_MAPPING = {
    1: 1,  // Only A
    2: 2,  // Only B
    3: 3,  // Only C
    4: 4,  // A and C, not B
    5: 5,  // A and B, not C
    6: 6,  // B and C, not A
    7: 7,  // All three
    8: 8   // None (outside all sets)
  };
  
  return elements.map(el => REGION_MAPPING[el]).filter(r => r !== undefined);
}

/**
 * Check if two expressions are equivalent
 * @param {string} expr1 - First expression
 * @param {string} expr2 - Second expression
 * @returns {boolean} - True if expressions evaluate to same set
 */
export function areExpressionsEquivalent(expr1, expr2) {
  const result1 = parseSetExpression(expr1);
  const result2 = parseSetExpression(expr2);
  
  if (!result1 || !result2) return false;
  
  return JSON.stringify(result1) === JSON.stringify(result2);
}

/**
 * Get a human-readable description of a set expression result
 * @param {number[]} elements - Array of elements
 * @returns {string} - Description
 */
export function describeSet(elements) {
  if (!elements || elements.length === 0) {
    return 'Empty set ∅';
  }
  
  return `{${elements.join(', ')}}`;
}

// Export for testing
export const testParser = {
  SET_DEFINITIONS,
  union,
  intersect,
  complement,
  difference
};