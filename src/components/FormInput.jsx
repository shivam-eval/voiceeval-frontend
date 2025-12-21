const FormInput = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  focused,
  onFocus,
  onBlur,
}) => {
  return (
    <div>
      <label className="block text-white text-base font-medium mb-3">
        {label}
      </label>

      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-5 py-4 bg-dark-input border rounded-xl text-white text-base placeholder-gray-500 focus:outline-none transition-all duration-300 ${
            focused || value
              ? "border-teal-400 shadow-lg shadow-teal-400/30"
              : "border-gray-700 hover:border-gray-600"
          }`}
        />

        {(focused || value) && (
          <div className="absolute inset-0 rounded-xl bg-teal-400 opacity-10 blur-xl -z-10 animate-glow" />
        )}
      </div>
    </div>
  )
}

export default FormInput
