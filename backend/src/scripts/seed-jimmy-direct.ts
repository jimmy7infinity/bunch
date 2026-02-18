/**
 * Direct MongoDB seed script for jimmy7infinity ranks
 * Run: npx ts-node backend/src/scripts/seed-jimmy-direct.ts
 */

import { MongoClient, ObjectId } from 'mongodb';

const MONGO_URI = 'mongodb+srv://jimmy7:NZBbmtf34O9y7I42@polybanter.dnsdecj.mongodb.net/polybanter?retryWrites=true&w=majority';
const JIMMY_USER_ID = '6954dcf967b3dbdf7c2f2cd1';

async function seedRanks() {
  console.log('🌱 Seeding ranks for jimmy7infinity...\n');
  
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db('polybanter');
    const specialRanksCollection = db.collection('specialranks');
    const userInventoryCollection = db.collection('userinventories');
    const usersCollection = db.collection('users');
    
    const userId = new ObjectId(JIMMY_USER_ID);
    const now = new Date();

    // Clear existing ranks for clean slate
    await specialRanksCollection.deleteMany({ user_id: userId });
    await userInventoryCollection.deleteOne({ user_id: userId });
    console.log('🧹 Cleared existing ranks\n');

    // Create special ranks
    const ranks = [
      {
        user_id: userId,
        rank_name: 'DIAMOND',
        assigned_at: now,
        is_active: true,
        criteria_met: { hold_days: 35, position_count: 5, total_size: 25000 },
        last_checked_at: now,
      },
      {
        user_id: userId,
        rank_name: 'ON FIRE',
        assigned_at: now,
        expires_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
        is_active: true,
        criteria_met: { win_streak: 8, total_profit: 1250 },
        last_checked_at: now,
      },
      {
        user_id: userId,
        rank_name: 'DANK',
        assigned_at: now,
        expires_at: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
        is_active: true,
        criteria_met: { laugh_reactions: 73, messages_count: 45 },
        last_checked_at: now,
      },
      {
        user_id: userId,
        rank_name: 'EARLY',
        assigned_at: now,
        is_active: true,
        criteria_met: { reason: 'Early supporter' },
        last_checked_at: now,
      },
    ];

    await specialRanksCollection.insertMany(ranks);
    console.log('✅ Created special ranks:');
    ranks.forEach(r => console.log(`  💎 ${r.rank_name}`));

    // Create inventory
    const inventory = {
      user_id: userId,
      items: [
        { item_id: 'DIAMOND', item_type: 'rank_accent', unlocked_at: now, unlock_method: 'special_rank' },
        { item_id: 'ON FIRE', item_type: 'rank_accent', unlocked_at: now, unlock_method: 'special_rank' },
        { item_id: 'DANK', item_type: 'rank_accent', unlocked_at: now, unlock_method: 'special_rank' },
        { item_id: 'EARLY', item_type: 'rank_accent', unlocked_at: now, unlock_method: 'special_rank' },
        { item_id: 'RECRUIT+', item_type: 'rank_accent', unlocked_at: now, unlock_method: 'rank_progression' },
        { item_id: 'VETERAN+', item_type: 'rank_accent', unlocked_at: now, unlock_method: 'rank_progression' },
        { item_id: 'CAPTAIN+', item_type: 'rank_accent', unlocked_at: now, unlock_method: 'rank_progression' },
      ],
      equipped: {
        rank_accent: null,
        pfp_effect: null,
        chat_badge: null,
        emoji_pack: null,
      },
      updated_at: now,
    };

    await userInventoryCollection.insertOne(inventory);
    console.log('\n✅ Created inventory with items:');
    inventory.items.forEach(item => console.log(`  ✨ ${item.item_type}: ${item.item_id}`));

    // Update user model with special ranks
    await usersCollection.updateOne(
      { _id: userId },
      { 
        $set: { 
          special_ranks: ['DIAMOND', 'ON FIRE', 'DANK', 'EARLY'],
          equipped_accent: null 
        } 
      }
    );
    console.log('\n✅ Updated user model with special_ranks\n');

    console.log('🎉 All done! Check your Settings > Rank Accents section\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

seedRanks();
