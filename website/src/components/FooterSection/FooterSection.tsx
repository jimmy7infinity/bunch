import React from 'react'
import { Link } from 'react-router-dom'
import './FooterSection.css'
import bunchLogo from '../../assets/images/bunch_logo.png'
import darkIconBunch from '../../assets/images/dark-icon-bunch.png'
import chromeIcon from '../../assets/images/chrome-icon.png'

const FooterSection: React.FC = () => {
  const handleDownload = () => {
    window.open('https://chromewebstore.google.com/detail/bunch/gnpefmfnagkjjmpmcnfpnimicggkcgna', '_blank')
  }

  return (
    <section className="snap-section footer-section">
      <div className="mini-download-section-footer">
        <button className="mini-download-button" onClick={handleDownload}>
          <img src={darkIconBunch} alt="Bunch" className="mini-button-icon-top" />
          <svg className="mini-button-icon-bottom" width="25" height="25" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 12L3 7L4.4 5.6L7 8.2V0H9V8.2L11.6 5.6L13 7L8 12ZM2 16C1.45 16 0.979 15.804 0.587 15.412C0.195 15.02 0 14.549 0 14V11H2V14H14V11H16V14C16 14.55 15.804 15.021 15.412 15.413C15.02 15.805 14.549 16 14 16H2Z" fill="#19191A"/>
          </svg>
        </button>
        <img src={chromeIcon} alt="Chrome" className="mini-chrome-icon" />
      </div>

      <div className="footer-content">
        <img src={bunchLogo} alt="Bunch Logo" className="footer-logo" />
        
        <h1 className="footer-title yellow-fill-text">BUNCH</h1>
        
        <p className="footer-tagline">Real-time chat for Polymarket traders</p>
        
        <div className="divider-line footer-divider"></div>
        
        <div className="footer-links">
          <Link to="/terms" className="footer-link">Terms of Service</Link>
          <div className="footer-link-separator"></div>
          <Link to="/privacy" className="footer-link">Privacy Policy</Link>
          <div className="footer-link-separator"></div>
          <a 
            className="footer-link" 
            href="https://x.com" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            X / Twitter
          </a>
          <div className="footer-link-separator"></div>
          <span className="footer-link footer-email">support@bunch.chat</span>
        </div>

        <div className="divider-line footer-divider"></div>

        <div className="footer-bottom">
          <p className="copyright">© 2026 Bunch. All rights reserved.</p>
          <p className="disclaimer">Not affiliated with Polymarket or Twitter/X.</p>
        </div>
      </div>
    </section>
  )
}

export default FooterSection
