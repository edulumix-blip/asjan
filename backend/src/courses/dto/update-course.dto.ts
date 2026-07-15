import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { LessonDto, InstructorDto } from './create-course.dto';

export class UpdateCourseDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsString()
  @IsOptional()
  previewVideo?: string;

  @IsString()
  @IsOptional()
  @IsEnum([
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'DevOps',
    'Cybersecurity',
    'Cloud Computing',
    'UI/UX Design',
    'Digital Marketing',
    'Interview Prep',
    'DSA',
    'Programming Languages',
    'Others',
  ])
  category?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['Beginner', 'Intermediate', 'Advanced', 'All Levels'])
  level?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['English', 'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Others'])
  language?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  actualPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  offerPrice?: number;

  @IsBoolean()
  @IsOptional()
  isFree?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LessonDto)
  @IsOptional()
  lessons?: LessonDto[];

  @ValidateNested()
  @Type(() => InstructorDto)
  @IsOptional()
  instructor?: InstructorDto;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requirements?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  whatYouWillLearn?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  enrollmentLink?: string;

  @IsString()
  @IsOptional()
  whatsappNumber?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}
