const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const { defaultClasses, defaultBlogs, defaultPricing } = require('../utils/defaultData');
const User = require('../models/User');
const YogaClass = require('../models/YogaClass');
const BlogPost = require('../models/BlogPost');
const BlogFeedback = require('../models/BlogFeedback');
const PricingPlan = require('../models/PricingPlan');
const ContactMessage = require('../models/ContactMessage');
const InstructorVideo = require('../models/InstructorVideo');
const LiveSession = require('../models/LiveSession');
const LearnerProgress = require('../models/LearnerProgress');
const Complaint = require('../models/Complaint');
const YogaCategory = require('../models/YogaCategory');
const PlatformSetting = require('../models/PlatformSetting');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const seedIfEmpty = async (Model, data, label) => {
  const count = await Model.countDocuments();
  if (count > 0) {
    console.log(`${label}: already has data (${count})`);
    return;
  }
  if (!data || data.length === 0) {
    console.log(`${label}: no seed payload`);
    return;
  }
  await Model.insertMany(data);
  console.log(`${label}: inserted ${data.length}`);
};

const run = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing in backend/.env');
    }

    await connectDB();

    const adminEmail = 'admin@yogaflow.com';
    const instructorEmail = 'instructor@yogaflow.com';
    const learnerEmail = 'learner@yogaflow.com';
    const defaultPassword = '12345678';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    await seedIfEmpty(User, [
      {
        full_name: 'Yoga Admin',
        email: adminEmail,
        password_hash: passwordHash,
        role: 'admin',
        account_status: 'active',
        instructor_status: 'approved',
        is_verified: true,
      },
      {
        full_name: 'Anita Instructor',
        email: instructorEmail,
        password_hash: passwordHash,
        role: 'instructor',
        account_status: 'active',
        instructor_status: 'approved',
        is_verified: true,
      },
      {
        full_name: 'Riya Learner',
        email: learnerEmail,
        password_hash: passwordHash,
        role: 'practitioner',
        account_status: 'active',
        instructor_status: 'approved',
        is_verified: true,
      },
    ], 'users');

    await seedIfEmpty(YogaClass, defaultClasses, 'classes');
    await seedIfEmpty(BlogPost, defaultBlogs, 'blogs');
    await seedIfEmpty(PricingPlan, defaultPricing, 'pricing_plans');

    const instructor = await User.findOne({ email: instructorEmail });
    const learner = await User.findOne({ email: learnerEmail });
    const firstClass = await YogaClass.findOne().sort({ createdAt: 1 });
    const firstBlog = await BlogPost.findOne().sort({ createdAt: 1 });

    await seedIfEmpty(InstructorVideo, instructor ? [
      {
        title: 'Morning Mobility Flow',
        level: 'Beginner',
        file_name: 'morning-mobility-flow.mp4',
        uploaded_by: instructor._id.toString(),
        status: 'active',
        category: 'Mobility',
        tags: ['morning', 'beginner', 'mobility'],
        views: 18,
      },
    ] : [], 'instructor_videos');

    await seedIfEmpty(LiveSession, instructor ? [
      {
        topic: 'Sunrise Breath & Stretch',
        is_live: false,
        started_by: instructor._id.toString(),
        status: 'scheduled',
        scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000),
        attendee_count: 0,
      },
    ] : [], 'live_sessions');

    await seedIfEmpty(LearnerProgress, learner && firstClass ? [
      {
        user_id: learner._id.toString(),
        class_title: firstClass.title,
        minutes: 35,
        completed: true,
        session_date: new Date(),
      },
    ] : [], 'learner_progress');

    await seedIfEmpty(BlogFeedback, firstBlog ? [
      {
        blog_slug: firstBlog.slug,
        name: 'Riya Learner',
        message: 'Very helpful tips, easy to follow.',
        rating: 5,
      },
    ] : [], 'blog_feedback');

    await seedIfEmpty(ContactMessage, [
      {
        name: 'Sample Contact',
        email: 'sample@yogaflow.com',
        message: 'Hello, I want to join beginner classes.',
      },
    ], 'contact_messages');

    await seedIfEmpty(YogaCategory, [
      {
        name: 'Beginner',
        description: 'Classes for new learners',
        tags: ['foundation', 'slow', 'alignment'],
        is_active: true,
      },
      {
        name: 'Meditation',
        description: 'Breathwork and mindfulness sessions',
        tags: ['breath', 'mindfulness'],
        is_active: true,
      },
    ], 'yoga_categories');

    await seedIfEmpty(PlatformSetting, [
      {
        key: 'platform_name',
        value: 'Yoga Flow',
        description: 'Displayed platform title',
      },
      {
        key: 'support_email',
        value: 'support@yogaflow.com',
        description: 'Public support contact email',
      },
    ], 'platform_settings');

    const instructorVideo = await InstructorVideo.findOne().sort({ createdAt: 1 });
    await seedIfEmpty(Complaint, learner && instructorVideo ? [
      {
        reporter_id: learner._id.toString(),
        target_type: 'video',
        target_id: instructorVideo._id.toString(),
        reason: 'Audio quality issue',
        details: 'Audio is low in the middle section.',
        status: 'open',
      },
    ] : [], 'complaints');

    console.log('');
    console.log('Seed complete.');
    console.log('Login users created if users collection was empty:');
    console.log(`- Admin: ${adminEmail} / ${defaultPassword}`);
    console.log(`- Instructor: ${instructorEmail} / ${defaultPassword}`);
    console.log(`- Learner: ${learnerEmail} / ${defaultPassword}`);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();
