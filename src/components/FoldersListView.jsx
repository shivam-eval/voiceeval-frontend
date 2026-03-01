import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Folder } from 'lucide-react';
import { useFolders } from '../hooks/useFolders';

/**
 * FoldersListView - Shows simulation run folders (batches) for a selected agent
 */
const FoldersListView = ({
  agentId,
  onFolderSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch folders filtered by agent_id
  const { data: foldersData, isLoading } = useFolders({
    agentId,
    skip: (page - 1) * itemsPerPage,
    limit: itemsPerPage,
  });

  const folders = useMemo(() => {
    return foldersData?.folders || [];
  }, [foldersData]);

  const totalCount = foldersData?.total || 0;

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handleRowClick = (folder) => {
    if (onFolderSelect) {
      onFolderSelect(folder.folder_id, folder.folder_name);
    }
  };

  // Reset pagination when search changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // Filter folders by search term (client-side for now)
  const filteredFolders = folders.filter(f =>
    f.folder_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search simulations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-panel border border-gray-800 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-teal-500 text-white"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-dark-panel rounded-xl overflow-hidden border border-gray-800/50 shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/50 text-gray-400 text-xs font-semibold border-b border-gray-800/50">
                <th className="px-4 py-3">Simulation</th>
                <th className="px-4 py-3 text-center">Created</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-300">
              {isLoading ? (
                <tr>
                  <td colSpan="2" className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                      Loading folders...
                    </div>
                  </td>
                </tr>
              ) : filteredFolders.length === 0 ? (
                <tr>
                  <td colSpan="2" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-gray-800/30 rounded-full border border-gray-700/50">
                        <Folder className="w-8 h-8 text-gray-500" />
                      </div>
                      <p className="text-gray-400 text-lg font-medium">No simulations found</p>
                      <p className="text-gray-500 text-sm">
                        {searchTerm ? 'Try adjusting your search' : 'Run a simulation to see it here'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredFolders.map(folder => (
                  <tr
                    key={folder.folder_id}
                    className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors cursor-pointer group"
                    onClick={() => handleRowClick(folder)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-teal-500/5 rounded border border-teal-500/10 group-hover:border-teal-500/30 transition-colors">
                          <Folder className="w-4 h-4 text-teal-400" />
                        </div>
                        <span className="text-white font-semibold text-sm">
                          {folder.folder_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-400 text-sm">
                      {folder.created_at ? new Date(folder.created_at).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => handlePageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Prev
          </button>
          {pageNumbers.map(num => (
            <button
              key={num}
              onClick={() => handlePageChange(num)}
              className={`px-3 py-2 rounded text-sm ${
                page === num
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default FoldersListView;
