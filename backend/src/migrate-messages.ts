import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Message } from './modules/chat/schemas/message.schema';
import { Conversation } from './modules/chat/schemas/conversation.schema';

/**
 * Migration script to move existing messages to a "General" global conversation
 * 
 * Run with: npm run migration:messages
 */
async function migrate() {
  console.log('🚀 Starting migration...');
  
  const app = await NestFactory.createApplicationContext(AppModule);

  const messageModel: Model<Message> = app.get(getModelToken(Message.name));
  const conversationModel: Model<Conversation> = app.get(getModelToken(Conversation.name));

  try {
    // Step 1: Create the "General" global conversation
    console.log('📝 Creating General global conversation...');
    
    let generalConversation = await conversationModel.findOne({
      type: 'global',
      slug: 'general',
    }).exec();

    if (!generalConversation) {
      generalConversation = await conversationModel.create({
        type: 'global',
        slug: 'general',
        title: 'General',
        is_private: false,
        participant_count: 0,
        metadata: {
          description: 'General discussion for all topics',
        },
      });
      console.log('✅ General conversation created:', generalConversation._id);
    } else {
      console.log('ℹ️  General conversation already exists:', generalConversation._id);
    }

    // Step 2: Count messages without conversation_id
    const orphanedMessages = await messageModel.countDocuments({
      conversation_id: { $exists: false },
    }).exec();

    console.log(`📊 Found ${orphanedMessages} messages without conversation_id`);

    if (orphanedMessages === 0) {
      console.log('✅ No messages to migrate!');
      await app.close();
      return;
    }

    // Step 3: Update all orphaned messages
    console.log('🔄 Migrating messages...');
    
    const result = await messageModel.updateMany(
      { conversation_id: { $exists: false } },
      { $set: { conversation_id: generalConversation._id } },
    ).exec();

    console.log(`✅ Migrated ${result.modifiedCount} messages to General conversation`);

    // Step 4: Update last_message_at on the conversation
    const lastMessage = await messageModel.findOne({
      conversation_id: generalConversation._id,
    }).sort({ created_at: -1 }).exec();

    if (lastMessage) {
      await conversationModel.findByIdAndUpdate(generalConversation._id, {
        last_message_at: lastMessage.created_at,
      }).exec();
      console.log('✅ Updated last_message_at on General conversation');
    }

    // Step 5: Create additional default global chats
    console.log('📝 Creating default global chats...');
    
    const defaultChats = [
      { slug: 'crypto', title: 'Crypto', description: 'Cryptocurrency and blockchain discussion' },
      { slug: 'politics', title: 'Politics', description: 'Political predictions and discussion' },
      { slug: 'sports', title: 'Sports', description: 'Sports betting and discussion' },
      { slug: 'entertainment', title: 'Entertainment', description: 'Movies, TV shows, and entertainment' },
    ];

    for (const chat of defaultChats) {
      const existing = await conversationModel.findOne({
        type: 'global',
        slug: chat.slug,
      }).exec();

      if (!existing) {
        await conversationModel.create({
          type: 'global',
          slug: chat.slug,
          title: chat.title,
          is_private: false,
          participant_count: 0,
          metadata: { description: chat.description },
        });
        console.log(`✅ Created ${chat.title} global chat`);
      } else {
        console.log(`ℹ️  ${chat.title} global chat already exists`);
      }
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Migrated messages: ${result.modifiedCount}`);
    console.log(`   - General conversation ID: ${generalConversation._id}`);
    console.log(`   - Total global chats: ${defaultChats.length + 1}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Run migration
migrate()
  .then(() => {
    console.log('\n✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  });

