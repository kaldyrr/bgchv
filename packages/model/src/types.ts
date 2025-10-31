import { z } from 'zod';

export const Contact = z.object({
  id: z.string(),
  createdAt: z.number().default(() => Date.now()),
  updatedAt: z.number().default(() => Date.now()),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  companyId: z.string().optional()
});
export type Contact = z.infer<typeof Contact>;

export const Company = z.object({
  id: z.string(),
  createdAt: z.number().default(() => Date.now()),
  updatedAt: z.number().default(() => Date.now()),
  name: z.string().min(1)
});
export type Company = z.infer<typeof Company>;

export const Deal = z.object({
  id: z.string(),
  createdAt: z.number().default(() => Date.now()),
  updatedAt: z.number().default(() => Date.now()),
  title: z.string().min(1),
  value: z.number().nonnegative().default(0),
  status: z.enum(['open', 'won', 'lost']).default('open'),
  companyId: z.string().optional(),
  contactId: z.string().optional()
});
export type Deal = z.infer<typeof Deal>;

