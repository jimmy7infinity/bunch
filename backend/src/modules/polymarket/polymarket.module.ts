import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PolymarketController } from './polymarket.controller';
import { PolymarketService } from './polymarket.service';
import { WhaleDetectionService } from './whale-detection.service';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [PolymarketController],
  providers: [PolymarketService, WhaleDetectionService],
  exports: [PolymarketService, WhaleDetectionService],
})
export class PolymarketModule {}
