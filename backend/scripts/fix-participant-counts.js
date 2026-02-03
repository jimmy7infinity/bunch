/**
 * Fix participant counts for all conversations
 * 
 * This script recalculates the correct participant_count for each conversation
 * by counting actual participants in the participants collection.
 * 
 * Usage:
 *   node scripts/fix-participant-counts.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

async function fixParticipantCounts() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    const conversationsCollection = db.collection('conversations');
    const participantsCollection = db.collection('participants');

    // Get all conversations
    const conversations = await conversationsCollection.find({}).toArray();
    console.log(`\n📊 Found ${conversations.length} conversations\n`);

    let fixed = 0;
    let correct = 0;

    for (const conversation of conversations) {
      // Count actual participants
      const actualCount = await participantsCollection.countDocuments({
        conversation_id: conversation._id,
      });

      const storedCount = conversation.participant_count || 0;

      if (actualCount !== storedCount) {
        console.log(`🔧 Fixing conversation ${conversation._id}`);
        console.log(`   Type: ${conversation.type}`);
        console.log(`   Title: ${conversation.title || conversation.slug || conversation.market_id || 'DM'}`);
        console.log(`   Stored count: ${storedCount} → Actual count: ${actualCount}`);

        // Update the count
        await conversationsCollection.updateOne(
          { _id: conversation._id },
          { $set: { participant_count: actualCount } }
        );

        fixed++;
      } else {
        correct++;
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`   Fixed: ${fixed} conversations`);
    console.log(`   Already correct: ${correct} conversations`);
    console.log(`   Total: ${conversations.length} conversations\n`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

fixParticipantCounts();
