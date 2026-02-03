import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InviteCode, InviteCodeDocument } from './schemas/invite-code.schema';
import * as crypto from 'crypto';

@Injectable()
export class InviteCodesService {
  constructor(
    @InjectModel(InviteCode.name)
    private inviteCodeModel: Model<InviteCodeDocument>,
  ) {}

  /**
   * Generate a unique invite code in format: BUNCH-XXXX-XX
   */
  private generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars (0, O, I, 1)
    let code = 'BUNCH-';
    
    // Generate 4 chars
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    code += '-';
    
    // Generate 2 chars
    for (let i = 0; i < 2; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return code;
  }

  /**
   * Generate multiple invite codes
   */
  async generateCodes(
    count: number,
    maxUses: number,
    createdBy: string,
    expiresAt?: Date,
  ): Promise<InviteCode[]> {
    if (count < 1 || count > 100) {
      throw new BadRequestException('Count must be between 1 and 100');
    }

    if (maxUses < 1) {
      throw new BadRequestException('maxUses must be at least 1');
    }

    const codes: InviteCode[] = [];
    const createdByObjectId = new Types.ObjectId(createdBy);

    for (let i = 0; i < count; i++) {
      let code = this.generateCode();
      
      // Ensure uniqueness (retry if collision)
      let exists = await this.inviteCodeModel.findOne({ code });
      let retries = 0;
      while (exists && retries < 10) {
        code = this.generateCode();
        exists = await this.inviteCodeModel.findOne({ code });
        retries++;
      }

      if (exists) {
        throw new BadRequestException('Failed to generate unique code');
      }

      const inviteCode = await this.inviteCodeModel.create({
        code,
        maxUses,
        createdBy: createdByObjectId,
        expiresAt,
      });

      codes.push(inviteCode);
    }

    return codes;
  }

  /**
   * Validate and use an invite code
   */
  async validateAndUse(code: string, userId: string): Promise<InviteCode> {
    const inviteCode = await this.inviteCodeModel.findOne({ code });

    if (!inviteCode) {
      throw new NotFoundException('Invalid invite code');
    }

    // Check if expired
    if (inviteCode.expiresAt && new Date() > inviteCode.expiresAt) {
      throw new BadRequestException('Invite code has expired');
    }

    // Check if max uses reached
    if (inviteCode.useCount >= inviteCode.maxUses) {
      throw new BadRequestException('Invite code has reached maximum uses');
    }

    // Increment use count
    inviteCode.useCount += 1;

    // Mark as used and set usedBy on first use
    if (inviteCode.useCount === 1) {
      inviteCode.used = true;
      inviteCode.usedBy = new Types.ObjectId(userId);
    }

    await inviteCode.save();

    return inviteCode;
  }

  /**
   * Get all invite codes (admin)
   */
  async findAll(): Promise<InviteCode[]> {
    return this.inviteCodeModel
      .find()
      .populate('createdBy', 'username display_name')
      .populate('usedBy', 'username display_name')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get invite codes created by a specific user
   */
  async findByCreator(creatorId: string): Promise<InviteCode[]> {
    return this.inviteCodeModel
      .find({ createdBy: new Types.ObjectId(creatorId) })
      .populate('usedBy', 'username display_name')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Delete an invite code (admin only)
   */
  async deleteCode(code: string): Promise<void> {
    const result = await this.inviteCodeModel.deleteOne({ code });
    
    if (result.deletedCount === 0) {
      throw new NotFoundException('Invite code not found');
    }
  }

  /**
   * Get stats for dashboard
   */
  async getStats(): Promise<{
    total: number;
    used: number;
    unused: number;
    totalUses: number;
  }> {
    const all = await this.inviteCodeModel.find().exec();
    
    return {
      total: all.length,
      used: all.filter(c => c.used).length,
      unused: all.filter(c => !c.used).length,
      totalUses: all.reduce((sum, c) => sum + c.useCount, 0),
    };
  }
}
