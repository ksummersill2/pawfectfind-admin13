import React from 'react';
import { Dog } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="animate-bounce mb-4">
        <Dog className={`${sizeClasses[size]} text-blue-600`} />
      </div>
      <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">
        Loading...
      </div>
    </div>
  );
};

export default LoadingSpinner;