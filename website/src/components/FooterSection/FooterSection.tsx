import React, { useState } from 'react'
import './FooterSection.css'
import bunchLogo from '../../assets/images/bunch_logo.png'
import darkIconBunch from '../../assets/images/dark-icon-bunch.png'
import chromeIcon from '../../assets/images/chrome-icon.png'

const FooterSection: React.FC = () => {
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)

  const handleDownload = () => {
    window.open('https://chromewebstore.google.com/detail/bunch/gnpefmfnagkjjmpmcnfpnimicggkcgna', '_blank')
  }

  const handleShowTerms = () => {
    setShowPrivacy(false)
    setShowTerms(true)
  }

  const handleShowPrivacy = () => {
    setShowTerms(false)
    setShowPrivacy(true)
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
        {!showTerms && !showPrivacy && (
          <>
            <img src={bunchLogo} alt="Bunch Logo" className="footer-logo" />
            
            <h1 className="footer-title yellow-fill-text">BUNCH</h1>
            
            <p className="footer-tagline">Real-time chat for Polymarket traders</p>
            
            <div className="divider-line footer-divider"></div>
          </>
        )}
        
        <div className="footer-links">
          <button className="footer-link" onClick={handleShowTerms}>
            Terms of Service
          </button>
          <div className="footer-link-separator"></div>
          <button className="footer-link" onClick={handleShowPrivacy}>
            Privacy Policy
          </button>
          <div className="footer-link-separator"></div>
          <a 
            className="footer-link" 
            href="https://x.com/bunch" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            X / Twitter
          </a>
          <div className="footer-link-separator"></div>
          <span className="footer-link footer-email">
            support@bunch.chat
          </span>
        </div>
        
        {showTerms && (
          <div className="footer-document">
            <button className="close-button" onClick={() => setShowTerms(false)}>✕</button>
            <div className="document-content">
              <h2>Terms of Service</h2>
              <p className="last-updated">Last Updated: January 16, 2026</p>
              
              <h3>Acceptance of Terms</h3>
              <p>By using Bunch, you agree to these Terms of Service. If you disagree, do not use the service.</p>
              
              <h3>Service Description</h3>
              <p>Bunch is a Chrome extension that provides chat functionality for Polymarket users. It is provided "as is" without warranties.</p>
              
              <h3>User Accounts</h3>
              <ul>
                <li>You must authenticate with Twitter</li>
                <li>You must be 18 or older</li>
                <li>One account per person</li>
                <li>Accurate information required</li>
              </ul>
              
              <h3>Acceptable Use</h3>
              <p><strong>You MAY:</strong></p>
              <ul>
                <li>Chat with other users</li>
                <li>Share opinions and predictions</li>
                <li>Use GIFs and images</li>
                <li>Report inappropriate content</li>
              </ul>
              
              <p><strong>You MAY NOT:</strong></p>
              <ul>
                <li>Post hate speech or slurs</li>
                <li>Harass or threaten others</li>
                <li>Spam or flood chats</li>
                <li>Impersonate others</li>
                <li>Share illegal content</li>
                <li>Use bots or automation</li>
              </ul>
              
              <h3>Moderation</h3>
              <p>Violations may result in warnings, suspensions, or permanent bans.</p>
              
              <h3>Disclaimers</h3>
              <p>Bunch is for discussion only. Not financial, legal, or investment advice. We are not responsible for your trading decisions.</p>
              
              <p className="footer-note">For full terms, visit our GitHub repository.</p>
            </div>
          </div>
        )}
        
        {showPrivacy && (
          <div className="footer-document">
            <button className="close-button" onClick={() => setShowPrivacy(false)}>✕</button>
            <div className="document-content">
              <h2>Privacy Policy</h2>
              <p className="last-updated">Last Updated: January 16, 2026</p>
              
              <h3>Information We Collect</h3>
              <ul>
                <li>Twitter account info (via OAuth)</li>
                <li>Polymarket wallet (optional)</li>
                <li>Profile information</li>
                <li>Chat messages</li>
                <li>Usage data</li>
              </ul>
              
              <h3>How We Use Your Information</h3>
              <ul>
                <li>Provide and improve our service</li>
                <li>Authenticate your identity</li>
                <li>Display your profile</li>
                <li>Detect and prevent abuse</li>
              </ul>
              
              <h3>Data Sharing</h3>
              <p>We <strong>DO NOT</strong> sell your personal information.</p>
              <p>We may share data with Polymarket (if you opt-in), Twitter (for auth), Cloudinary (for images), and law enforcement if required.</p>
              
              <h3>Your Rights</h3>
              <ul>
                <li>Access your data</li>
                <li>Delete your account</li>
                <li>Opt-out of Polymarket verification</li>
                <li>Block other users</li>
              </ul>
              
              <h3>Data Security</h3>
              <p>We use encrypted connections, JWT authentication, content moderation, and rate limiting to protect your data.</p>
              
              <p className="footer-note">For complete privacy policy, visit our GitHub repository.</p>
            </div>
          </div>
        )}
        
        <div className="divider-line footer-divider-bottom"></div>
        
        <div className="footer-bottom">
          <p className="copyright">© 2026 Bunch. All rights reserved.</p>
          <p className="disclaimer">Not affiliated with Polymarket or Twitter/X.</p>
        </div>
      </div>
    </section>
  )
}

export default FooterSection
