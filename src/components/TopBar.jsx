import { BookOpen, Loader2, ArrowLeft } from "lucide-react";
import { useIsMutating } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";

const TopBar = ({ showBackButton = false, onBack = null }) => {
    const isMutating = useIsMutating();
    const location = useLocation();

    // Only show back button when context requests it AND we're on a report view
    const isReportPath = /\/evaluations\/(report|session|report-legacy)/.test(location.pathname);
    const showButton = !!(showBackButton && onBack && isReportPath);

    return (
        <div className="flex items-center justify-between mb-4 mx-8">
            {showButton ? (
                <button
                    onClick={onBack}
                    className="px-4 py-2 bg-dark-input hover:bg-dark-input/80 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Results
                </button>
            ) : (
                <div></div>
            )}
            
            <div className="flex items-center gap-4">
                {isMutating > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/30 rounded-lg text-teal-400 shadow-lg animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm font-bold">Processing...</span>
                    </div>
                )}

                <Link
                    to="/docs"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900/95 backdrop-blur-sm border border-gray-800 rounded-lg text-gray-300 hover:text-teal-400 hover:border-teal-400/50 transition-all group shadow-lg"
                >
                    <BookOpen className="w-5 h-5" />
                    <span className="text-sm font-medium">Documentation</span>
                </Link>
            </div>
        </div>
    );
};

export default TopBar;