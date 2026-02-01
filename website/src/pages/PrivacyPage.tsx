import React from 'react'
import { Link } from 'react-router-dom'
import './DocumentPage.css'

const PrivacyPage: React.FC = () => {
  return (
    <div className="document-page">
      <div className="document-container">
        <Link to="/" className="back-link">← Back to Home</Link>
        
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: January 2025</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            Bunch ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we 
            collect, use, disclose, and safeguard your information when you use our Chrome extension.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          
          <h3>2.1 Information You Provide</h3>
          <ul>
            <li><strong>Authentication Data:</strong> When you sign in with Twitter/X, we receive your Twitter username, profile picture, and basic profile information.</li>
            <li><strong>Chat Messages:</strong> Messages you send through the Extension are stored to provide the chat service.</li>
            <li><strong>Profile Information:</strong> Any additional information you choose to add to your Bunch profile (bio, etc.).</li>
          </ul>

          <h3>2.2 Automatically Collected Information</h3>
          <ul>
            <li><strong>Usage Data:</strong> Information about how you interact with the Extension (features used, chat participation).</li>
            <li><strong>Technical Data:</strong> Browser type, Extension version, and basic device information.</li>
            <li><strong>Polymarket Activity:</strong> Which prediction markets you're viewing (to suggest relevant chat rooms).</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We use the collected information to:</p>
          <ul>
            <li>Provide and maintain the chat service</li>
            <li>Authenticate your identity</li>
            <li>Enable communication between users</li>
            <li>Suggest relevant chat rooms based on your Polymarket browsing</li>
            <li>Detect and prevent abuse, spam, and violations of our Terms of Service</li>
            <li>Improve and optimize the Extension</li>
            <li>Send important service updates and notifications</li>
          </ul>
        </section>

        <section>
          <h2>4. Information Sharing and Disclosure</h2>
          
          <h3>4.1 With Other Users</h3>
          <p>Your username, profile picture, and messages are visible to other users in the chat rooms you join.</p>

          <h3>4.2 Service Providers</h3>
          <p>We may share your information with third-party service providers who help us operate the Extension (hosting, database management, etc.).</p>

          <h3>4.3 Legal Requirements</h3>
          <p>We may disclose your information if required by law or in response to valid legal requests.</p>

          <h3>4.4 We Do Not Sell Your Data</h3>
          <p>We do not sell, rent, or trade your personal information to third parties for marketing purposes.</p>
        </section>

        <section>
          <h2>5. Data Retention</h2>
          <p>
            We retain your information for as long as your account is active or as needed to provide services. Chat 
            messages are retained indefinitely unless deleted. You may request deletion of your account and associated 
            data at any time.
          </p>
        </section>

        <section>
          <h2>6. Data Security</h2>
          <p>
            We implement reasonable security measures to protect your information. However, no method of transmission 
            over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2>7. Your Privacy Rights</h2>
          <p>Depending on your location, you may have the following rights:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
            <li><strong>Correction:</strong> Request correction of inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
            <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
            <li><strong>Objection:</strong> Object to certain processing of your information</li>
          </ul>
          <p>To exercise these rights, contact us at <strong>support@bunch.chat</strong></p>
        </section>

        <section>
          <h2>8. Third-Party Services</h2>
          <p>
            The Extension integrates with Polymarket and Twitter/X. This Privacy Policy does not cover how these 
            third-party services handle your data. Please review their respective privacy policies.
          </p>
        </section>

        <section>
          <h2>9. Children's Privacy</h2>
          <p>
            The Extension is not intended for users under 13 years of age. We do not knowingly collect information 
            from children under 13. If you believe we have collected such information, please contact us immediately.
          </p>
        </section>

        <section>
          <h2>10. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your own. We ensure appropriate 
            safeguards are in place to protect your information in accordance with this Privacy Policy.
          </p>
        </section>

        <section>
          <h2>11. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant changes through 
            the Extension. Continued use after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2>12. Contact Us</h2>
          <p>
            If you have questions or concerns about this Privacy Policy, please contact us at:
          </p>
          <p><strong>support@bunch.chat</strong></p>
        </section>
      </div>
    </div>
  )
}

export default PrivacyPage
