
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import CodeEditor from '@/components/CodeEditor';
import Console from '@/components/Console';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

// Sample initial code
const initialCode = `// Welcome to JavaScript Dreamweaver!
// Write your code here and click Run to execute it.

function greet(name) {
  return \`Hello, \${name}! Welcome to JS Dreamweaver.\`;
}

// Let's test our function
console.log(greet("Developer"));

// Try to experiment with more code below:
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled numbers:", doubled);

// This is how errors are handled:
// Uncomment the line below to see error handling in action
// console.log(undefinedVariable);
`;

const Index = () => {
  const [code, setCode] = useState(initialCode);
  const [fileName, setFileName] = useState('example.js');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);
  const [errorLine, setErrorLine] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 0 });
  
  const { toast } = useToast();

  // Handle code execution
  const handleRunCode = () => {
    const editorComponent = document.querySelector('div[data-component-name="CodeEditor"]') as HTMLElement;
    if (editorComponent) {
      // This would normally call a method on the component, but we're using a direct approach here
      executeCode();
    }
  };
  
  const executeCode = () => {
    // The actual execution happens in the CodeEditor component
    // This is just to coordinate the UI state
    setStatus('idle');
  };

  // Handle results from code execution
  const handleResults = (output: string[], err?: string, errLine?: number) => {
    setConsoleOutput(output);
    setError(err);
    setErrorLine(errLine);
    setStatus(err ? 'error' : 'success');
  };

  // Handle creating a new file
  const handleNewFile = () => {
    if (code !== initialCode) {
      if (confirm('Create a new file? All unsaved changes will be lost.')) {
        setCode('// Write your JavaScript code here...\n\n');
        setFileName('untitled.js');
        setConsoleOutput([]);
        setError(undefined);
        setStatus('idle');
        toast({
          title: "New file created",
          variant: "default",
        });
      }
    } else {
      setCode('// Write your JavaScript code here...\n\n');
      setFileName('untitled.js');
    }
  };

  // Handle saving the file
  const handleSaveFile = () => {
    try {
      const blob = new Blob([code], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      
      URL.revokeObjectURL(url);
      
      toast({
        title: "File saved",
        description: `Successfully saved as ${fileName}`,
        variant: "default",
      });
    } catch (err) {
      console.error("Error saving file:", err);
      toast({
        title: "Save failed",
        description: "Unable to save file. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle console clear
  const handleClearConsole = () => {
    setConsoleOutput([]);
    setError(undefined);
  };

  // Handle cursor position updates
  const handleCursorPositionChange = (line: number, column: number) => {
    setCursorPosition({ line, column });
  };

  useEffect(() => {
    // Set up event listeners for keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S / Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveFile();
      }
      
      // Ctrl+Enter / Cmd+Enter to run
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [code, fileName]);

  return (
    <div className="min-h-screen flex flex-col bg-editor-bg text-editor-text">
      <Header
        onRun={handleRunCode}
        onNew={handleNewFile}
        onSave={handleSaveFile}
        fileName={fileName}
        onFileNameChange={setFileName}
      />
      
      <ResizablePanelGroup
        direction="vertical"
        className="flex-1"
      >
        <ResizablePanel defaultSize={70} className="editor-container">
          <CodeEditor
            initialCode={code}
            onCodeChange={setCode}
            onResultsChange={handleResults}
            onCursorPositionChange={handleCursorPositionChange}
          />
        </ResizablePanel>
        
        <ResizableHandle className="h-1 bg-editor-line/50 hover:bg-editor-cursor transition-colors" />
        
        <ResizablePanel defaultSize={30}>
          <Console
            output={consoleOutput}
            error={error}
            onClear={handleClearConsole}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
      
      <Footer
        status={status}
        message={error}
        line={cursorPosition.line}
        column={cursorPosition.column}
      />
    </div>
  );
};

export default Index;
