import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation } from '../../modules/chat/schemas/conversation.schema';

/**
 * Cleanup script to remove null/invalid conversations from database
 */
async function cleanupNullConversations() {
  console.log('🧹 Starting null conversation cleanup...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const conversationModel = app.get<Model<Conversation>>(getModelToken(Conversation.name));

  try {
    // Find conversations with null or missing critical fields
    const nullConversations = await conversationModel.find({
      $or: [
        { _id: null },
        { type: null },
        { type: { $exists: false } },
      ]
    }).exec();

    console.log(`📊 Found ${nullConversations.length} null/invalid conversations`);

    if (nullConversations.length > 0) {
      // Delete them
      const result = await conversationModel.deleteMany({
        $or: [
          { _id: null },
          { type: null },
          { type: { $exists: false } },
        ]
      });

      console.log(`✅ Deleted ${result.deletedCount} null conversations`);
    } else {
      console.log('✅ No null conversations found - database is clean!');
    }

    // Also check for conversations with empty/invalid titles
    const invalidTitles = await conversationModel.find({
      $or: [
        { title: null },
        { title: '' },
      ]
    }).exec();

    if (invalidTitles.length > 0) {
      console.log(`⚠️  Found ${invalidTitles.length} conversations with null/empty titles`);
      console.log('These may need manual review or default titles assigned.');
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await app.close();
    console.log('🏁 Cleanup complete');
  }
}

// Run the cleanup
cleanupNullConversations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
