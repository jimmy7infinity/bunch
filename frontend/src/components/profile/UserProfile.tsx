import React, { useState, useEffect, useRef } from 'react';
import { RankedPFP } from '../common/RankedPFP';
import { useAuthStore } from '../../stores/authStore';
import { userService, friendService, blockService, mediaService } from '../../services/api';
import type { User } from '../../types';
import './UserProfile.css';

interface UserProfileProps {
  userId: string;
  isOwnProfile: boolean;
  onBack: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId, isOwnProfile, onBack }) => {
  const { user: currentUser, setAuth, token } = useAuthStore();
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [bio, setBio] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showRequestSent, setShowRequestSent] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<'friends' | 'pending' | 'not_friends' | 'request_sent'>('not_friends');
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [isUploadingPFP, setIsUploadingPFP] = useState(false);
  const pfpInputRef = useRef<HTMLInputElement>(null);

  // Store original values for cancel functionality
  const [originalBio, setOriginalBio] = useState('');
  const [originalUsername, setOriginalUsername] = useState('');
  const [originalDisplayName, setOriginalDisplayName] = useState('');

  // Load user data from backend
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        let user: User;
        
        if (isOwnProfile) {
          // For own profile, use current user data
          user = currentUser!;
          
          // Load friend requests and friends for own profile
          const [requests, friendsList] = await Promise.all([
            friendService.getFriendRequests().catch(() => []),
            friendService.getFriends().catch(() => []),
          ]);
          setFriendRequests(requests);
          setFriends(friendsList);
        } else {
          // For other users, fetch their data and friendship status
          user = await userService.getUser(userId);
          const status = await friendService.getFriendshipStatus(userId).catch(() => ({ status: 'not_friends' as const }));
          setFriendshipStatus(status.status);
        }
        
        setUserData(user);
        setBio(user.bio || '');
        setUsername(user.username || '');
        setDisplayName(user.display_name || user.username || '');
        setOriginalBio(user.bio || '');
        setOriginalUsername(user.username || '');
        setOriginalDisplayName(user.display_name || user.username || '');
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOwnProfile && currentUser) {
      loadUserData();
    } else if (!isOwnProfile && userId) {
      loadUserData();
    }
  }, [userId, isOwnProfile, currentUser]);

  // Mock user data - will be replaced with actual API calls
  const mockData = {
    pfp: '👤',
    rank: isOwnProfile ? 'TITAN' : 'LEGEND+', // Using actual rank names from ranks.ts
    friendStatus: isOwnProfile ? null : 'not_friends', // 'friends', 'pending', 'not_friends', 'request_sent'
  };

  const handleAddFriend = async () => {
    try {
      await friendService.sendFriendRequest(userId);
      setFriendshipStatus('request_sent');
      setShowRequestSent(true);
      setTimeout(() => setShowRequestSent(false), 2000);
    } catch (error) {
      console.error('Failed to send friend request:', error);
      alert('Failed to send friend request. Please try again.');
    }
  };

  const handleAcceptFriendRequest = async (requestId: string) => {
    try {
      await friendService.acceptFriendRequest(requestId);
      // Reload friend requests and friends
      const [requests, friendsList] = await Promise.all([
        friendService.getFriendRequests(),
        friendService.getFriends(),
      ]);
      setFriendRequests(requests);
      setFriends(friendsList);
    } catch (error) {
      console.error('Failed to accept friend request:', error);
      alert('Failed to accept friend request. Please try again.');
    }
  };

  const handleRejectFriendRequest = async (requestId: string) => {
    try {
      await friendService.rejectFriendRequest(requestId);
      // Reload friend requests
      const requests = await friendService.getFriendRequests();
      setFriendRequests(requests);
    } catch (error) {
      console.error('Failed to reject friend request:', error);
      alert('Failed to reject friend request. Please try again.');
    }
  };

  const handleBlock = () => {
    setShowBlockConfirm(true);
  };

  const confirmBlock = async () => {
    try {
      await blockService.blockUser(userId);
      setShowBlockConfirm(false);
      onBack(); // Go back after blocking
    } catch (error) {
      console.error('Failed to block user:', error);
      alert('Failed to block user. Please try again.');
    }
  };

  const handleSaveBio = async () => {
    try {
      setIsSaving(true);
      const updatedUser = await userService.updateProfile({ bio });
      setOriginalBio(bio);
      setIsEditingBio(false);
      
      // Update local userData and auth store with full updated user data
      setUserData(updatedUser);
      if (currentUser && token) {
        setAuth({ ...currentUser, ...updatedUser }, token);
      }
    } catch (error) {
      console.error('Failed to update bio:', error);
      alert('Failed to update bio. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelBio = () => {
    setBio(originalBio);
    setIsEditingBio(false);
  };

  const handleSaveUsername = async () => {
    try {
      setIsSaving(true);
      
      // Check if username has changed
      if (username !== originalUsername) {
        // Check username availability
        const isAvailable = await userService.checkUsernameAvailable(username);
        if (!isAvailable) {
          alert('Username is already taken. Please choose a different one.');
          setIsSaving(false);
          return;
        }
      }
      
      const updatedUser = await userService.updateProfile({ 
        username,
        display_name: displayName 
      });
      setOriginalUsername(username);
      setOriginalDisplayName(displayName);
      setIsEditingUsername(false);
      
      // Update local userData and auth store
      setUserData(updatedUser);
      if (currentUser && token) {
        setAuth({ ...currentUser, ...updatedUser }, token);
      }
    } catch (error) {
      console.error('Failed to update username:', error);
      alert('Failed to update username. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle PFP upload
  const handlePFPUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }
    
    if (file.size > maxSize) {
      alert('Image must be less than 10MB');
      return;
    }
    
    setIsUploadingPFP(true);
    try {
      // Upload to backend
      const imageUrl = await mediaService.uploadImage(file);
      
      // Update profile with new avatar
      const updatedUser = await userService.updateProfile({ avatar_url: imageUrl });
      
      // Update local state
      setUserData(updatedUser);
      if (currentUser && token) {
        setAuth({ ...currentUser, ...updatedUser }, token);
      }
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploadingPFP(false);
      // Reset input
      if (pfpInputRef.current) {
        pfpInputRef.current.value = '';
      }
    }
  };

  const handleCancelUsername = () => {
    setUsername(originalUsername);
    setDisplayName(originalDisplayName);
    setIsEditingUsername(false);
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      backgroundColor: '#19191A' 
    }}>
      {/* TOP BAR */}
      <div 
        className="profile-topbar"
        style={{
          height: '75px',
          backgroundColor: '#19191A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '0 20px',
        }}
      >
        {/* Back Button */}
        <button
          onClick={onBack}
          className="nav-icon-button"
          style={{
            position: 'absolute',
            left: '20px',
            width: '40px',
            height: '40px',
            backgroundColor: '#19191A',
            border: '1px solid transparent',
            backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#BAB9B9" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        {/* Title with Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '15px',
            background: 'linear-gradient(135deg, #C0C0C0, #CBCBCB)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {isOwnProfile ? 'My Profile' : 'User Profile'}
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C0C0C0" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
      </div>

      {/* PROFILE CONTENT */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '45px 20px 40px 20px',
        gap: '30px',
      }}>
        {/* Profile Picture with Rank */}
        <div style={{ 
          position: 'relative',
        }}>
          {/* RankedPFP Component - xlarge size for profile */}
          <RankedPFP 
            rank={userData?.rank || 'RECRUIT'} 
            size="xlarge" 
            showRankLabel={true}
            avatarUrl={userData?.avatar_url}
          />

          {/* Edit PFP Button (only for own profile) - overlapping PFP halfway down on right */}
          {isOwnProfile && (
            <>
              <button
                onClick={() => pfpInputRef.current?.click()}
                disabled={isUploadingPFP}
                className="edit-pfp-button"
                style={{
                  position: 'absolute',
                  top: '75px', // Halfway down the 150px PFP
                  right: '-10px',
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#19191A',
                  border: '1px solid transparent',
                  backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isUploadingPFP ? 'not-allowed' : 'pointer',
                  opacity: isUploadingPFP ? 0.5 : 1,
                }}
              >
                {isUploadingPFP ? (
                  <span style={{ fontSize: '12px', color: '#5BC854' }}>...</span>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#BAB9B9" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                )}
              </button>
              <input
                ref={pfpInputRef}
                type="file"
                accept="image/*"
                onChange={handlePFPUpload}
                style={{ display: 'none' }}
              />
            </>
          )}
        </div>

        {/* Username */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          gap: '5px',
          width: '90%',
          maxWidth: '400px',
          marginTop: '-5px',
        }}>
          {isEditingUsername && isOwnProfile ? (
            <>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                disabled={isSaving}
                style={{
                  backgroundColor: '#19191A',
                  border: '1px solid #333333',
                  borderRadius: '10px',
                  padding: '8px 15px',
                  fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '18px',
                  color: '#D3D3D3',
                  outline: 'none',
                  textAlign: 'center',
                  width: '100%',
                  maxWidth: '250px',
                }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleSaveUsername}
                  disabled={isSaving}
                  style={{
                    width: '30px',
                    height: '30px',
                    backgroundColor: '#19191A',
                    border: '1px solid #5BC854',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    opacity: isSaving ? 0.5 : 1,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5BC854" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </button>
                <button
                  onClick={handleCancelUsername}
                  disabled={isSaving}
                  style={{
                    width: '30px',
                    height: '30px',
                    backgroundColor: '#19191A',
                    border: '1px solid #C85454',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    opacity: isSaving ? 0.5 : 1,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C85454" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '16px',
                background: 'linear-gradient(135deg, #C0C0C0, #CBCBCB)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                @{username || 'loading...'}
              </span>
              {isOwnProfile && (
                <button
                  onClick={() => setIsEditingUsername(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: '1px',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#707070" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons (for other users' profiles) */}
        {!isOwnProfile && (
          <div style={{ 
            width: '90%', 
            maxWidth: '400px',
            backgroundColor: '#19191A',
            border: '1px solid transparent',
            backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
            borderRadius: '30px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 15px',
            gap: '10px',
          }}>
            {/* Add Friend / Remove Friend Button */}
            {friendshipStatus === 'friends' ? (
              <button
                className="profile-pill-button"
                style={{
                  flex: 1,
                  height: '40px',
                  backgroundColor: '#19191A',
                  border: '1px solid transparent',
                  backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  gap: '6px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B9B7B7" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <line x1="12" y1="12" x2="18" y2="12"/>
                </svg>
              </button>
            ) : friendshipStatus === 'pending' ? (
              <button
                className="profile-pill-button"
                style={{
                  flex: 1,
                  height: '40px',
                  backgroundColor: '#19191A',
                  border: '1px solid transparent',
                  backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  gap: '6px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B9B7B7" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </button>
            ) : (
              <button
                onClick={handleAddFriend}
                className="profile-pill-button"
                style={{
                  flex: 1,
                  height: '40px',
                  backgroundColor: '#19191A',
                  border: '1px solid transparent',
                  backgroundImage: showRequestSent 
                    ? 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)'
                    : 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: showRequestSent ? 'not-allowed' : 'pointer',
                  gap: '6px',
                  opacity: showRequestSent ? 0.5 : 1,
                }}
                disabled={showRequestSent}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B9B7B7" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <line x1="15" y1="7" x2="21" y2="7"/>
                  <line x1="18" y1="4" x2="18" y2="10"/>
                </svg>
              </button>
            )}

            {/* Message / Message Request Button */}
            {friendshipStatus === 'friends' ? (
              <button
                className="profile-pill-button-primary"
                style={{
                  flex: 1,
                  height: '40px',
                  backgroundColor: '#19191A',
                  border: '1px solid transparent',
                  backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #5BC854, #082724)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  gap: '6px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5BC854" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
            ) : (
              <button
                className="profile-pill-button"
                style={{
                  flex: 1,
                  height: '40px',
                  backgroundColor: '#19191A',
                  border: '1px solid transparent',
                  backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  gap: '6px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B9B7B7" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
            )}

            {/* Block Button */}
            <button
              onClick={handleBlock}
              className="profile-pill-button-danger"
              style={{
                flex: 1,
                height: '40px',
                backgroundColor: '#19191A',
                border: '1px solid transparent',
                backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #8B2A2A, #5C1717)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                gap: '6px',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C85454" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
            </button>
          </div>
        )}

        {/* Bio Section */}
        <div 
          className="bio-section"
          style={{
            width: '90%',
            maxWidth: '500px',
            backgroundColor: '#19191A',
            border: '1px solid transparent',
            backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
            borderRadius: '20px',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <span style={{
              fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '14px',
              color: '#B9B7B7',
            }}>
              Bio
            </span>
            {isOwnProfile && !isEditingBio && (
              <button
                onClick={() => setIsEditingBio(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#707070" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            )}
          </div>
          {isEditingBio ? (
            <>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={isSaving}
                placeholder="Tell us about yourself..."
                style={{
                  width: '100%',
                  minHeight: '80px',
                  backgroundColor: '#19191A',
                  border: '1px solid #333333',
                  borderRadius: '10px',
                  padding: '10px',
                  fontFamily: 'Be Vietnam Pro, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '12px',
                  color: '#D3D3D3',
                  resize: 'vertical',
                  marginBottom: '10px',
                }}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleSaveBio}
                  disabled={isSaving}
                  style={{
                    width: '30px',
                    height: '30px',
                    backgroundColor: '#19191A',
                    border: '1px solid #5BC854',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    opacity: isSaving ? 0.5 : 1,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5BC854" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </button>
                <button
                  onClick={handleCancelBio}
                  disabled={isSaving}
                  style={{
                    width: '30px',
                    height: '30px',
                    backgroundColor: '#19191A',
                    border: '1px solid #C85454',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    opacity: isSaving ? 0.5 : 1,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C85454" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <p style={{
              fontFamily: 'Be Vietnam Pro, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '12px',
              color: '#909090',
              margin: 0,
              lineHeight: '1.5',
            }}>
              {bio || 'No bio yet.'}
            </p>
          )}
        </div>

        {/* Friend Requests and Friends (only for own profile) */}
        {isOwnProfile && (
          <>
            {/* Friend Requests */}
            <div 
              className="bio-section"
              style={{
                width: '90%',
                maxWidth: '500px',
                backgroundColor: '#19191A',
                border: '1px solid transparent',
                backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                borderRadius: '20px',
                padding: '20px',
              }}
            >
              <span style={{
                fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '14px',
                color: '#B9B7B7',
                marginBottom: '15px',
                display: 'block',
              }}>
                Friend Requests (2)
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {/* Sample request item */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '35px',
                      height: '35px',
                      borderRadius: '50%',
                      border: '2px solid #888888',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#2A2A2A',
                      filter: 'grayscale(100%)',
                    }}>
                      <span style={{ fontSize: '16px' }}>👤</span>
                    </div>
                    <span style={{
                      fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: '12px',
                      color: '#B9B7B7',
                    }}>
                      request_username
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button style={{
                      width: '30px',
                      height: '30px',
                      backgroundColor: '#19191A',
                      border: '1px solid #5BC854',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5BC854" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </button>
                    <button style={{
                      width: '30px',
                      height: '30px',
                      backgroundColor: '#19191A',
                      border: '1px solid #C85454',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C85454" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>
                {/* Horizontal separator */}
                <div style={{
                  height: '1px',
                  backgroundColor: '#333333',
                  margin: '5px 0',
                }} />
                {/* Another sample request */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '35px',
                      height: '35px',
                      borderRadius: '50%',
                      border: '2px solid #888888',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#2A2A2A',
                      filter: 'grayscale(100%)',
                    }}>
                      <span style={{ fontSize: '16px' }}>👤</span>
                    </div>
                    <span style={{
                      fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: '12px',
                      color: '#B9B7B7',
                    }}>
                      another_request
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button style={{
                      width: '30px',
                      height: '30px',
                      backgroundColor: '#19191A',
                      border: '1px solid #5BC854',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5BC854" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </button>
                    <button style={{
                      width: '30px',
                      height: '30px',
                      backgroundColor: '#19191A',
                      border: '1px solid #C85454',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C85454" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Friends List */}
            <div 
              className="bio-section"
              style={{
                width: '90%',
                maxWidth: '500px',
                backgroundColor: '#19191A',
                border: '1px solid transparent',
                backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                borderRadius: '20px',
                padding: '20px',
              }}
            >
              <span style={{
                fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '14px',
                color: '#B9B7B7',
                marginBottom: '15px',
                display: 'block',
              }}>
                Friends (12)
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {/* Sample friend items with separators */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 0',
                }}>
                  <div style={{
                    width: '35px',
                    height: '35px',
                    borderRadius: '50%',
                    border: '2px solid #888888',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#2A2A2A',
                    filter: 'grayscale(100%)',
                  }}>
                    <span style={{ fontSize: '16px' }}>👤</span>
                  </div>
                  <span style={{
                    fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: '12px',
                    color: '#B9B7B7',
                  }}>
                    friend_username
                  </span>
                </div>
                <div style={{
                  height: '1px',
                  backgroundColor: '#333333',
                  margin: '5px 0',
                }} />
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 0',
                }}>
                  <div style={{
                    width: '35px',
                    height: '35px',
                    borderRadius: '50%',
                    border: '2px solid #888888',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#2A2A2A',
                    filter: 'grayscale(100%)',
                  }}>
                    <span style={{ fontSize: '16px' }}>👤</span>
                  </div>
                  <span style={{
                    fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: '12px',
                    color: '#B9B7B7',
                  }}>
                    another_friend
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Request Sent Popup - Bottom Middle */}
      {showRequestSent && (
        <div style={{
          position: 'fixed',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
        }}>
          <span style={{
            fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '16px',
            color: '#5BC854',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
          }}>
            Friend Request Sent!
          </span>
        </div>
      )}

      {/* Block Confirmation Modal */}
      {showBlockConfirm && (
        <div
          onClick={() => setShowBlockConfirm(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bio-section"
            style={{
              backgroundColor: '#19191A',
              border: '1px solid transparent',
              backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              borderRadius: '20px',
              padding: '30px',
              width: '90%',
              maxWidth: '400px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <h2 style={{
              fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '18px',
              background: 'linear-gradient(135deg, #C0C0C0, #CBCBCB)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0,
            }}>
              Block User?
            </h2>
            <p style={{
              fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '14px',
              color: '#B9B7B7',
              margin: 0,
            }}>
              Are you sure you want to block this user? They won't be able to message you or see your profile.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowBlockConfirm(false)}
                className="nav-button"
                style={{
                  flex: 1,
                  height: '45px',
                  backgroundColor: '#19191A',
                  border: '1px solid transparent',
                  backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                  borderRadius: '20px',
                  fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '14px',
                  color: '#B9B7B7',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmBlock}
                className="nav-button"
                style={{
                  flex: 1,
                  height: '45px',
                  backgroundColor: '#19191A',
                  border: '1px solid transparent',
                  backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #8B2A2A, #5C1717)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                  borderRadius: '20px',
                  fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '14px',
                  color: '#C85454',
                  cursor: 'pointer',
                }}
              >
                Block
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


