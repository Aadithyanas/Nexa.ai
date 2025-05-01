import { useContext, useEffect, useState } from "react"
import { datacontext } from "../context/VoiceContext"
import Header from "./Header"
import Robot from "./Robot"
import ChatArea from "./ChatArea"
import InputForm from "./InputForm"
import BackgroundCanvas from "./BackgroundCanvas"
import AnimationStyles from "./AnimationStyles"
import FileIcon from "./FileIcon"
import FileSummarizerModal from "./FileSummarizerModal"
import Sidebar from "./Sidebar"

function LandingPage() {
  // Get context safely with fallback default values
  const contextData = useContext(datacontext) || {};
  const { status = "Ready" } = contextData;

  const [showFileSummary, setshowFileSummary] = useState(false)
  const [showRobot, setShowRobot] = useState(false)
  const [particleCount, setParticleCount] = useState(0)
  const [selectedSessionId, setSelectedSessionId] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isLoadingSession, setIsLoadingSession] = useState(false)

  const userId = "guest"

  // Toggle robot visibility
  const toggleRobot = () => {
    setShowRobot(!showRobot)
  }

  const toogleFileSummary = () => {
    setshowFileSummary(!showFileSummary)
  }

  // Handle session selection
  const handleSessionSelect = async (sessionId) => {
    if (sessionId === selectedSessionId) return // Skip if same session

    setIsLoadingSession(true)
    setSelectedSessionId(sessionId)

    // Create visual effect when selecting a session
  

   
    setIsLoadingSession(false)
  }

  // Add createSpecialParticle function
  

  // Handle sidebar collapse state
  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed)
  }

  // Create floating particles
  

  // Add useEffect for responsive handling
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarCollapsed(true);
      }
    };
    // Initial check
    handleResize();
    // Add event listener
    window.addEventListener('resize', handleResize);
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      className="min-h-screen text-white relative overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: "url('./Main.png')" }}
    >
      <AnimationStyles />
      <BackgroundCanvas />

      {/* Sidebar Component */}
      <Sidebar 
        userId={userId} 
        onSessionSelect={handleSessionSelect} 
        onCollapse={handleSidebarCollapse} 
        isCollapsed={sidebarCollapsed} 
        setIsCollapsed={setSidebarCollapsed} 
      />

      {/* Main Content Area */}
      <div
        className={`
          flex flex-col min-h-screen 
          transition-all duration-300 ease-in-out 
          ml-[var(--sidebar-collapsed-width)]
          sm:ml-[var(--sidebar-collapsed-width)]
          ${!sidebarCollapsed && 'sm:ml-[var(--sidebar-width)]'}
        `}
      >
        {/* Header Container */}
        <div className={`
          fixed top-0 right-0 left-0 z-10 
          transition-all duration-300 ease-in-out 
          pl-[var(--sidebar-collapsed-width)]
          sm:pl-[var(--sidebar-collapsed-width)]
          ${!sidebarCollapsed && 'sm:pl-[var(--sidebar-width)]'}
          bg-transparent
        `}>
          <div className="max-w-6xl mx-auto px-4 py-2">
            <Header toggleRobot={toggleRobot} />
          </div>
        </div>

        {/* Main Content Container */}
        <div className="
          flex-1 flex flex-col items-center 
          mt-[var(--header-height)] px-4 
          pb-[calc(var(--bottom-input-height)+2rem)]
        ">
          <div className={`
            w-full transition-all duration-300 ease-in-out 
            mx-auto
            ${sidebarCollapsed ? 'max-w-4xl' : 'max-w-3xl'}
            sm:px-6 lg:px-8
          `}>
            {showRobot && (
              <div className="mb-4 animate-fadeIn">
                <Robot />
              </div>
            )}

            {/* Loading indicator when switching sessions */}
            {isLoadingSession ? (
              <div className="flex-1 flex justify-center items-center py-8">
                <div className="loading-spinner"></div>
              </div>
            ) : (
              <div className="min-h-[calc(100vh-var(--header-height)-var(--bottom-input-height))]">
                <ChatArea sessionId={selectedSessionId} />
              </div>
            )}
          </div>
        </div>

        {/* Fixed Input Form at Bottom */}
        <div className="
          fixed bottom-0 left-0 right-0 
          bg-black/20 backdrop-blur-md 
          transition-all duration-300 ease-in-out z-20
          border-t border-white/10
        ">
          <div className={`
            mx-auto px-4 py-4 
            transition-all duration-300 ease-in-out
            ml-[var(--sidebar-collapsed-width)]
            sm:ml-[var(--sidebar-collapsed-width)]
            ${!sidebarCollapsed && 'sm:pl-[var(--sidebar-width)]'}
          `}>
            <div className={`
              mx-auto 
              ${sidebarCollapsed ? 'max-w-4xl' : 'max-w-3xl'}
              sm:px-6 lg:px-8
            `}>
              <InputForm sessionId={selectedSessionId} />
            </div>
          </div>
        </div>

        {/* Floating Action Buttons */}
        <div className="
          fixed bottom-[calc(var(--bottom-input-height)+1rem)] right-4 
          z-30 flex flex-col gap-3
        ">
          <div className="transition-all duration-300 hover:scale-110">
            <FileIcon toogleFileSummary={toogleFileSummary} />
          </div>
        </div>
      </div>

      {showFileSummary && (
        <div className="fixed inset-0 z-50">
          <FileSummarizerModal onClose={toogleFileSummary} />
        </div>
      )}

      <style jsx>{`
        .loading-spinner {
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 3px solid #fff;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  )
}

export default LandingPage