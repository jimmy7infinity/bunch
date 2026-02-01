import React from 'react'
import './GetStartedSection.css'
import bunchLogo from '../../assets/images/bunch_logo.png'
import chromeIcon from '../../assets/images/chrome-icon.png'

const GetStartedSection: React.FC = () => {
  const handleDownload = () => {
    window.open('https://chromewebstore.google.com/detail/bunch/gnpefmfnagkjjmpmcnfpnimicggkcgna', '_blank')
  }

  return (
    <section className="snap-section get-started-section">
      <div className="get-started-content">
        <img src={bunchLogo} alt="Bunch Logo" className="get-started-logo" />
        
        <h1 className="get-started-title yellow-fill-text">GET STARTED</h1>
        
        <div className="divider-line get-started-divider"></div>
        
        <button className="main-download-button-2" onClick={handleDownload}>
          <img src={chromeIcon} alt="Chrome" className="button-chrome-icon" />
          <span className="button-text">DOWNLOAD</span>
          <svg className="button-download-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 12L3 7L4.4 5.6L7 8.2V0H9V8.2L11.6 5.6L13 7L8 12ZM2 16C1.45 16 0.979 15.804 0.587 15.412C0.195 15.02 0 14.549 0 14V11H2V14H14V11H16V14C16 14.55 15.804 15.021 15.412 15.413C15.02 15.805 14.549 16 14 16H2Z" fill="#C4C4C4"/>
          </svg>
        </button>
        
        <div className="black-dot"></div>
        
        <h2 className="how-to-title">HOW TO</h2>
        
        <div className="dots-container">
          <div className="grey-dot dot-small"></div>
          <div className="grey-dot dot-medium"></div>
          <div className="grey-dot dot-large"></div>
        </div>
        
        <svg className="bouncing-arrow" width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4L12 20M12 20L5 13M12 20L19 13" stroke="#FFD655" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </section>
  )
}

export default GetStartedSection
