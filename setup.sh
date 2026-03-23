#!/bin/bash

# AI Snapshot Generator - Setup Script
# This script completes the app setup and prepares for deployment

set -e

echo "🚀 AI Snapshot Generator - Setup Script"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the ai-snapshot-generator directory"
    exit 1
fi

echo "📦 Step 1: Installing dependencies..."
npm install

echo ""
echo "✅ Dependencies installed!"
echo ""

# Check if App_original.jsx exists
if [ ! -f "src/App_original.jsx" ]; then
    echo "❌ Error: src/App_original.jsx not found"
    echo "Please make sure the artifact file is copied to src/App_original.jsx"
    exit 1
fi

echo "📝 Step 2: Checking for required modifications..."
echo ""

# Count callClaude occurrences
CALL_COUNT=$(grep -c "callClaude({" src/App_original.jsx || true)
echo "Found $CALL_COUNT callClaude() calls that need API key parameter"

# Check if API key functions exist
if grep -q "getStoredAPIKey" src/App_original.jsx; then
    echo "✅ API key storage functions found"
else
    echo "⚠️  API key storage functions not found - check INTEGRATION_GUIDE.md"
fi

echo ""
echo "🔧 Step 3: Next steps for you:"
echo ""
echo "1. Complete the API key integration:"
echo "   - Open INTEGRATION_GUIDE.md"
echo "   - Follow steps 2-5 to add API key handling"
echo "   - Or use the sed command for quick fix (review carefully!)"
echo ""
echo "2. Rename the file when ready:"
echo "   mv src/App_original.jsx src/App.jsx"
echo ""
echo "3. Test locally:"
echo "   npm run dev"
echo ""
echo "4. Open http://localhost:3000 and enter an API key"
echo ""

read -p "Would you like me to attempt the automatic API key integration? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🔄 Creating backup..."
    cp src/App_original.jsx src/App_backup.jsx
    echo "✅ Backup created: src/App_backup.jsx"

    echo ""
    echo "⚠️  NOTE: This automatic integration may need manual review!"
    echo "Please check the modified file for correctness."
    echo ""

    read -p "Continue with automatic integration? (y/n) " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔧 Adding API key parameter to callClaude calls..."

        # Simple replacement - adds apiKey parameter
        # Note: This is a basic fix and may need manual adjustment
        sed -i '' 's/await callClaude({$/await callClaude({ apiKey,/g' src/App_original.jsx

        echo "✅ Basic integration complete!"
        echo ""
        echo "⚠️  IMPORTANT: Please manually verify:"
        echo "1. Check src/App_original.jsx for correct apiKey passing"
        echo "2. Review the changes against src/App_backup.jsx"
        echo "3. Add the APIKeyConfig component (see INTEGRATION_GUIDE.md Step 2)"
        echo "4. Update the main App component (see INTEGRATION_GUIDE.md Step 3)"
        echo ""
        echo "When ready:"
        echo "  mv src/App_original.jsx src/App.jsx"
        echo "  npm run dev"
    fi
else
    echo ""
    echo "💡 Follow the manual steps in INTEGRATION_GUIDE.md"
fi

echo ""
echo "📚 Helpful resources:"
echo "  - README.md - Getting started guide"
echo "  - INTEGRATION_GUIDE.md - API key integration steps"
echo "  - DEPLOY.md - Deployment instructions"
echo ""
echo "✨ Setup script complete!"
echo ""
echo "Questions? Check the docs or ask in your team Slack!"
