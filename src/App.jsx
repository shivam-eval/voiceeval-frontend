import { useState, useEffect } from 'react'
import DashboardLoader from './components/DashboardLoader'
import PlatformSelection from './components/PlatformSelection'
import ConnectionForm from './components/ConnectionForm'
import ConnectionLoading from './components/ConnectionLoading'
import WorkspaceDashboard from './components/WorkspaceDashboard'

function App() {
  const [showDashboard, setShowDashboard] = useState(true)
  const [showPlatformSelection, setShowPlatformSelection] = useState(false)
  const [showConnectionForm, setShowConnectionForm] = useState(false)
  const [showConnectionLoading, setShowConnectionLoading] = useState(false)
  const [showWorkspaceDashboard, setShowWorkspaceDashboard] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    // Show dashboard loader first, then transition to platform selection
    const timer = setTimeout(() => {
      setShowDashboard(false)
      setTimeout(() => setShowPlatformSelection(true), 300)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handlePlatformSelect = (platformId) => {
    setSelectedPlatform(platformId)
    setShowPlatformSelection(false)
    setTimeout(() => setShowConnectionForm(true), 300)
  }

  const handleBackToPlatforms = () => {
    setShowConnectionForm(false)
    setTimeout(() => {
      setShowPlatformSelection(true)
      setSelectedPlatform(null)
    }, 300)
  }

  const handleConnect = async ({ apiKey, assistantId }) => {
    setIsConnecting(true)
    // Simulate API connection
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsConnecting(false)
    // Show connection loading screen
    setShowConnectionForm(false)
    setTimeout(() => {
      setShowConnectionLoading(true)
    }, 300)
    // Here you would handle the actual API connection
    console.log('Connecting with:', { platform: selectedPlatform, apiKey, assistantId })
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-accent-green rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `pulse-slow ${2 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Dashboard Loader Animation */}
      {showDashboard && (
        <div className="animate-fade-in">
          <DashboardLoader />
        </div>
      )}

      {/* Platform Selection */}
      {showPlatformSelection && (
        <div className="animate-slide-up">
          <PlatformSelection onSelectPlatform={handlePlatformSelect} />
        </div>
      )}

      {/* Connection Form */}
      {showConnectionForm && (
        <div className="animate-slide-up">
          <ConnectionForm
            platform={selectedPlatform}
            onConnect={handleConnect}
            isConnecting={isConnecting}
            onBack={handleBackToPlatforms}
          />
        </div>
      )}

      {/* Connection Loading Screen */}
      {showConnectionLoading && !showWorkspaceDashboard && (
        <div className="animate-slide-up">
          <ConnectionLoading 
            onComplete={() => {
              setShowConnectionLoading(false)
              setTimeout(() => setShowWorkspaceDashboard(true), 300)
            }}
          />
        </div>
      )}

      {/* Workspace Dashboard */}
      {showWorkspaceDashboard && (
        <div className="animate-slide-up">
          <WorkspaceDashboard />
        </div>
      )}
    </div>
  )
}

export default App

