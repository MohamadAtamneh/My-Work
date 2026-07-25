import { db } from '../config/firebase';

export interface VerifiedLine {
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  quantity: number;
  size: string;
}

export interface PricedCart {
  items: VerifiedLine[];
  totalAmount: number;
}

// Rebuild client-sent cart lines against Firestore product data. Prices and the
// total are ALWAYS computed server-side — client-sent prices/totals are never
// trusted. Throws an Error with a client-safe message when a line is invalid.
export const priceCartItems = async (
  items: Array<{ productId?: unknown; quantity?: unknown; size?: unknown }>
): Promise<PricedCart> => {
  const verified: VerifiedLine[] = [];
  let totalAmount = 0;

  for (const item of items) {
    if (!item || typeof item.productId !== 'string' || !item.productId) {
      throw new Error('Every item needs a productId');
    }

    const productDoc = await db.collection('products').doc(item.productId).get();
    if (!productDoc.exists) {
      throw new Error(`Unknown product: ${item.productId}`);
    }

    const product = productDoc.data() as {
      name?: string;
      price?: number;
      salePrice?: number;
      image?: string;
    };
    const unitPrice =
      typeof product.salePrice === 'number' && product.salePrice > 0
        ? product.salePrice
        : Number(product.price) || 0;
    const quantity = Math.max(1, Math.min(99, Math.floor(Number(item.quantity)) || 1));

    verified.push({
      productId: item.productId,
      productName: product.name || 'Unknown product',
      productPrice: unitPrice,
      productImage: product.image || '',
      quantity,
      size: String(item.size || '')
    });
    totalAmount += unitPrice * quantity;
  }

  return { items: verified, totalAmount: Math.round(totalAmount * 100) / 100 };
};
