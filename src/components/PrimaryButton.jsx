const PrimaryButton = ({
  text = "Connect Agent",
  loading = false,
  disabled = false,
  onClick,
  type = "button",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full px-6 py-4 rounded-xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2 ${
        !disabled && !loading
          ? "bg-teal-400 hover:bg-teal-500 text-white shadow-lg shadow-teal-400/50 animate-glow hover:scale-105"
          : "bg-gray-700 text-gray-400 cursor-not-allowed"
      }`}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {text}
        </>
      ) : (
        <>
          <span>{text}</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </>
      )}
    </button>
  );
};

export default PrimaryButton;
