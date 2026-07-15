import { IsInt, IsOptional, Min } from 'class-validator';

export class FetchExternalJobsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  adzunaLimit?: number = 20;

  @IsOptional()
  @IsInt()
  @Min(1)
  jsearchPages?: number = 2;
}
