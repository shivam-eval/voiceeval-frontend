import { toast } from "react-toastify";
import { Copy } from "lucide-react";

const SystemPromptViewer = ({ prompt }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    toast.success("System prompt copied to clipboard");
  };

  return (
    <div className="bg-dark-input rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h5 className="text-base font-semibold text-white mb-2">System Prompt</h5>
          <p className="text-gray-400 text-sm">
            This is the prompt that guides your Voice Agent's behavior and responses.
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="text-sm text-teal-400 hover:text-teal-300 flex items-center gap-2 transition-colors"
        >
          <Copy className="w-4 h-4" />
          Copy
        </button>
      </div>
      <div className="bg-dark-bg rounded-lg p-4 border border-gray-800">
        <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
          {prompt}
        </pre>
      </div>
    </div>
  )
}

export default SystemPromptViewer

