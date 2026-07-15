import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class LessonDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  duration?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  isFree?: boolean;
}

export class InstructorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty({ message: 'Course title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Course description is required' })
  description: string;

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
  @IsNotEmpty({ message: 'Category is required' })
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
  category: string;

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
  actualPrice: number;

  @IsNumber()
  @Min(0)
  offerPrice: number;

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
  instructor: InstructorDto;

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
