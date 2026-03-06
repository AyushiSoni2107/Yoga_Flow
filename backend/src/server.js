const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const classRoutes = require('./routes/classes');
const blogRoutes = require('./routes/blogs');
const pricingRoutes = require('./routes/pricing');
const contactRoutes = require('./routes/contact');
const instructorRoutes = require('./routes/instructor');
const learnerRoutes = require('./routes/learner');
const adminRoutes = require('./routes/admin');
const reportRoutes = require('./routes/reports');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Backend running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/learner', learnerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
