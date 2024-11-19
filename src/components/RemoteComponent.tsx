import React, { Suspense } from 'react';
import LoadingSpinner from './common/LoadingSpinner';

// Import the remote component
const RemoteButton = React.lazy(() => import('remote-app/Button'));

interface RemoteComponentProps {
  text?: string;
  onClick?: () => void;
}

const RemoteComponent: React.FC<RemoteComponentProps> = ({ text = 'Click Me', onClick }) => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RemoteButton text={text} onClick={onClick} />
    </Suspense>
  );
};

export default RemoteComponent;