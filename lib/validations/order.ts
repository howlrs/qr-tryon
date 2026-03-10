import { z } from 'zod';

export const createOrderSchema = z.object({
  productId: z.number().int().positive(),
  productName: z.string().min(1).max(200).trim(),
  variantId: z.number().int().positive(),
  variantName: z.string().min(1).max(200).trim(),
  type: z.enum(['try-on', 'purchase']),
  deviceId: z.string().uuid().optional(),
}).strict();

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
