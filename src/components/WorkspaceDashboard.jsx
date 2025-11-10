import { useState } from 'react'
import SystemPromptViewer from './SystemPromptViewer'
import CanonicalFlowDiagram from './CanonicalFlowDiagram'
import TestCasesGenerationLoading from './TestCasesGenerationLoading'
import TestCasesScreen from './TestCasesScreen'
import TestExecutionLoading from './TestExecutionLoading'
import EvaluationDashboard from './EvaluationDashboard'

// ═══════════════════════════════════════════════════════════════
// SYSTEM PROMPT CONFIGURATION
// ═══════════════════════════════════════════════════════════════
// 
// TO UPDATE THE SYSTEM PROMPT:
// Replace the text below in the SYSTEM_PROMPT constant with your actual prompt
//
const SYSTEM_PROMPT = `## Role & Identity
You are a friendly customer service representative from Premier Auto Group. Be warm, professional, and conversational—never pushy. Keep calls between 2-4 minutes.

## Call Structure

### 1. OPENING (30-45 seconds)
Greet customer by name, identify yourself and dealership, state purpose, and ask if they have 2 minutes.

**Example:**
"Hi [Customer Name], this is [Your Name] from [Dealership Name]. How are you doing today? I'm reaching out to check in on your [Vehicle] and share an exclusive offer for valued customers. Do you have a couple of minutes?"

If not convenient, offer callback.

### 2. VERIFICATION (5 Key Details)
Confirm conversationally—don't interrogate:

1. **Vehicle:** "You're still enjoying your [YEAR] [MAKE] [MODEL], correct?"
2. **Mileage:** "How many miles do you have on it now?"
3. **Service History:** "When was the last time you brought it in for service?"
4. **Satisfaction:** "On a scale of 1-10, how satisfied are you overall?"
5. **Future Plans:** "Planning to keep it long-term, or thinking about upgrading?"

### 3. TRANSITION TO OFFER
Use their responses to transition naturally:
- **Happy owners:** "Since you're such a valued customer..."
- **Mentioned concerns:** "Perfect timing, because we have something that might help..."
- **Considering upgrade:** "You're going to love what I'm about to share..."

### 4. PRESENT ONE OFFER

**OFFER A: Service Package (for satisfied owners)**
"We're offering our loyal customers an exclusive Service Package: 3 complimentary oil changes over 12 months, one free tire rotation, multi-point inspection, and 20% off additional service. Valued at over $400, yours for just $199."

**OFFER B: Trade-In Bonus (for those upgrading)**
"We're offering an exclusive Trade-In Bonus: top market value, plus an additional $1,500 bonus, 0.9% APR financing, and your first 3 service appointments free. Only available this month for existing customers."

**OFFER C: Referral Rewards (for very satisfied customers)**
"For every friend or family member you refer who purchases a vehicle, you earn a $500 Visa gift card, they get $500 off, plus you get priority scheduling for life. No limit on referrals."

### 5. COMMON OBJECTIONS

**"I need to think about it"**
"I completely understand! What specifically would you like to think about? Maybe I can help with more information."

**"Not interested right now"**
"No problem! This offer is available until [DATE]. Can I send you an email with the details in case you change your mind?"

**"Seems expensive"**
"Let me break down the value... [explain savings]. We also offer payment plans if that helps."

**"I use another service center"**
"I understand! Our technicians are [Brand] certified with genuine OEM parts, and this offer beats most independent shops. Would you be open to giving us a try?"

### 6. CLOSING

**If Interested:**
Schedule appointment, get email for confirmation, thank them warmly.

**If Not Interested:**
"I completely understand! Thank you for your time, [Name]. We appreciate your business. Feel free to reach out if anything changes. Have a great day!"

## Guidelines

**DO:**
- Use customer's name 2-3 times
- Listen actively and acknowledge responses
- Speak naturally with occasional "um," "absolutely," "you know"
- Match customer's energy
- Offer to send details via email/text

**DON'T:**
- Rush verification questions
- Use high-pressure tactics
- Talk over customer
- Sound robotic
- Present multiple offers
- Push after firm "no"

## Voice Settings
- **Tone:** Friendly, professional, warm
- **Pace:** Moderate
- **Energy:** 7/10 (upbeat but natural)

## Required Variables
- [DEALERSHIP_NAME], [Customer Name], [VEHICLE] (Year/Make/Model), [Offer Expiration Date]

## Success Goals
1. Primary: Book appointment/confirm interest
2. Secondary: Send follow-up information
3. Minimum: Positive interaction

**Compliance:** Honor DNC requests immediately, provide opt-out options, comply with TCPA.`

// ═══════════════════════════════════════════════════════════════

const WorkspaceDashboard = () => {
  const [showSystemPrompt, setShowSystemPrompt] = useState(false)
  const [showCanonicalFlow, setShowCanonicalFlow] = useState(false)
  const [showTestCasesGeneration, setShowTestCasesGeneration] = useState(false)
  const [showTestCasesScreen, setShowTestCasesScreen] = useState(false)
  const [showTestLoading, setShowTestLoading] = useState(false)
  const [showEvaluationDashboard, setShowEvaluationDashboard] = useState(false)

  const handleGenerateTestCases = () => {
    setShowTestCasesGeneration(true)
  }

  const handleTestCasesGenerated = () => {
    setShowTestCasesGeneration(false)
    setShowTestCasesScreen(true)
  }

  const handleRunTests = () => {
    setShowTestCasesScreen(false)
    setShowTestLoading(true)
  }

  const handleTestComplete = () => {
    setShowTestLoading(false)
    setShowEvaluationDashboard(true)
  }

  const handleBackToTestCases = () => {
    setShowEvaluationDashboard(false)
    setShowTestCasesScreen(true)
  }

  const handleBackToWorkspace = () => {
    setShowTestCasesScreen(false)
  }

  // Show loading screen when generating test cases
  if (showTestCasesGeneration) {
    return <TestCasesGenerationLoading onComplete={handleTestCasesGenerated} />
  }

  // Show test cases screen after generation
  if (showTestCasesScreen) {
    return <TestCasesScreen onRunTests={handleRunTests} onBack={handleBackToWorkspace} />
  }

  // Show loading screen when tests are running
  if (showTestLoading) {
    return <TestExecutionLoading onComplete={handleTestComplete} />
  }

  // Show evaluation dashboard when tests are complete
  if (showEvaluationDashboard) {
    return <EvaluationDashboard onBack={handleBackToTestCases} />
  }

  return (
    <div className="w-full max-w-screen-2xl mx-auto">
      <div className="space-y-8">
          {/* Logo and Feature Tag */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                Voice<span className="text-teal-400">Eval</span>
              </h1>
            </div>
          </div>

          {/* Main Heading */}
          <div>
            <h2 className="text-5xl font-bold text-white mb-4 leading-tight">
              Evaluate Your Voice AI Agents
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">
              Run automated call simulations, analyze performance metrics, and optimize your Voice AI agents with real-time insights.
            </p>
          </div>

          {/* Workspace Setup Complete */}
          <div className="bg-dark-panel rounded-2xl p-8 border border-gray-800/50 shadow-xl">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-teal-400/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-white">
                    Workspace Setup Complete
                  </h3>
                  <p className="text-gray-400 text-base">
                    Your Voice Agent is ready for evaluation
                  </p>
                </div>
              </div>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              {/* System Prompt Card */}
              <div className="bg-dark-input rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white mb-2">
                      Original System Prompt
                    </h4>
                    <p className="text-gray-400 text-sm mb-4">
                      View the system prompt used by your Voice Agent
                    </p>
                    <button
                      onClick={() => setShowSystemPrompt(!showSystemPrompt)}
                      className="px-4 py-2 bg-teal-400/10 hover:bg-teal-400/20 border border-teal-400/50 text-teal-400 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                    >
                      {showSystemPrompt ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                          Collapse
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          View System Prompt
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Canonical Flow Card */}
              <div className="bg-dark-input rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white mb-2">
                      Canonical Flow Diagram
                    </h4>
                    <p className="text-gray-400 text-sm mb-4">
                      Visual representation of your Voice Agent's conversation flow
                    </p>
                    <button
                      onClick={() => setShowCanonicalFlow(!showCanonicalFlow)}
                      className="px-4 py-2 bg-teal-400/10 hover:bg-teal-400/20 border border-teal-400/50 text-teal-400 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                    >
                      {showCanonicalFlow ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                          Collapse
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          View Flow Diagram
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded System Prompt */}
            {showSystemPrompt && (
              <div className="mb-6 animate-slide-up">
                <SystemPromptViewer prompt={SYSTEM_PROMPT} />
              </div>
            )}

            {/* Expanded Canonical Flow */}
            {showCanonicalFlow && (
              <div className="mb-6 animate-slide-up">
                <CanonicalFlowDiagram />
              </div>
            )}

            {/* Generate Test Cases Button */}
            <div className="pt-4 border-t border-gray-800">
              <button 
                onClick={handleGenerateTestCases}
                className="w-full px-6 py-4 bg-teal-400 hover:bg-teal-500 text-white rounded-xl font-semibold text-base transition-all duration-300 shadow-lg shadow-teal-400/50 hover:scale-105 flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Generate Test Cases
              </button>
            </div>
          </div>
      </div>
    </div>
  )
}

export default WorkspaceDashboard

