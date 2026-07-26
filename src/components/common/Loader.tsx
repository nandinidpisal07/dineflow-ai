import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  label?: string;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({ label = 'Loading...', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-slate-500 ${className}`}>
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
      <p className="text-xs font-medium text-slate-600">{label}</p>
    </div>
  );
};
