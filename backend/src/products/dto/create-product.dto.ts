import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Product name is required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsString()
  @IsNotEmpty({ message: 'Category is required' })
  @IsEnum([
    'AI Tools',
    'Design & Creative',
    'Entertainment & Streaming',
    'Productivity & Office',
    'Security & Utility',
    'Education & Learning',
    'Others',
  ])
  category: string;

  @IsString()
  @IsNotEmpty({ message: 'Subcategory is required' })
  subcategory: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsNumber()
  @Min(0)
  actualPrice: number;

  @IsNumber()
  @Min(0)
  offerPrice: number;

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
