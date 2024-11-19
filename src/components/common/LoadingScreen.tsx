import React from 'react';
import { Dog } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center z-50">
      <div className="animate-bounce mb-4">
        <Dog className="w-12 h-12 text-blue-600" />
      </div>
      <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
        Loading PawfectFind Admin...
      </div>
      <div className="mt-4 w-32 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 animate-loading-bar" />
      </div>
    </div>
  );
};

export default LoadingScreen;