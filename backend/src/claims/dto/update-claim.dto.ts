import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateClaimDto {
  @IsString()
  @IsOptional()
  @IsEnum(['pending', 'processing', 'paid', 'rejected'])
  status?: string;

  @IsString()
  @IsOptional()
  transactionId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
