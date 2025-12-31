import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './modules/users/users.service';
import { ChatService } from './modules/chat/chat.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const chatService = app.get(ChatService);

  console.log('🌱 Seeding database...');

  // Create test users
  const users = [];
  const usernames = ['alice', 'bob', 'charlie', 'diana', 'eve'];

  for (const username of usernames) {
    const fakeWallet = `0x${username.toLowerCase().padEnd(40, '0')}`;
    let user = await usersService.findByUsername(username);
    
    if (!user) {
      user = await usersService.createDevUser(username, fakeWallet);
      console.log(`✅ Created user: ${username}`);
    } else {
      console.log(`⏭️  User already exists: ${username}`);
    }
    users.push(user);
  }

  // Create test messages in global chat
  const testMessages = [
    { user: 0, text: 'Hey everyone! Just joined PolyBanter 👋' },
    { user: 1, text: 'Welcome! How are the markets looking today?' },
    { user: 2, text: 'Bitcoin prediction looking bullish 📈' },
    { user: 0, text: 'Anyone trading the election markets?' },
    { user: 3, text: 'I\'m up 20% this week! 🚀' },
    { user: 4, text: 'Nice! What\'s your strategy?' },
    { user: 1, text: 'The crypto markets are wild right now' },
    { user: 2, text: 'Just placed a big bet on the sports category' },
  ];

  for (const msg of testMessages) {
    const userId = (users[msg.user] as any)._id.toString();
    await chatService.createMessage(userId, msg.text);
    console.log(`✅ Created message from ${usernames[msg.user]}`);
  }

  console.log('🎉 Seeding complete!');
  console.log('\n📊 Test Data Summary:');
  console.log(`   Users: ${users.length}`);
  console.log(`   Messages: ${testMessages.length}`);
  console.log('\n🔐 You can login as any of these users:');
  usernames.forEach(u => console.log(`   - ${u}`));
  
  await app.close();
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});

