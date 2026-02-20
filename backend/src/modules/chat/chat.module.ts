import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatScheduler } from './chat.scheduler';
import { Message, MessageSchema } from './schemas/message.schema';
import { Conversation, ConversationSchema } from './schemas/conversation.schema';
import { Participant, ParticipantSchema } from './schemas/participant.schema';
import { MarketUserStatus, MarketUserStatusSchema } from './schemas/market-user-status.schema';
import { Report, ReportSchema } from './schemas/report.schema';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Conversation.name, schema: ConversationSchema },
      { name: Participant.name, schema: ParticipantSchema },
      { name: MarketUserStatus.name, schema: MarketUserStatusSchema },
      { name: Report.name, schema: ReportSchema },
    ]),
    UsersModule,
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService, ChatScheduler],
  exports: [ChatService],
})
export class ChatModule {}

