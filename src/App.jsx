import { useState, useEffect } from 'react'
import DashboardLoader from './components/DashboardLoader'
import DashboardLayout from './components/DashboardLayout'
import Dashboard from './components/Dashboard'
import PlatformSelection from './components/PlatformSelection'
import ConnectionForm from './components/ConnectionForm'
import ConnectionLoading from './components/ConnectionLoading'
import WorkspaceDashboard from './components/WorkspaceDashboard'

function App() {
  const [showDashboard, setShowDashboard] = useState(true)
  const [showLayout, setShowLayout] = useState(false)
  const [activeView, setActiveView] = useState('dashboard')
  const [showPlatformSelection, setShowPlatformSelection] = useState(false)
  const [showConnectionForm, setShowConnectionForm] = useState(false)
  const [showConnectionLoading, setShowConnectionLoading] = useState(false)
  const [showWorkspaceDashboard, setShowWorkspaceDashboard] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    // Show dashboard loader first, then transition to dashboard with layout
    const timer = setTimeout(() => {
      setShowDashboard(false)
      setTimeout(() => {
        setShowLayout(true)
        // Dashboard view is shown by default (activeView is already 'dashboard')
      }, 300)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleNavigate = (viewId) => {
    setActiveView(viewId)
    
    if (viewId === 'connect-agent') {
      setShowWorkspaceDashboard(false)
      setShowPlatformSelection(true)
      setShowConnectionForm(false)
      setShowConnectionLoading(false)
    } else if (viewId === 'dashboard') {
      setShowPlatformSelection(false)
      setShowConnectionForm(false)
      setShowConnectionLoading(false)
      setShowWorkspaceDashboard(false)
    }
    // Add other navigation handlers as needed
  }

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

  const handleConnectionComplete = () => {
    setShowConnectionLoading(false)
    setShowWorkspaceDashboard(true)
    setActiveView('workspace')
  }

  // Show loader before layout
  if (showDashboard) {
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
        <div className="animate-fade-in">
          <DashboardLoader />
        </div>
      </div>
    )
  }

  // Show layout with side panel after initialization
  if (showLayout) {
    return (
      <DashboardLayout activeView={activeView} onNavigate={handleNavigate}>
        {/* Dashboard - Default view */}
        {activeView === 'dashboard' && !showPlatformSelection && !showConnectionForm && !showConnectionLoading && !showWorkspaceDashboard && (
          <div className="p-8">
            <Dashboard />
          </div>
        )}

        {/* Platform Selection - Connect Agent flow */}
        {showPlatformSelection && (
          <div className="p-8">
            <PlatformSelection onSelectPlatform={handlePlatformSelect} />
          </div>
        )}

        {/* Connection Form - Connect Agent flow */}
        {showConnectionForm && (
          <div className="p-8">
            <ConnectionForm
              platform={selectedPlatform}
              onConnect={handleConnect}
              isConnecting={isConnecting}
              onBack={handleBackToPlatforms}
            />
          </div>
        )}

        {/* Connection Loading Screen - Connect Agent flow */}
        {showConnectionLoading && (
          <div className="p-8">
            <ConnectionLoading onComplete={handleConnectionComplete} />
          </div>
        )}

        {/* Workspace Dashboard - Shown after connection complete */}
        {showWorkspaceDashboard && (
          <div className="p-8">
            <WorkspaceDashboard />
          </div>
        )}
      </DashboardLayout>
    )
  }

  return null
}

export default App

