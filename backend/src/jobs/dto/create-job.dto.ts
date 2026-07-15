import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty({ message: 'Job title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Company name is required' })
  company: string;

  @IsString()
  @IsNotEmpty({ message: 'Location is required' })
  location: string;

  @IsString()
  @IsNotEmpty({ message: 'Category is required' })
  @IsEnum([
    'IT Job',
    'Non IT Job',
    'Walk In Drive',
    'Govt Job',
    'Internship',
    'Part Time Job',
    'Remote Job',
    'Others',
  ])
  category: string;

  @IsString()
  @IsOptional()
  @IsEnum(['Fresher', '1 Year', '2 Years', '3 Years', '4 Years', '5+ Years'])
  experience?: string;

  @IsString()
  @IsOptional()
  salary?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['Open', 'Closed'])
  status?: string;

  @IsString()
  @IsOptional()
  companyLogo?: string;

  @IsString()
  @IsNotEmpty({ message: 'Apply link or email is required' })
  applyLink: string;

  @IsString()
  @IsNotEmpty({ message: 'Job description is required' })
  description: string;
}
