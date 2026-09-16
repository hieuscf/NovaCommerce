import { isIntegrationEvent, type BusEvent } from '@novacommerce/building-blocks';
import {
  PRODUCT_SEARCH_STATUSES,
  type ProductSearchAttribute,
  type ProductSearchBrand,
  type ProductSearchCategory,
  type ProductSearchStatus,
} from '../../domain/entities/product-search-document';

export const PRODUCT_CREATED_INTEGRATION_TYPE = 'catalog.product_created';
export const PRODUCT_UPDATED_INTEGRATION_TYPE = 'catalog.product_updated';

export interface ProductSearchIndexContract {
  readonly productId: string;
  readonly eventId?: string;
  readonly name: string;
  readonly slug: string;
  readonly status: ProductSearchStatus;
  readonly price: number;
  readonly currency: string;
  readonly description?: string;
  readonly brand?: ProductSearchBrand;
  readonly categories?: readonly ProductSearchCategory[];
  readonly images?: readonly string[];
  readonly attributes?: readonly ProductSearchAttribute[];
  readonly tags?: readonly string[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export function parseProductCreatedSearchContract(event: BusEvent): ProductSearchIndexContract | null {
  if (!isProductCreatedEvent(event)) {
    return null;
  }

  return parseProductSearchIndexContract(event);
}

export function parseProductUpdatedSearchContract(event: BusEvent): ProductSearchIndexContract | null {
  if (!isProductUpdatedEvent(event)) {
    return null;
  }

  return parseProductSearchIndexContract(event);
}

function isProductCreatedEvent(event: BusEvent): boolean {
  if (isIntegrationEvent(event)) {
    return event.eventType === PRODUCT_CREATED_INTEGRATION_TYPE;
  }

  return event.eventName === 'ProductCreated';
}

function isProductUpdatedEvent(event: BusEvent): boolean {
  if (isIntegrationEvent(event)) {
    return event.eventType === PRODUCT_UPDATED_INTEGRATION_TYPE;
  }

  return event.eventName === 'ProductUpdated';
}

function parseProductSearchIndexContract(event: BusEvent): ProductSearchIndexContract | null {
  const productId = readAggregateId(event).trim();
  if (!productId) {
    return null;
  }

  const payload = readEventPayload(event);
  const name = readRequiredString(payload.name);
  const slug = readRequiredString(payload.slug);
  const status = readStatus(payload.status);
  const price = readNonNegativeNumber(payload.price);
  const currency = readRequiredString(payload.currency);
  const occurredAt = readEventOccurredAt(event);
  const createdAt = readDate(payload.createdAt) ?? occurredAt;
  const updatedAt = readDate(payload.updatedAt) ?? occurredAt;

  if (!name || !slug || !status || price === undefined || !currency || !createdAt || !updatedAt) {
    return null;
  }

  const description = readOptionalString(payload.description);
  const brand = readBrand(payload.brand);
  if (payload.brand !== undefined && brand === undefined) {
    return null;
  }

  const categories = readCategories(payload.categories);
  if (payload.categories !== undefined && categories === undefined) {
    return null;
  }

  const attributes = readAttributes(payload.attributes);
  if (payload.attributes !== undefined && attributes === undefined) {
    return null;
  }

  const categoryId = readRequiredString(payload.categoryId);
  const resolvedCategories =
    categories && categories.length > 0
      ? categories
      : categoryId
        ? [{ id: categoryId, name: 'Category' }]
        : undefined;

  return {
    productId,
    eventId: readEventId(event),
    name,
    slug,
    status,
    price,
    currency,
    description,
    brand,
    categories: resolvedCategories,
    images: readStringArray(payload.images),
    attributes,
    tags: readStringArray(payload.tags),
    createdAt,
    updatedAt,
  };
}

function readEventPayload(event: BusEvent): Record<string, unknown> {
  if (isIntegrationEvent(event)) {
    return event.payload ?? {};
  }

  if ('payload' in event && typeof event.payload === 'object' && event.payload !== null) {
    return event.payload as Record<string, unknown>;
  }

  return {};
}

function readAggregateId(event: BusEvent): string {
  return event.aggregateId;
}

function readEventId(event: BusEvent): string | undefined {
  if (isIntegrationEvent(event)) {
    return event.eventId;
  }

  return undefined;
}

function readEventOccurredAt(event: BusEvent): Date | undefined {
  if (isIntegrationEvent(event)) {
    return readDate(event.occurredAt);
  }

  return event.occurredOn instanceof Date && !Number.isNaN(event.occurredOn.getTime())
    ? event.occurredOn
    : undefined;
}

function readRequiredString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readOptionalString(value: unknown): string | undefined {
  return readRequiredString(value);
}

function readNonNegativeNumber(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return undefined;
  }

  return value;
}

function readStatus(value: unknown): ProductSearchStatus | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if ((PRODUCT_SEARCH_STATUSES as readonly string[]).includes(normalized)) {
    return normalized as ProductSearchStatus;
  }

  return undefined;
}

function readDate(value: unknown): Date | undefined {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value !== 'string' || value.trim().length === 0) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function readStringArray(value: unknown): readonly string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.filter((entry): entry is string => typeof entry === 'string');
}

function readBrand(value: unknown): ProductSearchBrand | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'object') {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  const id = readRequiredString(record.id);
  const name = readRequiredString(record.name);
  if (!id || !name) {
    return undefined;
  }

  return { id, name };
}

function readCategories(value: unknown): readonly ProductSearchCategory[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    return undefined;
  }

  const categories: ProductSearchCategory[] = [];
  for (const entry of value) {
    if (typeof entry !== 'object' || entry === null) {
      return undefined;
    }

    const record = entry as Record<string, unknown>;
    const id = readRequiredString(record.id);
    const name = readRequiredString(record.name);
    if (!id || !name) {
      return undefined;
    }

    categories.push({ id, name });
  }

  return categories;
}

function readAttributes(value: unknown): readonly ProductSearchAttribute[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    return undefined;
  }

  const attributes: ProductSearchAttribute[] = [];
  for (const entry of value) {
    if (typeof entry !== 'object' || entry === null) {
      return undefined;
    }

    const record = entry as Record<string, unknown>;
    const name = readRequiredString(record.name);
    const attributeValue = readRequiredString(record.value);
    if (!name || !attributeValue) {
      return undefined;
    }

    attributes.push({ name, value: attributeValue });
  }

  return attributes;
}
