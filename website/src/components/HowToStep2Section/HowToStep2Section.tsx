import React from 'react'
import './HowToStep2Section.css'
import bunchLogo from '../../assets/images/bunch_logo.png'
import browseChatsCategories from '../../assets/images/browse-chats-categories.png'
import chatLabels from '../../assets/images/chat-labels.png'
import darkIconBunch from '../../assets/images/dark-icon-bunch.png'
import chromeIcon from '../../assets/images/chrome-icon.png'

const HowToStep2Section: React.FC = () => {
  const handleDownload = () => {
    window.open('https://chromewebstore.google.com/detail/bunch/gnpefmfnagkjjmpmcnfpnimicggkcgna', '_blank')
  }

  return (
    <section className="snap-section howto-step2-section">
      <div className="mini-download-section-howto">
        <button className="mini-download-button" onClick={handleDownload}>
          <img src={darkIconBunch} alt="Bunch" className="mini-button-icon-top" />
          <svg className="mini-button-icon-bottom" width="25" height="25" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 12L3 7L4.4 5.6L7 8.2V0H9V8.2L11.6 5.6L13 7L8 12ZM2 16C1.45 16 0.979 15.804 0.587 15.412C0.195 15.02 0 14.549 0 14V11H2V14H14V11H16V14C16 14.55 15.804 15.021 15.412 15.413C15.02 15.805 14.549 16 14 16H2Z" fill="#19191A"/>
          </svg>
        </button>
        <img src={chromeIcon} alt="Chrome" className="mini-chrome-icon" />
      </div>

      <div className="howto-step2-content">
        <img src={bunchLogo} alt="Bunch Logo" className="howto-logo" />
        
        <div className="grey-dots-top">
          <div className="grey-dot dot-small"></div>
          <div className="grey-dot dot-medium"></div>
        </div>
        
        <div className="step-number-circle">
          <span className="step-number-text">2</span>
        </div>
        
        <h1 className="howto-title yellow-fill-text">BROWSE CHATS</h1>
        
        <img src={browseChatsCategories} alt="Browse Chats Categories" className="howto-step2-image" />
        <img src={chatLabels} alt="Chat Labels" className="howto-step2-image" />
        
        <div className="divider-line howto-divider"></div>
        
        <div className="black-dot"></div>
        
        <div className="grey-dots-bottom">
          <div className="grey-dot dot-small"></div>
          <div className="grey-dot dot-medium"></div>
          <div className="grey-dot dot-large"></div>
          <div className="grey-dot dot-xlarge"></div>
        </div>
      </div>
    </section>
  )
}

export default HowToStep2Section
