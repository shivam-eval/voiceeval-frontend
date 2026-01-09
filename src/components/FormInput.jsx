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
  ...props
}) => {
  return (
    <div>
      <label className="block text-white text-xs font-medium mb-1.5 ml-1">
        {label}
      </label>

      <div className="relative">
        <input
          {...props}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-2 bg-dark-input border rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none transition-all duration-300 ${
            focused || value
              ? "border-teal-400 shadow-sm shadow-teal-400/20"
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
