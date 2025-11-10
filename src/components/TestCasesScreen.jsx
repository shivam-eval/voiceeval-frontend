import { useState } from 'react'

const TEST_CASES = [
  {
    id: 1,
    title: "Happy Customer - Service Package Success",
    icon: "⭐",
    persona: {
      gender: "Female",
      name: "Sarah Martinez",
      speakingRate: "Moderate (120-130 WPM)",
      interruptionTendency: "Low (waits for pauses)",
      dialect: "Standard American English (West Coast)",
      personality: "Friendly, engaged, asks clarifying questions",
      backgroundEnvironment: "Quiet home office, occasional keyboard typing",
      vehicle: "2021 Honda CR-V",
      currentSituation: "Happy with vehicle, regular service customer"
    }
  },
  {
    id: 2,
    title: "Upgrade Seeker - Trade-In Success",
    persona: {
      gender: "Male",
      name: "Michael Chen",
      speakingRate: "Fast (150-160 WPM)",
      interruptionTendency: "Medium (occasionally finishes sentences)",
      dialect: "Standard American English (slight Northeast accent)",
      personality: "Decisive, business-like, efficiency-focused",
      backgroundEnvironment: "Car interior (driving), occasional turn signal sounds",
      vehicle: "2019 Toyota Camry with 78,000 miles",
      currentSituation: "Considering upgrade, interested in newer models"
    }
  },
  {
    id: 3,
    title: "Skeptical Customer - Objection Handling",
    persona: {
      gender: "Female",
      name: "Patricia Thompson",
      speakingRate: "Slow-Moderate (100-110 WPM)",
      dialect: "Southern American English (Georgia/Alabama)",
      interruptionTendency: "Low",
      personality: "Skeptical, price-sensitive, needs convincing",
      backgroundEnvironment: "Quiet, occasional TV in background",
      vehicle: "2020 Ford F-150",
      currentSituation: "Uses independent mechanic, budget-conscious"
    }
  },
  {
    id: 4,
    title: "Busy Customer - Callback Request",
    persona: {
      gender: "Male",
      name: "David Kumar",
      speakingRate: "Very Fast (160-170 WPM)",
      interruptionTendency: "High (frequently interrupts)",
      dialect: "Standard American English with slight Indian accent",
      personality: "Rushed, stressed, multitasking",
      backgroundEnvironment: "Office environment (meetings in background, phone ringing)",
      vehicle: "2022 Tesla Model 3",
      currentSituation: "In the middle of work, genuinely busy"
    }
  },
  {
    id: 5,
    title: "Satisfied Referrer - Referral Program Success",
    persona: {
      gender: "Female",
      name: "Jennifer Williams",
      speakingRate: "Moderate-Fast (140 WPM)",
      interruptionTendency: "Low-Medium",
      dialect: "Midwest American English",
      personality: "Enthusiastic, loyal customer, socially connected",
      backgroundEnvironment: "Quiet home, occasional dog barking",
      vehicle: "2021 Lexus RX 350",
      currentSituation: "Very satisfied (10/10), has friends looking for cars"
    }
  },
  {
    id: 6,
    title: "Indecisive Customer - \"Need to Think\" Handling",
    persona: {
      gender: "Male",
      name: "Robert (Bob) Anderson",
      speakingRate: "Slow (90-100 WPM)",
      interruptionTendency: "None (very polite)",
      dialect: "Upper Midwest English (Minnesota/Wisconsin)",
      personality: "Cautious, needs to consult spouse, detail-oriented",
      backgroundEnvironment: "Quiet, suburban home",
      vehicle: "2020 Subaru Outback",
      currentSituation: "Generally happy but makes joint decisions"
    }
  },
  {
    id: 7,
    title: "Do Not Call Request - Compliance Test",
    persona: {
      gender: "Female",
      name: "Lisa Rodriguez",
      speakingRate: "Fast (155 WPM)",
      interruptionTendency: "High (cuts in immediately)",
      dialect: "Standard American English",
      personality: "Direct, firm, slightly irritated",
      backgroundEnvironment: "Quiet",
      vehicle: "2021 Nissan Altima",
      currentSituation: "Doesn't want marketing calls"
    }
  },
  {
    id: 8,
    title: "Service-Loyal Customer - Competitor Comparison",
    persona: {
      gender: "Male",
      name: "James Morrison",
      speakingRate: "Moderate (125 WPM)",
      interruptionTendency: "Low",
      dialect: "Southern American English (Texas)",
      personality: "Loyal to current mechanic, friendly but firm",
      backgroundEnvironment: "Home garage (tools, radio playing country music)",
      vehicle: "2018 Chevrolet Silverado",
      currentSituation: "Happy with independent shop, needs convincing"
    }
  },
  {
    id: 9,
    title: "Technical Difficulties - Poor Connection",
    persona: {
      gender: "Female",
      name: "Amanda Foster",
      speakingRate: "Moderate but with breaks",
      interruptionTendency: "None (connection issues cause gaps)",
      dialect: "Standard American English",
      personality: "Patient but frustrated with connection",
      backgroundEnvironment: "Poor cell coverage, frequent audio drops, static",
      vehicle: "2020 Mazda CX-5",
      currentSituation: "Interested but connection makes it difficult"
    }
  },
  {
    id: 10,
    title: "High-Mileage Owner - Service Package Perfect Fit",
    persona: {
      gender: "Male",
      name: "Thomas (Tom) Green",
      speakingRate: "Slow-Moderate (110 WPM)",
      interruptionTendency: "Medium (asks many questions)",
      dialect: "Northeast American English (Boston area)",
      personality: "Practical, analytical, value-conscious",
      backgroundEnvironment: "Home office, occasional family noise (kids)",
      vehicle: "2017 Honda Accord with 95,000 miles",
      currentSituation: "Plans to keep car long-term, maintenance-focused"
    }
  }
]

const TestCasesScreen = ({ onRunTests, onBack }) => {
  return (
    <div className="w-full max-w-screen-2xl mx-auto px-8 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Generated Test Cases
            </h1>
            <p className="text-gray-400">
              Review the test cases and personas below, then run all tests to evaluate your Voice AI agent.
            </p>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-dark-input hover:bg-dark-input/80 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors"
            >
              Back
            </button>
          )}
        </div>

        {/* Test Cases List */}
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {TEST_CASES.map((testCase) => (
            <div
              key={testCase.id}
              className="bg-dark-panel rounded-xl p-6 border border-gray-800/50 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-400/20 flex items-center justify-center text-teal-400 font-semibold">
                  {testCase.id}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                    {testCase.icon && <span>{testCase.icon}</span>}
                    {testCase.title}
                  </h4>
                </div>
              </div>

              {/* Persona Details */}
              <div className="ml-14">
                <div className="mb-3">
                  <h5 className="text-sm font-semibold text-teal-400 mb-2 uppercase tracking-wide">
                    Simulator Persona
                  </h5>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Gender:</span>
                    <span className="text-white ml-2">{testCase.persona.gender}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white ml-2">{testCase.persona.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Speaking Rate:</span>
                    <span className="text-white ml-2">{testCase.persona.speakingRate}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Interruption Tendency:</span>
                    <span className="text-white ml-2">{testCase.persona.interruptionTendency}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400">Dialect:</span>
                    <span className="text-white ml-2">{testCase.persona.dialect}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400">Personality:</span>
                    <span className="text-white ml-2">{testCase.persona.personality}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400">Background Environment:</span>
                    <span className="text-white ml-2">{testCase.persona.backgroundEnvironment}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400">Vehicle:</span>
                    <span className="text-white ml-2">{testCase.persona.vehicle}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400">Current Situation:</span>
                    <span className="text-white ml-2">{testCase.persona.currentSituation}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Run Tests Button */}
        <div className="pt-4 border-t border-gray-800">
          <button
            onClick={onRunTests}
            className="w-full px-6 py-4 bg-teal-400 hover:bg-teal-500 text-white rounded-xl font-semibold text-base transition-all duration-300 shadow-lg shadow-teal-400/50 hover:scale-105 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Run Tests
          </button>
        </div>
      </div>
    </div>
  )
}

export default TestCasesScreen

