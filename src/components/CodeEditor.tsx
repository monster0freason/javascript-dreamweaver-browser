
import React, { useState, useRef, useEffect } from 'react';
import { validateJavaScript } from '@/utils/codeProcessor';
import { highlightCode } from '@/utils/syntaxHighlighter';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CodeEditorProps {
  initialCode?: string;
  onCodeChange: (code: string) => void;
  onResultsChange: (output: string[], error?: string, errorLine?: number) => void;
  onCursorPositionChange: (line: number, column: number) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  initialCode = '',
  onCodeChange,
  onResultsChange,
  onCursorPositionChange
}) => {
  const [code, setCode] = useState(initialCode);
  const [highlightedCode, setHighlightedCode] = useState('');
  const [errorLine, setErrorLine] = useState<number | undefined>(undefined);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 0 });
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightedRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const editorWrapperRef = useRef<HTMLDivElement>(null);
  
  // Update highlighted code when code changes
  useEffect(() => {
    try {
      updateHighlightedCode();
      updateLineNumbers();
      
      // Basic validation on code change
      const validation = validateJavaScript(code);
      if (!validation.valid) {
        setErrorLine(validation.errorLine);
      } else {
        setErrorLine(undefined);
      }
      
      onCodeChange(code);
    } catch (error) {
      console.error("Error updating code highlight:", error);
    }
  }, [code]);
  
  // Sync scrolling between textarea and highlighted code
  useEffect(() => {
    const textarea = textareaRef.current;
    const highlighted = highlightedRef.current;
    const lineNumbers = lineNumbersRef.current;
    
    if (!textarea || !highlighted || !lineNumbers) return;
    
    const handleScroll = () => {
      highlighted.scrollTop = textarea.scrollTop;
      highlighted.scrollLeft = textarea.scrollLeft;
      lineNumbers.scrollTop = textarea.scrollTop;
    };
    
    textarea.addEventListener('scroll', handleScroll);
    return () => {
      textarea.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const updateHighlightedCode = () => {
    try {
      const highlighted = highlightCode(code);
      setHighlightedCode(highlighted);
    } catch (error) {
      console.error("Error in syntax highlighting:", error);
      setHighlightedCode(code);
    }
  };
  
  const updateLineNumbers = () => {
    if (!lineNumbersRef.current) return;
    
    const linesCount = (code.match(/\n/g) || '').length + 1;
    const numbers = Array.from({ length: linesCount }, (_, i) => i + 1)
      .map(num => `<div class="${errorLine === num ? 'text-editor-error' : ''}">${num}</div>`)
      .join('');
    
    lineNumbersRef.current.innerHTML = numbers;
  };
  
  // Fixed cursor position calculation function
  const calculateCursorPosition = (cursorIndex: number, text: string): { line: number, column: number } => {
    // Handle empty text case
    if (!text) return { line: 1, column: 1 };
    
    // Get all line break indices
    const lineBreaks = [];
    let index = -1;
    
    while ((index = text.indexOf('\n', index + 1)) !== -1) {
      lineBreaks.push(index);
    }
    
    // Calculate line and column
    if (lineBreaks.length === 0 || cursorIndex <= lineBreaks[0]) {
      // First line
      return { line: 1, column: cursorIndex + 1 };
    }
    
    // Find which line the cursor is on
    let lineIndex = 0;
    while (lineIndex < lineBreaks.length && cursorIndex > lineBreaks[lineIndex]) {
      lineIndex++;
    }
    
    const line = lineIndex + 1;
    const previousLineBreak = lineIndex > 0 ? lineBreaks[lineIndex - 1] : -1;
    const column = cursorIndex - previousLineBreak;
    
    return { line, column };
  };
  
  const updateCursorPosition = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const cursorIndex = textarea.selectionStart;
    const position = calculateCursorPosition(cursorIndex, code);
    
    setCursorPosition(position);
    onCursorPositionChange(position.line, position.column);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    
    // Capture cursor position after change to ensure it's correct
    requestAnimationFrame(() => {
      updateCursorPosition();
    });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Handle tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Insert tab at cursor position
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      
      // Move cursor after the tab
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        updateCursorPosition();
      });
    }
  };
  
  // Event handlers for cursor position updates
  const handleCursorPosition = () => {
    requestAnimationFrame(updateCursorPosition);
  };
  
  return (
    <div className="relative h-full">
      <div 
        ref={editorWrapperRef} 
        className="editor-wrapper relative"
      >
        <div className="flex h-full">
          <div 
            ref={lineNumbersRef} 
            className="line-numbers"
          ></div>
          
          <div className="relative flex-1">
            <div 
              ref={highlightedRef}
              className="editor-textarea absolute top-0 left-0 pointer-events-none whitespace-pre overflow-hidden"
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            ></div>
            
            <textarea
              ref={textareaRef}
              value={code}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onClick={handleCursorPosition}
              onKeyUp={handleCursorPosition}
              onMouseUp={handleCursorPosition}
              onSelect={handleCursorPosition}
              className="editor-textarea absolute top-0 left-0 bg-transparent text-transparent caret-editor-cursor"
              spellCheck="false"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              data-gramm="false"
            ></textarea>
          </div>
        </div>
      </div>

      {errorLine && (
        <div 
          className="absolute left-0 right-0 bg-editor-error/20"
          style={{
            top: `calc(${errorLine - 1} * 1.5rem + 1rem)`,
            height: '1.5rem'
          }}
        ></div>
      )}
    </div>
  );
};

export default CodeEditor;
