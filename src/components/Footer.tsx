
import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  status: 'idle' | 'success' | 'error';
  message?: string;
  line?: number;
  column?: number;
}

const Footer: React.FC<FooterProps> = ({ status, message, line, column }) => {
  return (
    <footer className="flex items-center justify-between p-2 bg-editor-bg text-sm border-t border-editor-line">
      <div className="flex items-center">
        {status === 'error' ? (
          <>
            <AlertCircle className="h-4 w-4 text-editor-error mr-2" />
            <span className="text-editor-error">{message}</span>
          </>
        ) : status === 'success' ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-editor-success mr-2" />
            <span className="text-editor-success">Code executed successfully</span>
          </>
        ) : null}
      </div>
      <div className="text-editor-comment">
        {line !== undefined && `Ln ${line}`}
        {column !== undefined && line !== undefined && `, Col ${column}`}
      </div>
    </footer>
  );
};

export default Footer;
