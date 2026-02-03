import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class BetaGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if beta mode is enabled
    const betaMode = this.configService.get<string>('BETA_MODE') === 'true';
    
    // If beta mode is disabled, allow all users
    if (!betaMode) {
      return true;
    }

    // Beta mode is enabled, check user's betaAccess
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Fetch fresh user data to check betaAccess
    const fullUser = await this.usersService.findById(user.userId);

    if (!fullUser) {
      throw new ForbiddenException('User not found');
    }

    // Check if user has beta access
    if (!fullUser.betaAccess) {
      throw new ForbiddenException({
        message: 'Beta access required. Please activate your account with an invite code.',
        requiresBetaActivation: true,
      });
    }

    return true;
  }
}
