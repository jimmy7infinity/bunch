import React, { useState } from 'react';
import { activateBeta } from '../../services/api';
import './BetaActivation.css';

interface BetaActivationProps {
  onSuccess: () => void;
  onLogout: () => void;
}

export const BetaActivation: React.FC<BetaActivationProps> = ({ onSuccess, onLogout }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code.trim()) {
      setError('Please enter an invite code');
      return;
    }

    // Validate format
    if (!/^BUNCH-[A-Z2-9]{4}-[A-Z2-9]{2}$/.test(code.trim().toUpperCase())) {
      setError('Invalid code format. Expected: BUNCH-XXXX-XX');
      return;
    }

    setLoading(true);

    try {
      await activateBeta(code.trim().toUpperCase());
      onSuccess();
    } catch (err: any) {
      console.error('Beta activation failed:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Invalid or expired invite code'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCode = (input: string) => {
    // Auto-format as user types: BUNCH-XXXX-XX
    const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (cleaned.length <= 5) {
      return cleaned;
    } else if (cleaned.length <= 9) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    } else {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 9)}-${cleaned.slice(9, 11)}`;
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCode(e.target.value);
    setCode(formatted);
    setError('');
  };

  return (
    <div className="beta-activation-container">
      <div className="beta-activation-card">
        <div className="beta-activation-header">
          <div className="beta-icon">🚀</div>
          <h1 className="beta-title">Welcome to Bunch Beta</h1>
          <p className="beta-subtitle">
            Enter your invite code to activate your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="beta-form">
          <div className="form-group">
            <label htmlFor="invite-code" className="form-label">
              Invite Code
            </label>
            <input
              id="invite-code"
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder="BUNCH-XXXX-XX"
              maxLength={14}
              className="form-input"
              disabled={loading}
              autoFocus
            />
            {error && (
              <p className="error-message">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={loading || !code.trim()}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Activating...
              </>
            ) : (
              'Activate Beta Access'
            )}
          </button>
        </form>

        <div className="beta-footer">
          <p className="footer-text">
            Don't have an invite code?{' '}
            <a 
              href="https://x.com/bunchxyz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
            >
              Request one
            </a>
          </p>
          <button onClick={onLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
