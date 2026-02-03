import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class TwitterOAuthService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly callbackUrl: string;
  private readonly codeVerifiers = new Map<string, string>();

  constructor(private configService: ConfigService) {
    this.clientId = configService.get<string>('TWITTER_CLIENT_ID') || '';
    this.clientSecret = configService.get<string>('TWITTER_CLIENT_SECRET') || '';
    this.callbackUrl = configService.get<string>('TWITTER_CALLBACK_URL') || '';
  }

  generateCodeChallenge(): { codeVerifier: string; codeChallenge: string; state: string } {
    // Generate code verifier (random string)
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    
    // Generate code challenge (SHA256 hash of verifier)
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
    
    // Generate state for CSRF protection
    const state = crypto.randomBytes(16).toString('base64url');
    
    // Store verifier for later use in callback
    this.codeVerifiers.set(state, codeVerifier);
    
    return { codeVerifier, codeChallenge, state };
  }

  getAuthorizationUrl(extensionRedirectUri?: string): string {
    const { codeChallenge, state: randomState } = this.generateCodeChallenge();
    
    // Encode redirect_uri and CSRF token into state parameter (fully stateless)
    const stateData = {
      csrf: randomState,
      redirect_uri: extensionRedirectUri,
    };
    
    const state = Buffer.from(JSON.stringify(stateData)).toString('base64url');
    console.log('🔗 Encoded state with redirect_uri:', extensionRedirectUri);
    
    // Store code verifier by CSRF token (not by full state)
    this.codeVerifiers.set(randomState, this.codeVerifiers.get(randomState)!);
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      scope: 'tweet.read users.read offline.access',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
  }
  
  getRedirectUri(state: string): string | undefined {
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64url').toString());
      console.log('🔍 Decoded state:', decoded);
      return decoded.redirect_uri;
    } catch (error) {
      console.error('❌ Failed to decode state:', error);
      return undefined;
    }
  }

  async handleCallback(code: string, state: string): Promise<any> {
    // Decode state to get CSRF token
    let csrfToken: string;
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64url').toString());
      csrfToken = decoded.csrf;
      console.log('🔍 Decoded CSRF token from state:', csrfToken);
    } catch (error) {
      throw new Error('Invalid state parameter: failed to decode');
    }
    
    const codeVerifier = this.codeVerifiers.get(csrfToken);
    
    if (!codeVerifier) {
      throw new Error('Invalid state parameter: code verifier not found');
    }

    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://api.twitter.com/2/oauth2/token',
      new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: this.clientId,
        redirect_uri: this.callbackUrl,
        code_verifier: codeVerifier,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
        },
      }
    );

    const { access_token, refresh_token } = tokenResponse.data;

    // Get user profile
    const userResponse = await axios.get('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
      params: {
        'user.fields': 'id,name,username,profile_image_url,description',
      },
    });

    // Clean up stored verifier
    this.codeVerifiers.delete(state);

    return {
      accessToken: access_token,
      refreshToken: refresh_token,
      profile: userResponse.data.data,
    };
  }
}

