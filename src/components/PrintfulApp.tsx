import React, { Suspense, useState, useEffect } from 'react';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';
import { AlertTriangle } from 'lucide-react';

interface PrintfulAppProps {
  className?: string;
}

const PrintfulRemoteError: React.FC<{ error?: string }> = ({ error }) => (
  <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
    <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
      <AlertTriangle className="w-5 h-5" />
      <h3 className="font-medium">Printful Integration Unavailable</h3>
    </div>
    <p className="mt-2 text-sm text-amber-500 dark:text-amber-300">
      {error || 'Unable to load Printful integration. Please try again later or contact support if the issue persists.'}
    </p>
  </div>
);

const PrintfulApp: React.FC<PrintfulAppProps> = ({ className }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [PrintfulRemoteApp, setPrintfulRemoteApp] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const loadPrintfulModule = async () => {
      try {
        timeoutId = setTimeout(() => {
          if (mounted) {
            setError('Connection timeout: Unable to reach Printful services');
            setIsLoading(false);
          }
        }, 10000);

        // Initialize federation
        const federationInit = await import('printful/PrintfulImport').then(module => {
          if ('init' in module) {
            return (module as any).init({
              react: { singleton: true },
              'react-dom': { singleton: true }
            });
          }
          return Promise.resolve();
        });

        // Load the actual component
        const PrintfulModule = await import('printful/PrintfulImport');
        
        if (mounted) {
          clearTimeout(timeoutId);
          setError(null);
          setIsLoading(false);
          setPrintfulRemoteApp(() => (PrintfulModule as any).default);
        }
      } catch (err) {
        console.error('Failed to load Printful module:', err);
        if (mounted) {
          setError('Failed to connect to Printful services. Please check your connection and try again.');
          setIsLoading(false);
        }
      }
    };

    loadPrintfulModule();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  if (error) {
    return <PrintfulRemoteError error={error} />;
  }

  if (isLoading || !PrintfulRemoteApp) {
    return <LoadingSpinner />;
  }

  return (
    <div className={className}>
      <ErrorBoundary fallback={<PrintfulRemoteError />}>
        <Suspense fallback={<LoadingSpinner />}>
          <PrintfulRemoteApp />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default PrintfulApp;