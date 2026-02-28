import { z } from 'zod';

// Phone number validation for Kenyan numbers
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+254|254|0)?[17]\d{8}$/, {
    message: 'Invalid Kenyan phone number. Use format: 0712345678 or +254712345678',
  })
  .transform((val) => {
    // Normalize to 254XXXXXXXXX format
    if (val.startsWith('+254')) return val.slice(1);
    if (val.startsWith('0')) return '254' + val.slice(1);
    if (val.startsWith('254')) return val;
    return '254' + val;
  });

// Amount validation
export const amountSchema = z
  .number()
  .positive({ message: 'Amount must be positive' })
  .max(150000, { message: 'Amount cannot exceed KES 150,000' })
  .min(1, { message: 'Amount must be at least KES 1' });

// MPESA account validation
export const mpesaAccountSchema = z.object({
  account_name: z
    .string()
    .trim()
    .min(2, { message: 'Account name must be at least 2 characters' })
    .max(100, { message: 'Account name must be less than 100 characters' }),
  account_number: z
    .string()
    .trim()
    .regex(/^\d{5,10}$/, {
      message: 'Account number must be 5-10 digits',
    }),
  account_type: z.enum(['till', 'paybill', 'pochi'] as const, {
    message: 'Invalid account type',
  }),
});

// Payment request validation
export const paymentRequestSchema = z.object({
  phone_number: phoneSchema,
  amount: amountSchema,
  mpesa_account_id: z.string().uuid({ message: 'Invalid account ID' }),
  description: z
    .string()
    .trim()
    .max(200, { message: 'Description must be less than 200 characters' })
    .optional(),
});

// Profile update validation
export const profileUpdateSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name must be less than 100 characters' }),
  phone_number: phoneSchema.optional(),
});

// Transaction filter validation
export const transactionFilterSchema = z.object({
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  status: z.enum(['pending', 'completed', 'failed', 'all']).optional(),
  transaction_type: z.enum(['sent', 'received', 'all']).optional(),
  min_amount: z.number().positive().optional(),
  max_amount: z.number().positive().optional(),
});

// Sanitize user input for display
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000); // Limit length
};

// Validate and sanitize search query
export const sanitizeSearchQuery = (query: string): string => {
  return query
    .trim()
    .replace(/[^\w\s\-+]/g, '') // Allow only alphanumeric, spaces, hyphens, and plus
    .slice(0, 100); // Limit length
};
