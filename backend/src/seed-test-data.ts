import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Model, Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './modules/users/schemas/user.schema';
import { Block } from './modules/users/schemas/block.schema';
import { FriendRequest } from './modules/users/schemas/friend-request.schema';
import { Friendship } from './modules/users/schemas/friendship.schema';
import { Conversation } from './modules/chat/schemas/conversation.schema';
import { Participant } from './modules/chat/schemas/participant.schema';
import { Message } from './modules/chat/schemas/message.schema';
import { createHash } from 'crypto';

async function seed() {
  console.log('🌱 Seeding database...');
  
  const app = await NestFactory.createApplicationContext(AppModule);

  const userModel: Model<User> = app.get(getModelToken(User.name));
  const blockModel: Model<Block> = app.get(getModelToken(Block.name));
  const friendRequestModel: Model<FriendRequest> = app.get(getModelToken(FriendRequest.name));
  const friendshipModel: Model<Friendship> = app.get(getModelToken(Friendship.name));
  const conversationModel: Model<Conversation> = app.get(getModelToken(Conversation.name));
  const participantModel: Model<Participant> = app.get(getModelToken(Participant.name));
  const messageModel: Model<Message> = app.get(getModelToken(Message.name));

  try {
    // Clear all data
    await userModel.deleteMany({});
    await blockModel.deleteMany({});
    await friendRequestModel.deleteMany({});
    await friendshipModel.deleteMany({});
    await conversationModel.deleteMany({});
    await participantModel.deleteMany({});
    await messageModel.deleteMany({});

    // Create users with realistic data
    const jimmy = await userModel.create({
      _id: new Types.ObjectId('6954dcf967b3dbdf7c2f2cd1'),
      twitter_id: '4406698455',
      twitter_username: 'jimmy7infinity',
      twitter_avatar: 'https://pbs.twimg.com/profile_images/1713120244443848704/76Va0izy_normal.jpg',
      username: 'jimmy7infinity',
      display_name: 'jimmy∞',
      avatar_url: 'https://pbs.twimg.com/profile_images/1713120244443848704/76Va0izy_normal.jpg',
      bio: 'Building PolyBanter | Prediction markets enthusiast',
      status: 'active',
      role: 'admin',
      is_online: true,
    });

    const users = await userModel.create([
      {
        twitter_id: '891234567',
        twitter_username: 'cryptoalice',
        username: 'cryptoalice',
        display_name: 'Alice Chen',
        avatar_url: 'https://i.pravatar.cc/150?img=1',
        bio: 'ETH maxi | DeFi researcher',
        status: 'active',
        role: 'user',
        is_online: true,
      },
      {
        twitter_id: '892345678',
        twitter_username: 'bobtrader',
        username: 'bobtrader',
        display_name: 'Bob Martinez',
        avatar_url: 'https://i.pravatar.cc/150?img=2',
        bio: 'Day trader | Options strategist',
        status: 'active',
        role: 'moderator',
        is_online: true,
      },
      {
        twitter_id: '893456789',
        twitter_username: 'charlienft',
        username: 'charlienft',
        display_name: 'Charlie Wong',
        avatar_url: 'https://i.pravatar.cc/150?img=3',
        bio: 'NFT collector | Web3 builder',
        status: 'active',
        role: 'user',
        is_online: false,
      },
      {
        twitter_id: '894567890',
        twitter_username: 'dianasmith',
        username: 'dianasmith',
        display_name: 'Diana Smith',
        avatar_url: 'https://i.pravatar.cc/150?img=4',
        bio: 'Smart contract developer',
        status: 'active',
        role: 'user',
        is_online: true,
      },
      {
        twitter_id: '895678901',
        twitter_username: 'evewilliams',
        username: 'evewilliams',
        display_name: 'Eve Williams',
        avatar_url: 'https://i.pravatar.cc/150?img=5',
        bio: 'Risk analyst | Market maker',
        status: 'active',
        role: 'user',
        is_online: false,
      },
      {
        twitter_id: '896789012',
        twitter_username: 'frankjohnson',
        username: 'frankjohnson',
        display_name: 'Frank Johnson',
        avatar_url: 'https://i.pravatar.cc/150?img=6',
        bio: 'HODL since 2013',
        status: 'active',
        role: 'user',
        is_online: true,
      },
      {
        twitter_id: '897890123',
        twitter_username: 'gracedavis',
        username: 'gracedavis',
        display_name: 'Grace Davis',
        avatar_url: 'https://i.pravatar.cc/150?img=7',
        bio: 'Data scientist | ML engineer',
        status: 'active',
        role: 'user',
        is_online: true,
      },
      {
        twitter_id: '898901234',
        twitter_username: 'hankmiller',
        username: 'hankmiller',
        display_name: 'Hank Miller',
        avatar_url: 'https://i.pravatar.cc/150?img=8',
        bio: 'Whale watcher | Macro investor',
        status: 'active',
        role: 'user',
        is_online: false,
      },
      {
        twitter_id: '899012345',
        twitter_username: 'iristaylor',
        username: 'iristaylor',
        display_name: 'Iris Taylor',
        avatar_url: 'https://i.pravatar.cc/150?img=9',
        bio: 'AI researcher | Prediction models',
        status: 'active',
        role: 'user',
        is_online: true,
      },
      {
        twitter_id: '890123456',
        twitter_username: 'jackanderson',
        username: 'jackanderson',
        display_name: 'Jack Anderson',
        avatar_url: 'https://i.pravatar.cc/150?img=10',
        bio: 'Controversial takes',
        status: 'active',
        role: 'user',
        is_online: true,
      },
      {
        twitter_id: '881234567',
        twitter_username: 'karenthomas',
        username: 'karenthomas',
        display_name: 'Karen Thomas',
        avatar_url: 'https://i.pravatar.cc/150?img=11',
        bio: 'Crypto promoter',
        status: 'suspended',
        role: 'user',
        suspended_until: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
        is_online: false,
      },
    ]);

    const [alice, bob, charlie, diana, eve, frank, grace, hank, iris, jack, karen] = users;

    // Create friendships
    await friendshipModel.create([
      {
        user1_id: jimmy._id < alice._id ? jimmy._id : alice._id,
        user2_id: jimmy._id < alice._id ? alice._id : jimmy._id,
      },
      {
        user1_id: jimmy._id < bob._id ? jimmy._id : bob._id,
        user2_id: jimmy._id < bob._id ? bob._id : jimmy._id,
      },
      {
        user1_id: alice._id < bob._id ? alice._id : bob._id,
        user2_id: alice._id < bob._id ? bob._id : alice._id,
      },
    ]);

    // Create friend requests
    await friendRequestModel.create([
      {
        from_user_id: hank._id,
        to_user_id: jimmy._id,
        status: 'pending',
        message: 'Hey, love PolyBanter! Let\'s connect',
      },
      {
        from_user_id: iris._id,
        to_user_id: jimmy._id,
        status: 'pending',
        message: 'Would like to discuss prediction models with you',
      },
    ]);

    // Create blocks
    await blockModel.create([
      {
        blocker_id: jimmy._id,
        blocked_id: karen._id,
        reason: 'Spam',
      },
      {
        blocker_id: jack._id,
        blocked_id: jimmy._id,
      },
    ]);

    // Create conversations
    const dmHash = createHash('md5')
      .update([jimmy._id.toString(), alice._id.toString()].sort().join(':'))
      .digest('hex');

    const dmConv = await conversationModel.create({
      type: 'dm',
      dm_hash: dmHash,
      is_private: true,
      participant_count: 2,
      last_message_at: new Date(Date.now() - 1000 * 60 * 15),
    });

    await participantModel.create([
      { conversation_id: dmConv._id, user_id: jimmy._id, role: 'member', last_read_at: new Date(Date.now() - 1000 * 60 * 10) },
      { conversation_id: dmConv._id, user_id: alice._id, role: 'member', last_read_at: new Date() },
    ]);

    const groupConv = await conversationModel.create({
      type: 'group',
      title: 'Prediction Market Alpha',
      is_private: true,
      created_by: jimmy._id,
      participant_count: 4,
      last_message_at: new Date(Date.now() - 1000 * 60 * 45),
    });

    await participantModel.create([
      { conversation_id: groupConv._id, user_id: jimmy._id, role: 'owner' },
      { conversation_id: groupConv._id, user_id: bob._id, role: 'admin' },
      { conversation_id: groupConv._id, user_id: charlie._id, role: 'member' },
      { conversation_id: groupConv._id, user_id: diana._id, role: 'member' },
    ]);

    const politicsConv = await conversationModel.create({
      type: 'global',
      slug: 'politics',
      title: 'Politics',
      is_private: false,
      participant_count: 332,  // Estimated active users in global chat
      last_message_at: new Date(Date.now() - 1000 * 60 * 3),
      metadata: { description: 'Political predictions and discussion' },
    });

    const cryptoConv = await conversationModel.create({
      type: 'global',
      slug: 'crypto',
      title: 'Crypto',
      is_private: false,
      participant_count: 245,  // Estimated active users in global chat
      last_message_at: new Date(Date.now() - 1000 * 60 * 8),
      metadata: { description: 'Cryptocurrency and blockchain' },
    });

    const strangerThingsConv = await conversationModel.create({
      type: 'market',
      market_id: 'polymarket:stranger-things-s5-death',
      title: 'Who will die in Stranger Things Season 5?',
      is_private: false,
      participant_count: 156,  // Users interested in this market
      last_message_at: new Date(Date.now() - 1000 * 60 * 1),
      metadata: {
        category: 'entertainment',
        url: 'https://polymarket.com/event/stranger-things-s5-death',
        outcomes: ['Steve', 'Nancy', 'Robin', 'Eddie', 'None'],
      },
    });

    // Create messages
    const now = Date.now();

    // DM messages
    await messageModel.create([
      {
        conversation_id: dmConv._id,
        sender_id: alice._id,
        text: 'Hey! How\'s the development going?',
        created_at: new Date(now - 1000 * 60 * 30),
      },
      {
        conversation_id: dmConv._id,
        sender_id: jimmy._id,
        text: 'Great! Just finished the new conversation system',
        created_at: new Date(now - 1000 * 60 * 28),
      },
      {
        conversation_id: dmConv._id,
        sender_id: alice._id,
        text: 'That\'s awesome! Can\'t wait to try it',
        created_at: new Date(now - 1000 * 60 * 25),
      },
      {
        conversation_id: dmConv._id,
        sender_id: jimmy._id,
        text: 'Want to help test some features?',
        created_at: new Date(now - 1000 * 60 * 20),
      },
      {
        conversation_id: dmConv._id,
        sender_id: alice._id,
        text: 'Absolutely! Send me the details',
        created_at: new Date(now - 1000 * 60 * 15),
      },
    ]);

    // Group messages
    await messageModel.create([
      {
        conversation_id: groupConv._id,
        sender_id: jimmy._id,
        text: 'Welcome everyone! Let\'s share our best market insights here',
        created_at: new Date(now - 1000 * 60 * 90),
      },
      {
        conversation_id: groupConv._id,
        sender_id: bob._id,
        text: 'Just spotted an arbitrage opportunity on the Fed decision market',
        created_at: new Date(now - 1000 * 60 * 80),
      },
      {
        conversation_id: groupConv._id,
        sender_id: charlie._id,
        text: 'Share the details!',
        created_at: new Date(now - 1000 * 60 * 75),
      },
      {
        conversation_id: groupConv._id,
        sender_id: diana._id,
        text: 'I\'m working on a bot to monitor spreads, should be ready next week',
        created_at: new Date(now - 1000 * 60 * 70),
      },
      {
        conversation_id: groupConv._id,
        sender_id: jimmy._id,
        text: 'That sounds promising Diana, keep us posted',
        created_at: new Date(now - 1000 * 60 * 65),
      },
      {
        conversation_id: groupConv._id,
        sender_id: bob._id,
        text: 'DMing you the opportunity Charlie',
        created_at: new Date(now - 1000 * 60 * 60),
      },
    ]);

    // Politics messages
    await messageModel.create([
      {
        conversation_id: politicsConv._id,
        sender_id: bob._id,
        text: 'The 2026 senate race predictions are all over the place',
        created_at: new Date(now - 1000 * 60 * 45),
      },
      {
        conversation_id: politicsConv._id,
        sender_id: grace._id,
        text: 'Current data shows a statistical dead heat',
        created_at: new Date(now - 1000 * 60 * 40),
      },
      {
        conversation_id: politicsConv._id,
        sender_id: alice._id,
        text: 'I like the underdog odds here',
        created_at: new Date(now - 1000 * 60 * 35),
      },
      {
        conversation_id: politicsConv._id,
        sender_id: jimmy._id,
        text: 'The prediction markets are pricing it at 52/48',
        created_at: new Date(now - 1000 * 60 * 30),
      },
      {
        conversation_id: politicsConv._id,
        sender_id: frank._id,
        text: 'Waiting for the debates before placing any bets',
        created_at: new Date(now - 1000 * 60 * 25),
      },
      {
        conversation_id: politicsConv._id,
        sender_id: eve._id,
        text: 'Just placed a significant position on this',
        created_at: new Date(now - 1000 * 60 * 20),
      },
      {
        conversation_id: politicsConv._id,
        sender_id: diana._id,
        text: 'The smart money is hedging both directions',
        created_at: new Date(now - 1000 * 60 * 15),
      },
      {
        conversation_id: politicsConv._id,
        sender_id: grace._id,
        text: 'State-by-state analysis coming tomorrow',
        created_at: new Date(now - 1000 * 60 * 10),
      },
      {
        conversation_id: politicsConv._id,
        sender_id: bob._id,
        text: 'This is why prediction markets > traditional polling',
        created_at: new Date(now - 1000 * 60 * 5),
      },
      {
        conversation_id: politicsConv._id,
        sender_id: alice._id,
        text: 'Agreed, much more accurate historically',
        created_at: new Date(now - 1000 * 60 * 3),
      },
    ]);

    // Stranger Things messages
    await messageModel.create([
      {
        conversation_id: strangerThingsConv._id,
        sender_id: alice._id,
        text: 'Steve has to survive, he\'s everyone\'s favorite',
        created_at: new Date(now - 1000 * 60 * 35),
      },
      {
        conversation_id: strangerThingsConv._id,
        sender_id: bob._id,
        text: 'Plot armor is real though',
        created_at: new Date(now - 1000 * 60 * 32),
      },
      {
        conversation_id: strangerThingsConv._id,
        sender_id: charlie._id,
        text: 'I think Nancy is in the most danger this season',
        created_at: new Date(now - 1000 * 60 * 28),
      },
      {
        conversation_id: strangerThingsConv._id,
        sender_id: diana._id,
        text: 'The Duffer Brothers love their plot twists',
        created_at: new Date(now - 1000 * 60 * 25),
      },
      {
        conversation_id: strangerThingsConv._id,
        sender_id: jimmy._id,
        text: 'Robin has the highest death odds on Polymarket right now',
        created_at: new Date(now - 1000 * 60 * 22),
      },
      {
        conversation_id: strangerThingsConv._id,
        sender_id: eve._id,
        text: 'Eddie already died, they won\'t do that again',
        created_at: new Date(now - 1000 * 60 * 20),
      },
      {
        conversation_id: strangerThingsConv._id,
        sender_id: frank._id,
        text: 'Where are you seeing those odds?',
        created_at: new Date(now - 1000 * 60 * 18),
      },
      {
        conversation_id: strangerThingsConv._id,
        sender_id: jimmy._id,
        text: 'Check the market page, link is in the chat metadata',
        created_at: new Date(now - 1000 * 60 * 15),
      },
      {
        conversation_id: strangerThingsConv._id,
        sender_id: grace._id,
        text: 'Analyzed all the teasers, putting 70% probability on Steve',
        created_at: new Date(now - 1000 * 60 * 12),
      },
      {
        conversation_id: strangerThingsConv._id,
        sender_id: hank._id,
        text: 'Going contrarian here - betting on "None will die"',
        created_at: new Date(now - 1000 * 60 * 10),
      },
      {
        conversation_id: strangerThingsConv._id,
        sender_id: alice._id,
        text: 'That\'s actually an interesting angle',
        created_at: new Date(now - 1000 * 60 * 8),
      },
      {
        conversation_id: strangerThingsConv._id,
        sender_id: charlie._id,
        text: 'Season drops in July, can\'t wait!',
        created_at: new Date(now - 1000 * 60 * 5),
      },
      {
        conversation_id: strangerThingsConv._id,
        sender_id: diana._id,
        text: 'This market is going to see huge volume',
        created_at: new Date(now - 1000 * 60 * 3),
      },
      {
        conversation_id: strangerThingsConv._id,
        sender_id: jimmy._id,
        text: 'Love how PolyBanter creates instant chats for any market',
        created_at: new Date(now - 1000 * 60 * 1),
      },
    ]);

    // Crypto messages (including Karen's spam before suspension)
    await messageModel.create([
      {
        conversation_id: cryptoConv._id,
        sender_id: alice._id,
        text: 'ETH looking strong today, breaking resistance',
        created_at: new Date(now - 1000 * 60 * 25),
      },
      {
        conversation_id: cryptoConv._id,
        sender_id: diana._id,
        text: 'New L2 deployment went live this morning',
        created_at: new Date(now - 1000 * 60 * 22),
      },
      {
        conversation_id: cryptoConv._id,
        sender_id: karen._id,
        text: 'NEW COIN ALERT! 100X GUARANTEED! CHECK MY PROFILE!',
        created_at: new Date(now - 1000 * 60 * 20),
      },
      {
        conversation_id: cryptoConv._id,
        sender_id: frank._id,
        text: 'Report that spam please',
        created_at: new Date(now - 1000 * 60 * 18),
      },
      {
        conversation_id: cryptoConv._id,
        sender_id: jack._id,
        text: 'This chat is getting worse',
        created_at: new Date(now - 1000 * 60 * 16),
      },
      {
        conversation_id: cryptoConv._id,
        sender_id: alice._id,
        text: 'Back to crypto discussion... thoughts on the upcoming ETF decision?',
        created_at: new Date(now - 1000 * 60 * 12),
      },
      {
        conversation_id: cryptoConv._id,
        sender_id: iris._id,
        text: 'Built a prediction model for BTC, 73% accuracy on backtesting',
        created_at: new Date(now - 1000 * 60 * 8),
      },
    ]);

    // Add reactions
    const politicsMsg = await messageModel.findOne({ 
      conversation_id: politicsConv._id,
      text: { $regex: 'prediction markets' }
    });
    if (politicsMsg) {
      politicsMsg.reactions = new Map([
        ['👍', [alice._id, jimmy._id, grace._id]],
        ['🔥', [bob._id]],
      ]);
      await politicsMsg.save();
    }

    console.log('✅ Database seeded successfully');
    console.log(`   Users: ${await userModel.countDocuments()}`);
    console.log(`   Conversations: ${await conversationModel.countDocuments()}`);
    console.log(`   Messages: ${await messageModel.countDocuments()}`);
    console.log(`   Friendships: ${await friendshipModel.countDocuments()}`);
    console.log(`   Friend Requests: ${await friendRequestModel.countDocuments()}`);
    console.log(`   Blocks: ${await blockModel.countDocuments()}`);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await app.close();
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
