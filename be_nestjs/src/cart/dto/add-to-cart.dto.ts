import { IsNumber, IsOptional, IsPositive, Min } from 'class-validator';

export class AddToCartDto {
  @IsNumber()
  @IsPositive()
  productId: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  variantId?: number;

  @IsNumber()
  @Min(1)
  quantity: number;
}
