import { Controller, Post, UseInterceptors, UploadedFile, Body, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../config/multer.config';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    storage: multerConfig.productStorage,
    fileFilter: multerConfig.fileFilter,
    limits: multerConfig.limits,
  }))
  async uploadProductImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('productId') productId: string
  ) {
    if (!file) {
      return {
        success: false,
        message: 'Không có file được upload'
      };
    }

    const fileUrl = `/uploads/products/${file.filename}`;
    
    return {
      success: true,
      message: 'Upload thành công',
      data: {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        url: fileUrl,
        productId: productId
      }
    };
  }

  @Post('products')
  @UseInterceptors(FileInterceptor('file', {
    storage: multerConfig.productStorage,
    fileFilter: multerConfig.fileFilter,
    limits: multerConfig.limits,
  }))
  async uploadProductImages(
    @UploadedFile() file: Express.Multer.File,
    @Body('productId') productId: string
  ) {
    if (!file) {
      return {
        success: false,
        message: 'Không có file được upload'
      };
    }

    const fileUrl = `/uploads/products/${file.filename}`;
    
    return {
      success: true,
      message: 'Upload thành công',
      data: {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        url: fileUrl,
        productId: productId
      }
    };
  }
}
