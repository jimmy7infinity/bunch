/**
 * Cleanup inactive chats to keep database lean
 * 
 * Deletion Rules (MVP):
 * - Delete if: total messages < 200 AND no messages for 7 days
 * - Never delete if: messages >= 200 (historical value)
 * 
 * Safe to run multiple times (idempotent)
 * Recommended schedule: Once per day (Railway cron)
 */

import { NestFactory } from '@nestjs/core';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { AppModule } from '../../app.module';
import { Conversation, ConversationDocument } from '../../modules/chat/schemas/conversation.schema';
import { Message, MessageDocument } from '../../modules/chat/schemas/message.schema';
import { Participant, ParticipantDocument } from '../../modules/chat/schemas/participant.schema';
import { daysAgo } from '../utils/time';

interface CleanupStats {
  totalChatsScanned: number;
  chatsDeleted: number;
  messagesDeleted: number;
  participantsDeleted: number;
  deletedChatIds: string[];
}

/**
 * Main cleanup function
 */
export async function cleanupInactiveChats(): Promise<CleanupStats> {
  const app = await NestFactory.createApplicationContext(AppModule);

  const conversationModel = app.get<Model<ConversationDocument>>(
    getModelToken(Conversation.name)
  );
  const messageModel = app.get<Model<MessageDocument>>(
    getModelToken(Message.name)
  );
  const participantModel = app.get<Model<ParticipantDocument>>(
    getModelToken(Participant.name)
  );

  const stats: CleanupStats = {
    totalChatsScanned: 0,
    chatsDeleted: 0,
    messagesDeleted: 0,
    participantsDeleted: 0,
    deletedChatIds: [],
  };

  console.log('🧹 Starting chat cleanup...');
  console.log('Deletion criteria:');
  console.log('  - Messages < 200');
  console.log('  - No activity for 7+ days');
  console.log('');

  try {
    // Get all conversations
    const conversations = await conversationModel.find({}).exec();
    stats.totalChatsScanned = conversations.length;

    console.log(`Found ${conversations.length} conversations to scan`);

    // Threshold date (7 days ago)
    const inactiveThreshold = daysAgo(7);

    for (const conversation of conversations) {
      // Count messages for this conversation
      const messageCount = await messageModel.countDocuments({
        conversation_id: conversation._id,
        deleted: false,
      });

      // Skip if has 200+ messages (historical value)
      if (messageCount >= 200) {
        continue;
      }

      // Check last message date
      const lastMessageDate = conversation.last_message_at;

      // Skip if no last message date (shouldn't happen, but be safe)
      if (!lastMessageDate) {
        continue;
      }

      // Check if inactive (no messages for 7+ days)
      if (lastMessageDate > inactiveThreshold) {
        continue; // Still active
      }

      // This chat meets deletion criteria
      console.log(`🗑️  Deleting chat: ${conversation.title || conversation._id}`);
      console.log(`   Messages: ${messageCount}, Last activity: ${lastMessageDate.toISOString()}`);

      // Delete messages
      const messagesDeleted = await messageModel.deleteMany({
        conversation_id: conversation._id,
      });
      stats.messagesDeleted += messagesDeleted.deletedCount || 0;

      // Delete participants
      const participantsDeleted = await participantModel.deleteMany({
        conversation_id: conversation._id,
      });
      stats.participantsDeleted += participantsDeleted.deletedCount || 0;

      // Delete conversation
      await conversationModel.deleteOne({ _id: conversation._id });
      stats.chatsDeleted++;
      stats.deletedChatIds.push(conversation._id.toString());
    }

    console.log('');
    console.log('✅ Cleanup complete!');
    console.log(`   Chats scanned: ${stats.totalChatsScanned}`);
    console.log(`   Chats deleted: ${stats.chatsDeleted}`);
    console.log(`   Messages deleted: ${stats.messagesDeleted}`);
    console.log(`   Participants deleted: ${stats.participantsDeleted}`);

    return stats;
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
  } finally {
    await app.close();
  }
}

/**
 * Run as standalone script
 */
if (require.main === module) {
  cleanupInactiveChats()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}
