
import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Terminal, Trash2 } from 'lucide-react';

interface ConsoleProps {
  output: string[];
  error?: string;
  onClear: () => void;
}

const Console: React.FC<ConsoleProps> = ({ output, error, onClear }) => {
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new content is added
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output, error]);

  return (
    <div className="border-t border-editor-line bg-editor-bg">
      <div className="flex items-center justify-between px-4 py-2 bg-editor-bg border-b border-editor-line">
        <div className="flex items-center">
          <Terminal className="h-4 w-4 mr-2 text-editor-function" />
          <h2 className="text-sm font-medium text-white">Console</h2>
        </div>
        <Button
          onClick={onClear}
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-editor-line/20"
          title="Clear console"
        >
          <Trash2 className="h-4 w-4 text-editor-text" />
        </Button>
      </div>
      <div className="console-output">
        {output.length === 0 && !error ? (
          <div className="text-editor-comment italic p-2">
            Console output will appear here...
          </div>
        ) : (
          <>
            {output.map((line, index) => (
              <div key={index} className="py-1 border-b border-editor-line/30 break-words">
                {line}
              </div>
            ))}
            {error && (
              <div className="py-1 text-editor-error break-words">
                {error}
              </div>
            )}
            <div ref={consoleEndRef} />
          </>
        )}
      </div>
    </div>
  );
};

export default Console;
