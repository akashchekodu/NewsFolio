// components/SkeletonCard.js
import React from "react";

const SkeletonCard = () => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg animate-pulse">
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6 mb-6"></div>
      <div className="flex justify-between mt-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
