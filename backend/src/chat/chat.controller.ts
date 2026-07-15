import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ChatService } from './chat.service';
import { ChatRequestDto } from './dto/chat-request.dto';

@Controller('chat')
@UseGuards(ThrottlerGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async generateResponse(@Body() chatRequestDto: ChatRequestDto) {
    const data = await this.chatService.generateResponse(chatRequestDto);
    return {
      success: true,
      data,
    };
  }
}
