import { IsInt, IsOptional, Min } from 'class-validator';

export class FetchExternalResourcesDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  devToLimit?: number = 400;

  @IsOptional()
  @IsInt()
  @Min(1)
  mediumLimit?: number = 120;
}
