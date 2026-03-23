# Deployment Guide

## 🚀 Deploying to Lovable

Lovable is perfect for Zendesk internal tools! Here's how to deploy:

### Prerequisites
- GitHub account
- Lovable.dev account (sign up with your Zendesk email)

### Step 1: Push to GitHub

```bash
cd /Users/matt.marontate/ai-snapshot-generator

# Initialize git
git init
git add .
git commit -m "Initial commit: AI Snapshot Generator"

# Create repo on github.com, then:
git remote add origin https://github.com/YOUR-USERNAME/ai-snapshot-generator.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Lovable

1. Go to [lovable.dev](https://lovable.dev)
2. Sign in with your Zendesk email
3. Click **"New Project"**
4. Select **"Import from GitHub"**
5. Choose your `ai-snapshot-generator` repo
6. Click **"Deploy"**

Lovable will:
- Automatically detect Vite config
- Build the project
- Deploy it to a URL like: `https://your-app.lovable.app`
- Set up automatic deploys on every push to `main`

### Step 3: Share with Team

1. Send the URL to your colleagues
2. They visit the URL
3. Each person enters their own Anthropic API key
4. Start generating reports!

---

## Alternative: Vercel (if Lovable isn't available)

### Deploy with Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd /Users/matt.marontate/ai-snapshot-generator
vercel

# Follow prompts:
# - Link to existing project? N
# - Project name: ai-snapshot-generator
# - Directory: ./
# - Override settings? N

# Production deploy
vercel --prod
```

Your app will be live at: `https://ai-snapshot-generator.vercel.app`

### Vercel Automatic Deploys

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Import your GitHub repo
3. Vercel auto-deploys on every push to `main`

---

## Alternative: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Deploy
netlify deploy --prod
```

---

## 🔐 Important: Environment Variables

**You DON'T need server-side environment variables!**

This app stores API keys in the browser (`localStorage`), so:
- ✅ No backend needed
- ✅ No secrets to manage
- ✅ Each user brings their own API key
- ✅ Works on any static host

---

## 📱 Custom Domain (Optional)

### For Lovable:
1. Go to project settings
2. Add custom domain
3. Update DNS records

### For Vercel:
```bash
vercel domains add yourapp.zendesk.com
```

### For Netlify:
1. Site settings → Domain management
2. Add custom domain

---

## 🔄 Updating the App

After making changes:

```bash
git add .
git commit -m "Description of changes"
git push
```

Lovable/Vercel/Netlify will automatically rebuild and deploy!

---

## 👥 Team Collaboration Setup

### Adding Your Colleague

#### On GitHub:
1. Go to your repo → **Settings** → **Collaborators**
2. Click **"Add people"**
3. Enter colleague's GitHub username
4. They accept the invitation

#### On Lovable:
- Lovable picks up GitHub permissions automatically
- If they're a repo collaborator, they can view/manage deployments

#### On Vercel/Netlify:
- Settings → Team
- Invite by email

### Your Colleague's Setup:

```bash
# Clone the repo
git clone https://github.com/YOUR-USERNAME/ai-snapshot-generator.git
cd ai-snapshot-generator

# Install
npm install

# Run locally
npm run dev

# Make changes, then push
git add .
git commit -m "Added new feature"
git push
```

---

## 🐛 Troubleshooting

### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json dist .vite
npm install
npm run build
```

### Deployment URL shows blank page

- Check browser console for errors
- Verify `index.html` is loading
- Check build output in deployment logs

### API Key Issues

- API keys are stored client-side only
- Each user must enter their own key
- No server configuration needed

---

## 📊 Monitoring Usage

Since each user has their own API key:
- Usage tracked per person at [console.anthropic.com](https://console.anthropic.com)
- No centralized billing
- Each team member responsible for their own credits

---

## 🎉 You're Done!

Your app is now:
- ✅ Deployed and accessible
- ✅ Automatically updating on push
- ✅ Ready for your team to use
- ✅ Secure (keys stored locally)

**Next:** Share the URL with your team and start generating reports!
