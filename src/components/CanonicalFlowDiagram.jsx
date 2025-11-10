const CanonicalFlowDiagram = () => {
  return (
    <div className="bg-dark-input rounded-xl p-6 border border-gray-700">
      <div className="mb-4">
        <h5 className="text-base font-semibold text-white mb-2">Canonical Flow Diagram</h5>
        <p className="text-gray-400 text-sm">
          Visual representation of your Voice Agent's conversation flow and decision points.
        </p>
      </div>
      
      <div className="bg-dark-bg rounded-lg p-6 border border-gray-800 overflow-x-auto">
        <div className="min-w-max">
          {/* START NODE */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mb-2">
              <span className="text-green-400 font-semibold text-sm">START</span>
            </div>
            <div className="w-0.5 h-8 bg-gray-600"></div>
          </div>

          {/* PHASE 1: OPENING */}
          <div className="mb-6">
            <div className="bg-blue-500/20 border-2 border-blue-500 rounded-xl p-4 mb-4">
              <h6 className="text-blue-300 font-semibold mb-2">PHASE 1: OPENING (30-45 seconds)</h6>
              <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
                <li>Greet customer by name</li>
                <li>Identify self & dealership</li>
                <li>State purpose</li>
                <li>Ask for 2 minutes</li>
              </ul>
            </div>
            
            {/* Decision: Does customer have time? */}
            <div className="flex flex-col items-center mb-4">
              <div className="w-0.5 h-8 bg-gray-600 mb-2"></div>
              <div className="w-32 h-32 transform rotate-45 bg-orange-500/20 border-2 border-orange-500 flex items-center justify-center mb-2">
                <div className="transform -rotate-45 text-orange-300 text-xs font-semibold text-center px-2">
                  Does customer have time?
                </div>
              </div>
              <div className="flex gap-8 mt-2">
                <div className="flex flex-col items-center">
                  <span className="text-gray-400 text-xs mb-1">NO</span>
                  <div className="w-0.5 h-6 bg-gray-600"></div>
                  <div className="bg-gray-700 rounded px-3 py-1 text-xs text-gray-300">
                    Offer Callback → Schedule & End
                  </div>
                  <div className="w-0.5 h-6 bg-gray-600 mt-1"></div>
                  <div className="w-12 h-12 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
                    <span className="text-red-400 text-xs font-semibold">END</span>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-gray-400 text-xs mb-1">YES</span>
                  <div className="w-0.5 h-6 bg-gray-600"></div>
                </div>
              </div>
            </div>
          </div>

          {/* PHASE 2: VERIFICATION */}
          <div className="mb-6">
            <div className="bg-orange-500/20 border-2 border-orange-500 rounded-xl p-4 mb-4">
              <h6 className="text-orange-300 font-semibold mb-3">PHASE 2: VERIFICATION (5 Key Details)</h6>
              <div className="space-y-3">
                {[
                  'Confirm Vehicle (Year/Make/Model)',
                  'Current Mileage',
                  'Last Service Date',
                  'Satisfaction Score (1-10 scale)',
                  'Future Plans (Keep or Upgrade?)'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                    <div className="bg-gray-800 rounded-lg px-4 py-2 text-gray-300 text-sm flex-1">
                      {idx + 1}. {item}
                    </div>
                    {idx < 4 && <div className="w-0.5 h-6 bg-gray-600"></div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PHASE 3: ANALYZE & ROUTE */}
          <div className="mb-6">
            <div className="bg-purple-500/20 border-2 border-purple-500 rounded-xl p-4 mb-4">
              <h6 className="text-purple-300 font-semibold mb-3">PHASE 3: ANALYZE & ROUTE TO OFFER</h6>
              
              {/* Decision: Analyze Customer Profile */}
              <div className="flex flex-col items-center mb-4">
                <div className="w-0.5 h-8 bg-gray-600 mb-2"></div>
                <div className="w-40 h-40 transform rotate-45 bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center mb-2">
                  <div className="transform -rotate-45 text-purple-300 text-xs font-semibold text-center px-2">
                    Analyze Customer Profile
                  </div>
                </div>
              </div>

              {/* Three Paths */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3">
                  <div className="text-green-300 font-semibold text-xs mb-2">PATH A</div>
                  <div className="text-gray-300 text-xs mb-2">Happy Owner + High Satisfaction</div>
                  <div className="bg-gray-800 rounded p-2 text-xs text-gray-300">
                    <strong>OFFER A: Service Package</strong><br />
                    $199 for $400 value<br />
                    3 oil changes + extras
                  </div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-3">
                  <div className="text-blue-300 font-semibold text-xs mb-2">PATH B</div>
                  <div className="text-gray-300 text-xs mb-2">Considering Upgrade or Has Concerns</div>
                  <div className="bg-gray-800 rounded p-2 text-xs text-gray-300">
                    <strong>OFFER B: Trade-In Bonus</strong><br />
                    $1,500 + Top Market Value<br />
                    0.9% APR + Free Service
                  </div>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/50 rounded-lg p-3">
                  <div className="text-purple-300 font-semibold text-xs mb-2">PATH C</div>
                  <div className="text-gray-300 text-xs mb-2">Very Satisfied (9-10 Rating)</div>
                  <div className="bg-gray-800 rounded p-2 text-xs text-gray-300">
                    <strong>OFFER C: Referral Rewards</strong><br />
                    $500 per referral<br />
                    Unlimited referrals
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PHASE 4: PRESENT OFFER */}
          <div className="mb-6">
            <div className="bg-purple-500/20 border-2 border-purple-500 rounded-xl p-4 mb-4">
              <h6 className="text-purple-300 font-semibold mb-3">PHASE 4: PRESENT OFFER</h6>
              <div className="bg-gray-800 rounded-lg px-4 py-2 text-gray-300 text-sm mb-4">
                Present Single Offer (with Natural Transition)
              </div>
              
              {/* Decision: Customer Response? */}
              <div className="flex flex-col items-center mb-4">
                <div className="w-0.5 h-8 bg-gray-600 mb-2"></div>
                <div className="w-40 h-40 transform rotate-45 bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center mb-2">
                  <div className="transform -rotate-45 text-purple-300 text-xs font-semibold text-center px-2">
                    Customer Response?
                  </div>
                </div>
              </div>

              {/* Four Main Paths */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3">
                  <div className="text-green-300 font-semibold text-xs mb-2">PATH 1: INTERESTED</div>
                  <div className="bg-green-500/20 rounded p-2 text-xs text-gray-300">
                    <strong>Close Interested:</strong><br />
                    • Schedule Appointment<br />
                    • Get Email<br />
                    • Send Confirmation<br />
                    • Thank Customer
                  </div>
                  <div className="w-0.5 h-6 bg-gray-600 mx-auto mt-2"></div>
                  <div className="w-12 h-12 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mx-auto mt-2">
                    <span className="text-red-400 text-xs font-semibold">END</span>
                  </div>
                </div>
                
                <div className="bg-orange-500/10 border border-orange-500/50 rounded-lg p-3">
                  <div className="text-orange-300 font-semibold text-xs mb-2">PATH 2: OBJECTION</div>
                  <div className="space-y-2 text-xs text-gray-300">
                    <div className="bg-gray-800 rounded p-2">
                      <strong>Type of Objection?</strong><br />
                      • Need to Think<br />
                      • Not Interested Now<br />
                      • Too Expensive<br />
                      • Use Another Service<br />
                      • <span className="text-red-400">DNC REQUEST</span> → END
                    </div>
                    <div className="bg-gray-800 rounded p-2">
                      <strong>Resolved?</strong><br />
                      YES → Close Interested<br />
                      NO → Close Not Interested
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3">
                  <div className="text-gray-300 font-semibold text-xs mb-2">PATH 3: DIRECT NO</div>
                  <div className="bg-gray-800 rounded p-2 text-xs text-gray-300">
                    Routes to "Firm No?" decision
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CLOSING NODE */}
          <div className="mb-6">
            <div className="bg-orange-500/20 border-2 border-orange-500 rounded-xl p-4 mb-4">
              <h6 className="text-orange-300 font-semibold mb-2">CLOSING NODE</h6>
              <div className="bg-gray-800 rounded-lg px-4 py-2 text-gray-300 text-sm">
                <strong>Close Not Interested:</strong><br />
                • Acknowledge & Thank<br />
                • "I completely understand"<br />
                • "Thank you for your time"<br />
                • "Feel free to reach out"<br />
                • End Positively
              </div>
              <div className="w-0.5 h-6 bg-gray-600 mx-auto mt-2"></div>
              <div className="w-12 h-12 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mx-auto mt-2">
                <span className="text-red-400 text-xs font-semibold">END</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CanonicalFlowDiagram

