
import React from 'react';

import { useState, useEffect } from "react"

import LandingPage from "./components/LandingPage"
import LoadingScreen from "./components/LoadingScreen"
import YoutubeAutomation from "./components/YoutubeAutomation"
import SeatMonitor from './components/SeatMonitor';

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const userId = "guest"; // Replace with dynamic user if needed

  // Simulate app initialization
  useEffect(() => {
    // Initialize any app-wide resources, configurations, or services
    const initializeApp = async () => {
      try {
        // Check if browser supports required features
        const speechSynthesisSupported = 'speechSynthesis' in window
        const speechRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
        
        // You could load user preferences from localStorage here
        const userPreferences = localStorage.getItem('friday-preferences')
        
        // Wait a bit to show the loading screen (remove in production)
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Set initialization flag
        setIsInitialized(true)
        
        // Log initialization status
        console.log('App initialized', {
          speechSynthesisSupported,
          speechRecognitionSupported,
          userPreferences: userPreferences ? JSON.parse(userPreferences) : null
        })
      } catch (error) {
        console.error('Failed to initialize app:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()

    // Set up global event listeners
    const handleOnline = () => console.log('App is online')
    const handleOffline = () => console.log('App is offline')
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Handle errors at the app level
  useEffect(() => {
    const handleGlobalError = (event) => {
      console.error('Global error:', event.error)
      // You could show a global error UI here
    }

    window.addEventListener('error', handleGlobalError)
    
    return () => {
      window.removeEventListener('error', handleGlobalError)
    }
  }, [])

  // Handle keyboard shortcuts at the app level
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Example: Escape key to reset app state in emergency
      if (e.key === 'Escape' && e.ctrlKey && e.shiftKey) {
        console.log('Emergency app reset triggered')
        // Reset app state here if needed
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
      
      <LandingPage initialized={isInitialized} />
      // <div>
      //   <YoutubeAutomation/>
      // </div>
    // <SeatMonitor/>
  )
}

export default App
