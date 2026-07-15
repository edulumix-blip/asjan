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

export class QuestionDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsEnum(['mcq', 'msq', 'true_false', 'integer'])
  @IsOptional()
  type?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];

  @IsString()
  @IsNotEmpty()
  correctAnswer: string;

  @IsString()
  @IsOptional()
  explanation?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  marks?: number;
}

export class CreateMockTestDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsString()
  @IsNotEmpty({ message: 'Category is required' })
  @IsEnum([
    'Aptitude',
    'Logical Reasoning',
    'Verbal Ability',
    'Technical - Programming',
    'Technical - DSA',
    'Technical - DBMS',
    'Technical - OS',
    'Technical - CN',
    'Technical - Web Dev',
    'Company Specific',
    'Gate',
    'Government Exams',
    'Placement Prep',
    'Competitive Exams',
    'Others',
  ])
  category: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['Easy', 'Medium', 'Hard', 'Mixed'])
  difficulty?: string;

  @IsInt()
  @Min(1)
  duration: number; // in minutes

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  instructions?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  isFree?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsString()
  @IsOptional()
  whatsappNumber?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  passingMarks?: number;
}
