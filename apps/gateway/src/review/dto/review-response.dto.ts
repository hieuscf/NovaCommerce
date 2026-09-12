import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewMediaDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  url!: string;

  @ApiProperty()
  mediaType!: string;

  @ApiProperty()
  createdAt!: string;
}

export class ReviewDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  productId!: string;

  @ApiPropertyOptional()
  variantId?: string;

  @ApiProperty()
  customerId!: string;

  @ApiProperty()
  rating!: number;

  @ApiProperty()
  text!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty({ type: [ReviewMediaDto] })
  media!: ReviewMediaDto[];

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class ReviewEnvelopeDto extends ReviewDto {}

export class ReviewListEnvelopeDto {
  @ApiProperty({ type: [ReviewDto] })
  items!: ReviewDto[];
}
