# API Key Integration Guide

## Problem
The artifact is missing API authentication. All `callClaude()` calls fail with 401 Unauthorized.

## Solution
You need to pass the `apiKey` parameter to every `callClaude()` function.

## Files to Modify

### src/App_original.jsx

**Step 1:** The `callClaude` function has already been fixed (lines 34-56)

**Step 2:** Add API Key Modal Component

Insert this after the base components (around line 237):

```javascript
// ─── API KEY CONFIGURATION MODAL ──────────────────────────────────────────────
function APIKeyConfig({ apiKey, onSave, onClose }) {
  const [key, setKey] = useState(apiKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const testKey = async () => {
    if (!key.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      await callClaude({
        messages: [{ role: "user", content: "Say hello in 3 words" }],
        maxTokens: 20,
        apiKey: key.trim()
      });
      setTestResult({ success: true, message: "API key is valid!" });
    } catch (e) {
      setTestResult({ success: false, message: e.message });
    }
    setTesting(false);
  };

  const handleSave = () => {
    onSave(key.trim());
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
      <div style={{ background: T.white, borderRadius: 16, maxWidth: 520, width: "100%",
        padding: "28px 32px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: T.indigoBg,
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ic d={D.key} s={20} c={T.indigo} sw={2} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: T.dark }}>
              Anthropic API Key Required
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: T.inkMid }}>
              Enter your API key to use Claude AI features
            </p>
          </div>
        </div>

        <div style={{ background: T.xxlight, border: `1px solid ${T.border}`, borderRadius: 8,
          padding: 14, marginBottom: 16 }}>
          <p style={{ fontSize: 12, color: T.inkMid, lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: T.ink }}>How to get your API key:</strong><br />
            1. Go to <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer"
              style={{ color: T.indigo, fontWeight: 600 }}>console.anthropic.com</a><br />
            2. Sign up or log in<br />
            3. Navigate to API Keys → Create Key<br />
            4. Copy and paste it below
          </p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.05em", color: T.inkMid, marginBottom: 8 }}>
            API Key
          </label>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="sk-ant-..."
            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${T.border}`,
              fontSize: 13, fontFamily: "monospace", outline: "none", boxSizing: "border-box" }}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          {testResult && (
            <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 6,
              background: testResult.success ? T.greenBg : T.redBg,
              border: `1px solid ${testResult.success ? T.greenBorder : T.redBorder}`,
              fontSize: 12, color: testResult.success ? T.green : T.red }}>
              {testResult.message}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={testKey} disabled={!key.trim() || testing}
            style={{ padding: "8px 16px", borderRadius: 8, border: `1.5px solid ${T.border}`,
              background: T.white, color: T.inkMid, fontSize: 13, fontWeight: 600, cursor: "pointer",
              opacity: !key.trim() || testing ? 0.5 : 1 }}>
            {testing ? "Testing..." : "Test Key"}
          </button>
          <button onClick={handleSave} disabled={!key.trim()}
            style={{ padding: "8px 16px", borderRadius: 8, border: `1.5px solid ${T.dark}`,
              background: T.dark, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
              opacity: !key.trim() ? 0.5 : 1 }}>
            Save & Continue
          </button>
        </div>

        <p style={{ marginTop: 16, fontSize: 11, color: T.inkLight, lineHeight: 1.6 }}>
          🔒 Your API key is stored locally in your browser and never sent to any server except Anthropic's API.
        </p>
      </div>
    </div>
  );
}
```

**Step 3:** Update the Main App Component (at the end of file, line ~1662)

Replace the existing `export default function App()` with:

```javascript
export default function App() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initData());
  const [generating, setGenerating] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  
  // ADD THESE THREE LINES:
  const [apiKey, setAPIKey] = useState(getStoredAPIKey());
  const [showAPIKeyModal, setShowAPIKeyModal] = useState(!getStoredAPIKey());
  
  const handleSaveAPIKey = (key) => {
    setStoredAPIKey(key);
    setAPIKey(key);
  };

  // ADD THIS CHECK:
  if (!apiKey || showAPIKeyModal) {
    return <APIKeyConfig apiKey={apiKey} onSave={handleSaveAPIKey} onClose={() => setShowAPIKeyModal(false)} />;
  }

  const set = section => val => {
    // Pass apiKey through data context
    if (section === "cx" || section === "qa" || section === "agents") {
      val._apiKey = apiKey;
    }
    setData(p => ({ ...p, [section]: val }));
  };
  
  // ... rest of existing code
```

**Step 4:** Update all callClaude calls

Search for all instances of `callClaude({` and add `apiKey` parameter.

Examples:
- Line ~291: `const result = await callClaude({ ... apiKey });`
- Line ~409: `const result = await callClaude({ ... apiKey });`
- Line ~535: `const result = await callClaude({ ... apiKey });`
- Line ~700: `const result = await callClaude({ ... apiKey });`
- Line ~1143: `sections[key] = await callClaude({ ... apiKey });`
- Line ~1166: `sections[key] = await callClaude({ ... apiKey });`

You can search and replace:
```bash
# This will show all locations
grep -n "callClaude({" src/App_original.jsx
```

Then manually add `, apiKey: data._apiKey` or `, apiKey` to each call.

**Step 5:** Add Settings Button to Nav Bar

In the nav bar section (around line 1684), add a settings button:

```javascript
<button onClick={() => setShowAPIKeyModal(true)}
  style={{ padding: "5px 10px", background: "rgba(255,255,255,0.08)",
    borderRadius: 5, border: "none", color: "rgba(255,255,255,0.6)",
    fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
  <Ic d={D.settings} s={14} c="rgba(255,255,255,0.6)" />
  API Key
</button>
```

## Quick Fix Script

Or run this automated fix (requires manual review):

```bash
cd ai-snapshot-generator/src

# Backup
cp App_original.jsx App_backup.jsx

# Add apiKey to all callClaude calls (review carefully!)
sed -i '' 's/callClaude({/callClaude({ apiKey,/g' App_original.jsx

# Rename to App.jsx when ready
mv App_original.jsx App.jsx
```

## Testing

```bash
npm run dev
```

1. You should see the API key modal
2. Enter your key from console.anthropic.com
3. Test it
4. Save and the app should work!

## Troubleshooting

- **401 Unauthorized**: API key not being passed
- **403 Forbidden**: Invalid API key
- **Rate limit**: Wait a minute or upgrade plan

---

Need help? Check the README.md
