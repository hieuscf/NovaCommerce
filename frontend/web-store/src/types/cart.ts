export type CartItem = {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
};
