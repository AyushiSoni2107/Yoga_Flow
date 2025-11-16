# Yoga Flow - API Documentation

## Database Schema

### Tables

#### 1. profiles
Extends Supabase auth.users with additional user information.

**Columns:**
- `id` (uuid, primary key) - References auth.users
- `full_name` (text) - User's full name
- `avatar_url` (text, nullable) - Profile photo URL
- `created_at` (timestamptz) - Account creation timestamp
- `updated_at` (timestamptz) - Last update timestamp

**RLS Policies:**
- Users can view their own profile
- Users can update their own profile
- Users can insert their own profile

---

#### 2. yoga_classes
Stores information about different yoga class types.

**Columns:**
- `id` (uuid, primary key) - Unique identifier
- `title` (text) - Class name
- `description` (text) - Detailed description
- `difficulty_level` (text) - Beginner, Intermediate, or Advanced
- `duration_minutes` (integer) - Class duration in minutes
- `image_url` (text, nullable) - Class image URL
- `instructor` (text) - Instructor name
- `max_participants` (integer) - Maximum class size
- `created_at` (timestamptz) - Creation timestamp

**RLS Policies:**
- Public read access for active classes

---

#### 3. class_schedules
Manages scheduled class sessions.

**Columns:**
- `id` (uuid, primary key) - Unique identifier
- `class_id` (uuid, foreign key) - References yoga_classes
- `day_of_week` (text) - Monday through Sunday
- `start_time` (time) - Class start time
- `end_time` (time) - Class end time
- `is_active` (boolean) - Whether schedule is active
- `created_at` (timestamptz) - Creation timestamp

**RLS Policies:**
- Public read access for active schedules

---

#### 4. bookings
Tracks user class bookings.

**Columns:**
- `id` (uuid, primary key) - Unique identifier
- `user_id` (uuid, foreign key) - References profiles
- `schedule_id` (uuid, foreign key) - References class_schedules
- `booking_date` (date) - Date of booking
- `status` (text) - confirmed, cancelled, or completed
- `created_at` (timestamptz) - Booking timestamp

**RLS Policies:**
- Users can view their own bookings
- Users can create their own bookings
- Users can update their own bookings
- Users can delete their own bookings

---

#### 5. blog_posts
Stores yoga-related articles and tips.

**Columns:**
- `id` (uuid, primary key) - Unique identifier
- `title` (text) - Article title
- `slug` (text, unique) - URL-friendly identifier
- `content` (text) - Article content
- `excerpt` (text, nullable) - Short summary
- `image_url` (text, nullable) - Featured image URL
- `author_id` (uuid, foreign key, nullable) - References profiles
- `published` (boolean) - Publication status
- `created_at` (timestamptz) - Creation timestamp
- `updated_at` (timestamptz) - Last update timestamp

**RLS Policies:**
- Public can view published blog posts
- Authenticated users can view all blog posts

---

#### 6. contact_messages
Stores contact form submissions.

**Columns:**
- `id` (uuid, primary key) - Unique identifier
- `name` (text) - Sender's name
- `email` (text) - Sender's email
- `message` (text) - Message content
- `status` (text) - new, read, or replied
- `created_at` (timestamptz) - Submission timestamp

**RLS Policies:**
- Public can create contact messages

---

#### 7. pricing_plans
Stores pricing tier information.

**Columns:**
- `id` (uuid, primary key) - Unique identifier
- `name` (text) - Plan name
- `price` (numeric) - Monthly/annual price
- `interval` (text) - month or year
- `features` (jsonb) - Plan features array
- `is_active` (boolean) - Whether plan is available
- `display_order` (integer) - Order in UI
- `created_at` (timestamptz) - Creation timestamp

**RLS Policies:**
- Public can view active pricing plans

---

## Authentication Endpoints

### Sign Up
Creates a new user account and profile.

**Function:** `signUp(email: string, password: string, fullName: string)`

**Process:**
1. Creates auth.users entry via Supabase Auth
2. Creates corresponding profiles entry
3. Returns error or success

---

### Sign In
Authenticates existing user.

**Function:** `signIn(email: string, password: string)`

**Process:**
1. Validates credentials via Supabase Auth
2. Establishes session
3. Returns error or success

---

### Sign Out
Logs out current user.

**Function:** `signOut()`

**Process:**
1. Invalidates current session
2. Clears local state

---

### Update Profile
Updates user profile information.

**Function:** `updateProfile(updates: Partial<Profile>)`

**Process:**
1. Validates user authentication
2. Updates profiles table
3. Updates local state

---

## Data Fetching Patterns

### Fetch Classes
```typescript
const { data, error } = await supabase
  .from('yoga_classes')
  .select('*')
  .order('difficulty_level');
```

### Fetch Pricing Plans
```typescript
const { data, error } = await supabase
  .from('pricing_plans')
  .select('*')
  .eq('is_active', true)
  .order('display_order');
```

### Fetch Blog Posts
```typescript
const { data, error } = await supabase
  .from('blog_posts')
  .select('*')
  .eq('published', true)
  .order('created_at', { ascending: false });
```

### Submit Contact Message
```typescript
const { error } = await supabase
  .from('contact_messages')
  .insert([{ name, email, message }]);
```

### Fetch User Profile
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .maybeSingle();
```

---

## AI Features

### AI Chatbot
**Location:** Floating button in bottom-right corner

**Capabilities:**
- Class recommendations based on skill level
- Pricing and plan information
- Schedule inquiries
- General yoga questions
- Booking assistance

**Implementation:**
- Rule-based response system
- Keyword matching for queries
- Extensible for integration with AI services (OpenAI, Claude, etc.)

---

### AI Mudra Recognition
**Location:** `/mudra-recognition` page

**Features:**
- Camera-based hand position detection
- Real-time feedback on mudra accuracy
- Detailed information about each mudra
- Benefits and instructions
- Confidence scoring

**Mudras Database:**
1. Anjali Mudra (Prayer Position)
2. Gyan Mudra (Knowledge Seal)
3. Prana Mudra (Life Force Seal)
4. Dhyana Mudra (Meditation Seal)
5. Lotus Mudra (Padma Mudra)

**Implementation Notes:**
- Current version uses simulated detection
- Ready for integration with MediaPipe Hands or TensorFlow.js
- Camera permissions required
- WebRTC for video stream

---

## Security Considerations

### Row Level Security (RLS)
All tables have RLS enabled with appropriate policies:
- Users can only access their own data
- Public data is read-only
- Authentication required for sensitive operations

### Authentication State
- Session-based authentication via Supabase Auth
- Automatic session refresh
- Secure password requirements (minimum 6 characters)

### Data Validation
- Client-side validation for forms
- Server-side validation via database constraints
- File upload restrictions (5MB max, images only)

---

## Environment Variables

Required environment variables in `.env`:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Error Handling

### Common Error Patterns

**Authentication Errors:**
- Invalid credentials
- User already exists
- Session expired

**Database Errors:**
- Connection failures
- Constraint violations
- Permission denied

**Validation Errors:**
- Missing required fields
- Invalid email format
- Password too short
- File size too large

---

## Future Enhancements

### Recommended Integrations

1. **Real AI Mudra Recognition:**
   - Integrate MediaPipe Hands
   - TensorFlow.js for hand pose detection
   - Custom ML model training

2. **Advanced Chatbot:**
   - OpenAI GPT integration
   - Context-aware responses
   - Natural language understanding

3. **Payment Processing:**
   - Stripe integration for subscriptions
   - Automated billing
   - Trial period management

4. **File Storage:**
   - Supabase Storage for profile photos
   - Image optimization
   - CDN delivery

5. **Email Notifications:**
   - Welcome emails
   - Class reminders
   - Booking confirmations

6. **Analytics:**
   - User engagement tracking
   - Popular classes
   - Conversion metrics
