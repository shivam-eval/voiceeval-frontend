import React from 'react';

const LoadingSkeleton = ({ message = "Loading..." }) => {
    return (
        <div className="flex flex-col gap-6 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between pr-48">
                <div>
                    <div className="h-9 w-96 bg-gray-800 rounded mb-2"></div>
                </div>
                <div className="h-10 w-32 bg-gray-800 rounded"></div>
            </div>

            {/* Summary Cards Skeleton */}
            <div className="grid grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-dark-panel border border-gray-800/50 rounded-xl p-5">
                        <div className="h-4 w-24 bg-gray-800 rounded mb-3"></div>
                        <div className="h-8 w-16 bg-gray-700 rounded"></div>
                    </div>
                ))}
            </div>

            {/* Tabs Skeleton */}
            <div className="h-12 bg-dark-panel border border-gray-800/50 rounded-xl"></div>

            {/* Content Skeleton */}
            <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-6">
                <div className="h-6 w-48 bg-gray-800 rounded mb-6"></div>
                <div className="space-y-4">
                    <div className="h-4 w-full bg-gray-800 rounded"></div>
                    <div className="h-4 w-5/6 bg-gray-800 rounded"></div>
                    <div className="h-4 w-4/6 bg-gray-800 rounded"></div>
                </div>
            </div>

            {/* Loading Message */}
            <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-400 text-sm">{message}</span>
                </div>
            </div>
        </div>
    );
};

export default LoadingSkeleton;
