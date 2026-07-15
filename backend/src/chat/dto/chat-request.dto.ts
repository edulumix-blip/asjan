import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChatMessageDto {
  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class ChatRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Message is required' })
  message: string;

  @IsArray()
  @IsOptional()
  history?: ChatMessageDto[];
}
