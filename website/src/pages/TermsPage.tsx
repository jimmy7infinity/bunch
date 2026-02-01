import React from 'react'
import { Link } from 'react-router-dom'
import './DocumentPage.css'

const TermsPage: React.FC = () => {
  return (
    <div className="document-page">
      <div className="document-container">
        <Link to="/" className="back-link">← Back to Home</Link>
        
        <h1>Terms of Service</h1>
        <p className="last-updated">Last Updated: January 2025</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using Bunch ("the Extension"), you accept and agree to be bound by the terms and 
            provision of this agreement. If you do not agree to abide by the above, please do not use this Extension.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>
            Bunch is a Chrome extension that provides real-time chat functionality for Polymarket users. The Extension 
            allows users to communicate with other traders while browsing prediction markets on Polymarket.
          </p>
        </section>

        <section>
          <h2>3. User Accounts and Authentication</h2>
          <p>
            To use Bunch, you must authenticate using your Twitter/X account. By doing so, you agree to:
          </p>
          <ul>
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Accept responsibility for all activities that occur under your account</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
          </ul>
        </section>

        <section>
          <h2>4. User Conduct</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Extension for any unlawful purpose</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Post spam, malware, or malicious content</li>
            <li>Impersonate others or misrepresent your affiliation</li>
            <li>Attempt to gain unauthorized access to the Extension or its related systems</li>
            <li>Use automated systems or bots to access the Extension</li>
          </ul>
        </section>

        <section>
          <h2>5. Content and Intellectual Property</h2>
          <p>
            Users retain ownership of content they post through the Extension. By posting content, you grant Bunch 
            a worldwide, non-exclusive license to use, reproduce, and display your content in connection with the Service.
          </p>
          <p>
            The Extension itself, including its design, functionality, and code, is the intellectual property of Bunch 
            and is protected by copyright and other laws.
          </p>
        </section>

        <section>
          <h2>6. Content Moderation</h2>
          <p>
            We reserve the right to remove any content or suspend/terminate user accounts that violate these Terms of 
            Service or our community guidelines. This includes but is not limited to:
          </p>
          <ul>
            <li>Harassment or hate speech</li>
            <li>Spam or commercial solicitation</li>
            <li>Illegal activities or content</li>
            <li>Impersonation or fraud</li>
          </ul>
        </section>

        <section>
          <h2>7. Third-Party Services</h2>
          <p>
            Bunch integrates with Polymarket and Twitter/X but is not affiliated with, endorsed by, or sponsored by 
            these platforms. Your use of these third-party services is subject to their respective terms of service.
          </p>
        </section>

        <section>
          <h2>8. Disclaimer of Warranties</h2>
          <p>
            THE EXTENSION IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT GUARANTEE 
            THAT THE EXTENSION WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
          </p>
        </section>

        <section>
          <h2>9. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, BUNCH SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, 
            CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE EXTENSION.
          </p>
        </section>

        <section>
          <h2>10. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms of Service at any time. We will notify users of significant 
            changes through the Extension. Continued use of the Extension after changes constitutes acceptance of the 
            modified terms.
          </p>
        </section>

        <section>
          <h2>11. Termination</h2>
          <p>
            We may terminate or suspend your access to the Extension immediately, without prior notice or liability, 
            for any reason, including breach of these Terms of Service.
          </p>
        </section>

        <section>
          <h2>12. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which 
            Bunch operates, without regard to its conflict of law provisions.
          </p>
        </section>

        <section>
          <h2>13. Contact Information</h2>
          <p>
            For questions about these Terms of Service, please contact us at: <strong>support@bunch.chat</strong>
          </p>
        </section>
      </div>
    </div>
  )
}

export default TermsPage
