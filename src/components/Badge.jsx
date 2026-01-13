/**
 * Reusable Badge component for status indicators.
 */

const Badge = ({ children, variant = "default", size = "md" }) => {
    const variants = {
        default: "bg-gray-500/20 text-gray-400 border-gray-500/30",
        success: "bg-green-500/20 text-green-400 border-green-500/30",
        warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        error: "bg-red-500/20 text-red-400 border-red-500/30",
        danger: "bg-red-500/20 text-red-400 border-red-500/30",
        info: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        primary: "bg-teal-500/20 text-teal-400 border-teal-500/30",
    };

    const sizes = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-3 py-1 text-sm",
        lg: "px-4 py-1.5 text-base",
    };

    return (
        <span
            className={`inline-flex items-center rounded-full border font-medium ${variants[variant]} ${sizes[size]}`}
        >
            {children}
        </span>
    );
};

export default Badge;
