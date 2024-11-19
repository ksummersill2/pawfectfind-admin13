import React, { Suspense } from 'react';
import { PrintfulApp } from '../../components';
import ErrorBoundary from '../../components/ErrorBoundary';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PrintfulIntegration: React.FC = () => {
  console.log('Rendering PrintfulIntegration component...');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Printful Integration
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden p-6">
        <ErrorBoundary>
          <Suspense
            fallback={
              <>
                {console.log('Loading fallback triggered: LoadingSpinner')}
                <LoadingSpinner />
              </>
            }
          >
            {(() => {
              console.log('Loading PrintfulApp component...');
              return <PrintfulApp className="w-full min-h-[800px]" />;
            })()}
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default PrintfulIntegration;
