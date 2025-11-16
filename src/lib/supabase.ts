import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type YogaClass = {
  id: string;
  title: string;
  description: string;
  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration_minutes: number;
  image_url: string | null;
  instructor: string;
  max_participants: number;
  created_at: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  author_id: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type PricingPlan = {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  is_active: boolean;
  display_order: number;
};

export type ContactMessage = {
  name: string;
  email: string;
  message: string;
};
