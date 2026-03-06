const defaultClasses = [
  {
    title: 'Beginner Flow',
    description: 'Learn foundational yoga poses, alignment, and breathwork in a calm guided session.',
    difficulty_level: 'Beginner',
    duration_minutes: 45,
    instructor: 'Anita Sharma',
    max_participants: 25,
    image_url: 'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    title: 'Power Yoga',
    description: 'Dynamic and energetic sequence designed to build strength and stamina.',
    difficulty_level: 'Intermediate',
    duration_minutes: 60,
    instructor: 'Rahul Verma',
    max_participants: 20,
    image_url: 'https://images.pexels.com/photos/317157/pexels-photo-317157.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    title: 'Advanced Vinyasa',
    description: 'Fast-paced vinyasa flow with advanced transitions for experienced practitioners.',
    difficulty_level: 'Advanced',
    duration_minutes: 75,
    instructor: 'Meera Iyer',
    max_participants: 15,
    image_url: 'https://images.pexels.com/photos/1812964/pexels-photo-1812964.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

const defaultBlogs = [
  {
    title: '5 Morning Yoga Poses to Boost Energy',
    slug: 'morning-yoga-poses-boost-energy',
    excerpt: 'Start your day with these five easy poses that improve focus and energy.',
    content: 'A full guide to morning yoga poses and breathing routines for a productive day.',
    image_url: 'https://images.pexels.com/photos/3822354/pexels-photo-3822354.jpeg?auto=compress&cs=tinysrgb&w=800',
    author_name: 'Yoga Flow Team',
    published: true,
    approval_status: 'approved',
    spam_flag: false,
  },
  {
    title: 'How Breathwork Reduces Stress',
    slug: 'how-breathwork-reduces-stress',
    excerpt: 'Understand the science of breath and simple techniques you can do anywhere.',
    content: 'Deep dive into pranayama methods and practical stress management rituals.',
    image_url: 'https://images.pexels.com/photos/4325465/pexels-photo-4325465.jpeg?auto=compress&cs=tinysrgb&w=800',
    author_name: 'Yoga Flow Team',
    published: true,
    approval_status: 'approved',
    spam_flag: false,
  },
];

const defaultPricing = [
  {
    name: 'Basic',
    price: 20,
    interval: 'month',
    features: ['2 classes/week', 'Beginner programs', 'Community support'],
    is_active: true,
    display_order: 1,
  },
  {
    name: 'Standard',
    price: 40,
    interval: 'month',
    features: ['Unlimited classes', 'Meditation sessions', 'Progress tracking'],
    is_active: true,
    display_order: 2,
  },
  {
    name: 'Premium',
    price: 60,
    interval: 'month',
    features: ['Everything in Standard', '1:1 coach support', 'Priority booking'],
    is_active: true,
    display_order: 3,
  },
  {
    name: 'Annual',
    price: 500,
    interval: 'year',
    features: ['All Premium features', '2 months free', 'Exclusive workshops'],
    is_active: true,
    display_order: 4,
  },
];

module.exports = { defaultClasses, defaultBlogs, defaultPricing };
