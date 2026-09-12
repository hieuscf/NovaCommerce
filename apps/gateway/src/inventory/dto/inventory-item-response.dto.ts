import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseMetaDto } from '../../common/dto/api-response-meta.dto';

export class InventoryItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  sku!: string;

  @ApiProperty()
  warehouseId!: string;

  @ApiProperty()
  onHand!: number;

  @ApiProperty()
  reserved!: number;

  @ApiProperty()
  available!: number;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

class InventoryItemEnvelopeDto {
  @ApiProperty({ type: () => InventoryItemResponseDto })
  data!: InventoryItemResponseDto;

  @ApiProperty({ type: () => ApiResponseMetaDto })
  meta!: ApiResponseMetaDto;
}

export class ReleaseStockByOrderResponseDto {
  @ApiProperty()
  releasedCount!: number;
}

class ReleaseStockByOrderEnvelopeDto {
  @ApiProperty({ type: () => ReleaseStockByOrderResponseDto })
  data!: ReleaseStockByOrderResponseDto;

  @ApiProperty({ type: () => ApiResponseMetaDto })
  meta!: ApiResponseMetaDto;
}

export { InventoryItemEnvelopeDto, ReleaseStockByOrderEnvelopeDto };
