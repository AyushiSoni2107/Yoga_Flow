export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const TOKEN_KEY = 'yoga_flow_token';

export type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: 'admin' | 'instructor' | 'practitioner';
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
  updated_at: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  author_id: string | null;
  author_name: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type BlogFeedback = {
  id: string;
  blog_slug: string;
  name: string;
  message: string;
  rating: number;
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
  created_at: string;
  updated_at: string;
};

export type ContactMessage = {
  name: string;
  email: string;
  message: string;
};

export type AuthUser = {
  id: string;
  email: string;
};

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
  } catch (_error) {
    throw new Error('Cannot connect to backend. Start backend with: npm run backend');
  }

  if (!response.ok) {
    let message = 'Request failed';
    if (response.status === 413) {
      message = 'Uploaded profile photo is too large. Please choose a smaller image.';
    }
    try {
      const payload = await response.json();
      if (payload?.message) {
        message = payload.message;
      }
    } catch (_error) {
      try {
        const text = await response.text();
        if (text.includes('Cannot POST') || text.includes('Cannot GET')) {
          message = 'Backend route not available. Restart backend with: npm run backend';
        }
      } catch (_ignored) {
        // no-op: keep fallback message
      }
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function authApiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    throw new Error('Please login first.');
  }

  return apiRequest<T>(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
}
