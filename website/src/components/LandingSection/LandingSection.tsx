import React from 'react'
import './LandingSection.css'
import bunchLogo from '../../assets/images/bunch_logo.png'
import chromeIcon from '../../assets/images/chrome-icon.png'

const LandingSection: React.FC = () => {
  const handleDownload = () => {
    window.open('https://chromewebstore.google.com/detail/bunch/gnpefmfnagkjjmpmcnfpnimicggkcgna', '_blank')
  }

  return (
    <section className="snap-section landing-section">
      {/* Thin yellow header line */}
      <div className="header-line"></div>
      
      {/* Shadow break */}
      <div className="shadow-break-element"></div>
      
      {/* Header with BUNCH text and logos */}
      <div className="top-header">
        <img src={bunchLogo} alt="Bunch Logo" className="header-logo header-logo-left" />
        <div className="top-header-center">
          <h1 className="bunch-title yellow-fill-text">BUNCH</h1>
        </div>
        <img src={bunchLogo} alt="Bunch Logo" className="header-logo header-logo-right" />
      </div>
      
      {/* Divider line under header */}
      <div className="divider-line-container">
        <div className="divider-line"></div>
      </div>
      
      {/* Main content */}
      <div className="main-content">
        {/* Large logo */}
        <img src={bunchLogo} alt="Bunch Logo" className="main-logo" />
        
        {/* Tagline with dividers */}
        <div className="tagline-container">
          <span className="tagline-text yellow-fill-text">DISCUSS</span>
          <div className="tagline-divider yellow-line"></div>
          <span className="tagline-text yellow-fill-text">PREDICT</span>
          <div className="tagline-divider yellow-line"></div>
          <span className="tagline-text yellow-fill-text">CONNECT</span>
        </div>
        
        {/* Second divider */}
        <div className="divider-line-container-small">
          <div className="divider-line"></div>
        </div>
        
        {/* Description text */}
        <p className="description-text">
          Real-time chat for PolyMarket traders - Connect with the community
        </p>
        
        {/* Main download button */}
        <button className="main-download-button download-button-bounce" onClick={handleDownload}>
          <span className="download-text">DOWNLOAD</span>
          <svg className="download-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 12L3 7L4.4 5.6L7 8.2V0H9V8.2L11.6 5.6L13 7L8 12ZM2 16C1.45 16 0.979 15.804 0.587 15.412C0.195 15.02 0 14.549 0 14V11H2V14H14V11H16V14C16 14.55 15.804 15.021 15.412 15.413C15.02 15.805 14.549 16 14 16H2Z" fill="#C4C4C4"/>
          </svg>
        </button>
        
        {/* "for Google Chrome" text */}
        <p className="chrome-text">for Google Chrome</p>
        
        {/* Chrome icon */}
        <img src={chromeIcon} alt="Chrome" className="chrome-icon" />
      </div>
    </section>
  )
}

export default LandingSection
