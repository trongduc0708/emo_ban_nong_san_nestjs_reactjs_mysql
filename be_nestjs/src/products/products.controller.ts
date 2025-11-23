import { Controller, Get, Param, Query, Post, Put, UseInterceptors, UploadedFile, UseGuards, Req, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { multerConfig } from '../config/multer.config';
import { AdminService } from '../admin/admin.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly adminService: AdminService
  ) {}

  @Get()
  async list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') categorySlug?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    return this.productsService.list({ page, limit, categorySlug, search, sort, minPrice, maxPrice });
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    return this.productsService.detail(Number(id));
  }

  @Get('featured')
  async getFeaturedProducts(@Query('limit') limit?: string) {
    const limitNum = limit ? Number(limit) : 25;
    return this.productsService.getFeaturedProducts(limitNum);
  }

  @Get('category/:categorySlug')
  async getProductsByCategory(
    @Param('categorySlug') categorySlug: string,
    @Query('limit') limit?: string
  ) {
    const limitNum = limit ? Number(limit) : 5;
    return this.productsService.getProductsByCategory(categorySlug, limitNum);
  }

  // Upload ảnh sản phẩm
  @UseGuards(JwtAuthGuard)
  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image', {
    storage: multerConfig.productStorage,
    fileFilter: multerConfig.fileFilter,
    limits: multerConfig.limits,
  }))
  async uploadProductImage(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('productId') productId: string,
    @Body('position') position: string = '0'
  ) {
    if (!file) {
      throw new Error('Không có file được upload');
    }

    const imageUrl = `/uploads/products/${file.filename}`;
    
    // Lưu vào database
    const result = await this.productsService.addProductImage(
      Number(productId),
      imageUrl,
      Number(position)
    );

    return {
      success: true,
      data: {
        imageUrl,
        id: result.id,
        position: result.position
      }
    };
  }

  // Seller endpoints - Tạo và sửa sản phẩm
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'admin')
  @Post('seller/create')
  async createProduct(@Req() req: any, @Body() data: any) {
    return this.adminService.createProduct(data, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'admin')
  @Put('seller/:id')
  async updateProduct(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    return this.adminService.updateProduct(parseInt(id), data, req.user);
  }
}
