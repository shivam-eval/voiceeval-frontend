import { useState, useRef, useEffect } from "react"

const GenericDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
}) => {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectedLabel =
    options.find((opt) => opt.value === value)?.label || placeholder

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-2
                   bg-dark-bg border border-gray-800 text-white rounded-md
                   text-sm hover:border-teal-500/50 transition-all duration-200"
      >
        <span className={`flex-1 text-left font-semibold whitespace-nowrap ${value ? "text-white" : "text-gray-500"}`}>
          {selectedLabel}
        </span>

        <svg
          className={`w-3.5 h-3.5 text-gray-500 ml-2 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1.5 min-w-full w-max bg-dark-panel
                        border border-gray-800 rounded-lg shadow-2xl overflow-hidden
                        animate-in fade-in zoom-in duration-200">
          <div className="py-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className={`w-full text-left px-4 py-3 text-sm whitespace-nowrap
                  transition-colors ${
                    value === opt.value
                      ? "text-teal-400 bg-teal-500/10 font-medium"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default GenericDropdown
