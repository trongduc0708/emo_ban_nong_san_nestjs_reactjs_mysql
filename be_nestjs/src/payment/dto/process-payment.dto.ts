import { IsNumber, IsPositive, IsOptional, IsString, IsEnum } from 'class-validator';

export class ProcessPaymentDto {
  @IsNumber()
  @IsPositive()
  cartId: number;

  @IsOptional()
  @IsEnum(['COD', 'VNPAY'])
  paymentMethod?: 'COD' | 'VNPAY';

  @IsOptional()
  @IsNumber()
  @IsPositive()
  addressId?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  couponCode?: string;
}
