interface LoadingSpinnerProps {
  message?: string;
  size?: "small" | "medium" | "large";
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Loading...", 
  size = "medium" 
}) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12"
  };

  const textSizes = {
    small: "text-sm",
    medium: "text-lg",
    large: "text-xl"
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className={`flex items-center gap-3 ${textSizes[size]} font-medium text-gray-600`}>
        <div className={`${sizeClasses[size]} border-4 border-blue-600 border-t-transparent rounded-full animate-spin`}></div>
        {message}
      </div>
    </div>
  );
};

// components/ErrorDisplay.tsx
import React from "react";

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  retryText?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onRetry, 
  retryText = "Try Again" 
}) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center p-8 max-w-md">
        <div className="text-red-600 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
        <p className="text-gray-700 mb-6">{error}</p>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            {retryText}
          </button>
        )}
      </div>
    </div>
  );
};

// components/EmptyState.tsx
interface EmptyStateProps {
  message?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  message = "No trucks found", 
  description = "There are currently no trucks online.",
  action 
}) => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="text-6xl mb-4">🚛</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">{message}</h3>
        <p className="text-gray-500 mb-4">{description}</p>
        
        {action && (
          <button
            onClick={action.onClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};