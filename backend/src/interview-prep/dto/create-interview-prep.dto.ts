import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateInterviewPrepDto {
  @IsString()
  @IsNotEmpty({ message: 'Category is required' })
  @IsEnum(['Frontend', 'Backend', 'Database', 'Behavioral', 'System Design', 'DevOps', 'HR', 'Architecture', 'Mobile Dev', 'Data Science', 'Cloud Computing', 'Cybersecurity', 'Testing & QA', 'Product Management', 'Project Management'], {
    message: 'Category must be a valid career preparation domain',
  })
  category: string;

  @IsString()
  @IsNotEmpty({ message: 'Question text is required' })
  question: string;

  @IsString()
  @IsNotEmpty({ message: 'Difficulty level is required' })
  @IsEnum(['Easy', 'Medium', 'Hard'], {
    message: 'Difficulty must be one of: Easy, Medium, Hard',
  })
  difficulty: string;

  @IsString()
  @IsNotEmpty({ message: 'Model answer is required' })
  answer: string;

  @IsString()
  @IsNotEmpty({ message: 'Interviewer tips are required' })
  tips: string;
}
