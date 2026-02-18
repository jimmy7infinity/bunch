import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { InventoryController } from './inventory.controller';
import { UsersService } from './users.service';
import { InventoryService } from './inventory.service';
import { SpecialRanksService } from './special-ranks.service';
import { User, UserSchema } from './schemas/user.schema';
import { Block, BlockSchema } from './schemas/block.schema';
import { FriendRequest, FriendRequestSchema } from './schemas/friend-request.schema';
import { Friendship, FriendshipSchema } from './schemas/friendship.schema';
import { UserInventory, UserInventorySchema } from './schemas/user-inventory.schema';
import { SpecialRank, SpecialRankSchema } from './schemas/special-rank.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Block.name, schema: BlockSchema },
      { name: FriendRequest.name, schema: FriendRequestSchema },
      { name: Friendship.name, schema: FriendshipSchema },
      { name: UserInventory.name, schema: UserInventorySchema },
      { name: SpecialRank.name, schema: SpecialRankSchema },
    ]),
  ],
  controllers: [UsersController, InventoryController],
  providers: [
    UsersService,
    InventoryService,
    SpecialRanksService,
    {
      provide: 'SOCKET_SERVER',
      useFactory: () => {
        // This will be set by ChatGateway when it initializes
        return (global as any).socketServer;
      },
    },
  ],
  exports: [UsersService, InventoryService, SpecialRanksService],
})
export class UsersModule {}





