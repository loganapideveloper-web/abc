import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Product name is required'),
    brand: z.string().min(1, 'Brand is required'),
    category: z.string().min(1, 'Category is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    shortDescription: z.string().optional(),
    price: z.number().min(0, 'Price must be positive'),
    originalPrice: z.number().min(0, 'Original price must be positive'),
    discount: z.number().min(0).max(100).optional(),
    images: z.array(z.string()).min(1, 'At least one image is required'),
    thumbnail: z.string().min(1, 'Thumbnail is required'),
    specifications: z.object({
      display: z.string().optional(),
      displaySize: z.string().optional(),
      processor: z.string().optional(),
      ram: z.string().optional(),
      storage: z.string().optional(),
      expandableStorage: z.string().optional(),
      battery: z.string().optional(),
      chargingSpeed: z.string().optional(),
      rearCamera: z.string().optional(),
      frontCamera: z.string().optional(),
      os: z.string().optional(),
      network: z.string().optional(),
      sim: z.string().optional(),
      weight: z.string().optional(),
      dimensions: z.string().optional(),
      waterResistant: z.string().optional(),
      fingerprint: z.string().optional(),
      nfc: z.boolean().optional(),
    }).optional(),
    stock: z.number().int().min(0).optional(),
    tags: z.array(z.string()).optional(),
    isFeatured: z.boolean().optional(),
    isTrending: z.boolean().optional(),
    colors: z.array(z.string()).optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: createProductSchema.shape.body.partial(),
});

export const reviewSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    rating: z.number().int().min(1).max(5),
    title: z.string().optional().default(''),
    comment: z.string().min(5, 'Review comment must be at least 5 characters'),
  }),
});
