import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ChatbotService } from './chatbot.service';

export class ChatDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsNumber()
  userId?: number;
}

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('chat')
  async chat(@Body() chatDto: ChatDto) {
    const response = await this.chatbotService.chat(
      chatDto.message,
      chatDto.userId,
    );
    return response;
  }

  @Get('search')
  async searchProducts(@Query('q') query: string) {
    const products = await this.chatbotService.searchProducts(query);
    return { products };
  }

  @Get('product/:id')
  async getProductInfo(@Param('id') id: string) {
    const product = await this.chatbotService.getProductInfo(parseInt(id));
    return { product };
  }
}

