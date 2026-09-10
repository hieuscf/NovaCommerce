import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class EchoRequestDto {
  @ApiProperty({ example: 'hello' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  message!: string;
}
