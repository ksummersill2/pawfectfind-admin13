import React, { useState, useRef, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';

interface ActionItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  download?: boolean;
  isFileInput?: boolean;
  onFileSelect?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

interface ActionDropdownProps {
  trigger: React.ReactNode;
  items: ActionItem[];
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ trigger, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
    input.onchange = (e) => {
      onFileSelect(e as React.ChangeEvent<HTMLInputElement>);
      setIsOpen(false);
    };
    input.click();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50">
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {item.isFileInput ? (
                <button
                  onClick={() => item.onFileSelect && handleFileInputClick(item.onFileSelect)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {item.icon && <span className="w-5 h-5 mr-3">{item.icon}</span>}
                  <span>{item.label}</span>
                </button>
              ) : item.href ? (
                <a
                  href={item.href}
                  download={item.download}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon && <span className="w-5 h-5 mr-3">{item.icon}</span>}
                  <span>{item.label}</span>
                  {!item.download && <ExternalLink className="w-4 h-4 ml-auto" />}
                </a>
              ) : (
                <button
                  onClick={() => {
                    item.onClick?.();
                    setIsOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {item.icon && <span className="w-5 h-5 mr-3">{item.icon}</span>}
                  <span>{item.label}</span>
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionDropdown;