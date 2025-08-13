# Deployment Guide for JapDEAL

## 📦 Deploying to GitHub

### Option 1: Using GitHub Website

1. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Repository name: `japdeal`
   - Description: "Japanese Car Import Auction Platform for Namibia"
   - Set to Private or Public based on your preference
   - Don't initialize with README (we already have one)
   - Click "Create repository"

2. **Push your local code to GitHub:**
   ```bash
   cd japdeal
   git remote add origin https://github.com/YOUR_USERNAME/japdeal.git
   git branch -M main
   git push -u origin main
   ```

### Option 2: Using GitHub CLI (if installed)

1. **Install GitHub CLI** (if not installed):
   - Download from: https://cli.github.com/
   - Or use winget: `winget install --id GitHub.cli`

2. **Create and push repository:**
   ```bash
   cd japdeal
   gh auth login
   gh repo create japdeal --private --source=. --remote=origin --push
   ```

## 🚀 Deploying to Vercel

### Prerequisites
- GitHub repository created and code pushed
- Vercel account (sign up at https://vercel.com)

### Step-by-Step Deployment

1. **Connect to Vercel:**
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Connect your GitHub account if not already connected
   - Select the `japdeal` repository

2. **Configure Project Settings:**
   
   **Framework Preset:** Next.js (auto-detected)
   
   **Build Settings:**
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

3. **Environment Variables:**
   
   Add the following environment variables in Vercel dashboard:
   
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://ugctohwrmliejdbrkter.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
   
   **Important:** Copy these from your `.env.local` file

4. **Deploy:**
   - Click "Deploy"
   - Wait for the build to complete (usually 2-3 minutes)
   - Your app will be available at: `https://japdeal.vercel.app`

### Post-Deployment Setup

1. **Update Supabase Settings:**
   - Go to your Supabase project settings
   - Add your Vercel URL to "Authorized URLs"
   - Update redirect URLs for authentication

2. **Custom Domain (Optional):**
   - In Vercel dashboard, go to Settings > Domains
   - Add your custom domain (e.g., `japdeal.na`)
   - Follow DNS configuration instructions

3. **Set up Production Database:**
   - Run migrations in Supabase SQL editor
   - Configure storage buckets for images
   - Set up email templates for authentication

## 🔧 Continuous Deployment

Once connected, Vercel will automatically:
- Deploy every push to `main` branch to production
- Create preview deployments for pull requests
- Provide deployment URLs for testing

## 📊 Monitoring

1. **Vercel Analytics:**
   - Enable Web Analytics in Vercel dashboard
   - Add Speed Insights for performance monitoring

2. **Supabase Dashboard:**
   - Monitor database usage
   - Check authentication logs
   - Review real-time connections

## 🚨 Important Security Steps

1. **Environment Variables:**
   - Never commit `.env.local` to GitHub
   - Use Vercel's environment variables for production
   - Rotate keys regularly

2. **Database Security:**
   - Ensure RLS policies are enabled
   - Test authentication flows
   - Monitor for unusual activity

3. **Rate Limiting:**
   - Configure Vercel's DDoS protection
   - Set up rate limiting in Supabase

## 📝 Deployment Checklist

Before going live:
- [ ] All environment variables configured in Vercel
- [ ] Database migrations run in Supabase
- [ ] Storage buckets created and configured
- [ ] Email templates set up in Supabase
- [ ] Authentication redirect URLs updated
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] RLS policies tested
- [ ] Sample data removed
- [ ] Admin user created

## 🆘 Troubleshooting

### Build Failures
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript has no errors: `npm run type-check`

### Database Connection Issues
- Verify Supabase URL and keys
- Check if database is not paused (free tier)
- Ensure RLS policies allow access

### Authentication Problems
- Update redirect URLs in Supabase
- Check email templates configuration
- Verify SMTP settings for magic links

## 📞 Support

- Vercel Support: https://vercel.com/support
- Supabase Support: https://supabase.com/support
- GitHub Issues: https://github.com/YOUR_USERNAME/japdeal/issues

---

**Note:** Replace `YOUR_USERNAME` with your actual GitHub username throughout this guide.