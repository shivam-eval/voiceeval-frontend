/**
 * Reusable Card component.
 */

const Card = ({ children, className = "", hoverable = false, onClick }) => {
    return (
        <div
            className={`bg-gray-900 rounded-2xl p-6 border border-gray-800/50 ${hoverable ? "hover:border-teal-400/50 hover:shadow-lg transition-all cursor-pointer" : ""
                } ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default Card;
