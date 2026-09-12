import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseMetaDto } from '../../common/dto/api-response-meta.dto';
import { PaymentStatus } from '../../../../../modules/payment/domain/aggregates/payment';

export class PaymentResponseDataDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  reference!: string;

  @ApiProperty({ format: 'uuid' })
  orderId!: string;

  @ApiProperty()
  amount!: number;

  @ApiProperty({ example: 'USD' })
  currency!: string;

  @ApiProperty()
  method!: string;

  @ApiProperty({ enum: PaymentStatus })
  status!: PaymentStatus;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}

export class PaymentInitiationResponseDataDto extends PaymentResponseDataDto {
  @ApiProperty()
  provider!: string;

  @ApiProperty()
  redirectUrl!: string;
}

export class PaymentEnvelopeDto {
  @ApiProperty({ type: () => PaymentResponseDataDto })
  data!: PaymentResponseDataDto;

  @ApiProperty({ type: () => ApiResponseMetaDto })
  meta!: ApiResponseMetaDto;
}

export class PaymentInitiationEnvelopeDto {
  @ApiProperty({ type: () => PaymentInitiationResponseDataDto })
  data!: PaymentInitiationResponseDataDto;

  @ApiProperty({ type: () => ApiResponseMetaDto })
  meta!: ApiResponseMetaDto;
}
