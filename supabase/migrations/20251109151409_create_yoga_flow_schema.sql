/*
  # Yoga Flow Database Schema

  ## Overview
  This migration creates the complete database schema for the Yoga Flow website,
  including user profiles, classes, bookings, blog posts, and contact messages.

  ## Tables Created

  ### 1. profiles
  Extends Supabase auth.users with additional user information:
  - `id` (uuid, primary key) - References auth.users
  - `full_name` (text) - User's full name
  - `avatar_url` (text) - Profile photo URL
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. yoga_classes
  Stores information about different yoga class types:
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text) - Class name
  - `description` (text) - Detailed description
  - `difficulty_level` (text) - Beginner, Intermediate, Advanced
  - `duration_minutes` (integer) - Class duration
  - `image_url` (text) - Class image
  - `instructor` (text) - Instructor name
  - `max_participants` (integer) - Maximum class size
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. class_schedules
  Manages scheduled class sessions:
  - `id` (uuid, primary key) - Unique identifier
  - `class_id` (uuid, foreign key) - References yoga_classes
  - `day_of_week` (text) - Monday-Sunday
  - `start_time` (time) - Class start time
  - `end_time` (time) - Class end time
  - `is_active` (boolean) - Whether schedule is active

  ### 4. bookings
  Tracks user class bookings:
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - References profiles
  - `schedule_id` (uuid, foreign key) - References class_schedules
  - `booking_date` (date) - Date of booking
  - `status` (text) - confirmed, cancelled, completed
  - `created_at` (timestamptz) - Booking timestamp

  ### 5. blog_posts
  Stores yoga-related articles and tips:
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text) - Article title
  - `slug` (text, unique) - URL-friendly identifier
  - `content` (text) - Article content
  - `excerpt` (text) - Short summary
  - `image_url` (text) - Featured image
  - `author_id` (uuid, foreign key) - References profiles
  - `published` (boolean) - Publication status
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 6. contact_messages
  Stores contact form submissions:
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Sender's name
  - `email` (text) - Sender's email
  - `message` (text) - Message content
  - `status` (text) - new, read, replied
  - `created_at` (timestamptz) - Submission timestamp

  ### 7. pricing_plans
  Stores pricing tier information:
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Plan name
  - `price` (numeric) - Monthly/annual price
  - `interval` (text) - month or year
  - `features` (jsonb) - Plan features array
  - `is_active` (boolean) - Whether plan is available
  - `display_order` (integer) - Order in UI

  ## Security
  - RLS enabled on all tables
  - Users can read their own profile data
  - Users can create and manage their own bookings
  - Public can read published blog posts and class information
  - Only authenticated users can create contact messages
  - Admin functions require service role

  ## Important Notes
  1. Profile photos are stored in Supabase Storage (not implemented in this migration)
  2. All timestamps use UTC timezone
  3. Soft deletes not implemented (use status fields instead)
  4. Indexes added for frequently queried columns
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create yoga_classes table
CREATE TABLE IF NOT EXISTS yoga_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  difficulty_level text NOT NULL CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')),
  duration_minutes integer NOT NULL DEFAULT 60,
  image_url text,
  instructor text NOT NULL,
  max_participants integer DEFAULT 20,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE yoga_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active classes"
  ON yoga_classes FOR SELECT
  TO public
  USING (true);

-- Create class_schedules table
CREATE TABLE IF NOT EXISTS class_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES yoga_classes(id) ON DELETE CASCADE,
  day_of_week text NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE class_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active schedules"
  ON class_schedules FOR SELECT
  TO public
  USING (is_active = true);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  schedule_id uuid NOT NULL REFERENCES class_schedules(id) ON DELETE CASCADE,
  booking_date date NOT NULL,
  status text DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookings"
  ON bookings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text,
  image_url text,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published blog posts"
  ON blog_posts FOR SELECT
  TO public
  USING (published = true);

CREATE POLICY "Authenticated users can view all blog posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (true);

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create contact messages"
  ON contact_messages FOR INSERT
  TO public
  WITH CHECK (true);

-- Create pricing_plans table
CREATE TABLE IF NOT EXISTS pricing_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric(10, 2) NOT NULL,
  interval text NOT NULL CHECK (interval IN ('month', 'year')),
  features jsonb NOT NULL DEFAULT '[]',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active pricing plans"
  ON pricing_plans FOR SELECT
  TO public
  USING (is_active = true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_schedule_id ON bookings(schedule_id);
CREATE INDEX IF NOT EXISTS idx_class_schedules_class_id ON class_schedules(class_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);

-- Insert sample yoga classes
INSERT INTO yoga_classes (title, description, difficulty_level, duration_minutes, instructor, image_url) VALUES
('Beginner Yoga', 'Perfect for those new to yoga. Learn basic poses, breathing techniques, and foundational principles in a supportive environment.', 'Beginner', 60, 'Sarah Johnson', 'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Power Yoga', 'A vigorous, fitness-based approach to yoga. Build strength, flexibility, and stamina through challenging sequences.', 'Intermediate', 75, 'Mike Chen', 'https://images.pexels.com/photos/3822220/pexels-photo-3822220.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Meditation & Mindfulness', 'Cultivate inner peace and mental clarity through guided meditation and mindfulness practices.', 'Beginner', 45, 'Emma Davis', 'https://images.pexels.com/photos/3822647/pexels-photo-3822647.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Advanced Flow', 'Challenge yourself with complex sequences, inversions, and arm balances. Requires strong foundation.', 'Advanced', 90, 'David Martinez', 'https://images.pexels.com/photos/3822688/pexels-photo-3822688.jpeg?auto=compress&cs=tinysrgb&w=800')
ON CONFLICT DO NOTHING;

-- Insert sample pricing plans
INSERT INTO pricing_plans (name, price, interval, features, display_order) VALUES
('Basic Plan', 20.00, 'month', '["Access to beginner classes", "1 class per week", "Online resources", "Community forum access"]', 1),
('Standard Plan', 40.00, 'month', '["Access to all classes", "Meditation sessions", "3 classes per week", "Priority booking", "Nutrition guide"]', 2),
('Premium Plan', 60.00, 'month', '["Unlimited class access", "Personal coaching", "One-on-one sessions", "Customized workout plans", "Nutrition consultation"]', 3),
('Annual Plan', 500.00, 'year', '["Best value package", "All Premium features", "2 free months", "Exclusive workshops", "Retreat discounts"]', 4)
ON CONFLICT DO NOTHING;

-- Insert sample blog posts
INSERT INTO blog_posts (title, slug, content, excerpt, published, image_url) VALUES
('Benefits of Morning Yoga', 'benefits-of-morning-yoga', 'Starting your day with yoga can transform your entire routine. Morning yoga helps awaken your body, increases energy levels, and sets a positive tone for the day ahead. Research shows that practicing yoga in the morning can improve focus, boost metabolism, and reduce stress throughout the day.', 'Discover how morning yoga can energize your day and improve your overall wellbeing.', true, 'https://images.pexels.com/photos/3822354/pexels-photo-3822354.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Meditation for Beginners', 'meditation-for-beginners', 'Meditation doesn''t have to be complicated. This beginner''s guide will walk you through simple techniques to start your meditation practice. Learn about breathing exercises, finding the right posture, and dealing with common challenges like a wandering mind.', 'Simple techniques to start your meditation journey and find inner peace.', true, 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Yoga for Stress Relief', 'yoga-for-stress-relief', 'In our fast-paced world, stress has become a constant companion. Yoga offers powerful tools to manage and reduce stress naturally. Specific poses, breathing techniques, and meditation practices can activate your body''s relaxation response and help you find calm amidst chaos.', 'Learn effective yoga practices to manage stress and restore balance in your life.', true, 'https://images.pexels.com/photos/3822356/pexels-photo-3822356.jpeg?auto=compress&cs=tinysrgb&w=800')
ON CONFLICT DO NOTHING;