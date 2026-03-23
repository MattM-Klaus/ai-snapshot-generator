# 🚀 Quick Start Guide

## Get Up and Running in 5 Minutes!

### Step 1: Complete the Integration (One Time)

```bash
cd /Users/matt.marontate/ai-snapshot-generator

# Run setup script
./setup.sh

# OR do it manually: follow INTEGRATION_GUIDE.md
```

The artifact code needs small modifications to handle API keys. The guide walks you through it!

### Step 2: Get Your API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up (free - get $5 credits!)
3. **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`)

### Step 3: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

- Enter your API key when prompted
- Start generating reports!

---

## 📤 Share with Your Colleague

### Option A: GitHub + Local Development

```bash
# You: Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/ai-snapshot-generator.git
git push -u origin main

# Add colleague as collaborator on GitHub

# Your colleague: Clone and run
git clone https://github.com/YOUR-USERNAME/ai-snapshot-generator.git
cd ai-snapshot-generator
npm install
npm run dev
```

### Option B: Deploy to Lovable (Recommended!)

```bash
# Push to GitHub first (see above)

# Then go to lovable.dev:
# 1. Sign in
# 2. Import from GitHub
# 3. Deploy
# 4. Share the URL with your team!
```

Everyone visits the URL and enters their own API key. Done!

---

## 🎯 What This App Does

1. **CX Overview** - AI researches customer sentiment & existing chatbots
2. **QA Audit** - Upload screenshots, AI extracts all scores
3. **AI Agents** - Automation potential from Blueprint PDFs
4. **PDF Export** - Beautiful print-ready reports

All powered by Claude AI (Sonnet 4)!

---

## ❓ Common Questions

**Q: Do we need a backend server?**
A: Nope! API keys are stored in the browser.

**Q: How much does it cost?**
A: Free $5 credits = ~50 reports. Then $3-5/month for light use.

**Q: Is it secure?**
A: Yes! API keys never leave your browser except to call Anthropic directly.

**Q: Can we share one API key?**
A: Better for each person to have their own (for usage tracking).

---

## 📚 Full Documentation

- [README.md](README.md) - Complete overview
- [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) - API key setup
- [DEPLOY.md](DEPLOY.md) - Deployment options

---

## 🎉 You're Ready!

Start generating AI Snapshots for your customers. Happy reporting!

**Need help?** Check the docs or ask in your team Slack.
