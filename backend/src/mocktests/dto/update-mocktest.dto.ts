import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { QuestionDto } from './create-mocktest.dto';

export class UpdateMockTestDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsString()
  @IsOptional()
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
  category?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['Easy', 'Medium', 'Hard', 'Mixed'])
  difficulty?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  duration?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  @IsOptional()
  questions?: QuestionDto[];

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
