
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Save, 
  FileCode, 
  Plus,
  Settings
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onRun: () => void;
  onNew: () => void;
  onSave: () => void;
  fileName: string;
  onFileNameChange: (name: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  onRun,
  onNew,
  onSave,
  fileName,
  onFileNameChange
}) => {
  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileNameChange(e.target.value);
  };

  return (
    <header className="flex items-center justify-between p-4 bg-editor-bg text-white border-b border-editor-line">
      <div className="flex items-center">
        <FileCode className="h-6 w-6 mr-2 text-editor-function" />
        <h1 className="text-xl font-semibold text-white hidden sm:block">JS Dreamweaver</h1>
      </div>

      <div className="flex-1 mx-4">
        <input 
          type="text"
          value={fileName}
          onChange={handleFileNameChange}
          className="bg-editor-bg text-white border border-editor-line rounded px-2 py-1 w-full max-w-xs outline-none focus:border-editor-cursor"
          placeholder="Untitled.js"
        />
      </div>

      <div className="flex space-x-2">
        <Button 
          onClick={onRun} 
          variant="default" 
          className="bg-editor-success hover:bg-editor-success/80 text-black"
        >
          <Play className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Run</span>
        </Button>

        <Button 
          onClick={onSave} 
          variant="outline" 
          className="border-editor-line hover:bg-editor-line/20"
        >
          <Save className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Save</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-editor-line hover:bg-editor-line/20">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-editor-bg text-white border-editor-line">
            <DropdownMenuLabel>Options</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-editor-line" />
            <DropdownMenuItem 
              onClick={onNew}
              className="hover:bg-editor-line/20 cursor-pointer focus:bg-editor-line/20"
            >
              <Plus className="h-4 w-4 mr-2" />
              New File
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
