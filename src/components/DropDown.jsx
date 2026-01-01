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
                   bg-gray-900 border border-gray-700 text-white rounded-lg
                   text-sm hover:border-teal-400 transition-colors"
      >
        <span className={value ? "text-white" : "text-gray-400"}>
          {selectedLabel}
        </span>

        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${
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
        <div className="absolute z-50 mt-2 w-full bg-gray-900
                        border border-gray-700 rounded-lg shadow-xl overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
              className={`w-full text-left px-4 py-2 text-sm
                hover:bg-gray-800 transition-colors ${
                  value === opt.value
                    ? "text-teal-400 bg-gray-800"
                    : "text-white"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default GenericDropdown
