import { Module, forwardRef } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TwitterOAuthService } from './twitter-oauth.service';
import { BannedUserGuard } from './guards/banned-user.guard';
import { AdminGuard } from './guards/admin.guard';
import { UsersModule } from '../users/users.module';
import { PolymarketModule } from '../polymarket/polymarket.module';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    UsersModule,
    forwardRef(() => PolymarketModule),
    PassportModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    TwitterOAuthService,
    AdminGuard,
    {
      provide: APP_GUARD,
      useClass: BannedUserGuard,
    },
  ],
  exports: [AuthService, AdminGuard],
})
export class AuthModule {}



