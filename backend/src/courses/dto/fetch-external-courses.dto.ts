import { IsInt, IsOptional, Min } from 'class-validator';

export class FetchExternalCoursesDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 15;
}
