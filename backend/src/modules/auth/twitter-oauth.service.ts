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
    this.clientId = configService.get<string>('TWITTER_CLIENT_ID');
    this.clientSecret = configService.get<string>('TWITTER_CLIENT_SECRET');
    this.callbackUrl = configService.get<string>('TWITTER_CALLBACK_URL');
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

  getAuthorizationUrl(): string {
    const { codeChallenge, state } = this.generateCodeChallenge();
    
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

  async handleCallback(code: string, state: string): Promise<any> {
    const codeVerifier = this.codeVerifiers.get(state);
    
    if (!codeVerifier) {
      throw new Error('Invalid state parameter');
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
        'user.fields': 'id,name,username,profile_image_url',
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

