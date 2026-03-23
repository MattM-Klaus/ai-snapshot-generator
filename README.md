# AI Snapshot Generator

Zendesk internal tool for generating AI-powered customer intelligence reports. Built with React + Vite.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd ai-snapshot-generator
npm install
```

### 2. Get Your Anthropic API Key

**Important:** Each user needs their own Anthropic API key.

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in (free account works!)
3. Navigate to **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`)

**Note:** You get $5 free credits when you sign up - enough to generate dozens of reports!

### 3. Run the App

```bash
npm run dev
```

The app will open at `http://localhost:3000`. You'll be prompted to enter your API key on first launch.

## 🔒 Security

- Your API key is stored **locally** in your browser (`localStorage`)
- It's **never sent to any server** except Anthropic's official API
- Each team member uses their own key

## 📦 What This Tool Does

Generates comprehensive AI Snapshot reports for Zendesk customers:

1. **CX Overview** - AI-powered web research on customer sentiment & existing AI
2. **QA Audit** - Automated extraction of QA scores from screenshots
3. **AI Agents** - Automation potential analysis with benchmarked data
4. **PDF Export** - Professional, print-ready HTML reports

## 🛠 Tech Stack

- React 18
- Vite (fast builds)
- Anthropic Claude API (Sonnet 4)
- No backend required!

## 🚢 Deployment Options

### Option 1: Lovable (Recommended for Zendesk)

Lovable is available to all ZD employees - perfect for internal tools!

1. Push code to GitHub (see below)
2. Go to [lovable.dev](https://lovable.dev)
3. Connect your GitHub repo
4. Deploy (automatic)

### Option 2: Vercel (Free)

```bash
npm install -g vercel
vercel
```

### Option 3: Netlify (Free)

```bash
npm install -g netlify-cli
netlify deploy
```

## 🤝 Collaborating with GitHub

### Initial Setup

```bash
cd ai-snapshot-generator
git init
git add .
git commit -m "Initial commit - AI Snapshot Generator"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR-USERNAME/ai-snapshot-generator.git
git push -u origin main
```

### Adding Your Colleague

1. Go to your GitHub repo → **Settings** → **Collaborators**
2. Add your colleague's GitHub username
3. They can now clone and push:

```bash
git clone https://github.com/YOUR-USERNAME/ai-snapshot-generator.git
cd ai-snapshot-generator
npm install
npm run dev
```

### Daily Workflow

```bash
git pull                    # Get latest changes
# ... make your changes ...
git add .
git commit -m "Description of changes"
git push
```

## 🐛 Troubleshooting

### API Key Issues

- Make sure your key starts with `sk-ant-`
- Check you have credits at [console.anthropic.com](https://console.anthropic.com)
- Clear browser cache and re-enter key

### Build Issues

```bash
rm -rf node_modules package-lock.json
npm install
```

## 📝 Key Features

- ✅ API key stored locally (no backend needed)
- ✅ AI-powered web research with Claude
- ✅ Screenshot OCR for QA data extraction
- ✅ PDF report generation
- ✅ Multi-language support (EN, ES, FR, DE, NL)
- ✅ Responsive UI
- ✅ No database required

## 🆘 Support

Questions? Check out:
- [Anthropic API Docs](https://docs.anthropic.com)
- [React Docs](https://react.dev)
- Ask in your team Slack channel!

---

Built with ❤️ for the Zendesk AI Specialist Team
