import React from 'react';
import { AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

interface ImportProgressProps {
  loading: boolean;
  error: string | null;
  importStatus: string | null;
  importProgress: number;
  showSuccess: boolean;
}

const ImportProgress: React.FC<ImportProgressProps> = ({
  loading,
  error,
  importStatus,
  importProgress,
  showSuccess
}) => {
  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded relative">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <pre className="whitespace-pre-wrap font-mono text-sm">{error}</pre>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="bg-green-100 dark:bg-green-900/20 border border-green-400 text-green-700 dark:text-green-400 px-4 py-3 rounded relative">
          Import completed successfully
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          {importStatus && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{importStatus}</p>
          )}
          {importProgress > 0 && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${importProgress}%` }}
              />
            </div>
          )}
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

export default ImportProgress;