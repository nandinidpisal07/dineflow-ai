import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div className={`p-5 rounded-2xl bg-rose-50 border border-rose-100 flex flex-col items-center text-center ${className}`}>
      <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl mb-2">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <h5 className="text-sm font-semibold text-rose-900">{title}</h5>
      <p className="text-xs text-rose-700 mt-1 mb-3">{message}</p>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
