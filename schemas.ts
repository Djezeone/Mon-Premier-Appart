
import { z } from 'zod';

// Basic Enums and Types
export const CategoryIdSchema = z.enum(['kitchen', 'living', 'bedroom', 'kids', 'bathroom', 'cleaning', 'tools', 'multimedia', 'groceries']);
export const StoreTypeSchema = z.enum(['supermarket', 'furniture', 'diy', 'tech', 'pharmacy']);

// SubItem Schema
export const SubItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  acquired: z.boolean()
});

// Item Schema
export const ItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  acquired: z.boolean(),
  category: CategoryIdSchema,
  store: StoreTypeSchema,
  priority: z.boolean(),
  estimatedPrice: z.number(),
  paidPrice: z.number().optional(),
  paidBy: z.string().optional(), // Changed to generic string for names
  dimensions: z.string().optional(),
  notes: z.string().optional(),
  subItems: z.array(SubItemSchema).optional()
});

// User Schema
export const HousingInfoSchema = z.object({
    address: z.string().optional(),
    surface: z.number().optional(),
    floor: z.number().optional(),
    hasElevator: z.boolean().optional(),
    searchRadius: z.number().optional()
});

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatar: z.string(),
  isPremium: z.boolean(),
  memberSince: z.string().or(z.date()), // Date is stringified in JSON
  hasSocialWorker: z.boolean().optional(),
  socialWorkerName: z.string().optional(),
  housing: HousingInfoSchema.optional()
});

// Chat Schema
export const ChatMessageSchema = z.object({
    id: z.string(),
    role: z.enum(['user', 'model']),
    text: z.string(),
    timestamp: z.string().or(z.date()),
    image: z.string().optional()
});

// Full Backup Schema
export const BackupSchema = z.object({
    version: z.string().optional(),
    timestamp: z.string().optional(),
    user: UserSchema.optional(),
    roommates: z.array(z.string()).optional(), // Added roommates array
    partnerName: z.string().nullable().optional(), // Kept for backward compatibility
    gamification: z.object({
        xp: z.number(),
        level: z.number()
    }).optional(),
    inventory: z.array(ItemSchema).optional(),
    chatHistory: z.array(ChatMessageSchema).optional()
});
