import React from 'react'
import './SectionHeader.css'
import bunchLogo from '../../assets/images/bunch_logo.png'
import darkIconBunch from '../../assets/images/dark-icon-bunch.png'
import chromeIcon from '../../assets/images/chrome-icon.png'

interface SectionHeaderProps {
  title: string
  dividerWidth?: number
  showMiniDownload?: boolean
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  dividerWidth = 390,
  showMiniDownload = false 
}) => {
  const handleDownload = () => {
    window.open('https://chromewebstore.google.com/detail/bunch/gnpefmfnagkjjmpmcnfpnimicggkcgna', '_blank')
  }

  return (
    <div className="section-header-container">
      {showMiniDownload && (
        <div className="mini-download-section">
          <button className="mini-download-button" onClick={handleDownload}>
            <img src={darkIconBunch} alt="Bunch" className="mini-button-icon-top" />
            <svg className="mini-button-icon-bottom" width="25" height="25" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 12L3 7L4.4 5.6L7 8.2V0H9V8.2L11.6 5.6L13 7L8 12ZM2 16C1.45 16 0.979 15.804 0.587 15.412C0.195 15.02 0 14.549 0 14V11H2V14H14V11H16V14C16 14.55 15.804 15.021 15.412 15.413C15.02 15.805 14.549 16 14 16H2Z" fill="#19191A"/>
            </svg>
          </button>
          <img src={chromeIcon} alt="Chrome" className="mini-chrome-icon" />
        </div>
      )}
      
      <div className="section-header-content">
        <img src={bunchLogo} alt="Bunch Logo" className="section-header-logo" />
        <h2 className="section-header-title yellow-fill-text">{title}</h2>
        <div 
          className="section-header-divider divider-line" 
          style={{ width: `${dividerWidth}px` }}
        ></div>
      </div>
    </div>
  )
}

export default SectionHeader
