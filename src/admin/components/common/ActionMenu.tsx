import React, { useState, useRef, useEffect } from 'react';
import { Menu } from 'lucide-react';

interface Action {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  download?: boolean;
  isFileInput?: boolean;
  onFileSelect?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

interface ActionMenuProps {
  actions: Action[];
}

export const ActionMenu: React.FC<ActionMenuProps> = ({ actions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileInputClick = (onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => onFileSelect(e as React.ChangeEvent<HTMLInputElement>);
    input.click();
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="sm:hidden p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 rounded-lg"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Desktop Buttons */}
      <div className="hidden sm:flex items-center gap-2">
        {actions.map((action, index) => (
          <React.Fragment key={index}>
            {action.isFileInput ? (
              <button
                onClick={() => action.onFileSelect && handleFileInputClick(action.onFileSelect)}
                className={`flex items-center px-3 py-1.5 text-sm rounded-lg transition-colors ${action.className || 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {action.icon}
                <span className="ml-1.5">{action.label}</span>
              </button>
            ) : action.href ? (
              <a
                href={action.href}
                download={action.download}
                className={`flex items-center px-3 py-1.5 text-sm rounded-lg transition-colors ${action.className || 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {action.icon}
                <span className="ml-1.5">{action.label}</span>
              </a>
            ) : (
              <button
                onClick={action.onClick}
                className={`flex items-center px-3 py-1.5 text-sm rounded-lg transition-colors ${action.className || 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {action.icon}
                <span className="ml-1.5">{action.label}</span>
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 sm:hidden z-50 max-h-[calc(100vh-100px)] overflow-y-auto">
          {actions.map((action, index) => (
            <React.Fragment key={index}>
              {action.isFileInput ? (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    action.onFileSelect && handleFileInputClick(action.onFileSelect);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {action.icon && <span className="w-5 h-5 mr-3">{action.icon}</span>}
                  <span>{action.label}</span>
                </button>
              ) : action.href ? (
                <a
                  href={action.href}
                  download={action.download}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  {action.icon && <span className="w-5 h-5 mr-3">{action.icon}</span>}
                  <span>{action.label}</span>
                </a>
              ) : (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    action.onClick?.();
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {action.icon && <span className="w-5 h-5 mr-3">{action.icon}</span>}
                  <span>{action.label}</span>
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;