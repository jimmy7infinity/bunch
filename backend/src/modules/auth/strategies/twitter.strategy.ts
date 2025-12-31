import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from '@superfaceai/passport-twitter-oauth2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TwitterStrategy extends PassportStrategy(Strategy, 'twitter') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('TWITTER_CLIENT_ID'),
      clientSecret: configService.get<string>('TWITTER_CLIENT_SECRET'),
      callbackURL: configService.get<string>('TWITTER_CALLBACK_URL'),
      clientType: 'confidential',
      scope: ['tweet.read', 'users.read', 'offline.access'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    return {
      id: profile.id,
      username: profile.username,
      name: profile.name,
      profile_image_url: profile.profile_image_url,
    };
  }
}
