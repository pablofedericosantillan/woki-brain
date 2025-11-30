import { z } from 'zod';

export const createBookingBodySchema = z.object({
  restaurantId: z.string(),
  sectorId: z.string(),
  partySize: z.coerce.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "date must follow format YYYY-MM-DD",
    }),
  windowStart: z.string().regex(/^\d{2}:\d{2}$/, {
      message: "windowStart must follow format HH:mm",
    }),
  windowEnd: z.string().regex(/^\d{2}:\d{2}$/, {
      message: "windowEnd must follow format HH:mm",
    }),
  durationMinutes: z.coerce.number()
    .int()
    .positive()
    .refine((v: number) => v % 15 === 0, {
      message: "Non-grid times/durations",
    }),
});

export const discoverSeatsQuerySchema = z.object({
  restaurantId: z.string(),
  sectorId: z.string(),
  partySize: z.coerce.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "date must follow format YYYY-MM-DD",
    }),
  windowStart: z.string().regex(/^\d{2}:\d{2}$/, {
      message: "windowStart must follow format HH:mm",
    }),
  windowEnd: z.string().regex(/^\d{2}:\d{2}$/, {
      message: "windowEnd must follow format HH:mm",
    }),
  durationMinutes: z.coerce.number()
    .int()
    .positive()
    .refine((v: number) => v % 15 === 0, {
      message: "Non-grid times/durations",
    }),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const listBookingsQuerySchema = z.object({
  restaurantId: z.string(),
  sectorId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "date must follow format YYYY-MM-DD",
    }),
});
