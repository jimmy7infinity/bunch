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
    { name: 'Politics', slug: 'politics' },
    { name: 'Sports', slug: 'sports' },
    { name: 'Crypto', slug: 'crypto' },
    { name: 'Finance', slug: 'finance' },
    { name: 'Geopolitics', slug: 'geopolitics' },
    { name: 'Earnings', slug: 'earnings' },
    { name: 'Tech', slug: 'tech' },
    { name: 'Culture', slug: 'culture' },
    { name: 'World Economy', slug: 'world-economy' },
    { name: 'Climate & Science', slug: 'climate-science' },
    { name: 'Elections', slug: 'elections' },
    { name: 'Mentions', slug: 'mentions' },
  ];

  console.log('🌱 Seeding global chats...');

  for (const chat of globalChats) {
    const existing = await conversationModel.findOne({
      type: 'global',
      slug: chat.slug,
    });

    if (existing) {
      console.log(`✓ ${chat.name} already exists`);
    } else {
      await conversationModel.create({
        type: 'global',
        name: chat.name,
        slug: chat.slug,
        participants: [],
        created_at: new Date(),
        updated_at: new Date(),
      });
      console.log(`✓ Created ${chat.name}`);
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
