
interface ExecutionResult {
  success: boolean;
  output: string[];
  error?: string;
  errorLine?: number;
}

export const executeJavaScript = (code: string): ExecutionResult => {
  const result: ExecutionResult = {
    success: true,
    output: []
  };

  // Create a sandbox for the code execution
  const sandbox = {
    console: {
      log: (...args: any[]) => {
        result.output.push(args.map(arg => formatOutput(arg)).join(' '));
      },
      error: (...args: any[]) => {
        result.output.push(`Error: ${args.map(arg => formatOutput(arg)).join(' ')}`);
      },
      warn: (...args: any[]) => {
        result.output.push(`Warning: ${args.map(arg => formatOutput(arg)).join(' ')}`);
      },
      info: (...args: any[]) => {
        result.output.push(`Info: ${args.map(arg => formatOutput(arg)).join(' ')}`);
      }
    },
    setTimeout: () => {
      result.output.push("Note: setTimeout is not fully supported in the sandbox");
      return 0;
    },
    setInterval: () => {
      result.output.push("Note: setInterval is not fully supported in the sandbox");
      return 0;
    },
    alert: (msg: any) => {
      result.output.push(`Alert: ${formatOutput(msg)}`);
    },
    prompt: () => {
      result.output.push("Note: prompt() is not supported in the sandbox");
      return null;
    },
    confirm: () => {
      result.output.push("Note: confirm() is not supported in the sandbox");
      return false;
    }
  };

  try {
    // Prepare the code with console capturing
    const wrappedCode = `
      with (sandbox) {
        ${code}
      }
    `;
    
    // Create a function from the code and execute it
    const scriptFunction = new Function('sandbox', wrappedCode);
    scriptFunction(sandbox);
    
  } catch (error) {
    result.success = false;
    if (error instanceof Error) {
      result.error = error.message;
      
      // Attempt to extract the line number from the error stack
      const stackLines = error.stack?.split('\n') || [];
      let lineMatch = null;
      
      for (const line of stackLines) {
        lineMatch = line.match(/<anonymous>:(\d+):(\d+)/);
        if (lineMatch) break;
      }
      
      if (lineMatch && lineMatch[1]) {
        const extractedLine = parseInt(lineMatch[1], 10);
        // Adjust for the wrapping code (subtract 2 for the wrapper)
        result.errorLine = Math.max(1, extractedLine - 2);
      }
    } else {
      result.error = String(error);
    }
  }

  return result;
};

function formatOutput(value: any): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  
  try {
    if (typeof value === 'object') {
      return JSON.stringify(value, getCircularReplacer(), 2);
    }
  } catch (e) {
    return String(value);
  }
  
  return String(value);
}

// Handle circular references in objects when stringifying
function getCircularReplacer() {
  const seen = new WeakSet();
  return (key: string, value: any) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular Reference]';
      }
      seen.add(value);
    }
    return value;
  };
}

export const formatErrorMessage = (error: string): string => {
  // Simplify common error messages for better readability
  if (error.includes('is not defined')) {
    return error.replace('ReferenceError: ', '');
  } else if (error.includes('is not a function')) {
    return error.replace('TypeError: ', '');
  } else if (error.includes('Cannot read properties of')) {
    return error.replace(/TypeError: Cannot read properties of (undefined|null) \(reading '(.+)'\)/, 
      "Cannot read property '$2' of $1");
  }
  return error;
};

export const findErrorLine = (code: string, error: string): number | undefined => {
  const lines = code.split('\n');
  
  // Common error patterns with line numbers
  const syntaxErrorMatch = error.match(/SyntaxError: .+ in .+ line (\d+)/);
  if (syntaxErrorMatch) {
    return parseInt(syntaxErrorMatch[1], 10);
  }
  
  // Look for variable names in the error message
  const undefinedMatch = error.match(/(\w+) is not defined/);
  if (undefinedMatch) {
    const variable = undefinedMatch[1];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(variable)) {
        return i + 1;
      }
    }
  }
  
  return undefined;
};

export const validateJavaScript = (code: string): { valid: boolean; error?: string; errorLine?: number } => {
  try {
    // Basic syntax check by parsing
    new Function(code);
    return { valid: true };
  } catch (error) {
    if (error instanceof Error) {
      // Extract line number from error message
      const lineMatch = error.message.match(/line (\d+)/);
      const errorLine = lineMatch ? parseInt(lineMatch[1], 10) : undefined;
      
      return {
        valid: false,
        error: error.message,
        errorLine
      };
    }
    return {
      valid: false,
      error: String(error)
    };
  }
};
