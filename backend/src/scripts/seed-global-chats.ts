import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Conversation } from '../modules/chat/schemas/conversation.schema';

async function seedGlobalChats() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const conversationModel = app.get<Model<Conversation>>(
    getModelToken(Conversation.name),
  );

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

  console.log('🌱 Seeding global chats...');

  for (const chat of globalChats) {
    const existing = await conversationModel.findOne({
      type: 'global',
      slug: chat.slug,
    });

    if (existing) {
      console.log(`✓ ${chat.title} already exists`);
    } else {
      await conversationModel.create({
        type: 'global',
        title: chat.title,
        slug: chat.slug,
        is_private: false,
        participant_count: 0,
        created_at: new Date(),
        updated_at: new Date(),
      });
      console.log(`✓ Created ${chat.title}`);
    }
  }

  console.log('✅ Global chats seeded successfully!');
  await app.close();
  process.exit(0);
}

seedGlobalChats().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
