import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateInterviewPrepDto {
  @IsString()
  @IsOptional()
  @IsEnum(['Frontend', 'Backend', 'Database', 'Behavioral', 'System Design', 'DevOps', 'HR', 'Architecture', 'Mobile Dev', 'Data Science', 'Cloud Computing', 'Cybersecurity', 'Testing & QA', 'Product Management', 'Project Management'], {
    message: 'Category must be a valid career preparation domain',
  })
  category?: string;

  @IsString()
  @IsOptional()
  question?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['Easy', 'Medium', 'Hard'], {
    message: 'Difficulty must be one of: Easy, Medium, Hard',
  })
  difficulty?: string;

  @IsString()
  @IsOptional()
  answer?: string;

  @IsString()
  @IsOptional()
  tips?: string;
}
