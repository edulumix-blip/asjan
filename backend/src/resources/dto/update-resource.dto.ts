import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateResourceDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  @IsEnum([
    'Software Notes',
    'Interview Notes',
    'Tools & Technology',
    'Trending Technology',
    'Video Resources',
    'Software Project',
    'Hardware Project',
  ])
  category?: string;

  @IsString()
  @IsOptional()
  subcategory?: string;

  @IsString()
  @IsOptional()
  link?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;
}
