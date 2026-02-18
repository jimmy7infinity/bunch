/**
 * Seed jimmy7infinity with special ranks for testing
 * Run: ts-node backend/src/scripts/seed-jimmy-ranks.ts
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SpecialRanksService } from '../modules/users/special-ranks.service';
import { InventoryService } from '../modules/users/inventory.service';

const JIMMY_USER_ID = '6954dcf967b3dbdf7c2f2cd1';

async function seedRanks() {
  console.log('🌱 Seeding ranks for jimmy7infinity...\n');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const specialRanksService = app.get(SpecialRanksService);
  const inventoryService = app.get(InventoryService);

  try {
    // Assign DIAMOND rank (💎)
    console.log('💎 Assigning DIAMOND rank...');
    await specialRanksService.assignRank(
      JIMMY_USER_ID,
      'DIAMOND',
      { 
        hold_days: 35, 
        position_count: 5,
        total_size: 25000,
        reason: 'Manual seed for testing'
      }
    );

    // Assign ON FIRE rank (🔥) with 7 day expiry
    console.log('🔥 Assigning ON FIRE rank...');
    await specialRanksService.assignRank(
      JIMMY_USER_ID,
      'ON FIRE',
      { 
        win_streak: 8,
        total_profit: 1250,
        reason: 'Manual seed for testing'
      },
      7
    );

    // Assign DANK rank (😂) with 30 day expiry
    console.log('😂 Assigning DANK rank...');
    await specialRanksService.assignRank(
      JIMMY_USER_ID,
      'DANK',
      { 
        laugh_reactions: 73,
        messages_count: 45,
        reason: 'Manual seed for testing'
      },
      30
    );

    // Assign EARLY rank (permanent)
    console.log('🌟 Assigning EARLY rank...');
    await specialRanksService.assignRank(
      JIMMY_USER_ID,
      'EARLY',
      { reason: 'Early supporter' }
    );

    // Unlock some + ranks
    console.log('\n✨ Unlocking + ranks...');
    await inventoryService.unlockAccent(JIMMY_USER_ID, 'RECRUIT+', 'rank_progression');
    await inventoryService.unlockAccent(JIMMY_USER_ID, 'VETERAN+', 'rank_progression');
    await inventoryService.unlockAccent(JIMMY_USER_ID, 'CAPTAIN+', 'rank_progression');

    console.log('\n✅ Successfully seeded ranks!');
    console.log('\nActive Ranks:');
    const activeRanks = await specialRanksService.getActiveRanks(JIMMY_USER_ID);
    activeRanks.forEach(rank => console.log(`  - ${rank}`));

    console.log('\nUnlocked Accents:');
    const accents = await inventoryService.getUnlockedAccents(JIMMY_USER_ID);
    accents.forEach(accent => console.log(`  - ${accent}`));

  } catch (error) {
    console.error('❌ Error seeding ranks:', error);
  } finally {
    await app.close();
    process.exit(0);
  }
}

seedRanks();
