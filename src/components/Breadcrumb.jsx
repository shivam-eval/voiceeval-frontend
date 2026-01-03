import { Link } from "react-router-dom";

const Breadcrumb = ({ items }) => {
    if (!items || items.length === 0) return null;

    return (
        <nav className="flex items-center space-x-2 text-sm mb-6">
            {items.map((item, index) => (
                <div key={index} className="flex items-center">
                    {index > 0 && (
                        <svg
                            className="w-4 h-4 mx-2 text-gray-600"
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
                    )}
                    {item.path && index < items.length - 1 ? (
                        <Link
                            to={item.path}
                            className="text-gray-400 hover:text-teal-400 transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className={index === items.length - 1 ? "text-white font-medium" : "text-gray-400"}>
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    );
};

export default Breadcrumb;
