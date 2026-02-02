import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../users/schemas/user.schema';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;

    if (!userId) {
      throw new ForbiddenException('Authentication required');
    }

    // Check if user has admin, moderator, or creator role
    const user = await this.userModel.findById(userId).select('role status').exec();

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    if (user.status === 'banned' || user.status === 'suspended') {
      throw new ForbiddenException('Account is banned or suspended');
    }

    if (!['admin', 'moderator', 'creator'].includes(user.role)) {
      throw new ForbiddenException('Admin access required');
    }

    // Attach user role to request for further use
    request.userRole = user.role;

    return true;
  }
}
