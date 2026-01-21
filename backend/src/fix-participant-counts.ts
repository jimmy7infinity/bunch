import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

/**
 * Script to fix participant_count for all conversations
 * 
 * This recalculates the count based on actual participants in the database
 */
async function fixParticipantCounts() {
  console.log('🔧 Starting participant count fix...\n');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const conversationModel = app.get<Model<any>>(getModelToken('Conversation'));
    const participantModel = app.get<Model<any>>(getModelToken('Participant'));

    // Get all conversations
    const conversations = await conversationModel.find({}).exec();
    console.log(`Found ${conversations.length} conversations to process\n`);

    let fixed = 0;
    let unchanged = 0;

    for (const conversation of conversations) {
      // Count actual participants
      const actualCount = await participantModel.countDocuments({
        conversation_id: conversation._id,
      }).exec();

      const currentCount = conversation.participant_count || 0;

      if (actualCount !== currentCount) {
        // Update the count
        await conversationModel.findByIdAndUpdate(conversation._id, {
          participant_count: actualCount,
        }).exec();

        console.log(`✅ Fixed: "${conversation.title || conversation.name || 'Unnamed'}" (${conversation.type})`);
        console.log(`   Old count: ${currentCount} → New count: ${actualCount}`);
        fixed++;
      } else {
        unchanged++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Fixed: ${fixed} conversations`);
    console.log(`   Unchanged: ${unchanged} conversations`);
    console.log(`   Total: ${conversations.length} conversations`);
    console.log('\n✅ Participant count fix complete!');

  } catch (error) {
    console.error('❌ Error fixing participant counts:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

fixParticipantCounts();
