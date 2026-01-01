import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation, ConversationDocument } from './modules/chat/schemas/conversation.schema';
import { Message, MessageDocument } from './modules/chat/schemas/message.schema';

async function backfillLastMessages() {
  console.log('Starting backfill of last_message_id for all conversations...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const conversationModel = app.get<Model<ConversationDocument>>(
    getModelToken(Conversation.name),
  );
  const messageModel = app.get<Model<MessageDocument>>(
    getModelToken(Message.name),
  );

  try {
    // Get all conversations
    const conversations = await conversationModel.find({}).exec();
    console.log(`Found ${conversations.length} conversations to process`);

    let updated = 0;
    let skipped = 0;

    for (const conversation of conversations) {
      // Find the most recent message for this conversation
      const lastMessage = await messageModel
        .findOne({
          conversation_id: conversation._id,
          deleted: false,
        })
        .sort({ created_at: -1 })
        .exec();

      if (lastMessage) {
        // Update the conversation with the last message
        await conversationModel.findByIdAndUpdate(conversation._id, {
          last_message_id: lastMessage._id,
          last_message_at: lastMessage.createdAt || lastMessage.created_at,
        }).exec();
        
        updated++;
        console.log(
          `✓ Updated conversation "${conversation.title || conversation._id}" with last message from ${lastMessage.createdAt || lastMessage.created_at}`,
        );
      } else {
        skipped++;
        console.log(
          `- Skipped conversation "${conversation.title || conversation._id}" (no messages)`,
        );
      }
    }

    console.log('\n=== Backfill Complete ===');
    console.log(`Updated: ${updated} conversations`);
    console.log(`Skipped: ${skipped} conversations (no messages)`);
  } catch (error) {
    console.error('Error during backfill:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Run the migration
backfillLastMessages()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

