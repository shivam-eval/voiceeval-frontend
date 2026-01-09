import { BookOpen, Loader2 } from "lucide-react";
import { useIsMutating } from "@tanstack/react-query";

const TopBar = () => {
    const isMutating = useIsMutating();

    const handleDocumentation = () => {
        // TODO: Add link to documentation when available
        window.open('https://docs.voiceeval.com', '_blank');
    };

    return (
        <div className="fixed top-4 right-10 z-[5] flex items-center gap-4">
            {isMutating > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/30 rounded-lg text-teal-400 shadow-lg animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-bold">Processing...</span>
                </div>
            )}
            
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
