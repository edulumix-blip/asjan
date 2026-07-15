import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateResourceDto {
  @IsString()
  @IsNotEmpty({ message: 'Resource title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Category is required' })
  @IsEnum([
    'Software Notes',
    'Interview Notes',
    'Tools & Technology',
    'Trending Technology',
    'Video Resources',
    'Software Project',
    'Hardware Project',
  ])
  category: string;

  @IsString()
  @IsOptional()
  subcategory?: string;

  @IsString()
  @IsNotEmpty({ message: 'Resource link is required' })
  link: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;
}
