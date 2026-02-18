import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { MediaModule } from './modules/media/media.module';
import { PolymarketModule } from './modules/polymarket/polymarket.module';
import { AdminModule } from './modules/admin/admin.module';
import { InviteCodesModule } from './modules/invite-codes/invite-codes.module';
import { RanksModule } from './modules/ranks/ranks.module';
import { Conversation, ConversationSchema } from './modules/chat/schemas/conversation.schema';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Scheduling
    ScheduleModule.forRoot(),

    // Rate Limiting
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 seconds
      limit: 100, // 100 requests per minute
    }]),

    // MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    // Import Conversation schema for AppController
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
    ]),

    // Feature modules
    UsersModule,
    AuthModule,
    ChatModule,
    MediaModule,
    PolymarketModule,
    AdminModule,
    InviteCodesModule,
    RanksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}





