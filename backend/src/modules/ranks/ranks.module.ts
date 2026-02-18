import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RanksCronService } from './ranks-cron.service';
import { OpportunisticRankChecker } from './opportunistic-rank-checker.service';
import { SpecialRanksService } from '../users/special-ranks.service';
import { InventoryService } from '../users/inventory.service';
import { PositionCacheService } from '../polymarket/position-cache.service';
import { SpecialRank, SpecialRankSchema } from '../users/schemas/special-rank.schema';
import { UserInventory, UserInventorySchema } from '../users/schemas/user-inventory.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Message, MessageSchema } from '../chat/schemas/message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SpecialRank.name, schema: SpecialRankSchema },
      { name: UserInventory.name, schema: UserInventorySchema },
      { name: User.name, schema: UserSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
  ],
  providers: [
    RanksCronService,
    OpportunisticRankChecker,
    SpecialRanksService,
    InventoryService,
    PositionCacheService,
  ],
  exports: [
    SpecialRanksService,
    InventoryService,
    OpportunisticRankChecker,
    PositionCacheService,
  ],
})
export class RanksModule {}
