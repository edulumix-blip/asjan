import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ProfileUpdateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Bio cannot exceed 500 characters' })
  bio?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Location cannot exceed 100 characters' })
  location?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  linkedin?: string;
}
