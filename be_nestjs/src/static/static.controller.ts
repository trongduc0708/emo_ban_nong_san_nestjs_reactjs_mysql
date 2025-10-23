import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@Controller('uploads')
export class StaticController {
  @Get('avatars/:filename')
  async getAvatar(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads', 'avatars', filename);
    
    if (!existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    return res.sendFile(filePath);
  }

  @Get('products/:filename')
  async getProductImage(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads', 'products', filename);
    
    if (!existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    return res.sendFile(filePath);
  }
}
