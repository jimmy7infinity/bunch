import React from 'react'
import './FeaturesSection.css'
import SectionHeader from '../SectionHeader/SectionHeader'
import joinButton from '../../assets/images/features1-join-button.png'
import favoritesButton from '../../assets/images/features1-favorites-button.png'
import polymarketFeatures from '../../assets/images/features1-polymarket-features.png'
import statusSection from '../../assets/images/features1-status-section.png'
import pfp from '../../assets/images/features1-pfp.png'

const features = [
  {
    image: joinButton,
    width: 290,
    text: 'Join chat for whatever prediction/theme you are browsing'
  },
  {
    image: polymarketFeatures,
    width: 290,
    text: 'Auto-join while you browse Polymarket'
  },
  {
    image: favoritesButton,
    width: 40,
    text: 'Save your favorites'
  },
  {
    image: polymarketFeatures,
    width: 290,
    text: 'Verify your PolyMarket username'
  },
  {
    image: statusSection,
    width: 222,
    text: 'Auto-join while you browse PolyMarket'
  },
  {
    image: pfp,
    width: 80,
    text: 'User ranks (coming soon)'
  }
]

const FeaturesSection: React.FC = () => {
  return (
    <section className="snap-section features-section">
      <SectionHeader title="FEATURES" dividerWidth={224} showMiniDownload={true} />
      
      <div className="features-content">
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-row">
              <div className="feature-image-container">
                <img src={feature.image} alt={feature.text} style={{ width: `${feature.width}px` }} />
              </div>
              <div className="feature-bullet"></div>
              <div className="feature-text-container">
                <p className="feature-text">{feature.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
