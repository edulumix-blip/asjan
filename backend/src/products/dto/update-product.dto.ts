import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsEnum([
    'AI Tools',
    'Design & Creative',
    'Entertainment & Streaming',
    'Productivity & Office',
    'Security & Utility',
    'Education & Learning',
    'Others',
  ])
  category?: string;

  @IsString()
  @IsOptional()
  subcategory?: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  actualPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  offerPrice?: number;

  @IsString()
  @IsOptional()
  whatsappNumber?: string;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsString()
  @IsOptional()
  externalId?: string;
}
