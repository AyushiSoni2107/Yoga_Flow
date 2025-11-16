# Yoga Flow - Deployment Guide

## Prerequisites

Before deploying, ensure you have:
- Node.js 18+ installed
- A Supabase account and project
- Git installed

---

## Database Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Save your project URL and anon key

### 2. Run Migrations
The database schema has already been created via the migration file. If you need to recreate it:

1. Navigate to SQL Editor in Supabase Dashboard
2. Copy the contents of `supabase/migrations/create_yoga_flow_schema.sql`
3. Execute the SQL

### 3. Verify Tables
Check that all tables exist:
- profiles
- yoga_classes
- class_schedules
- bookings
- blog_posts
- contact_messages
- pricing_plans

---

## Environment Configuration

### 1. Create .env File
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Update Supabase Credentials
Replace the values with your actual Supabase project credentials:
- URL: Found in Project Settings > API
- Anon Key: Found in Project Settings > API

---

## Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 3. Type Checking
```bash
npm run typecheck
```

### 4. Linting
```bash
npm run lint
```

---

## Production Build

### 1. Build for Production
```bash
npm run build
```

This creates optimized files in the `dist` directory.

### 2. Preview Production Build
```bash
npm run preview
```

---

## Deployment Options

### Option 1: Netlify

1. **Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Login to Netlify:**
```bash
netlify login
```

3. **Deploy:**
```bash
netlify deploy --prod
```

4. **Configure Environment Variables:**
- Go to Site Settings > Environment Variables
- Add `VITE_SUPABASE_URL`
- Add `VITE_SUPABASE_ANON_KEY`

---

### Option 2: Vercel

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel --prod
```

4. **Configure Environment Variables:**
- Go to Project Settings > Environment Variables
- Add `VITE_SUPABASE_URL`
- Add `VITE_SUPABASE_ANON_KEY`

---

### Option 3: GitHub Pages

1. **Install gh-pages:**
```bash
npm install --save-dev gh-pages
```

2. **Update package.json:**
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://yourusername.github.io/yoga-flow"
}
```

3. **Update vite.config.ts:**
```typescript
export default defineConfig({
  base: '/yoga-flow/',
  plugins: [react()],
  // ... rest of config
});
```

4. **Deploy:**
```bash
npm run deploy
```

---

### Option 4: Traditional Hosting (cPanel, etc.)

1. **Build the project:**
```bash
npm run build
```

2. **Upload files:**
- Upload contents of `dist` folder to your web server
- Ensure `.htaccess` is configured for SPA routing

3. **Create .htaccess file:**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## Post-Deployment Configuration

### 1. Supabase Authentication Settings

In Supabase Dashboard:
1. Go to Authentication > URL Configuration
2. Add your production URL to Site URL
3. Add redirect URLs under Redirect URLs

### 2. CORS Configuration

Ensure your production domain is allowed in Supabase:
1. Go to Project Settings > API
2. Check CORS settings
3. Add your domain if needed

### 3. Email Templates (Optional)

Configure email templates in Supabase:
1. Go to Authentication > Email Templates
2. Customize welcome email
3. Customize password reset email

---

## Monitoring and Maintenance

### 1. Database Backups
- Supabase provides automatic daily backups
- For additional safety, set up custom backup schedule

### 2. Error Tracking
Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- Google Analytics for usage tracking

### 3. Performance Monitoring
- Lighthouse CI for performance audits
- Web Vitals monitoring
- Supabase dashboard for database performance

---

## Scaling Considerations

### 1. Database Optimization
- Add indexes for frequently queried columns
- Implement caching for static data
- Use Supabase's connection pooling

### 2. CDN Integration
- Use Cloudflare or similar CDN
- Enable asset compression
- Implement caching headers

### 3. Image Optimization
- Implement lazy loading
- Use modern image formats (WebP)
- Integrate Supabase Storage with CDN

---

## Troubleshooting

### Common Issues

**Issue: White screen on deployment**
- Check browser console for errors
- Verify environment variables are set
- Check base URL in vite.config.ts

**Issue: Database connection errors**
- Verify Supabase credentials
- Check network connectivity
- Ensure RLS policies are correct

**Issue: Authentication not working**
- Verify redirect URLs in Supabase
- Check email confirmation settings
- Ensure session storage is enabled

**Issue: Camera access denied (Mudra Recognition)**
- Ensure HTTPS is enabled
- Check browser permissions
- Verify camera API support

---

## Security Checklist

Before going live:
- [ ] All environment variables are secure
- [ ] RLS policies are properly configured
- [ ] HTTPS is enabled
- [ ] Authentication is working correctly
- [ ] File upload restrictions are in place
- [ ] Rate limiting is configured (if needed)
- [ ] CORS settings are restrictive
- [ ] SQL injection protection via Supabase
- [ ] XSS protection enabled
- [ ] Content Security Policy configured

---

## Support and Resources

- Supabase Documentation: https://supabase.com/docs
- Vite Documentation: https://vitejs.dev
- React Documentation: https://react.dev
- Tailwind CSS: https://tailwindcss.com

---

## Maintenance Schedule

### Weekly Tasks
- Review error logs
- Check database performance
- Monitor user feedback

### Monthly Tasks
- Update dependencies
- Review and optimize database queries
- Check security updates

### Quarterly Tasks
- Backup audit
- Performance optimization
- Feature planning
- User survey

---

## Contact

For technical support or questions about deployment:
- Email: support@yogaflow.com
- Documentation: See API_DOCUMENTATION.md
- Issues: Use GitHub Issues (if applicable)
