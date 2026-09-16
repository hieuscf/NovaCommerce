export interface ProductAttributeEventPayload {
  readonly name: string;
  readonly value: string;
}

/**
 * Serializable product snapshot for ProductCreated / ProductUpdated.
 * Search projects this into ProductSearchDocument — Catalog remains source of truth.
 */
export interface ProductEventPayload {
  readonly name: string;
  readonly slug: string;
  readonly status: string;
  readonly price: number;
  readonly currency: string;
  readonly categoryId?: string;
  readonly images: readonly string[];
  readonly attributes: readonly ProductAttributeEventPayload[];
  readonly createdAt: string;
  readonly updatedAt: string;
}
