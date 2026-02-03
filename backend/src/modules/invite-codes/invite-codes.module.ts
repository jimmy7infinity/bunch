import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InviteCodesService } from './invite-codes.service';
import { InviteCodesController } from './invite-codes.controller';
import { InviteCode, InviteCodeSchema } from './schemas/invite-code.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { UsersModule } from '../users/users.module';
import { AdminGuard } from '../auth/guards/admin.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InviteCode.name, schema: InviteCodeSchema },
      { name: User.name, schema: UserSchema },
    ]),
    UsersModule,
  ],
  controllers: [InviteCodesController],
  providers: [InviteCodesService, AdminGuard],
  exports: [InviteCodesService],
})
export class InviteCodesModule {}
