import { useState, useRef, useEffect } from "react"

const REGIONS = [
  { label: "India", value: "apac_india" },
  { label: "Europe (EU)", value: "eu" },
  { label: "North America", value: "north-america" },
  { label: "Default", value: "" }
]

const RegionDropdown = ({ value, onChange, customValue, onCustomChange }) => {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown on outside click
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
    REGIONS.find((r) => r.value === value)?.label || "Select a region"

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg text-sm hover:border-teal-400 transition-colors"
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

      {/* Dropdown (FORCED DOWNWARD) */}
      {open && (
        <div className="absolute z-50 mt-2 w-full bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
          {REGIONS.map((region) => (
            <button
              key={region.value}
              onClick={() => {
                onChange(region.value)
                setOpen(false)
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-800 transition-colors ${
                value === region.value
                  ? "text-teal-400 bg-gray-800"
                  : "text-white"
              }`}
            >
              {region.label}
            </button>
          ))}
        </div>
      )}

      {/* Other input */}
      {value === "other" && (
        <input
          type="text"
          value={customValue}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder="Enter your region"
          className="mt-3 w-full px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
      )}
    </div>
  )
}

export default RegionDropdown
