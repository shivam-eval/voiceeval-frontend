import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
    currentPage,
    totalItems,
    itemsPerPage,
    onPageChange,
    itemName = 'items'
}) => {
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const displayedCount = Math.min(totalItems, itemsPerPage);

    if (totalItems === 0) return null;

    return (
        <div className="mt-8 flex items-center justify-between">
            <p className="text-gray-500 text-sm">
                Showing {displayedCount} of {totalItems} {totalItems === 1 ? itemName.slice(0, -1) : itemName}
            </p>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 bg-dark-panel border border-gray-800 rounded hover:bg-gray-800 transition-colors text-gray-400 disabled:opacity-30"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 text-sm text-gray-400">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="p-2 bg-dark-panel border border-gray-800 rounded hover:bg-gray-800 transition-colors text-gray-400 disabled:opacity-30"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
