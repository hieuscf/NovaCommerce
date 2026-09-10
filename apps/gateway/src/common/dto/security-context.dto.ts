import { ApiProperty } from '@nestjs/swagger';

export class SecurityContextDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  userId!: string;

  @ApiProperty({ type: [String], example: ['customer'] })
  roles!: string[];

  @ApiProperty({ type: [String], example: ['orders:read'] })
  permissions!: string[];
}
