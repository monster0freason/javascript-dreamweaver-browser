
export interface TokenType {
  type: 'keyword' | 'string' | 'number' | 'function' | 'variable' | 'operator' | 'comment' | 'plain';
  value: string;
}

// JavaScript keywords
const keywords = [
  'var', 'let', 'const', 'if', 'else', 'for', 'while', 'do', 'switch', 'case',
  'default', 'break', 'continue', 'return', 'function', 'class', 'extends',
  'new', 'try', 'catch', 'finally', 'throw', 'this', 'super', 'import', 'export',
  'from', 'as', 'async', 'await', 'true', 'false', 'null', 'undefined'
];

// JavaScript operators
const operators = [
  '+', '-', '*', '/', '%', '=', '==', '===', '!=', '!==', '>', '<',
  '>=', '<=', '&&', '||', '!', '?', ':', '++', '--', '+=', '-=', '*=',
  '/=', '%=', '&', '|', '^', '~', '<<', '>>', '>>>', '&=', '|=', '^=',
  '<<=', '>>=', '>>>='
];

export const tokenize = (code: string): TokenType[] => {
  const tokens: TokenType[] = [];
  let current = 0;

  while (current < code.length) {
    let char = code[current];

    // Handle comments
    if (char === '/' && code[current + 1] === '/') {
      let value = '';
      // Consume all characters until end of line
      while (current < code.length && code[current] !== '\n') {
        value += code[current];
        current++;
      }
      tokens.push({ type: 'comment', value });
      continue;
    }

    // Handle multi-line comments
    if (char === '/' && code[current + 1] === '*') {
      let value = '';
      // Consume all characters until we find */
      current += 2; // Skip /*
      while (current < code.length && !(code[current - 1] === '*' && code[current] === '/')) {
        value += code[current];
        current++;
      }
      if (current < code.length) {
        value = '/*' + value + '*/';
        current++; // Skip the final /
      } else {
        value = '/*' + value;
      }
      tokens.push({ type: 'comment', value });
      continue;
    }

    // Handle strings with double quotes
    if (char === '"' || char === "'" || char === '`') {
      const quote = char;
      let value = char;
      current++;

      while (current < code.length && code[current] !== quote) {
        // Handle escape characters
        if (code[current] === '\\' && current + 1 < code.length) {
          value += code[current] + code[current + 1];
          current += 2;
          continue;
        }
        
        value += code[current];
        current++;
      }

      if (current < code.length) {
        value += quote;
        current++;
      }

      tokens.push({ type: 'string', value });
      continue;
    }

    // Handle numbers
    if (/[0-9]/.test(char)) {
      let value = '';
      let isFloat = false;
      
      while (current < code.length && (/[0-9.]/.test(code[current]))) {
        if (code[current] === '.' && isFloat) break; // Two decimal points is invalid
        if (code[current] === '.') isFloat = true;
        value += code[current];
        current++;
      }
      
      // Handle scientific notation
      if (current < code.length && (code[current] === 'e' || code[current] === 'E')) {
        value += code[current];
        current++;
        
        if (current < code.length && (code[current] === '+' || code[current] === '-')) {
          value += code[current];
          current++;
        }
        
        while (current < code.length && /[0-9]/.test(code[current])) {
          value += code[current];
          current++;
        }
      }
      
      tokens.push({ type: 'number', value });
      continue;
    }

    // Handle identifiers (variables, functions, keywords)
    if (/[a-zA-Z_$]/.test(char)) {
      let value = '';
      
      while (current < code.length && /[a-zA-Z0-9_$]/.test(code[current])) {
        value += code[current];
        current++;
      }
      
      // Check if it's a function call
      let isFunction = false;
      let i = current;
      while (i < code.length && /\s/.test(code[i])) i++; // Skip whitespace
      if (i < code.length && code[i] === '(') {
        isFunction = true;
      }
      
      if (keywords.includes(value)) {
        tokens.push({ type: 'keyword', value });
      } else if (isFunction) {
        tokens.push({ type: 'function', value });
      } else {
        tokens.push({ type: 'variable', value });
      }
      continue;
    }

    // Handle operators
    if (operators.some(op => op === char) || operators.some(op => op.startsWith(char) && code.slice(current, current + op.length) === op)) {
      const matchedOperator = operators.find(op => op.startsWith(char) && code.slice(current, current + op.length) === op) || char;
      tokens.push({ type: 'operator', value: matchedOperator });
      current += matchedOperator.length;
      continue;
    }

    // Handle whitespace and other characters
    tokens.push({ type: 'plain', value: char });
    current++;
  }

  return tokens;
};

export const highlightCode = (code: string): string => {
  const tokens = tokenize(code);
  let highlighted = '';

  for (const token of tokens) {
    switch (token.type) {
      case 'keyword':
        highlighted += `<span class="syntax-keyword">${token.value}</span>`;
        break;
      case 'string':
        highlighted += `<span class="syntax-string">${token.value}</span>`;
        break;
      case 'number':
        highlighted += `<span class="syntax-number">${token.value}</span>`;
        break;
      case 'function':
        highlighted += `<span class="syntax-function">${token.value}</span>`;
        break;
      case 'variable':
        highlighted += `<span class="syntax-variable">${token.value}</span>`;
        break;
      case 'operator':
        highlighted += `<span class="syntax-operator">${token.value}</span>`;
        break;
      case 'comment':
        highlighted += `<span class="syntax-comment">${token.value}</span>`;
        break;
      default:
        highlighted += token.value;
    }
  }

  return highlighted;
};
