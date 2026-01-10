import { BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TopBar = () => {
    const navigate = useNavigate();

    const handleDocumentation = () => {
        navigate('/docs');
    };

    return (
        <div className="fixed top-4 right-10 z-[5]">
            <button
                onClick={handleDocumentation}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900/95 backdrop-blur-sm border border-gray-800 rounded-lg text-gray-300 hover:text-teal-400 hover:border-teal-400/50 transition-all group shadow-lg"
            >
                <BookOpen className="w-5 h-5" />
                <span className="text-sm font-medium">Documentation</span>
            </button>
        </div>
    );
};

export default TopBar;
