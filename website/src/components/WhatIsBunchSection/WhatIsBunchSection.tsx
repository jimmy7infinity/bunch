import React from 'react'
import './WhatIsBunchSection.css'
import SectionHeader from '../SectionHeader/SectionHeader'
import leftScreenshot from '../../assets/images/what-is-bunch-left-sc.png'
import rightScreenshot from '../../assets/images/what-is-bunch-right-sc.png'
import chromeIcon from '../../assets/images/chrome-icon.png'

const WhatIsBunchSection: React.FC = () => {
  const handleDownload = () => {
    window.open('https://chromewebstore.google.com/detail/bunch/gnpefmfnagkjjmpmcnfpnimicggkcgna', '_blank')
  }

  return (
    <section className="snap-section what-is-bunch-section">
      <SectionHeader title="WHAT IS BUNCH?" dividerWidth={390} />
      
      <div className="what-is-bunch-content">
        <p className="intro-text">
          Bunch brings real-time community to PolyMarket. Chat with other traders while you browse markets.
        </p>
        
        <div className="screenshots-container">
          {/* Left side */}
          <div className="screenshot-block">
            <img src={leftScreenshot} alt="Bunch Extension" className="screenshot-image" />
            <p className="screenshot-title">
              Bunch is a Chrome extension that adds a social layer to PolyMarket prediction markets.
            </p>
            <div className="feature-list">
              <p className="feature-list-intro">Chrome side panel letting you:</p>
              <ul className="feature-items">
                <li>Join real-time chats for specific prediction markets</li>
                <li>Talk with other traders without leaving the page</li>
              </ul>
            </div>
          </div>
          
          {/* Right side */}
          <div className="screenshot-block">
            <img src={rightScreenshot} alt="Chat Rooms" className="screenshot-image" />
            <p className="screenshot-title">
              Every PolyMarket prediction has its own chat room, so discussions stay relevant and focused.
            </p>
            <div className="feature-list">
              <p className="feature-list-intro">General & Category Rooms</p>
              <ul className="feature-items">
                <li>Status ⚡ & Whale 🐳 Badges</li>
                <li>Friends & Direct Messages</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Main download button */}
        <button className="main-download-button main-download-button-with-icon download-button-bounce" onClick={handleDownload}>
          <img src={chromeIcon} alt="Chrome" className="button-chrome-icon-left" />
          <span className="download-text">DOWNLOAD</span>
          <svg className="download-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 12L3 7L4.4 5.6L7 8.2V0H9V8.2L11.6 5.6L13 7L8 12ZM2 16C1.45 16 0.979 15.804 0.587 15.412C0.195 15.02 0 14.549 0 14V11H2V14H14V11H16V14C16 14.55 15.804 15.021 15.412 15.413C15.02 15.805 14.549 16 14 16H2Z" fill="#C4C4C4"/>
          </svg>
        </button>
      </div>
    </section>
  )
}

export default WhatIsBunchSection
