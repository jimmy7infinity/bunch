import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation, ConversationDocument } from './modules/chat/schemas/conversation.schema';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
  ) {}

  @Get()
  getHello(): object {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(): object {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Grex API',
      version: 'oauth2-v1',
    };
  }

  @Post('seed-global-chats')
  async seedGlobalChats() {
    const globalChats = [
      { title: 'General', slug: 'general' },
      { title: 'Politics', slug: 'politics' },
      { title: 'Sports', slug: 'sports' },
      { title: 'Crypto', slug: 'crypto' },
      { title: 'Finance', slug: 'finance' },
      { title: 'Geopolitics', slug: 'geopolitics' },
      { title: 'Earnings', slug: 'earnings' },
      { title: 'Tech', slug: 'tech' },
      { title: 'Culture', slug: 'culture' },
      { title: 'World Economy', slug: 'world-economy' },
      { title: 'Climate & Science', slug: 'climate-science' },
      { title: 'Elections', slug: 'elections' },
      { title: 'Mentions', slug: 'mentions' },
    ];

    const results = [];
    for (const chat of globalChats) {
      const existing = await this.conversationModel.findOne({
        type: 'global',
        slug: chat.slug,
      });

      if (existing) {
        results.push({ chat: chat.title, status: 'already exists' });
      } else {
        await this.conversationModel.create({
          type: 'global',
          title: chat.title,
          slug: chat.slug,
          is_private: false,
          participant_count: 0,
          created_at: new Date(),
          updated_at: new Date(),
        });
        results.push({ chat: chat.title, status: 'created' });
      }
    }

    return {
      success: true,
      message: 'Global chats seeded',
      results,
    };
  }
}





