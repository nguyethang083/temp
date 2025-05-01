import React from "react";

export const LoadingScreen = ({ message = "Loading..." }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-white">
    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    <p className="mt-4 text-lg font-medium text-gray-700">{message}</p>
  </div>
);
