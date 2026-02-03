import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../users/schemas/user.schema';

@Injectable()
export class BannedUserGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;

    if (!userId) {
      // No user authenticated, let other guards handle it
      return true;
    }

    // Check if user is banned
    const user = await this.userModel.findById(userId).select('status banned_reason').exec();

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    if (user.status === 'banned') {
      throw new ForbiddenException(`Your account has been banned. Reason: ${user.banned_reason || 'Violation of terms of service'}`);
    }

    if (user.status === 'suspended') {
      throw new ForbiddenException('Your account is temporarily suspended');
    }

    if (user.status === 'deleted') {
      throw new ForbiddenException('This account has been deleted');
    }

    return true;
  }
}
