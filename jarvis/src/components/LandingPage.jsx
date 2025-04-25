"use client"
import { useContext, useEffect, useState } from "react"
import { datacontext } from "../context/VoiceContext"
import Header from "./Header"
import Robot from "./Robot"
import ChatArea from "./ChatArea"
import InputForm from "./InputForm"
import YouTubeIcon from "./YoutubeIcon"
import YouTubeSummarizerModal from "./YoutubeSummarizerModal"
import BackgroundCanvas from "./BackgroundCanvas"
import AnimationStyles from "./AnimationStyles"
import FileIcon from "./FileIcon"
import FileSummarizerModal from "./FileSummarizerModel"
import Sidebar from "./Sidebar"
import SeatMonitor from "./SeatMonitor"
import { FaChair } from "react-icons/fa" 

function LandingPage() {
  const { status } = useContext(datacontext)
  const [showYouTubeSummarizer, setShowYouTubeSummarizer] = useState(false)
  const [showFileSummary, setshowFileSummary] = useState(false)
  const [showRobot, setShowRobot] = useState(true)
  const [particleCount, setParticleCount] = useState(0)
  const [selectedSessionId, setSelectedSessionId] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isLoadingSession, setIsLoadingSession] = useState(false)
  const [cameraActive, setCameraActive] = useState(true)
  const [seatMonitorExpanded, setSeatMonitorExpanded] = useState(false) // New state for toggle
  const userId = "guest"

  // Toggle seat monitor view
  const toggleSeatMonitor = () => {
    setSeatMonitorExpanded(!seatMonitorExpanded)
  }

  // Toggle robot visibility
  const toggleRobot = () => {
    setShowRobot(!showRobot)
  }

  // Toggle YouTube summarizer
  const toggleYouTubeSummarizer = () => {
    setShowYouTubeSummarizer(!showYouTubeSummarizer)
  }

  const toogleFileSummary = () => {
    setshowFileSummary(!showFileSummary)
  }

  // Toggle camera on/off
  const toggleCamera = () => {
    setCameraActive(!cameraActive)
  }

  // Handle session selection
  const handleSessionSelect = async (sessionId) => {
    if (sessionId === selectedSessionId) return // Skip if same session

    setIsLoadingSession(true)
    setSelectedSessionId(sessionId)

    // Create visual effect when selecting a session
    const particleEffect = () => {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => createSpecialParticle(), i * 100)
      }
    }

    particleEffect()
    setIsLoadingSession(false)
  }

  // Create a special particle for session selection
  const createSpecialParticle = () => {
    const particle = document.createElement("div")
    particle.className = "ai-particle"

    const size = Math.random() * 10 + 8
    const x = 100 + Math.random() * 150
    const y = Math.random() * window.innerHeight

    particle.style.width = `${size}px`
    particle.style.height = `${size}px`
    particle.style.left = `${x}px`
    particle.style.top = `${y}px`
    particle.style.backgroundColor = `rgba(59, 130, 246, ${Math.random() * 0.5 + 0.3})`
    particle.style.boxShadow = "0 0 10px rgba(59, 130, 246, 0.7)"

    document.body.appendChild(particle)
    setParticleCount((prev) => prev + 1)

    setTimeout(() => {
      document.body.removeChild(particle)
      setParticleCount((prev) => prev - 1)
    }, 2000)
  }

  // Handle sidebar collapse state
  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed)
  }

  // Create floating particles
  useEffect(() => {
    const createParticle = () => {
      if (particleCount >= 15) return

      const particle = document.createElement("div")
      particle.className = "ai-particle"

      const size = Math.random() * 10 + 5
      const x = Math.random() * window.innerWidth
      const y = Math.random() * window.innerHeight
      const hue = Math.random() * 60 + 180

      particle.style.width = `${size}px`
      particle.style.height = `${size}px`
      particle.style.left = `${x}px`
      particle.style.top = `${y}px`
      particle.style.backgroundColor = `hsla(${hue}, 100%, 70%, 0.7)`

      document.body.appendChild(particle)
      setParticleCount((prev) => prev + 1)

      setTimeout(() => {
        document.body.removeChild(particle)
        setParticleCount((prev) => prev - 1)
      }, 5000)
    }

    const interval = setInterval(createParticle, 500)
    return () => clearInterval(interval)
  }, [particleCount])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 relative overflow-hidden">
      <AnimationStyles />
      <BackgroundCanvas />

      {/* Sidebar Component */}
      <Sidebar userId={userId} onSessionSelect={handleSessionSelect} onCollapse={handleSidebarCollapse} />

      {/* Seat Monitor - Now toggleable */}
      {seatMonitorExpanded ? (
        <div className="fixed top-4 right-4 z-20 w-[20rem] h-[25rem] shadow-2xl rounded-lg overflow-hidden border border-gray-700 transition-all duration-300">
          <div className="bg-black rounded-lg overflow-hidden h-full">
            <div className="flex justify-between items-center p-2 bg-black">
              <h3 className="text-sm font-medium text-gray-200">Seat Monitor</h3>
              <div className="flex gap-2">
                <button
                  onClick={toggleCamera}
                  className={`text-xs px-2 py-1 rounded-full ${cameraActive ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} transition-colors`}
                >
                  {cameraActive ? "Camera On" : "Camera Off"}
                </button>
                <button
                  onClick={toggleSeatMonitor}
                  className="text-xs px-2 py-1 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                  Minimize
                </button>
              </div>
            </div>
            <div className="w-full h-[90%]">
              <SeatMonitor miniMode={false} cameraActive={cameraActive} />
            </div>
          </div>
        </div>
      ) : (
        <div 
          onClick={toggleSeatMonitor}
          className="fixed top-4 right-4 z-20 w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-gray-700 transition-colors border border-gray-700"
          title="Seat Monitor"
        >
          <FaChair className="text-xl text-blue-400" />
        </div>
      )}

      {/* YouTube Summarizer Icon */}
      <div className="fixed top-48 right-4 z-10 transition-all duration-300">
        <YouTubeIcon toggleYouTubeSummarizer={toggleYouTubeSummarizer} />
      </div>

      {/* YouTube Summarizer Modal */}
      {showYouTubeSummarizer && <YouTubeSummarizerModal onClose={toggleYouTubeSummarizer} />}

      {/* File Icon */}
      <div className="fixed bottom-4 right-4 z-10 transition-all duration-300">
        <FileIcon toogleFileSummary={toogleFileSummary} />
      </div>

      {showFileSummary && <FileSummarizerModal onClose={toogleFileSummary} />}

      <div
        className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-2rem)] relative z-1 transition-all duration-300"
        style={{
          marginLeft: sidebarCollapsed ? "5rem" : "17rem",
        }}
      >
        <Header toggleRobot={toggleRobot} toggleYouTubeSummarizer={toggleYouTubeSummarizer} />
        {showRobot && <Robot />}

        {/* Loading indicator when switching sessions */}
        {isLoadingSession ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <>
            <ChatArea sessionId={selectedSessionId} />
            <InputForm sessionId={selectedSessionId} />
          </>
        )}
      </div>

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
      `}</style>
    </div>
  )
}

export default LandingPage