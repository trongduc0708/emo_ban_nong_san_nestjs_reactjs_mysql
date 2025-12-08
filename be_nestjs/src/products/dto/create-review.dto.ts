import { IsNumber, IsString, IsOptional, Min, Max, IsArray } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsNumber()
  orderId?: number;

  @IsOptional()
  @IsArray()
  images?: string[];
}

