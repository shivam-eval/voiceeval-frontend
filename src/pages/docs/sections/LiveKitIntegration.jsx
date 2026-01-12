import { ExternalLink } from "lucide-react";

const LiveKitIntegrationSection = () => (
    <div className="prose prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-4 text-white">LiveKit / Pipecat Integration</h1>
        <p className="text-lg text-gray-400 mb-8">
            Integrate your LiveKit voice agent with VoiceEval using our Python SDK.
            This allows you to simulate, evaluate, and monitor your agent's performance.
        </p>

        {/* Installation */}
        <h2 className="text-2xl font-bold mt-12 mb-4 text-white">Installation</h2>
        <p className="text-gray-300 mb-4">Install the SDK using pip or uv:</p>
        <CodeBlock language="bash">
            {`pip install voiceeval-sdk
# or
uv add voiceeval-sdk`}
        </CodeBlock>

        {/* Initialization */}
        <h2 className="text-2xl font-bold mt-12 mb-4 text-white">Initialization</h2>
        <p className="text-gray-300 mb-4">
            Initialize the <code>Client</code> at your application entry point. This sets up the telemetry
            exporter and enables auto-instrumentation for supported LLM libraries.
        </p>
        <CodeBlock language="python">
            {`from voiceeval import Client

client = Client(
    api_key="your_api_key_here",
    project_name="my_livekit_agent"  # Required: identifies your project
)`}
        </CodeBlock>

        <div className="bg-dark-panel border border-gray-800/50 rounded-lg p-6 mt-6 mb-8">
            <p className="text-gray-300 mb-3"><strong>Environment Variables</strong></p>
            <p className="text-gray-400 text-sm mb-4">You can also provide configuration via environment variables:</p>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-300 ml-2 mb-4">
                <li><code className="text-teal-400">VOICE_EVAL_API_KEY</code>: Your API key.</li>
                <li><code className="text-teal-400">VOICE_EVAL_PROJECT_NAME</code>: Your project identifier.</li>
            </ul>
            <p className="text-gray-400 text-sm mb-2">If environment variables are set, you can initialize the client with minimal arguments:</p>
            <CodeBlock language="python">{`client = Client(project_name="my_livekit_agent")`}</CodeBlock>
        </div>


        {/* Auto-Instrumentation */}
        <h2 className="text-2xl font-bold mt-12 mb-4 text-white">Auto-Instrumentation</h2>
        <p className="text-gray-300 mb-4">
            The SDK automatically instruments the following libraries if they are installed in your environment:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-300 mb-6 ml-4">
            <li>OpenAI (<code>openai</code>)</li>
            <li>Anthropic (<code>anthropic</code>)</li>
            <li>Google Gemini (<code>google-generativeai</code>)</li>
        </ul>

        <p className="text-gray-300 mb-4">
            No additional code is required to trace calls to these libraries. Once the <code>Client</code> is initialized, all requests and responses will be captured.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-white">Example: OpenAI</h3>
        <CodeBlock language="python">
            {`from openai import OpenAI

# The client is already instrumented
client_openai = OpenAI()
response = client_openai.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Hello world"}]
)`}
        </CodeBlock>

        {/* Manual Tracing */}
        <h2 className="text-2xl font-bold mt-12 mb-4 text-white">Manual Tracing</h2>
        <p className="text-gray-300 mb-4">
            For functions that do not directly call LLMs but contain important logic (such as RAG retrieval or preprocessing), you can use the <code>@observe</code> decorator.
        </p>
        <p className="text-gray-300 mb-4">
            The <code>name_override</code> parameter accepts a string that can represent any method, task, or logical operation you want to track. Use descriptive names like <code>"document_retrieval"</code>, <code>"preprocessing"</code>, or <code>"context_building"</code> to identify different stages in your pipeline.
        </p>
        <CodeBlock language="python">
            {`from voiceeval import observe

@observe(name_override="document_retrieval")  # Descriptive name for this operation
def retrieve_documents(query: str):
    # Logic to retrieve documents
    return ["doc1", "doc2"]

@observe(name_override="context_building")
def build_context(docs: list):
    # Process and combine documents into context
    return " ".join(docs)`}
        </CodeBlock>

        {/* Configuration Reference */}
        <h2 className="text-2xl font-bold mt-12 mb-4 text-white">Configuration Reference</h2>
        <div className="bg-dark-panel border border-gray-800/50 rounded-lg p-6">
            <p className="text-gray-300 mb-4">The <code>Client</code> accepts the following arguments:</p>
            <ul className="space-y-3 text-gray-300 text-sm">
                <li className="flex gap-2">
                    <span className="font-mono text-[#b61249]">api_key</span>
                    <span className="text-gray-500">(str)</span>:
                    <span>Authentication key for the VoiceEval service.</span>
                </li>
                <li className="flex gap-2">
                    <span className="font-mono text-[#b61249]">project_name</span>
                    <span className="text-gray-500">(str, required)</span>:
                    <span>Project identifier for grouping traces. This is mandatory.</span>
                </li>
            </ul>
        </div>
    </div>
);

const CodeBlock = ({ language, children }) => (
    <div className="bg-dark-input border border-gray-800/50 rounded-lg overflow-hidden my-4 group">
        <div className="flex items-center justify-between px-4 py-2 bg-dark-panel border-b border-gray-800/50">
            <span className="text-xs text-gray-500 font-mono">{language}</span>
            <button
                className="text-xs text-gray-400 hover:text-[#b61249] transition-colors"
                onClick={() => navigator.clipboard.writeText(children.trim())}
            >
                Copy
            </button>
        </div>
        <pre className="p-4 overflow-x-auto">
            <code className="text-sm text-gray-300 font-mono whitespace-pre">{children.trim()}</code>
        </pre>
    </div>
);

export default LiveKitIntegrationSection;
