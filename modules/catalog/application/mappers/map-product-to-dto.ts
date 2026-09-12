import type { Product } from '../../domain/aggregates/product';
import type { ProductAttribute } from '../../domain/entities/product-attribute';
import type { ProductImage } from '../../domain/entities/product-image';
import type { ProductOption } from '../../domain/entities/product-option';
import type { ProductVariant } from '../../domain/entities/product-variant';
import type {
  ProductAttributeResponseDto,
  ProductImageResponseDto,
  ProductListResponseDto,
  ProductOptionResponseDto,
  ProductResponseDto,
  ProductVariantResponseDto,
} from '../dto/product-response.dto';

function mapVariantToDto(variant: ProductVariant): ProductVariantResponseDto {
  return {
    id: variant.id,
    sku: variant.getSku().value,
    priceAmount: variant.getPrice().amount,
    priceCurrency: variant.getPrice().currency,
    attributes: variant.getAttributes(),
    createdAt: variant.createdAt.toISOString(),
    updatedAt: variant.updatedAt.toISOString(),
  };
}

function mapImageToDto(image: ProductImage): ProductImageResponseDto {
  return {
    id: image.id,
    url: image.getUrl(),
    sortOrder: image.getSortOrder(),
    createdAt: image.createdAt.toISOString(),
    updatedAt: image.updatedAt.toISOString(),
  };
}

function mapAttributeToDto(attribute: ProductAttribute): ProductAttributeResponseDto {
  return {
    id: attribute.id,
    name: attribute.getName(),
    value: attribute.getValue(),
    createdAt: attribute.createdAt.toISOString(),
    updatedAt: attribute.updatedAt.toISOString(),
  };
}

function mapOptionToDto(option: ProductOption): ProductOptionResponseDto {
  return {
    id: option.id,
    name: option.getName(),
    values: option.getValues(),
    createdAt: option.createdAt.toISOString(),
    updatedAt: option.updatedAt.toISOString(),
  };
}

export function mapProductToDto(product: Product): ProductResponseDto {
  const basePrice = product.getBasePrice();
  return {
    id: product.id,
    name: product.getName().value,
    slug: product.getSlug().value,
    basePriceAmount: basePrice.amount,
    basePriceCurrency: basePrice.currency,
    status: product.getStatus(),
    categoryId: product.getCategoryId(),
    variants: product.getVariants().map(mapVariantToDto),
    images: product.getImages().map(mapImageToDto),
    attributes: product.getAttributes().map(mapAttributeToDto),
    options: product.getOptions().map(mapOptionToDto),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export function mapProductListToDto(
  products: Product[],
  total: number,
  page: number,
  pageSize: number,
): ProductListResponseDto {
  return {
    items: products.map(mapProductToDto),
    total,
    page,
    pageSize,
  };
}
