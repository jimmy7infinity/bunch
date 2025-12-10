import {
  Controller,
  Get,
  Query,
  UseGuards,
  Post,
  Body,
  Request,
  Param,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messages')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getMessages(
    @Query('limit') limit?: number,
    @Query('before') before?: string,
  ) {
    const messages = await this.chatService.getMessages(
      limit ? parseInt(limit.toString()) : 50,
      before ? new Date(before) : undefined,
    );

    return {
      messages: messages.reverse(), // Return in chronological order
      count: messages.length,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async sendMessage(@Request() req, @Body() body: { text: string }) {
    const message = await this.chatService.createMessage(
      req.user.userId,
      body.text,
    );

    return message;
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/react')
  async reactToMessage(
    @Request() req,
    @Param('id') messageId: string,
    @Body() body: { emoji: string },
  ) {
    const message = await this.chatService.addReaction(
      messageId,
      req.user.userId,
      body.emoji,
    );

    return message;
  }
}

