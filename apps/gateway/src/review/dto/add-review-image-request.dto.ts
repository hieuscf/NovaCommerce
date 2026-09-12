import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export class AddReviewImageRequestDto {
  @ApiProperty({ description: 'Base64-encoded image content' })
  @IsString()
  contentBase64!: string;

  @ApiProperty({ enum: ALLOWED_CONTENT_TYPES })
  @IsString()
  @IsIn([...ALLOWED_CONTENT_TYPES])
  contentType!: (typeof ALLOWED_CONTENT_TYPES)[number];
}
