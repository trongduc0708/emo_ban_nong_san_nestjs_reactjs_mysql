import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

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
}
