import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateClaimDto {
  @IsNumber()
  @IsNotEmpty({ message: 'Points is required' })
  points: number;

  @IsString()
  @IsNotEmpty({ message: 'Payment method is required' })
  @IsEnum(['upi', 'phone'])
  paymentMethod: string;

  @IsString()
  @IsNotEmpty({ message: 'Payment details are required' })
  paymentDetails: string;
}
