import { AlertCircle, CheckCircle, Copy, ExternalLink, Download, Upload } from "lucide-react";

const ElevenLabsIntegrationSection = () => (
  <div className="prose prose-invert max-w-none">
    <h1 className="text-4xl font-bold mb-4">ElevenLabs Integration</h1>
    <p className="text-lg text-gray-400 mb-8">
      Monitor and test your ElevenLabs-based voice agents with comprehensive observability and testing capabilities.
    </p>

    {/* Overview */}
    <div className="bg-gradient-to-br from-orange-900/20 to-purple-900/20 border border-orange-500/30 rounded-xl p-6 mb-8">
      <h2 className="text-xl font-semibold mb-3 text-orange-300">Overview</h2>
      <p className="text-gray-300 mb-4">
        This guide walks you through setting up and monitoring your ElevenLabs-based voice agents using VoiceEval's observability suite. Learn how to configure your integration, extract agent configurations, and access powerful monitoring tools.
      </p>
      <a 
        href="https://elevenlabs.io/docs" 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 text-sm"
      >
        View ElevenLabs Documentation
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>

    {/* Prerequisites */}
    <h2 className="text-2xl font-bold mt-12 mb-4">Prerequisites</h2>
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-8">
      <ul className="space-y-3 text-gray-300">
        <li className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <span>Active ElevenLabs account with Conversational AI access</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <span>ElevenLabs API key from your dashboard</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <span>Agent ID for the conversational agent you want to test</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <span>VoiceEval account with API access</span>
        </li>
      </ul>
    </div>

    {/* Setup Guide */}
    <h2 className="text-2xl font-bold mt-12 mb-6">Setup Guide</h2>

    <div className="space-y-8">
      {/* Step 1 */}
      <SetupStep
        number="1"
        title="Configure Webhook URL"
        description="Set up the observability webhook in your ElevenLabs dashboard"
      >
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            1. Log in to your <a href="https://elevenlabs.io/app" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">ElevenLabs Dashboard</a>
          </p>
          <p className="text-gray-400 text-sm">
            2. Navigate to your agent settings
          </p>
          <p className="text-gray-400 text-sm">
            3. Configure the observability webhook URL:
          </p>
          
          <CodeBlock language="text">
{`https://api.voiceeval.ai/observability/v1/elevenlabs/observe/`}
          </CodeBlock>

          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-200">
              <strong>Note:</strong> This webhook will automatically send conversation data to VoiceEval for analysis and testing.
            </div>
          </div>
        </div>
      </SetupStep>

      {/* Step 2 */}
      <SetupStep
        number="2"
        title="Get API Key and Agent ID"
        description="Retrieve your credentials from the ElevenLabs dashboard"
      >
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            <strong>API Key:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400 ml-4">
            <li>Go to <strong>Settings → API Keys</strong></li>
            <li>Copy your API key or create a new one</li>
            <li>Ensure the key has access to Conversational AI features</li>
          </ol>

          <p className="text-gray-400 text-sm mt-6">
            <strong>Agent ID:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400 ml-4">
            <li>Navigate to <strong>Conversational AI → Agents</strong></li>
            <li>Select your agent</li>
            <li>Copy the Agent ID from the dashboard or URL</li>
          </ol>
        </div>
      </SetupStep>

      {/* Step 3 */}
      <SetupStep
        number="3"
        title="Connect in VoiceEval"
        description="Add your ElevenLabs credentials to VoiceEval"
      >
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            1. Navigate to <strong>Connect Agent</strong> in VoiceEval
          </p>
          <p className="text-gray-400 text-sm">
            2. Select <strong>ElevenLabs</strong> as your platform
          </p>
          <p className="text-gray-400 text-sm">
            3. Enter your credentials:
          </p>
          
          <div className="bg-gray-950 border border-gray-800 rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">ElevenLabs API Key</label>
              <input 
                type="password" 
                placeholder="Your ElevenLabs API key" 
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-300"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Agent ID</label>
              <input 
                type="text" 
                placeholder="agent_..." 
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-300"
                disabled
              />
            </div>
            <button className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition-colors">
              Connect Agent
            </button>
          </div>
        </div>
      </SetupStep>

      {/* Step 4 */}
      <SetupStep
        number="4"
        title="Test Integration"
        description="Verify the connection by making a test call"
      >
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            Make a test call from ElevenLabs (phone number based or web call). Your calls should now appear in VoiceEval's observability dashboard.
          </p>

          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-200">
              <strong>Success!</strong> Your ElevenLabs agent is now connected and monitored by VoiceEval.
            </div>
          </div>
        </div>
      </SetupStep>
    </div>

    {/* Extracting Agent Configuration */}
    <h2 className="text-2xl font-bold mt-12 mb-6">Extracting Agent Configuration</h2>
    <p className="text-gray-400 mb-6">
      VoiceEval can extract complete agent descriptions from ElevenLabs, including system prompts, workflow nodes, and transfer conditions.
    </p>

    <h3 className="text-xl font-semibold mb-4">Using the Extraction Script</h3>
    <p className="text-gray-400 text-sm mb-4">
      Run this Python script to extract your agent's complete configuration:
    </p>

    <CodeBlock language="bash">
{`python extract_elevenlabs_agent.py <AGENT_ID> <ELEVENLABS_API_KEY>`}
    </CodeBlock>

    <h3 className="text-xl font-semibold mt-8 mb-4">Extraction Script</h3>
    <CodeBlock language="python">
{`import requests
import json
import argparse

def get_agent_description(agent_id: str, api_key: str):
    api_url = f"https://api.elevenlabs.io/v1/convai/agents/{agent_id}"
    headers = {
        "Content-Type": "application/json",
        "xi-api-key": api_key
    }
    
    try:
        print(f"Fetching data for agent ID: {agent_id}...")
        response = requests.get(api_url, headers=headers)
        response.raise_for_status()
        data = response.json()
        print("Successfully fetched data.")
    except requests.exceptions.RequestException as e:
        print(f"Error: Failed to fetch data from API. {e}")
        return None
    
    agent_description = []
    
    # Extract system prompt
    try:
        system_prompt = data['conversation_config']['agent']['prompt']['prompt']
        agent_description.append({
            "node name": "system",
            "node prompt": system_prompt
        })
    except KeyError:
        print("Warning: Could not find the main system prompt.")
        agent_description.append({
            "node name": "system",
            "node prompt": "Prompt not found in API response."
        })
    
    # Extract workflow nodes
    workflow = data.get('workflow', {})
    if not workflow:
        print("No workflow found for this agent.")
        return agent_description
    
    nodes = workflow.get('nodes', {})
    edges = workflow.get('edges', {})
    
    for node_id, node_data in nodes.items():
        if node_data.get('type') == 'start':
            continue
        
        node_name = node_data.get('label', 'Unnamed Node')
        node_prompt = node_data.get('additional_prompt', '')
        transfer_conditions = []
        
        if edges:
            for edge_data in edges.values():
                if edge_data.get('target') == node_id:
                    fwd_cond = edge_data.get('forward_condition')
                    if fwd_cond and fwd_cond.get('type') != 'unconditional':
                        condition_text = fwd_cond.get('condition') or fwd_cond.get('label')
                        if condition_text:
                            transfer_conditions.append(condition_text)
                    
                    bwd_cond = edge_data.get('backward_condition')
                    if bwd_cond:
                        condition_text = bwd_cond.get('condition') or bwd_cond.get('label')
                        if condition_text:
                            transfer_conditions.append(condition_text)
        
        agent_description.append({
            "node name": node_name,
            "node prompt": node_prompt,
            "transfer conditions": transfer_conditions
        })
    
    return agent_description

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract ElevenLabs agent configuration")
    parser.add_argument("agent_id", type=str, help="The ElevenLabs agent ID")
    parser.add_argument("api_key", type=str, help="Your ElevenLabs API key")
    
    args = parser.parse_args()
    
    description = get_agent_description(args.agent_id, args.api_key)
    
    if description:
        print("\\n--- Generated Agent Description ---")
        print(json.dumps(description, indent=2))
        print("---------------------------------\\n")`}
    </CodeBlock>

    <h3 className="text-xl font-semibold mt-8 mb-4">Example Output</h3>
    <CodeBlock language="json">
{`[
  {
    "node name": "system",
    "node prompt": "You are a helpful customer service agent for Acme Corp..."
  },
  {
    "node name": "Order Status",
    "node prompt": "Help the customer check their order status...",
    "transfer conditions": [
      "Customer asks about order",
      "Customer provides order number"
    ]
  },
  {
    "node name": "Returns",
    "node prompt": "Assist with return requests...",
    "transfer conditions": [
      "Customer wants to return item",
      "Customer mentions refund"
    ]
  }
]`}
    </CodeBlock>

    {/* Downloading Call Audio */}
    <h2 className="text-2xl font-bold mt-12 mb-6">Downloading Call Audio</h2>
    <p className="text-gray-400 mb-6">
      You can download call recordings from ElevenLabs for analysis and testing.
    </p>

    <CodeBlock language="python">
{`import requests
from typing import Optional, Union

ELEVENLABS_API_KEY = "your_elevenlabs_api_key"
ELEVENLABS_API_BASE_URL = "https://api.elevenlabs.io/v1"

def download_elevenlabs_call_audio(
    conversation_id: str, 
    output_file: Optional[str] = None
) -> Union[bytes, bool, None]:
    """
    Download call audio recording from ElevenLabs API.
    
    Args:
        conversation_id: The ElevenLabs conversation ID
        output_file: Path to save the audio file (optional)
    
    Returns:
        Audio content as bytes or True if saved to file
    """
    url = f"{ELEVENLABS_API_BASE_URL}/convai/conversations/{conversation_id}/audio"
    
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        if output_file:
            with open(output_file, 'wb') as f:
                f.write(response.content)
            return True
        return response.content
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
        return None

# Example usage
conversation_id = "your_conversation_id"
download_elevenlabs_call_audio(conversation_id, "call_recording.mp3")`}
    </CodeBlock>

    {/* Sending Data to VoiceEval */}
    <h2 className="text-2xl font-bold mt-12 mb-6">Sending Call Data to VoiceEval</h2>
    <p className="text-gray-400 mb-6">
      After downloading audio and transcript data, send it to VoiceEval for analysis.
    </p>

    <h3 className="text-xl font-semibold mb-4">Request Body Format</h3>
    <CodeBlock language="json">
{`{
  "agent": "<agent_id_in_voiceeval>",
  "transcript_type": "elevenlabs",
  "transcript_json": "<elevenlabs_transcript_data>",
  "call_id": "<elevenlabs_conversation_id>",
  "voice_recording": "<binary_audio_file>"
}`}
    </CodeBlock>

    <h3 className="text-xl font-semibold mt-8 mb-4">Python Integration Example</h3>
    <CodeBlock language="python">
{`import requests
import json

VOICEEVAL_API_KEY = "your_voiceeval_api_key"
VOICEEVAL_AGENT_ID = "your_voiceeval_agent_id"
VOICEEVAL_API_BASE_URL = "https://api.voiceeval.ai"

def send_to_voiceeval_observe(
    conversation_id: str,
    transcript_data: list,
    audio_content: bytes
):
    """
    Send ElevenLabs call data to VoiceEval's observability API.
    """
    url = f"{VOICEEVAL_API_BASE_URL}/observability/v1/observe/"
    
    headers = {
        "X-VOICEEVAL-API-KEY": VOICEEVAL_API_KEY
    }
    
    data = {
        "agent": VOICEEVAL_AGENT_ID,
        "call_id": conversation_id,
        "transcript_type": "elevenlabs",
        "transcript_json": json.dumps(transcript_data)
    }
    
    files = {
        "voice_recording": (
            f"elevenlabs_recording_{conversation_id}.mp3",
            audio_content,
            "audio/mpeg"
        )
    }
    
    response = requests.post(url, headers=headers, data=data, files=files)
    
    if response.status_code == 201:
        return response.json()
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
        return None

# Example usage
conversation_id = "your_conversation_id"
audio_content = download_elevenlabs_call_audio(conversation_id)
transcript_data = [...]  # Your ElevenLabs transcript data

if audio_content:
    result = send_to_voiceeval_observe(
        conversation_id,
        transcript_data,
        audio_content
    )
    print(f"Call log created with ID: {result['id']}")`}
    </CodeBlock>

    {/* Testing Features */}
    <h2 className="text-2xl font-bold mt-12 mb-6">Testing Features</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <TestingFeatureCard
        icon={<Download className="w-5 h-5" />}
        title="Call Recording Analysis"
        description="Download and analyze call recordings with AI-powered insights"
      />
      <TestingFeatureCard
        icon={<Upload className="w-5 h-5" />}
        title="Webhook Integration"
        description="Automatic call data collection via webhook notifications"
      />
      <TestingFeatureCard
        icon={<CheckCircle className="w-5 h-5" />}
        title="Workflow Extraction"
        description="Extract complete agent workflows including nodes and conditions"
      />
      <TestingFeatureCard
        icon={<AlertCircle className="w-5 h-5" />}
        title="Real-time Monitoring"
        description="Monitor agent performance and conversation quality in real-time"
      />
    </div>

    {/* Troubleshooting */}
    <h2 className="text-2xl font-bold mt-12 mb-6">Troubleshooting</h2>
    <div className="space-y-4">
      <TroubleshootingItem
        issue="Webhook not receiving data"
        solution="Verify the webhook URL is correctly configured in your ElevenLabs dashboard. Check that your agent is making calls and the webhook endpoint is accessible."
      />
      <TroubleshootingItem
        issue="Failed to download audio"
        solution="Ensure your API key has permissions to access conversation data. Verify the conversation ID is correct and the conversation has completed."
      />
      <TroubleshootingItem
        issue="Agent extraction failed"
        solution="Check that your API key has access to the Conversational AI features. Verify the agent ID is correct and the agent exists in your account."
      />
      <TroubleshootingItem
        issue="Invalid transcript format"
        solution="Ensure you're sending the transcript data in the correct JSON format. The transcript should be an array of conversation turns."
      />
    </div>

    {/* Best Practices */}
    <h2 className="text-2xl font-bold mt-12 mb-6">Best Practices</h2>
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
      <ul className="space-y-3 text-gray-300">
        <li className="flex items-start gap-3">
          <span className="text-orange-400 font-bold">→</span>
          <span><strong>Webhook Setup:</strong> Configure webhooks early to capture all conversation data automatically</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-orange-400 font-bold">→</span>
          <span><strong>Regular Extraction:</strong> Re-extract agent configurations after making workflow changes</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-orange-400 font-bold">→</span>
          <span><strong>Audio Storage:</strong> Store call recordings for compliance and quality assurance purposes</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-orange-400 font-bold">→</span>
          <span><strong>Monitor Metrics:</strong> Track conversation success rates and identify improvement areas</span>
        </li>
      </ul>
    </div>

    {/* Next Steps */}
    <h2 className="text-2xl font-bold mt-12 mb-6">Next Steps</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <NextStepCard
        title="Generate Tests"
        description="Create test suites from extracted workflows"
        link="/docs/test-suites"
      />
      <NextStepCard
        title="Run Simulations"
        description="Test your agent with automated conversations"
        link="/docs/simulation-api"
      />
      <NextStepCard
        title="View Analytics"
        description="Analyze call quality and performance metrics"
        link="/docs/evaluation"
      />
    </div>
  </div>
);

// Helper Components
const SetupStep = ({ number, title, description, children }) => (
  <div className="relative pl-12">
    <div className="absolute left-0 top-0 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center font-bold text-sm">
      {number}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-400 mb-4 text-sm">{description}</p>
    {children}
  </div>
);

const CodeBlock = ({ language, children }) => (
  <div className="bg-gray-950 border border-gray-800 rounded-lg overflow-hidden">
    <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
      <span className="text-xs text-gray-500 font-mono">{language}</span>
      <button className="text-xs text-gray-400 hover:text-gray-200 flex items-center gap-1">
        <Copy className="w-3 h-3" />
        Copy
      </button>
    </div>
    <pre className="p-4 overflow-x-auto">
      <code className="text-sm text-gray-300 font-mono whitespace-pre">{children}</code>
    </pre>
  </div>
);

const TestingFeatureCard = ({ icon, title, description }) => (
  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
    <div className="flex items-center gap-3 mb-2">
      <div className="text-orange-400">{icon}</div>
      <h4 className="font-semibold text-gray-200">{title}</h4>
    </div>
    <p className="text-sm text-gray-400">{description}</p>
  </div>
);

const TroubleshootingItem = ({ issue, solution }) => (
  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
    <h4 className="font-semibold mb-2 text-red-400 flex items-center gap-2">
      <AlertCircle className="w-4 h-4" />
      {issue}
    </h4>
    <p className="text-sm text-gray-400">{solution}</p>
  </div>
);

const NextStepCard = ({ title, description, link }) => (
  <a 
    href={link}
    className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:border-orange-500/50 transition-colors group"
  >
    <h4 className="font-semibold mb-2 text-gray-200 group-hover:text-orange-400 transition-colors">{title}</h4>
    <p className="text-sm text-gray-400">{description}</p>
  </a>
);

export default ElevenLabsIntegrationSection;
