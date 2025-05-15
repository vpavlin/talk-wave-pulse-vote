
import React from "react";

const LoadingState = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950">
      <div className="text-center">
        <div className="animate-pulse mx-auto h-12 w-12 rounded-full bg-accent mb-4"></div>
        <p className="text-xl font-medium text-gray-600 dark:text-gray-300">Loading event details...</p>
      </div>
    </div>
  );
};

export default LoadingState;
