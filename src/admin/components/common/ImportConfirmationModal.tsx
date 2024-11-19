import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ImportConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onSkip: () => void;
  onCancel: () => void;
}

const ImportConfirmationModal: React.FC<ImportConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onSkip,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md relative">
        <button
          onClick={onCancel}
          className="absolute -top-2 -right-2 p-1 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="p-6">
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 mb-4">
            <AlertTriangle className="w-6 h-6" />
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {message}
          </p>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel Import
            </button>
            <button
              onClick={onSkip}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Skip This Breed
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              Update Existing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportConfirmationModal;