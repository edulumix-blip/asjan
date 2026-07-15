import { IsInt, IsOptional, Min } from 'class-validator';

export class FetchExternalBlogsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  devToPerPage?: number = 25;

  @IsOptional()
  @IsInt()
  @Min(1)
  mediumLimit?: number = 25;
}
