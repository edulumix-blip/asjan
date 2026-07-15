import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty({ message: 'Blog title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Blog content is required' })
  content: string;

  @IsString()
  @IsOptional()
  excerpt?: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsString()
  @IsNotEmpty({ message: 'Blog category is required' })
  category: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsBoolean()
  @IsOptional()
  isSponsored?: boolean;

  @IsString()
  @IsOptional()
  sponsorName?: string;

  @IsString()
  @IsOptional()
  sponsorLink?: string;
}
