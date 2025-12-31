import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-twitter';
import { ConfigService } from '@nestjs/config';
import { RedisOAuthStore } from './redis-oauth-store';

@Injectable()
export class TwitterStrategy extends PassportStrategy(Strategy, 'twitter') {
  private oauthStore: RedisOAuthStore;

  constructor(private configService: ConfigService) {
    const oauthStore = new RedisOAuthStore();
    
    super({
      consumerKey: configService.get<string>('TWITTER_CONSUMER_KEY'),
      consumerSecret: configService.get<string>('TWITTER_CONSUMER_SECRET'),
      callbackURL: configService.get<string>('TWITTER_CALLBACK_URL'),
      includeEmail: true,
      sessionKey: 'oauth',
      store: {
        get: async (req: any, callback: any) => {
          try {
            const token = req.query?.oauth_token;
            if (!token) {
              return callback(new Error('No oauth_token in request'));
            }
            const data = await oauthStore.get(`oauth:${token}`);
            callback(null, data);
          } catch (error) {
            callback(error);
          }
        },
        set: async (req: any, token: string, tokenSecret: string, callback: any) => {
          try {
            await oauthStore.set(`oauth:${token}`, { token, tokenSecret });
            callback();
          } catch (error) {
            callback(error);
          }
        },
        destroy: async (req: any, token: string, callback: any) => {
          try {
            await oauthStore.destroy(`oauth:${token}`);
            callback();
          } catch (error) {
            callback(error);
          }
        },
      },
    });
    
    this.oauthStore = oauthStore;
  }

  async validate(token: string, tokenSecret: string, profile: any) {
    return {
      id: profile.id,
      username: profile.username,
      name: profile.displayName,
      profile_image_url: profile.photos?.[0]?.value,
    };
  }
}
