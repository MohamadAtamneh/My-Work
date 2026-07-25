import { Request, Response } from 'express';
import { db } from '../config/firebase';

export interface Product {
  id?: string;
  name: string;
  price: number;
  image: string;
  /** Gallery of angles for this product — images[0] is the main angle (same as `image`). */
  images?: string[];
  sizes: string[];
  category: string;
  description?: string;
  stock?: number;
  /** Optional sale price — when 0 < salePrice < price it wins everywhere (shop, cart, checkout). */
  salePrice?: number;
  /** Denormalized from the reviews collection — written by reviewsController only. */
  ratingAvg?: number;
  ratingCount?: number;
  createdAt?: string;
}

const COLLECTION = 'products';

// Get all products
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection(COLLECTION).orderBy('createdAt', 'desc').get();
    const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(products);
  } catch (error: any) {
    console.error('Error getting products:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await db.collection(COLLECTION).doc(id).get();

    if (doc.exists) {
      res.json({ id: doc.id, ...doc.data() });
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error: any) {
    console.error('Error getting product:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get products by category
export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const snapshot = await db
      .collection(COLLECTION)
      .where('category', '==', category)
      .get();
    const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(products);
  } catch (error: any) {
    console.error('Error getting products by category:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create new product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const productData = req.body as Omit<Product, 'id' | 'createdAt'>;
    // Rating fields are computed from the reviews collection — never client-set.
    delete (productData as Partial<Product>).ratingAvg;
    delete (productData as Partial<Product>).ratingCount;
    const docRef = await db.collection(COLLECTION).add({
      ...productData,
      createdAt: new Date().toISOString()
    });
    const doc = await docRef.get();
    res.status(201).json({ id: doc.id, ...doc.data() });
  } catch (error: any) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productData = req.body as Partial<Product>;
    // Rating fields are computed from the reviews collection — never client-set.
    delete productData.ratingAvg;
    delete productData.ratingCount;
    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await docRef.update(productData);
    const updated = await docRef.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (error: any) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await docRef.delete();
    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
};
