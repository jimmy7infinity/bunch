import React from 'react'
import './Features2Section.css'
import SectionHeader from '../SectionHeader/SectionHeader'
import pfp from '../../assets/images/features2-pfp.png'
import username from '../../assets/images/features2-username.png'
import bio from '../../assets/images/features2-bio.png'
import friendControls from '../../assets/images/features2-friend-controls.png'
import createChat from '../../assets/images/features2-create-chat.png'

const features = [
  {
    image: pfp,
    width: 165,
    lineExtension: 59, // (283-165)/2 = extra space to extend left
    text: 'Customize your profile picture.'
  },
  {
    image: username,
    width: 210,
    lineExtension: 36.5, // (283-210)/2 = extra space to extend left
    text: 'Update your username.'
  },
  {
    image: bio,
    width: 283,
    lineExtension: 0,
    text: 'Introduce yourself in your bio.'
  },
  {
    image: friendControls,
    width: 283,
    lineExtension: 0,
    text: 'Manage your friends.'
  },
  {
    image: createChat,
    width: 283,
    lineExtension: 0,
    text: 'Create DMs and Group chats with friends.'
  }
]

const Features2Section: React.FC = () => {
  return (
    <section className="snap-section features2-section">
      <SectionHeader title="FEATURES2" dividerWidth={224} showMiniDownload={true} />
      
      <div className="features2-content">
        <div className="features2-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature2-row">
              <div className="feature2-image-container">
                <div className="feature2-image-wrapper">
                  <img src={feature.image} alt={feature.text} style={{ width: `${feature.width}px` }} />
                </div>
              </div>
              <div 
                className="feature2-line" 
                style={{ 
                  width: `${60 + feature.lineExtension}px`,
                  marginLeft: `-${feature.lineExtension}px`
                }}
              ></div>
              <div className="feature2-text-container">
                <p className="feature2-text">{feature.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features2Section
