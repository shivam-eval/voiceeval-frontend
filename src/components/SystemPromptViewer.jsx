const SystemPromptViewer = ({ prompt }) => {
  return (
    <div className="bg-dark-input rounded-xl p-6 border border-gray-700">
      <div className="mb-4">
        <h5 className="text-base font-semibold text-white mb-2">System Prompt</h5>
        <p className="text-gray-400 text-sm">
          This is the prompt that guides your Voice Agent's behavior and responses.
        </p>
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

