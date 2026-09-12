import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class RefundPaymentRequestDto {
  @ApiPropertyOptional({ description: 'Refund amount; defaults to full payment amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;
}
