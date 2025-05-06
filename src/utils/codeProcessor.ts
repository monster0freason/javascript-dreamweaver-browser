
// interface ExecutionResult {
//   success: boolean;
//   output: string[];
//   error?: string;
//   errorLine?: number;
// }

// export const executeJavaScript = (code: string): ExecutionResult => {
//   const result: ExecutionResult = {
//     success: true,
//     output: []
//   };

//   // Create a sandbox for the code execution
//   const sandbox = {
//     console: {
//       log: (...args: any[]) => {
//         result.output.push(args.map(arg => formatOutput(arg)).join(' '));
//       },
//       error: (...args: any[]) => {
//         result.output.push(`Error: ${args.map(arg => formatOutput(arg)).join(' ')}`);
//       },
//       warn: (...args: any[]) => {
//         result.output.push(`Warning: ${args.map(arg => formatOutput(arg)).join(' ')}`);
//       },
//       info: (...args: any[]) => {
//         result.output.push(`Info: ${args.map(arg => formatOutput(arg)).join(' ')}`);
//       }
//     },
//     setTimeout: () => {
//       result.output.push("Note: setTimeout is not fully supported in the sandbox");
//       return 0;
//     },
//     setInterval: () => {
//       result.output.push("Note: setInterval is not fully supported in the sandbox");
//       return 0;
//     },
//     alert: (msg: any) => {
//       result.output.push(`Alert: ${formatOutput(msg)}`);
//     },
//     prompt: () => {
//       result.output.push("Note: prompt() is not supported in the sandbox");
//       return null;
//     },
//     confirm: () => {
//       result.output.push("Note: confirm() is not supported in the sandbox");
//       return false;
//     }
//   };

//   try {
//     // Prepare the code with console capturing
//     const wrappedCode = `
//       with (sandbox) {
//         ${code}
//       }
//     `;
    
//     // Create a function from the code and execute it
//     const scriptFunction = new Function('sandbox', wrappedCode);
//     scriptFunction(sandbox);
    
//   } catch (error) {
//     result.success = false;
//     if (error instanceof Error) {
//       result.error = error.message;
      
//       // Attempt to extract the line number from the error stack
//       const stackLines = error.stack?.split('\n') || [];
//       let lineMatch = null;
      
//       for (const line of stackLines) {
//         lineMatch = line.match(/<anonymous>:(\d+):(\d+)/);
//         if (lineMatch) break;
//       }
      
//       if (lineMatch && lineMatch[1]) {
//         const extractedLine = parseInt(lineMatch[1], 10);
//         // Adjust for the wrapping code (subtract 2 for the wrapper)
//         result.errorLine = Math.max(1, extractedLine - 2);
//       }
//     } else {
//       result.error = String(error);
//     }
//   }

//   return result;
// };

// function formatOutput(value: any): string {
//   if (value === undefined) return 'undefined';
//   if (value === null) return 'null';
  
//   try {
//     if (typeof value === 'object') {
//       return JSON.stringify(value, getCircularReplacer(), 2);
//     }
//   } catch (e) {
//     return String(value);
//   }
  
//   return String(value);
// }

// // Handle circular references in objects when stringifying
// function getCircularReplacer() {
//   const seen = new WeakSet();
//   return (key: string, value: any) => {
//     if (typeof value === 'object' && value !== null) {
//       if (seen.has(value)) {
//         return '[Circular Reference]';
//       }
//       seen.add(value);
//     }
//     return value;
//   };
// }

// export const formatErrorMessage = (error: string): string => {
//   // Simplify common error messages for better readability
//   if (error.includes('is not defined')) {
//     return error.replace('ReferenceError: ', '');
//   } else if (error.includes('is not a function')) {
//     return error.replace('TypeError: ', '');
//   } else if (error.includes('Cannot read properties of')) {
//     return error.replace(/TypeError: Cannot read properties of (undefined|null) \(reading '(.+)'\)/, 
//       "Cannot read property '$2' of $1");
//   }
//   return error;
// };

// export const findErrorLine = (code: string, error: string): number | undefined => {
//   const lines = code.split('\n');
  
//   // Common error patterns with line numbers
//   const syntaxErrorMatch = error.match(/SyntaxError: .+ in .+ line (\d+)/);
//   if (syntaxErrorMatch) {
//     return parseInt(syntaxErrorMatch[1], 10);
//   }
  
//   // Look for variable names in the error message
//   const undefinedMatch = error.match(/(\w+) is not defined/);
//   if (undefinedMatch) {
//     const variable = undefinedMatch[1];
//     for (let i = 0; i < lines.length; i++) {
//       if (lines[i].includes(variable)) {
//         return i + 1;
//       }
//     }
//   }
  
//   return undefined;
// };

// export const validateJavaScript = (code: string): { valid: boolean; error?: string; errorLine?: number } => {
//   try {
//     // Basic syntax check by parsing
//     new Function(code);
//     return { valid: true };
//   } catch (error) {
//     if (error instanceof Error) {
//       // Extract line number from error message
//       const lineMatch = error.message.match(/line (\d+)/);
//       const errorLine = lineMatch ? parseInt(lineMatch[1], 10) : undefined;
      
//       return {
//         valid: false,
//         error: error.message,
//         errorLine
//       };
//     }
//     return {
//       valid: false,
//       error: String(error)
//     };
//   }
// };


from PIL import Image
import numpy as np

def jpeg_to_binary_string(image_path):
    """
    Extract binary data from a JPEG image that was created using binary_string_to_jpeg
    
    Args:
        image_path (str): Path to the JPEG image
        
    Returns:
        str: The extracted binary string
    """
    # Open the image
    img = Image.open(image_path)
    
    # Convert to numpy array
    pixel_array = np.array(img)
    
    # Threshold values (anything below 128 is considered 0, above is considered 1)
    # This helps handle JPEG compression artifacts
    binary_array = (pixel_array > 128).astype(int)
    
    # Flatten the array and convert to binary string
    binary_string = ''.join(str(bit) for bit in binary_array.flatten())
    
    return binary_string

def jpeg_to_text(image_path):
    """
    Extract text from a JPEG image that was created from text converted to binary
    
    Args:
        image_path (str): Path to the JPEG image
        
    Returns:
        str: The extracted text
    """
    # Get binary string
    binary_string = jpeg_to_binary_string(image_path)
    
    # Process binary in 8-bit chunks
    text = ""
    for i in range(0, len(binary_string), 8):
        # Make sure we have a complete byte
        if i + 8 <= len(binary_string):
            byte = binary_string[i:i+8]
            # Convert binary to integer and then to ASCII character
            try:
                char = chr(int(byte, 2))
                # Only add printable ASCII characters
                if ord(char) >= 32 and ord(char) <= 126:
                    text += char
            except ValueError:
                # Skip invalid binary
                pass
    
    return text

def restore_original_message(image_path, expected_width=None, expected_height=None):
    """
    A more accurate method to restore the original message from an image
    when the exact dimensions are known
    
    Args:
        image_path (str): Path to the JPEG image
        expected_width (int): The width of the original image
        expected_height (int): The height of the original image
        
    Returns:
        str: The extracted binary string and attempted text conversion
    """
    # Open the image
    img = Image.open(image_path)
    
    # If dimensions are provided and different from the image, resize
    if expected_width and expected_height and (img.width != expected_width or img.height != expected_height):
        img = img.resize((expected_width, expected_height))
    
    # Convert to numpy array
    pixel_array = np.array(img)
    
    # Extract binary data (threshold to handle compression artifacts)
    binary_array = (pixel_array > 128).astype(int)
    
    # Flatten and convert to string
    binary_string = ''.join(str(bit) for bit in binary_array.flatten())
    
    # Try to convert binary to text
    text = ""
    for i in range(0, len(binary_string), 8):
        if i + 8 <= len(binary_string):
            byte = binary_string[i:i+8]
            try:
                char = chr(int(byte, 2))
                # Add only if it's a printable character
                if ord(char) >= 32 and ord(char) <= 126:
                    text += char
                # Add common control characters like newline
                elif char in ['\n', '\r', '\t']:
                    text += char
            except ValueError:
                pass
    
    return {
        "binary": binary_string,
        "extracted_text": text
    }

# Example usage
if __name__ == "__main__":
    # Extract binary from an image
    binary_data = jpeg_to_binary_string("binary_string.jpg")
    print(f"Extracted {len(binary_data)} binary digits")
    
    # Try to convert to text
    text = jpeg_to_text("binary_string.jpg")
    print(f"Extracted text (first 100 chars): {text[:100]}")
    
    # For more accurate extraction when dimensions are known
    result = restore_original_message("binary_string.jpg", 1280, 720)
    print(f"Restored binary length: {len(result['binary'])}")
    print(f"Restored text sample: {result['extracted_text'][:100]}")