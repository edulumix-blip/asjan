import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateJobDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
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
  category?: string;

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
  @IsOptional()
  applyLink?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
