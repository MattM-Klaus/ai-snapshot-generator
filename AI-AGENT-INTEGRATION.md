# AI Snapshot Agent Integration Guide

## Overview

This app now supports **automatic data import** from the ChatGPT AI Snapshot Agent. Instead of manually entering all customer data, you can generate a comprehensive JSON report in ChatGPT and import it with one click.

## Workflow

```
ChatGPT Enterprise + MCPs → Generate JSON → Paste into App → Beautiful PDF Report
```

**Time saved:** ~15-20 minutes per Innovation Day

---

## Step 1: Create the AI Snapshot Agent in ChatGPT

1. Go to **ChatGPT Enterprise**
2. Click **"Explore GPTs"** → **"Create"**
3. Name it: **"AI Snapshot Agent - Innovation Days"**
4. Copy the instructions from the main README (see "Custom GPT Instructions" section)
5. **Connect these MCPs:**
   - Tavily MCP (web research)
   - Researcher MCP (deep synthesis)
   - Cerebro MCP (internal service catalog)
   - Unleash MCP (Zendesk knowledge)
   - Zendesk Help Center MCP (customer help centers)
   - Google Workspace MCP (discovery notes)

---

## Step 2: Generate Customer Intelligence

In your AI Snapshot Agent custom GPT, provide:

```
Customer: Ryanair
Discovery Notes: High ticket volume during disruptions, seasonal peaks in summer, multi-language support challenges across 40 EU markets. Currently using basic chatbot.
```

**The agent will:**
- Research industry challenges (60-90 seconds)
- Find customer-specific pain points
- Map Zendesk AI products to their needs
- Generate discovery questions and white boarding prompts
- Return structured JSON output

**Sample output:** See `sample-chatgpt-output.json` in this repo

---

## Step 3: Import into the React App

1. **Copy the entire JSON output** from ChatGPT
2. **Run the app:** `npm run dev`
3. Go to **Step 0: CX Overview**
4. Click **"Import JSON"** button (purple box at top)
5. **Paste** the JSON into the modal
6. Click **"Import & Populate Fields"**

**All fields will auto-populate:**
- ✅ Company name, website, industry
- ✅ Additional context (industry challenges, pain points, talking points)
- ✅ Web research section (internal notes, public sentiment, AI trends)
- ✅ QA notes (product recommendations + discovery questions)
- ✅ AI Agents notes (opportunities, outcomes, discovery questions)

---

## Step 4: Generate the Report

1. **Review** the auto-populated fields (edit if needed)
2. **Upload** QA screenshots or blueprints if you have them (optional)
3. Go to **Step 5: Draft & Edit**
4. Click **"Generate Report Draft"**
5. **Download** the beautiful branded PDF

---

## What Gets Imported?

### CX Overview
- `customer.name` → Company Name
- `customer.website` → Website
- `customer.industry` → Industry
- `industryChallenges` + `customerContext` + `innovationDayTalkingPoints` → Additional Context
- `customerContext` + `aiTrends` → Web Research

### QA Audit
- `productRecommendations[Zendesk QA]` → Additional QA Notes
  - Value propositions
  - Discovery questions

### AI Agents
- `productRecommendations[AI Agents]` → Notes
  - Opportunities
  - Potential outcomes (quick win, medium, long term)
  - Discovery questions

---

## JSON Structure Reference

See `sample-chatgpt-output.json` for a complete example. Key sections:

```json
{
  "customer": { "name", "industry", "website" },
  "industryChallenges": {
    "summary": "...",
    "topChallenges": [ { "challenge", "impact", "source" } ],
    "aiTrends": "..."
  },
  "customerContext": {
    "internalNotes": "...",
    "publicSentiment": "...",
    "painPoints": [ "..." ]
  },
  "productRecommendations": [
    {
      "product": "Zendesk AI Agents | Zendesk QA | Zendesk Copilot",
      "valueProposition": [ "..." ],
      "potentialOutcomes": { "quickWin", "mediumTerm", "longTerm" },
      "discoveryQuestions": [ "..." ]
    }
  ],
  "innovationDayTalkingPoints": [ "..." ]
}
```

---

## Tips for Best Results

### In ChatGPT:
- ✅ Provide as much discovery context as possible
- ✅ Mention specific customer pain points
- ✅ Include any Bullseye Pro data you have
- ✅ Wait for Researcher MCP to complete (30-40 seconds) - it's worth it!

### In the App:
- ✅ Review imported data for accuracy
- ✅ Add QA scores manually (screenshot upload still works)
- ✅ Upload automation blueprint PDF if available
- ✅ Edit any sections that need refinement

---

## Scaling to 100s of Innovation Days

With this workflow, you can prepare for an Innovation Day in **under 5 minutes**:

1. **2 minutes:** Generate JSON in ChatGPT
2. **30 seconds:** Import into app
3. **2 minutes:** Review and adjust
4. **30 seconds:** Generate PDF

**vs. manual entry:** 20-30 minutes

---

## Troubleshooting

### "Invalid JSON format" error
- Make sure you copied the **entire JSON object** from ChatGPT
- Check for any text before `{` or after `}`
- Verify the JSON is valid (paste into https://jsonlint.com)

### Some fields not populating
- Check the JSON structure matches the expected format
- Some fields are optional (e.g., if no QA recommendations, QA notes stay empty)
- You can manually fill any missing fields

### ChatGPT Agent not returning JSON
- Check your custom GPT instructions
- Make sure MCPs are connected
- Try adding "Return ONLY valid JSON, no other text" to your prompt

---

## Next Steps

1. **Test the workflow** with 1-2 customers you know well
2. **Refine the ChatGPT instructions** based on output quality
3. **Share the Custom GPT** with your AI Sales team
4. **Iterate** - the JSON mapping can be adjusted as needs evolve

---

**Questions?** See the main [README.md](README.md) or check out the sample JSON file.
