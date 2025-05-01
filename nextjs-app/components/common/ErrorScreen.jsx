import React from "react";

export const ErrorScreen = ({ error, onRetry }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-md">
      <p className="font-bold">Error</p>
      <p>{error || "An unknown error occurred."}</p>
    </div>
    {onRetry && (
      <button
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        onClick={onRetry}
      >
        Try Again
      </button>
    )}
  </div>
);
