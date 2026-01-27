/**
 * Reusable Button component.
 */

const Button = ({
    children,
    variant = "primary",
    size = "md",
    disabled = false,
    loading = false,
    onClick,
    type = "button",
    className = "",
    icon,
}) => {
    const variants = {
        primary: "bg-teal-400 hover:bg-teal-500 text-white disabled:bg-teal-400/50",
        secondary: "bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:bg-gray-800/50",
        danger: "bg-red-500 hover:bg-red-600 text-white disabled:bg-red-500/50",
        outline: "bg-transparent border border-gray-700 hover:border-gray-600 text-gray-300 disabled:border-gray-700/50",
        premium: "bg-teal-500/10 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.1)]",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`rounded-lg font-semibold transition-colors flex items-center gap-2 justify-center disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {loading ? (
                <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Loading...
                </>
            ) : (
                <>
                    {icon && icon}
                    {children}
                </>
            )}
        </button>
    );
};

export default Button;
