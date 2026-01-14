/**
 * Reusable Table component with sorting, pagination, and actions.
 */
import { useState } from "react";

const Table = ({
    columns,
    data,
    onRowClick,
    selectable = false,
    selectedRows = [],
    onSelectionChange,
    actions,
    emptyMessage = "No data available",
    loading = false,
    primaryKey = "id", // Default to 'id' but allow override
}) => {
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc");

    const handleSort = (columnKey) => {
        if (sortColumn === columnKey) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(columnKey);
            setSortDirection("asc");
        }
    };

    const sortedData = [...data].sort((a, b) => {
        if (!sortColumn) return 0;

        const aVal = a[sortColumn];
        const bVal = b[sortColumn];

        if (aVal === bVal) return 0;

        const comparison = aVal > bVal ? 1 : -1;
        return sortDirection === "asc" ? comparison : -comparison;
    });

    const handleSelectAll = () => {
        if (selectedRows.length === data.length) {
            onSelectionChange([]);
        } else {
            onSelectionChange(data.map((row) => row[primaryKey] || row.id || row._id));
        }
    };

    const handleSelectRow = (rowId) => {
        if (selectedRows.includes(rowId)) {
            onSelectionChange(selectedRows.filter((id) => id !== rowId));
        } else {
            onSelectionChange([...selectedRows, rowId]);
        }
    };

    if (loading) {
        return (
            <div className="p-12">
                <div className="text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                        Loading...
                    </div>
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-gray-800/30 rounded-full border border-gray-700/50">
                        <div className="w-8 h-8 text-gray-500 flex items-center justify-center">?</div>
                    </div>
                    <p className="text-gray-400 text-lg font-medium">{emptyMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-900/50 text-gray-400 text-xs font-semibold border-b border-gray-800/50">
                        {selectable && (
                            <th className="px-4 py-3 w-12">
                                <input
                                    type="checkbox"
                                    checked={data.length > 0 && selectedRows.length === data.length}
                                    onChange={handleSelectAll}
                                    className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-teal-500 focus:ring-teal-500 focus:ring-offset-gray-900"
                                />
                            </th>
                        )}
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${column.sortable ? "cursor-pointer hover:text-white transition-colors" : ""
                                    }`}
                                onClick={() => column.sortable && handleSort(column.key)}
                            >
                                <div className="flex items-center gap-2">
                                    {column.label}
                                    {column.sortable && sortColumn === column.key && (
                                        <span className="text-teal-500">
                                            {sortDirection === "asc" ? "↑" : "↓"}
                                        </span>
                                    )}
                                </div>
                            </th>
                        ))}
                        {actions && <th className="px-4 py-3 text-center">Actions</th>}
                    </tr>
                </thead>
                <tbody className="text-sm text-gray-300">
                    {sortedData.map((row, index) => {
                        const rowId = row[primaryKey] || row.id || row._id;
                        return (
                            <tr
                                key={rowId || index}
                                onClick={() => onRowClick && onRowClick(row)}
                                className={`border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors group ${onRowClick ? "cursor-pointer" : ""
                                    }`}
                            >
                                {selectable && (
                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.includes(rowId)}
                                            onChange={() => handleSelectRow(rowId)}
                                            className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-teal-500 focus:ring-teal-500 focus:ring-offset-gray-900"
                                        />
                                    </td>
                                )}
                                {columns.map((column) => (
                                    <td key={column.key} className="px-4 py-3">
                                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                                    </td>
                                ))}
                                {actions && (
                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                        {actions(row)}
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
