
export type CategoryId = 'kitchen' | 'living' | 'bedroom' | 'kids' | 'bathroom' | 'cleaning' | 'tools' | 'multimedia' | 'groceries';

export type StoreType = 'supermarket' | 'furniture' | 'diy' | 'tech' | 'pharmacy';

export interface SubItem {
  id: string;
  label: string;
  acquired: boolean;
}

export interface Item {
  id: string;
  name: string;
  acquired: boolean;
  category: CategoryId;
  store: StoreType; // Where to buy this?
  priority: boolean; // True if it's a "survival" item
  estimatedPrice: number; // Average price for calculation
  paidPrice?: number; // Actual price paid by user
  paidBy?: string; // Who paid for this item? (Now a string to support names)
  dimensions?: string; // e.g. "140x200"
  notes?: string; // e.g. "Reference Billy White"
  subItems?: SubItem[]; // Granular checklist
}

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  image?: string; // Base64 image
}

export type View = 'dashboard' | 'inventory' | 'chat' | 'budget' | 'shopping-list' | 'settings' | 'profile' | 'admin' | 'moving' | 'social-report' | 'marketplace' | 'templates' | 'daily-groceries';

export interface Badge {
  id: string;
  label: string;
  description: string;
  icon: string;
  secret?: boolean; 
  condition: (inventory: Item[]) => boolean;
}

export interface LevelDef {
  level: number;
  title: string;
  minXP: number;
}

export interface OnboardingProfile {
  name: string;
  type: 'studio' | 't2' | 'coloc' | 'family';
}

export interface HousingInfo {
    address: string;
    surface: number; // m2
    floor: number; // 0 for ground
    hasElevator: boolean;
    searchRadius: number; // km
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isPremium: boolean;
  memberSince: Date;
  hasSocialWorker?: boolean;
  socialWorkerName?: string;
  housing?: HousingInfo; // New field for location targeting
}

// PLATINUM FEATURES TYPES

export interface AdminTask {
    id: string;
    label: string;
    category: 'housing' | 'energy' | 'internet' | 'admin' | 'social';
    status: 'todo' | 'in_progress' | 'done';
    dueDateOffset?: number; // Days relative to moving date (e.g., -7 for 1 week before)
    manualDate?: string; // User defined deadline (ISO string YYYY-MM-DD)
}

export interface LetterTemplate {
    id: string;
    label: string;
    subject: string;
    bodyModel: string; // Contains {{placeholder}}
}

export interface BoxDetail {
    count: number;
    isFragile: boolean;
    isHeavy: boolean;
}

export type BoxCounts = Record<string, BoxDetail>;

// V2 BUSINESS & SOCIAL TYPES

export interface PartnerService {
    id: string;
    name: string;
    description: string;
    category: 'moving' | 'insurance' | 'energy' | 'internet';
    logo: string; // Emoji or URL
    promo: string; // " -10% "
    link: string;
}

export interface CommunityTemplate {
    id: string;
    title: string;
    author: string;
    description: string;
    tags: string[];
    items: Partial<Item>[]; // List of items to add
    likes: number;
}

// ANCHORING SYSTEM TYPES
export interface Snapshot {
    id: string;
    label: string;
    timestamp: string;
    data: any; // Full state object
}

// NEW: DAILY GROCERY TYPES
export interface DailyGroceryItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    category: 'fresh' | 'pantry' | 'cleaning' | 'hygiene' | 'other';
    isFavorite: boolean;
    isChecked: boolean;
    estimatedPrice?: number;
}
