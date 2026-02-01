import React, { useState, useEffect } from 'react'
import './App.css'
import './animations.css'
import LandingSection from './components/LandingSection/LandingSection'
import WhatIsBunchSection from './components/WhatIsBunchSection/WhatIsBunchSection'
import FeaturesSection from './components/FeaturesSection/FeaturesSection'
import Features2Section from './components/Features2Section/Features2Section'
import GetStartedSection from './components/GetStartedSection/GetStartedSection'
import HowToStep1Section from './components/HowToStep1Section/HowToStep1Section'
import HowToStep2Section from './components/HowToStep2Section/HowToStep2Section'
import HowToStep3Section from './components/HowToStep3Section/HowToStep3Section'
import FooterSection from './components/FooterSection/FooterSection'
import bunchLogo from './assets/images/bunch_logo.png'

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Hide loading screen after a longer delay
    const timer = setTimeout(() => {
      setLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {loading && (
        <div className="loading-screen">
          <img src={bunchLogo} alt="Bunch Logo" className="loading-logo" />
        </div>
      )}
      
      <div className="snap-container">
        <LandingSection />
        <WhatIsBunchSection />
        <FeaturesSection />
        <Features2Section />
        <GetStartedSection />
        <HowToStep1Section />
        <HowToStep2Section />
        <HowToStep3Section />
        <FooterSection />
      </div>
    </>
  )
}

export default App
