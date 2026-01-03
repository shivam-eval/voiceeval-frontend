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
            onSelectionChange(data.map((row) => row.id || row._id));
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
            <div className="bg-gray-900 rounded-2xl p-12 border border-gray-800/50">
                <div className="text-center text-gray-400">
                    <div className="animate-spin w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                    Loading...
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="bg-gray-900 rounded-2xl p-12 border border-gray-800/50">
                <div className="text-center text-gray-400">{emptyMessage}</div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 rounded-2xl border border-gray-800/50 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-800 border-b border-gray-700">
                        <tr>
                            {selectable && (
                                <th className="px-4 py-3 text-left w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.length === data.length}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-teal-400 focus:ring-teal-400"
                                    />
                                </th>
                            )}
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider ${column.sortable ? "cursor-pointer hover:text-white" : ""
                                        }`}
                                    onClick={() => column.sortable && handleSort(column.key)}
                                >
                                    <div className="flex items-center gap-2">
                                        {column.label}
                                        {column.sortable && sortColumn === column.key && (
                                            <span className="text-teal-400">
                                                {sortDirection === "asc" ? "↑" : "↓"}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                            {actions && <th className="px-4 py-3 text-right w-24">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((row, rowIndex) => {
                            const rowId = row.id || row._id;
                            const isSelected = selectedRows.includes(rowId);

                            return (
                                <tr
                                    key={rowId || rowIndex}
                                    className={`border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${isSelected ? "bg-teal-400/10" : rowIndex % 2 === 0 ? "bg-gray-900/50" : "bg-gray-900"
                                        } ${onRowClick ? "cursor-pointer" : ""}`}
                                    onClick={() => onRowClick && onRowClick(row)}
                                >
                                    {selectable && (
                                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleSelectRow(rowId)}
                                                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-teal-400 focus:ring-teal-400"
                                            />
                                        </td>
                                    )}
                                    {columns.map((column) => (
                                        <td key={column.key} className="px-4 py-3 text-sm text-gray-300">
                                            {column.render ? column.render(row[column.key], row) : row[column.key]}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                {actions(row)}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Table;
