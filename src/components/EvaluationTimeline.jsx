import { useState, useRef, useEffect } from 'react'

// Sample timeline data for Test Case 1 with prompt-aware information
const TIMELINE_DATA = {
  duration: 222, // 3:42 in seconds
  issues: [
    { 
      id: 1, 
      time: 88, 
      type: "major", 
      label: "Empathy Gap – Missed 9/10 Moment",
      issue: "Agent ignored customer's emotional cue after positive feedback. Customer expressed high satisfaction (9/10) but agent immediately moved to next question without acknowledging the positive sentiment.",
      suggestion: `**Immediate Fix:**
When customer expresses high satisfaction (8-10 rating), pause and acknowledge their positive feedback before proceeding.

**Example Response:**
"That's wonderful to hear, Sarah! A 9 out of 10 is fantastic — it sounds like you're really happy with your vehicle. Since you're so satisfied with it, I have something that might make your ownership experience even better..."

**Why This Works:**
- Validates customer's positive experience
- Creates emotional connection before transitioning
- Shows you're listening, not just following a script
- Increases trust and receptivity to offers

**Prompt Update:**
Add to "DO" section: "When customer rates satisfaction 8-10, acknowledge enthusiastically before transitioning: 'That's wonderful! Since you're so happy with it...'"`,
      promptRef: "Guideline → DO: Listen actively and acknowledge responses.",
      promptSnippet: `**DO:**
- Listen actively and acknowledge responses
- Match customer's energy
- When customer rates satisfaction 8-10, acknowledge enthusiastically before transitioning`
    },
    { 
      id: 2, 
      time: 52, 
      type: "major", 
      label: "Rushed Question – Mileage",
      issue: "Agent interrupted customer mid-response when asking about mileage. Customer was still thinking/responding when agent jumped to next question, creating a rushed feeling.",
      suggestion: `**Immediate Fix:**
Add a 1-2 second pause after asking verification questions. Wait for complete customer response before proceeding.

**Example Flow:**
Agent: "How many miles do you have on it now?"
[Wait 2 seconds for response]
Customer: "Hmm, around 32,000 miles I think."
Agent: "Perfect, thank you. And when was the last time you brought it in for service?"

**Why This Works:**
- Reduces perceived pressure
- Allows customer to think and respond naturally
- Prevents interruption and shows respect
- Improves conversation flow and customer comfort

**Prompt Update:**
Add to "DON'T" section: "After asking verification questions, wait 1-2 seconds for complete response. Use phrases like 'Take your time' if customer seems to be thinking."`,
      promptRef: "Guideline → DON'T: Rush verification questions",
      promptSnippet: `**DON'T:**
- Rush verification questions
- Talk over customer
- Interrupt mid-response

**DO:**
- Wait 1-2 seconds after asking questions
- Use "Take your time" if customer is thinking`
    },
    { 
      id: 3, 
      time: 135, 
      type: "major", 
      label: "Offer Overload – Too Dense",
      issue: "Agent presented entire offer in one long, uninterrupted block. Customer received too much information at once without opportunity to process or ask questions.",
      suggestion: `**Immediate Fix:**
Break the offer into 2-3 digestible chunks with natural pauses and micro-confirmations between each.

**Example Structure:**
Chunk 1: "We're offering our loyal customers an exclusive Service Package. It includes three complimentary oil changes over the next 12 months. Does that sound interesting so far?"

[Wait for acknowledgment or continue]

Chunk 2: "Plus, you'll get one free tire rotation and a comprehensive multi-point inspection. And here's the best part — 20% off any additional service you might need."

Chunk 3: "The total value is over $400, but as a valued customer, it's yours for just $199. Would you like me to explain any part of that in more detail?"

**Why This Works:**
- Prevents information overload
- Allows customer to process each benefit
- Creates natural conversation flow
- Increases comprehension and retention
- Gives customer control to ask questions

**Prompt Update:**
Modify "PRESENT ONE OFFER" section: "Break offer into 2-3 parts. After each part, pause and ask: 'Does that sound good so far?' or 'Any questions about that?'"`,
      promptRef: "Section → PRESENT ONE OFFER",
      promptSnippet: `**OFFER A: Service Package (for satisfied owners)**
Present in 2-3 parts with pauses:

Part 1: "We're offering our loyal customers an exclusive Service Package: 3 complimentary oil changes over 12 months. Does that sound interesting so far?"

Part 2: "Plus, one free tire rotation and multi-point inspection, plus 20% off additional service."

Part 3: "Valued at over $400, yours for just $199."`
    },
    { 
      id: 4, 
      time: 190, 
      type: "good", 
      label: "Appointment Booked Successfully",
      issue: "Agent booked appointment naturally and thanked customer warmly. This demonstrates effective closing technique that should be replicated.",
      suggestion: `**What Worked Well:**
- Natural transition from offer acceptance to booking
- Clear confirmation of appointment details (day, time)
- Warm, appreciative closing tone
- Professional yet friendly demeanor

**Replication Strategy:**
Use this exact pattern for all successful conversions:
1. Acknowledge acceptance: "That sounds great!"
2. Confirm details clearly: "You're scheduled for [DAY] at [TIME]"
3. Express appreciation: "Thank you, [Name]"
4. Offer additional support: "Is there anything else I can help you with today?"

**Why This Works:**
- Creates positive final impression
- Reinforces customer's good decision
- Leaves door open for future engagement
- Maintains professional relationship

**Keep This Pattern:**
This closing aligns perfectly with the "If Interested" section. Continue using this approach for all successful bookings.`,
      promptRef: "Section → Closing → If Interested",
      promptSnippet: `**If Interested:**
1. Acknowledge: "That sounds great!"
2. Schedule: "You're scheduled for [DAY] at [TIME]"
3. Thank warmly: "Thank you, [Name]"
4. Offer support: "Is there anything else I can help with?"`
    },
  ],
  transcript: [
    { time: 0, speaker: "AGENT", text: "Hi Sarah! How are you doing today?" },
    { time: 5, speaker: "SARAH", text: "I'm doing great, thanks! Just got the car serviced last month." },
    { time: 52, speaker: "AGENT", text: "How many miles do you have on it now?" },
    { time: 55, speaker: "SARAH", text: "Hmm, around 32,000 miles I think." },
    { time: 88, speaker: "SARAH", text: "Oh, I'd definitely say a 9. The car runs beautifully!" },
    { time: 89, speaker: "AGENT", text: "A 9! That's wonderful. So are you planning to keep it long-term?" },
    { time: 135, speaker: "AGENT", text: "So this includes three complimentary oil changes..." },
    { time: 190, speaker: "SARAH", text: "That sounds great, let's book it." },
    { time: 210, speaker: "AGENT", text: "Perfect! You're scheduled for next Wednesday at 2 PM." },
  ],
}

const EvaluationTimeline = ({ testCaseData }) => {
  const transcriptRefs = useRef({})
  const [hoveredMarker, setHoveredMarker] = useState(null)
  const [activeMarker, setActiveMarker] = useState(null)
  const [modalData, setModalData] = useState(null)
  const [editedSuggestion, setEditedSuggestion] = useState('')
  const transcriptContainerRef = useRef(null)

  const data = TIMELINE_DATA // Using sample data for now

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleMarkerClick = (issue, e) => {
    e.stopPropagation() // Prevent event from bubbling to timeline container
    
    // Toggle popup
    const newActiveMarker = activeMarker === issue.id ? null : issue.id
    setActiveMarker(newActiveMarker)
    
    // Scroll to transcript - find the closest or exact matching entry
    const closestEntry = data.transcript.reduce((prev, curr) => {
      return Math.abs(curr.time - issue.time) < Math.abs(prev.time - issue.time) ? curr : prev
    })

    // Use setTimeout to ensure DOM is ready and scroll happens after popup renders
    setTimeout(() => {
      const el = transcriptRefs.current[closestEntry.time]
      if (el && transcriptContainerRef.current) {
        const container = transcriptContainerRef.current
        
        // Highlight the transcript entry first for visibility
        el.classList.add('bg-teal-400/30', 'ring-2', 'ring-teal-400/50', 'rounded-lg', 'transition-all', 'duration-300')
        
        // Calculate scroll position relative to container only (not the whole page)
        // Get element position relative to container's scroll position
        const elementTop = el.offsetTop
        const containerHeight = container.clientHeight
        const elementHeight = el.offsetHeight
        
        // Calculate position to center the element in the container viewport
        const scrollPosition = elementTop - (containerHeight / 2) + (elementHeight / 2)
        
        // Only scroll the transcript container, not the whole page
        container.scrollTo({
          top: Math.max(0, scrollPosition),
          behavior: 'smooth'
        })
        
        // Remove highlight after 3 seconds
        setTimeout(() => {
          el.classList.remove('bg-teal-400/30', 'ring-2', 'ring-teal-400/50', 'rounded-lg')
        }, 3000)
      }
    }, 100)
  }

  const handleSuggestionClick = (issue) => {
    setModalData(issue)
    setEditedSuggestion(issue.suggestion)
  }

  const handleSaveSuggestion = () => {
    // Here you would typically save to backend or update state
    console.log('Saving suggestion:', editedSuggestion)
    // For now, just close the modal
    setModalData(null)
    // You could show a success message here
  }

  const handleCloseModal = () => {
    setModalData(null)
    setEditedSuggestion('')
  }

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeMarker !== null) {
        // Check if click is outside the popup and not on a marker
        const popup = document.querySelector('.marker-popup')
        const clickedMarker = event.target.closest('[data-marker-id]')
        
        if (popup && !popup.contains(event.target) && !clickedMarker) {
          setActiveMarker(null)
        }
      }
    }

    if (activeMarker !== null) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [activeMarker])

  return (
    <div className="flex flex-col gap-6 p-6 bg-dark-input rounded-xl border border-gray-700">
      {/* Title */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">
          {testCaseData?.name || 'Test Case 1'} – {testCaseData?.scenario || 'Timeline View'}
        </h3>
        <p className="text-gray-400 text-sm">
          Duration: {formatTime(data.duration)}
        </p>
      </div>

      {/* Timeline */}
      <div className="relative w-full mb-20 overflow-visible">
        <div className="relative w-full h-8 bg-gray-700 rounded-full overflow-hidden border border-gray-600 timeline-background">
          {/* Timeline background with gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-full"></div>
          
          {/* Timeline markers */}
          {data.issues.map((issue) => {
            const position = (issue.time / data.duration) * 100
            const isHovered = hoveredMarker === issue.id
            const isActive = activeMarker === issue.id
            
            return (
              <div
                key={issue.id}
                className="absolute top-0"
                style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                data-marker-id={issue.id}
              >
                <div
                  className={`h-8 rounded-full cursor-pointer transition-all duration-200 ${
                    issue.type === "good" 
                      ? "bg-green-500 hover:bg-green-400 shadow-lg shadow-green-500/50" 
                      : "bg-red-500 hover:bg-red-400 shadow-lg shadow-red-500/50"
                  } ${isHovered ? 'z-10 w-2 scale-150' : 'w-1.5 scale-100'} ${isActive ? 'ring-2 ring-teal-400 ring-offset-2 ring-offset-gray-700' : ''}`}
                  title={`${issue.label} (${formatTime(issue.time)})`}
                  onMouseEnter={() => setHoveredMarker(issue.id)}
                  onMouseLeave={() => setHoveredMarker(null)}
                  onClick={(e) => handleMarkerClick(issue, e)}
                  data-marker-id={issue.id}
                />
              </div>
            )
          })}
        </div>
        
        {/* Popups rendered outside the overflow-hidden container */}
        {data.issues.map((issue) => {
          const position = (issue.time / data.duration) * 100
          const isActive = activeMarker === issue.id
          
          if (!isActive) return null
          
          return (
            <div
              key={`popup-${issue.id}`}
              className="marker-popup absolute bg-gray-800 shadow-2xl p-4 w-80 rounded-xl border border-gray-600 z-50"
              style={{ 
                left: `${position}%`,
                bottom: '100%',
                marginBottom: '12px',
                animation: 'popupFadeIn 0.2s ease-out forwards'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <p className="font-semibold text-white text-sm">{issue.label}</p>
                  <p className="text-xs text-gray-400 mt-1">{issue.issue}</p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveMarker(null)
                  }}
                  className="ml-2 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleSuggestionClick(issue)
                }}
                className="mt-3 flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300 cursor-pointer transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>View improvement suggestion</span>
              </button>
              {/* Arrow */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
          )
        })}

        {/* Time labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>0:00</span>
          <span>{formatTime(data.duration)}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full"></span>
          <span className="text-gray-300">Issue</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          <span className="text-gray-300">Good Response</span>
        </div>
      </div>

      {/* Transcript Viewer */}
      <div className="border border-gray-700 rounded-lg overflow-hidden bg-dark-panel">
        <div className="px-4 py-3 border-b border-gray-700 bg-dark-input">
          <h4 className="text-lg font-semibold text-white">Transcript</h4>
          <p className="text-gray-400 text-xs mt-1">Click timeline markers to jump to specific moments</p>
        </div>
        <div
          ref={transcriptContainerRef}
          className="h-96 overflow-y-auto p-4 space-y-3"
        >
          {data.transcript.map((line, idx) => (
            <div
              key={idx}
              ref={(el) => {
                if (el) transcriptRefs.current[line.time] = el
              }}
              className="transition-all duration-300 rounded-lg p-3 scroll-mt-4 hover:bg-gray-800/30"
              data-time={line.time}
            >
              <div className="flex items-start gap-3">
                <span className="text-xs text-gray-500 font-mono min-w-[60px]">
                  [{formatTime(line.time)}]
                </span>
                <div className="flex-1">
                  <span
                    className={`font-semibold text-sm ${
                      line.speaker === "AGENT" ? "text-teal-400" : "text-gray-300"
                    }`}
                  >
                    {line.speaker}:
                  </span>{' '}
                  <span className="text-gray-300 text-sm">{line.text}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Suggestion */}
      {modalData && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleCloseModal}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-dark-panel rounded-xl border border-gray-700 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-700 bg-dark-input">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {modalData.label}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {modalData.promptRef}
                    </p>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Original Prompt Snippet */}
                <div>
                  <p className="text-gray-300 text-sm font-semibold mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Original Prompt Snippet:
                  </p>
                  <div className="bg-dark-input p-4 rounded-lg border border-gray-700 text-sm text-gray-300 whitespace-pre-wrap font-mono">
                    {modalData.promptSnippet}
                  </div>
                </div>

                {/* Suggested Improvement */}
                <div>
                  <p className="text-gray-300 text-sm font-semibold mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Suggested Improvement:
                  </p>
                  <textarea
                    value={editedSuggestion}
                    onChange={(e) => setEditedSuggestion(e.target.value)}
                    className="w-full bg-dark-input border border-gray-700 rounded-lg p-4 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none min-h-[120px] font-sans"
                    placeholder="Enter your improvement suggestion..."
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-700 bg-dark-input flex justify-end gap-3">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSuggestion}
                  className="px-4 py-2 bg-teal-400 hover:bg-teal-500 text-white rounded-lg font-medium transition-colors"
                >
                  Save Suggestion
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default EvaluationTimeline

