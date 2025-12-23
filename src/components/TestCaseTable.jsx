const GenericTable = ({
  title,
  columns,   // [{ key, label, render? }]
  data,      // array of row objects
  className = "col-span-2"
}) => {
  return (
    <div className={`${className} bg-dark-panel rounded-xl p-6 border border-gray-800/50`}>
      {title && (
        <h2 className="text-xl font-semibold text-white mb-4">
          {title}
        </h2>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead>
            <tr className="border-b border-gray-800">
              {columns.map(col => (
                <th
                  key={col.key}
                  className="text-left text-gray-400 text-sm font-medium pb-3"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={row.id ?? rowIndex}
                className="border-b border-gray-800/50 hover:bg-dark-input/50 transition-colors"
              >
                {columns.map(col => (
                  <td key={col.key} className="py-3 text-sm">
                    {col.render
                      ? col.render(row[col.key], row)
                      : (
                        <span className="text-gray-300">
                          {row[col.key]}
                        </span>
                      )
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default GenericTable
