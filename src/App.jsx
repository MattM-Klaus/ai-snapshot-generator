import { useState, useRef, useCallback, useEffect } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  dark: "#03363D", mid: "#1F6F78", teal: "#2E9BA6", light: "#8ECDD3",
  xlight: "#EAF6F7", xxlight: "#F4FBFB",
  white: "#FFFFFF", bg: "#F2F5F7", surface: "#FFFFFF",
  border: "#DDE4E8", borderMid: "#C5D0D7",
  ink: "#0D1F22", inkMid: "#3D5259", inkLight: "#7A939B",
  green: "#059669", greenBg: "#ECFDF5", greenBorder: "#6EE7B7",
  amber: "#B45309", amberBg: "#FFFBEB", amberBorder: "#FDE68A",
  red: "#DC2626", redBg: "#FFF1F1", redBorder: "#FECACA",
  indigo: "#4338CA", indigoBg: "#EEF2FF", indigoBorder: "#C7D2FE",
};

const LANGUAGES = [
  { code: "en", label: "English",    flag: "🇬🇧" },
  { code: "es", label: "Spanish",    flag: "🇪🇸" },
  { code: "fr", label: "French",     flag: "🇫🇷" },
  { code: "de", label: "German",     flag: "🇩🇪" },
  { code: "nl", label: "Dutch",      flag: "🇳🇱" },
];

const STEPS = [
  { id: "cx",       label: "CX Overview",  num: "01" },
  { id: "qa",       label: "QA Audit",     num: "02" },
  { id: "agents",   label: "AI Agents",    num: "03" },
  { id: "settings", label: "Settings",     num: "04" },
  { id: "draft",    label: "Draft & Edit", num: "05" },
];

const QA_BENCHMARK = 86;

// ─── API KEY STORAGE ──────────────────────────────────────────────────────────
const API_KEY_STORAGE_KEY = "anthropic_api_key";
const getStoredAPIKey = () => {
  try { return localStorage.getItem(API_KEY_STORAGE_KEY) || ""; } catch { return ""; }
};
const setStoredAPIKey = (key) => {
  try { localStorage.setItem(API_KEY_STORAGE_KEY, key); } catch {}
};

// ─── CLAUDE API CALL (WITH API KEY) ───────────────────────────────────────────
async function callClaude({ messages, system, tools, maxTokens = 1500, apiKey }) {
  if (!apiKey) throw new Error("API key is required");

  const body = { model: "claude-sonnet-4-20250514", max_tokens: maxTokens, messages };
  if (system) body.system = system;
  if (tools) body.tools = tools;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55000); // 55s hard limit

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`API ${res.status}: ${errText.slice(0, 200)}`);
    }
    const data = await res.json();
    const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("\n") || "";
    if (!text) throw new Error(`No text in response. stop_reason: ${data.stop_reason}, content types: ${data.content?.map(b=>b.type).join(",")}`);
    return text;
  } catch (e) {
    clearTimeout(timeout);
    if (e.name === "AbortError") throw new Error("Request timed out after 55s — try again");
    throw e;
  }
}

// ─── ICON ─────────────────────────────────────────────────────────────────────
const Ic = ({ d, s = 16, c = "currentColor", sw = 1.8, fill = "none" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={fill} stroke={c} strokeWidth={sw}
    strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d={d} />
  </svg>
);
const D = {
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  check: "M20 6L9 17l-5-5",
  x: "M18 6L6 18M6 6l12 12",
  up: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0",
  img: "M21 19a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14zM3 15l5-5 4 4 3-3 5 5",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 110 6 3 3 0 010-6",
  edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z",
  chevR: "M9 18l6-6-6-6",
  info: "M12 16v-4M12 8h.01M22 12a10 10 0 11-20 0 10 10 0 0120 0",
  skip: "M12 9l-3 3 3 3M9 12h7.5M22 12a10 10 0 11-20 0 10 10 0 0120 0",
  pdf: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8M16 17H8M10 9H8",
  globe: "M12 2a10 10 0 110 20A10 10 0 0112 2zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z",
  spin: "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83",
  copy: "M8 4H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2M8 4a2 2 0 012-2h4a2 2 0 012 2M8 4h8",
  trash: "M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M9 6V4h6v2",
  key: "M21 10a7 7 0 11-14 0 7 7 0 0114 0M3 21l5.5-5.5M18 10h.01",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z",
};

// ─── BASE COMPONENTS ──────────────────────────────────────────────────────────
const Sp = ({ h = 12 }) => <div style={{ height: h }} />;

const Lbl = ({ children, required, hint, style = {} }) => (
  <div style={{ marginBottom: 7, ...style }}>
    <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em",
      textTransform: "uppercase", color: T.inkMid }}>
      {children}{required && <span style={{ color: T.red, marginLeft: 3 }}>*</span>}
    </span>
    {hint && <div style={{ fontSize: 11, color: T.inkLight, marginTop: 2, fontWeight: 400,
      textTransform: "none", letterSpacing: 0 }}>{hint}</div>}
  </div>
);

const Inp = ({ value, onChange, placeholder, type = "text", style = {} }) => (
  <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type}
    style={{ width: "100%", padding: "9px 12px", borderRadius: 7, border: `1.5px solid ${T.border}`,
      fontSize: 13.5, color: T.ink, background: T.white, outline: "none",
      boxSizing: "border-box", fontFamily: "inherit", transition: "border 0.12s", ...style }}
    onFocus={e => e.target.style.borderColor = T.mid}
    onBlur={e => e.target.style.borderColor = T.border} />
);

const Txta = ({ value, onChange, placeholder, rows = 5, mono = false, style = {} }) => (
  <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
    style={{ width: "100%", padding: "10px 12px", borderRadius: 7, border: `1.5px solid ${T.border}`,
      fontSize: mono ? 12.5 : 13.5, color: T.ink, background: T.white, outline: "none",
      boxSizing: "border-box", resize: "vertical", fontFamily: mono ? "'JetBrains Mono', 'Fira Code', monospace" : "inherit",
      lineHeight: 1.65, transition: "border 0.12s", ...style }}
    onFocus={e => e.target.style.borderColor = T.mid}
    onBlur={e => e.target.style.borderColor = T.border} />
);

const Btn = ({ children, onClick, variant = "primary", size = "md", icon, disabled, loading, style = {}, id }) => {
  const v = {
    primary:   { bg: T.dark,     fg: "#fff",   bd: T.dark },
    secondary: { bg: T.white,    fg: T.dark,   bd: T.dark },
    ghost:     { bg: "transparent", fg: T.inkMid, bd: T.border },
    ai:        { bg: T.indigo,   fg: "#fff",   bd: T.indigo },
    success:   { bg: T.green,    fg: "#fff",   bd: T.green },
    danger:    { bg: T.red,      fg: "#fff",   bd: T.red },
    amber:     { bg: T.amberBg,  fg: T.amber,  bd: T.amberBorder },
  }[variant];
  const pad = { sm: "5px 11px", md: "8px 16px", lg: "11px 22px" }[size];
  const fs = { sm: 11.5, md: 13, lg: 14 }[size];
  return (
    <button onClick={onClick} disabled={disabled || loading} id={id}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: pad,
        borderRadius: 8, border: `1.5px solid ${v.bd}`, background: v.bg, color: v.fg,
        fontSize: fs, fontWeight: 600, cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1, transition: "all 0.12s", fontFamily: "inherit",
        letterSpacing: "-0.01em", ...style }}>
      {loading
        ? <span className="zd-spinning"><Ic d={D.spin} s={size === "sm" ? 12 : 14} c={v.fg} sw={2} /></span>
        : icon && <Ic d={D[icon]} s={size === "sm" ? 12 : 14} c={v.fg} />}
      {children}
    </button>
  );
};

const Card = ({ children, style = {}, accent, pad = "18px 20px" }) => (
  <div style={{ background: T.white, borderRadius: 11, border: `1px solid ${T.border}`,
    borderLeft: accent ? `3px solid ${accent}` : undefined,
    padding: pad, marginBottom: 12, ...style }}>
    {children}
  </div>
);

const Notice = ({ children, type = "info", icon }) => {
  const cfg = {
    info:    { bg: T.xlight,    bd: T.light,         txt: T.mid,   ic: D.info },
    warn:    { bg: T.amberBg,   bd: T.amberBorder,   txt: T.amber, ic: D.info },
    success: { bg: T.greenBg,   bd: T.greenBorder,   txt: T.green, ic: D.check },
    example: { bg: T.indigoBg,  bd: T.indigoBorder,  txt: T.indigo, ic: D.eye },
  }[type];
  return (
    <div style={{ display: "flex", gap: 9, padding: "9px 13px", background: cfg.bg,
      border: `1px solid ${cfg.bd}`, borderRadius: 8, marginBottom: 12 }}>
      <Ic d={icon || cfg.ic} s={14} c={cfg.txt} sw={2} />
      <div style={{ fontSize: 12, color: cfg.txt, lineHeight: 1.65 }}>{children}</div>
    </div>
  );
};

const SkipBanner = ({ skipped, onChange, label }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "9px 13px", background: skipped ? T.redBg : T.xxlight,
    border: `1px solid ${skipped ? T.redBorder : T.light}`,
    borderRadius: 8, marginBottom: 14 }}>
    <span style={{ fontSize: 12, fontWeight: 600, color: skipped ? T.red : T.mid }}>
      {skipped ? `⊘ ${label} section will be excluded from the report` : `✓ ${label} section included`}
    </span>
    <Btn variant={skipped ? "danger" : "ghost"} size="sm" onClick={() => onChange(!skipped)}>
      {skipped ? "Re-include" : "Skip section"}
    </Btn>
  </div>
);

// ─── FILE DROP ZONE ───────────────────────────────────────────────────────────
function DropZone({ files, onAdd, onRemove, label, accept = "image/*,.pdf", multi = true }) {
  const ref = useRef();
  const [drag, setDrag] = useState(false);
  const handle = useCallback((raw) => {
    Array.from(raw).forEach(f => {
      const reader = new FileReader();
      reader.onload = e => onAdd({ id: crypto.randomUUID(), name: f.name, type: f.type, dataUrl: e.target.result });
      reader.readAsDataURL(f);
    });
  }, [onAdd]);
  return (
    <div>
      <div onClick={() => ref.current.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files); }}
        style={{ border: `2px dashed ${drag ? T.mid : T.borderMid}`, borderRadius: 9,
          padding: "16px 14px", textAlign: "center", cursor: "pointer",
          background: drag ? T.xlight : T.bg, transition: "all 0.12s" }}>
        <Ic d={D.up} s={20} c={drag ? T.mid : T.inkLight} />
        <p style={{ margin: "6px 0 1px", fontSize: 13, color: T.inkMid, fontWeight: 500 }}>{label}</p>
        <p style={{ margin: 0, fontSize: 11, color: T.inkLight }}>PNG · JPG · PDF</p>
        <input ref={ref} type="file" multiple={multi} accept={accept}
          style={{ display: "none" }} onChange={e => handle(e.target.files)} />
      </div>
      {files.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
          {files.map(f => (
            <div key={f.id} style={{ display: "inline-flex", alignItems: "center", gap: 6,
              padding: "5px 8px 5px 5px", background: T.xlight, border: `1px solid ${T.light}`,
              borderRadius: 6, fontSize: 12, color: T.dark, fontWeight: 500, maxWidth: 200 }}>
              {f.type?.startsWith("image/")
                ? <img src={f.dataUrl} alt="" style={{ width: 24, height: 24, objectFit: "cover", borderRadius: 3 }} />
                : <Ic d={D.pdf} s={14} c={T.mid} />}
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{f.name}</span>
              <button onClick={() => onRemove(f.id)} style={{ background: "none", border: "none",
                cursor: "pointer", color: T.inkLight, padding: 0, lineHeight: 1, flexShrink: 0 }}>
                <Ic d={D.x} s={12} sw={2.5} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── API KEY CONFIGURATION MODAL ──────────────────────────────────────────────
function APIKeyConfig({ apiKey, onSave, onClose }) {
  console.log("APIKeyConfig rendering", { apiKey });
  const [key, setKey] = useState(apiKey || "");
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
      setTestResult({ success: true, message: "✓ API key is valid!" });
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
            2. Sign up or log in (free account!)<br />
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

        <div style={{ marginTop: 16, padding: "10px 12px", background: T.greenBg,
          border: `1px solid ${T.greenBorder}`, borderRadius: 6 }}>
          <div style={{ fontSize: 11, color: T.green, lineHeight: 1.6 }}>
            <strong>🔒 Privacy & Security:</strong> Your API key is stored locally in your browser only. All customer data you enter is processed in your browser and sent directly to Anthropic's API—no data is stored on our servers. Reports are generated client-side and saved to your device.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AI STATUS BADGE ──────────────────────────────────────────────────────────
function AIStatusBadge({ status, label }) {
  if (status === "idle") return null;
  const cfg = {
    loading: { bg: T.indigoBg, bd: T.indigoBorder, txt: T.indigo, text: `Analysing ${label}…` },
    done:    { bg: T.greenBg,  bd: T.greenBorder,  txt: T.green,  text: `${label} extracted ✓` },
    error:   { bg: T.redBg,    bd: T.redBorder,    txt: T.red,    text: `Failed — add notes manually` },
  }[status];
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px",
      background: cfg.bg, border: `1px solid ${cfg.bd}`, borderRadius: 20, marginTop: 8 }}>
      {status === "loading" && <Ic d={D.spin} s={12} c={cfg.txt} sw={2} />}
      {status === "done" && <Ic d={D.check} s={12} c={cfg.txt} sw={2.5} />}
      <span style={{ fontSize: 11.5, fontWeight: 600, color: cfg.txt }}>{cfg.text}</span>
    </div>
  );
}

// ─── WHERE TO FIND GUIDE ─────────────────────────────────────────────────────
function FindGuide({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 10 }}>
      <button onClick={() => setOpen(v => !v)}
        style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5,
          color: T.indigo, fontWeight: 600, background: "none", border: "none", cursor: "pointer",
          padding: "3px 0", letterSpacing: "-0.01em" }}>
        <Ic d={open ? D.x : D.info} s={13} c={T.indigo} sw={2} />
        {open ? "Hide" : "Where to find this"}
      </button>
      {open && (
        <div style={{ marginTop: 6, padding: "10px 13px", background: T.indigoBg,
          border: `1px solid ${T.indigoBorder}`, borderRadius: 8,
          fontSize: 12, color: T.indigo, lineHeight: 1.7 }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── STEP HEADER ─────────────────────────────────────────────────────────────
function StepHdr({ num, title, sub }) {
  return (
    <div style={{ marginBottom: 22, paddingBottom: 18, borderBottom: `1px solid ${T.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: T.dark,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ color: T.light, fontSize: 12, fontWeight: 800, letterSpacing: "0.03em" }}>{num}</span>
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: T.dark,
            letterSpacing: "-0.03em", lineHeight: 1.2 }}>{title}</h2>
          {sub && <p style={{ margin: "3px 0 0", fontSize: 13, color: T.inkMid, lineHeight: 1.4 }}>{sub}</p>}
        </div>
      </div>
    </div>
  );
}

// ─── CX OVERVIEW STEP ────────────────────────────────────────────────────────
function CXStep({ data, onChange, skipped, onSkip, apiKey }) {
  const set = f => v => onChange({ ...data, [f]: v });
  const [searchStatus, setSearchStatus] = useState("idle");
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (searchStatus !== "loading") { setElapsed(0); return; }
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [searchStatus]);

  const runSearch = async () => {
    if (!data.name) return;
    setSearchStatus("loading");
    try {
      const result = await callClaude({
        system: "You are a senior CX analyst preparing intelligence for an enterprise software sales team. Be factual, concise, and focus on evidence. Return structured markdown.",
        messages: [{
          role: "user",
          content: `Based on your knowledge of ${data.name} (${data.website || ""}), produce a CX intelligence briefing covering:
1. **Existing AI / Chatbot** — Any virtual assistant, chatbot or AI support tool they use. Describe capabilities and known limitations or complaints.
2. **Customer Sentiment** — Key themes from reviews, Reddit, App Store. Include specific complaint patterns and overall rating if known.
3. **Top CX Pain Points** — 3–5 recurring issues customers report.
4. **CX Initiatives** — Any recent AI/CX improvement announcements or investments.
${data.searchPrompt ? `5. **Specific Focus:** ${data.searchPrompt}` : ""}

Be specific to this company — not generic. Use bullet points. Note where you're uncertain.`
        }],
        maxTokens: 1200,
        apiKey,
      });
      set("webResearch")(result);
      setSearchStatus("done");
    } catch {
      setSearchStatus("error");
    }
  };

  return (
    <div>
      <StepHdr num="01" title="CX Overview" sub="Company details and AI-powered research. Bullseye context is optional but improves the report." />
      <SkipBanner skipped={skipped} onChange={onSkip} label="CX Overview" />
      {!skipped && <>
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <div><Lbl required>Company Name</Lbl><Inp value={data.name} onChange={set("name")} placeholder="Ryanair" /></div>
            <div><Lbl>Website</Lbl><Inp value={data.website} onChange={set("website")} placeholder="ryanair.com" /></div>
            <div>
              <Lbl>Industry</Lbl>
              <select value={data.industry} onChange={e => set("industry")(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 7, border: `1.5px solid ${T.border}`,
                  fontSize: 13.5, color: data.industry ? T.ink : T.inkLight, background: T.white,
                  outline: "none", boxSizing: "border-box", fontFamily: "inherit", cursor: "pointer",
                  appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237A939B' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: 30 }}>
                <option value="">Select industry…</option>
                {["Airlines & Aviation","Automotive","Banking & Financial Services","E-commerce & Retail","Education","Energy & Utilities","Gaming","Government & Public Sector","Healthcare","Hospitality & Travel","Insurance","Logistics & Supply Chain","Manufacturing","Media & Entertainment","Professional Services","Real Estate","SaaS & Technology","Telecommunications","Transportation"].map(i => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <Card>
          <Lbl>AI Web Research</Lbl>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <Lbl hint="Optional: guide the research with specific topics to cover">Focus area</Lbl>
              <Inp value={data.searchPrompt} onChange={set("searchPrompt")}
                placeholder="e.g. 'their new app chatbot', 'baggage fee complaints', 'recent AI announcements'" />
            </div>
            <Btn variant="ai" icon="search" onClick={runSearch} loading={searchStatus === "loading"}
              disabled={!data.name || searchStatus === "loading"}
              style={{ flexShrink: 0, marginBottom: 1 }}>
              {searchStatus === "loading"
                ? `Researching… ${elapsed}s`
                : data.webResearch ? "Re-research" : "Research Company"}
            </Btn>
          </div>
          {searchStatus === "loading" && (
            <Notice type="info">
              Researching <strong>{data.name}</strong> — chatbot experience, customer sentiment, CX pain points…
            </Notice>
          )}
          {searchStatus === "error" && (
            <Notice type="warn">Research failed — check company name and try again.</Notice>
          )}
          {searchStatus === "done" && !data.webResearch && (
            <Notice type="warn">Research completed but returned no results — try adding a focus area above.</Notice>
          )}
          {data.webResearch && (
            <div style={{ marginTop: 10, padding: "10px 13px", background: T.indigoBg,
              border: `1px solid ${T.indigoBorder}`, borderRadius: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.indigo, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  AI Research Results
                </span>
                {searchStatus === "done" && (
                  <span style={{ fontSize: 11, color: T.green, fontWeight: 600 }}>✓ Complete</span>
                )}
              </div>
              <Txta value={data.webResearch} onChange={set("webResearch")} rows={8} mono
                style={{ background: "rgba(255,255,255,0.7)", border: `1px solid ${T.indigoBorder}`, fontSize: 12 }} />
            </div>
          )}
        </Card>

        <Card style={{ border: `1px solid ${T.border}`, background: T.xxlight }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <Lbl style={{ marginBottom: 0 }}>Bullseye Context</Lbl>
            <span style={{ fontSize: 10, fontWeight: 800, background: T.inkLight, color: "#fff",
              padding: "2px 7px", borderRadius: 10, letterSpacing: "0.06em" }}>OPTIONAL</span>
          </div>
          <p style={{ fontSize: 12, color: T.inkMid, marginBottom: 12, lineHeight: 1.6 }}>
            Paste any relevant context from Bullseye Pro — this significantly improves the CX metrics, Zendesk relationship details, and account intelligence in the report.{" "}
            <strong style={{ color: T.amber }}>The Key Metrics vs Benchmark section will only appear if this is filled in.</strong>
          </p>
          <FindGuide>
            Two useful sources in <strong>Bullseye Pro</strong>:
            <br /><br />
            <strong>1. Account Brief</strong> — Open the customer record → click <strong>"Get Account Brief"</strong> (top right). Copy the full text including Executive Summary, Recent News, Pain Points, and Next Steps.
            <br /><br />
            <strong>2. Value Selling Summary</strong> — Scroll to the performance analytics panel → click <strong>"Generate customer summary"</strong> → <strong>"Copy summary"</strong>. This includes benchmarked KPIs: First Reply Time, Resolution Time, CSAT, and Zero-Touch ratio vs peer medians.
            <br /><br />
            You can paste one or both — just drop them in together.
          </FindGuide>
          <Txta value={data.bullseyeContext} onChange={set("bullseyeContext")} rows={7}
            placeholder={"Paste Account Brief and/or Value Selling Summary from Bullseye Pro here…\n\nExample:\nExecutive Summary\nRyanair is Europe's largest low-cost carrier…\n\nTop Positives\n• First Reply Time of 0.2h vs median 5.2h\n• Resolution Time of 1.6h vs median 24.6h\n\nTop Areas for Improvement\n• CSAT 45% vs median 62%\n• Zero-Touch 19.2% vs median 47%"} />
        </Card>

        <Card>
          <Lbl>Additional Context</Lbl>
          <Txta value={data.additionalContext} onChange={set("additionalContext")} rows={3}
            placeholder="Relationship notes, recent meeting outcomes, known sensitivities, Salesforce context..." />
        </Card>
      </>}
    </div>
  );
}

// ─── QA CUSTOM PROMPTS (rich version) ─────────────────────────────────────────
const PROMPT_TYPES = [
  { id: "grading", label: "Grading Category", icon: "check",
    desc: "Score agents on this behaviour (0–100%)", color: T.mid },
  { id: "spotlight", label: "Spotlight Tag", icon: "search",
    desc: "AI tags conversations matching this condition", color: T.indigo },
];

function CustomPromptsSection({ cxName, website, industry, value = {}, onChange }) {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [prompts, setPrompts] = useState(value.prompts || []);
  const [included, setIncluded] = useState(value.included ?? false);
  const [urlInput, setUrlInput] = useState(website || "");

  // Tick elapsed seconds while generating
  useEffect(() => {
    if (!generating) { setElapsed(0); return; }
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [generating]);

  const sync = (p, inc) => {
    setPrompts(p);
    setIncluded(inc);
    onChange({ prompts: p, included: inc });
  };

  const togglePrompt = (idx) => {
    const updated = prompts.map((p, i) => i === idx ? { ...p, selected: !p.selected } : p);
    sync(updated, included);
  };

  const gradingPrompts = prompts.filter(p => p.type === "grading");
  const spotlightPrompts = prompts.filter(p => p.type === "spotlight");

  const generate = async () => {
    setGenerating(true);
    setGenerateError(null);
    const promptContent = `Generate exactly 8 Zendesk QA Custom Prompts for ${cxName} (${urlInput || website || ""}) — a ${industry || "B2C/B2B"} company.

Use your knowledge of ${cxName}'s business, products, customers, and industry to make these highly specific — not generic.

Split into two types:

GRADING CATEGORIES (5) — yes/no questions to evaluate agent behaviour (thumbs up / thumbs down). Must be specific to this company. Not grammar/tone — those already exist in AutoQA. Write each as a direct yes/no question e.g. "Did the agent...?" or "Was the customer...?"

SPOTLIGHT TAGS (3) — patterns to auto-tag conversations: competitor mentions, product failures, churn signals, compliance risk.

Return ONLY a valid JSON array of 8 objects, each with:
- "type": "grading" or "spotlight"
- "name": short title 3-5 words
- "prompt": a clear yes/no question the AI evaluator uses to grade the conversation e.g. "Did the agent confirm the booking reference before making changes?"
- "rationale": why this matters for ${cxName}, 1 sentence
- "example": a real example conversation snippet, 1 sentence

No other text. Just the JSON array.`;

    try {
      const result = await callClaude({
        system: "You are a world-class Zendesk QA expert. You respond ONLY with valid JSON arrays — no markdown, no explanation, no preamble.",
        messages: [{ role: "user", content: promptContent }],
        maxTokens: 1500,
      });
      console.log("RAW RESULT:", result);
      const clean = result.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      sync(parsed, true);
    } catch (e) {
      console.error("Generate error:", e);
      setGenerateError(e.message || String(e));
    }
    setGenerating(false);
  };

  return (
    <Card style={{ border: `1px solid ${T.indigoBorder}`, background: T.indigoBg }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 13.5, fontWeight: 800, color: T.indigo }}>
              QA Custom Prompts
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, background: T.indigo, color: "#fff",
              padding: "2px 7px", borderRadius: 10, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Optional
            </span>
          </div>
          <p style={{ fontSize: 12.5, color: T.indigo, lineHeight: 1.6, margin: 0 }}>
            Want to go beyond the standard AutoQA categories? <strong>QA Custom Prompts</strong> let you grade agents against criteria unique to {cxName || "this customer"} — and use <strong>Spotlight</strong> to automatically tag conversations by AI. Claude will research {cxName || "the company"} and suggest prompts tailored to their specific business, products, and risk profile.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
          {prompts.length > 0 && (
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <div onClick={() => sync(prompts, !included)}
                style={{ width: 16, height: 16, borderRadius: 3, flexShrink: 0,
                  border: `2px solid ${included ? T.indigo : T.borderMid}`,
                  background: included ? T.indigo : T.white,
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                {included && <Ic d={D.check} s={9} c="#fff" sw={3} />}
              </div>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: T.indigo, whiteSpace: "nowrap" }}>
                Include in report
              </span>
            </label>
          )}
          <Btn variant="ghost" size="sm" onClick={() => setOpen(v => !v)}>
            {open ? "Hide ↑" : "Show ↓"}
          </Btn>
        </div>
      </div>

      {open && (
        <div style={{ marginTop: 18, borderTop: `1px solid ${T.indigoBorder}`, paddingTop: 16 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <Lbl hint="Used to research their products, tone, industry context">Customer website URL</Lbl>
              <Inp value={urlInput} onChange={setUrlInput}
                placeholder="e.g. ryanair.com or support.ryanair.com" />
            </div>
            <Btn variant="ai" icon="zap" onClick={generate} loading={generating}
              style={{ flexShrink: 0, marginBottom: 1 }}>
              {generating ? `Researching… ${elapsed}s` : prompts.length ? "Regenerate" : "Generate Prompts"}
            </Btn>
          </div>

          {generating && (
            <Notice type="info">
              Researching <strong>{cxName}</strong> to understand their products, customer pain points, and risk areas — then building custom prompts tailored to their business…
            </Notice>
          )}

          {generateError && !generating && (
            <Notice type="warn">
              <strong>Error:</strong> {generateError} — check the browser console (F12) for the full RAW RESULT log.
            </Notice>
          )}

          {prompts.length > 0 && !generating && (
            <>
              <Notice type="example">
                <strong>Review & select</strong> the prompts you want to include in the report. Tick the ones that best fit — or regenerate for a fresh set.
              </Notice>

              {gradingPrompts.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.mid }} />
                    <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase",
                      letterSpacing: "0.08em", color: T.mid }}>
                      Grading Categories — score agent behaviour
                    </span>
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {gradingPrompts.map((p, i) => {
                      const globalIdx = prompts.indexOf(p);
                      return (
                        <PromptCard key={i} prompt={p} selected={!!p.selected}
                          onToggle={() => togglePrompt(globalIdx)}
                          onEdit={(field, val) => {
                            const updated = [...prompts];
                            updated[globalIdx] = { ...updated[globalIdx], [field]: val };
                            sync(updated, included);
                          }} />
                      );
                    })}
                  </div>
                </div>
              )}

              {spotlightPrompts.length > 0 && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.indigo }} />
                    <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase",
                      letterSpacing: "0.08em", color: T.indigo }}>
                      Spotlight Tags — AI-tag conversations automatically
                    </span>
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {spotlightPrompts.map((p, i) => {
                      const globalIdx = prompts.indexOf(p);
                      return (
                        <PromptCard key={i} prompt={p} selected={!!p.selected}
                          onToggle={() => togglePrompt(globalIdx)}
                          onEdit={(field, val) => {
                            const updated = [...prompts];
                            updated[globalIdx] = { ...updated[globalIdx], [field]: val };
                            sync(updated, included);
                          }} />
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Card>
  );
}

function PromptCard({ prompt, selected, onToggle, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const isSpotlight = prompt.type === "spotlight";
  const col = isSpotlight ? T.indigo : T.mid;
  const bgCol = isSpotlight ? T.indigoBg : T.xlight;
  const bdCol = isSpotlight ? T.indigoBorder : T.light;

  return (
    <div style={{ border: `1.5px solid ${selected ? col : T.border}`,
      borderRadius: 10, overflow: "hidden",
      background: selected ? bgCol : T.white,
      transition: "all 0.12s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px",
        cursor: "pointer" }} onClick={onToggle}>
        <div style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0,
          border: `2px solid ${selected ? col : T.borderMid}`,
          background: selected ? col : T.white,
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          {selected && <Ic d={D.check} s={10} c="#fff" sw={3} />}
        </div>
        <span style={{ fontSize: 9.5, fontWeight: 800, textTransform: "uppercase",
          letterSpacing: "0.07em", padding: "2px 7px", borderRadius: 4,
          background: col, color: "#fff", flexShrink: 0 }}>
          {isSpotlight ? "Spotlight" : "Grading"}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: T.ink, flex: 1,
          letterSpacing: "-0.01em" }}>{prompt.name}</span>
        <button onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
          style={{ background: "none", border: "none", cursor: "pointer",
            color: T.inkLight, padding: "2px 4px", fontSize: 11, fontWeight: 600 }}>
          {expanded ? "less" : "more"}
        </button>
      </div>

      {expanded && (
        <div style={{ padding: "0 14px 14px", borderTop: `1px solid ${T.border}` }}>
          <div style={{ height: 10 }} />
          <div style={{ marginBottom: 10 }}>
            <Lbl style={{ marginBottom: 5 }}>Prompt instruction</Lbl>
            <Txta value={prompt.prompt} onChange={v => onEdit("prompt", v)} rows={3}
              style={{ fontSize: 12.5, background: T.white }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ padding: "8px 10px", background: T.xxlight, borderRadius: 7,
              border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.07em", color: T.inkMid, marginBottom: 4 }}>Why this matters</div>
              <p style={{ fontSize: 12, color: T.inkMid, lineHeight: 1.6, margin: 0 }}>{prompt.rationale}</p>
            </div>
            <div style={{ padding: "8px 10px", background: T.xxlight, borderRadius: 7,
              border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.07em", color: T.inkMid, marginBottom: 4 }}>Example conversation</div>
              <p style={{ fontSize: 12, color: T.inkMid, lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>{prompt.example}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── QA STEP ─────────────────────────────────────────────────────────────────
function QAStep({ data, onChange, skipped, onSkip, apiKey }) {
  const set = f => v => onChange({ ...data, [f]: v });
  const [files, setFiles] = useState([]);
  const [imgStatus, setImgStatus] = useState("idle");

  const addFile = f => {
    setFiles(p => [...p, f]);
    analyseScreenshot([...files, f]);
  };
  const removeFile = id => setFiles(p => p.filter(f => f.id !== id));

  const analyseScreenshot = async (allFiles) => {
    const imgs = allFiles.filter(f => f.type?.startsWith("image/"));
    if (!imgs.length) return;
    setImgStatus("loading");
    try {
      const imageBlocks = imgs.map(f => ({
        type: "image", source: { type: "base64", media_type: f.type, data: f.dataUrl.split(",")[1] }
      }));
      const result = await callClaude({
        messages: [{
          role: "user",
          content: [
            ...imageBlocks,
            { type: "text", text: `Extract all QA/AutoQA data from this screenshot. Return ONLY valid JSON:
{
  "overallScore": 55.06,
  "categories": [
    {"name": "Grammar", "score": 97.55, "benchmark": 98.4},
    {"name": "Tone", "score": 99.06, "benchmark": 99.5},
    {"name": "Readability", "score": 95.86, "benchmark": 95.0},
    {"name": "Closing", "score": 46.08, "benchmark": 81.7},
    {"name": "Comprehension", "score": 76.88, "benchmark": 92.5},
    {"name": "Empathy", "score": 35.39, "benchmark": 85.5},
    {"name": "Solution", "score": 44.73, "benchmark": 85.7},
    {"name": "Greeting", "score": 57.06, "benchmark": 94.4}
  ],
  "notes": "any observations"
}
Use null for any values not visible. Return only JSON, no other text.` }
          ]
        }],
        apiKey,
      });
      const clean = result.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      set("extractedData")(parsed);
      if (parsed.overallScore && !data.overallScore) set("overallScore")(String(parsed.overallScore));
      setImgStatus("done");
    } catch {
      setImgStatus("error");
    }
  };

  const gap = data.overallScore
    ? (parseFloat(data.overallScore) - QA_BENCHMARK).toFixed(1) : null;

  return (
    <div>
      <StepHdr num="02" title="QA Audit" sub="Upload AutoQA screenshot — Claude extracts all scores automatically." />
      <SkipBanner skipped={skipped} onChange={onSkip} label="QA Audit" />
      {!skipped && <>
        <Card>
          <Lbl required>Overall AQS Score (%) — Auto Quality Score</Lbl>
          <Inp value={data.overallScore} onChange={set("overallScore")} placeholder="e.g. 55.06" type="number" />
          {gap && (
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%",
                background: parseFloat(gap) >= 0 ? T.green : T.red }} />
              <span style={{ fontSize: 12.5, fontWeight: 700,
                color: parseFloat(gap) >= 0 ? T.green : T.red }}>
                {gap > 0 ? "+" : ""}{gap}pts vs Zendesk average ({QA_BENCHMARK}%)
              </span>
            </div>
          )}
        </Card>

        <Card>
          <Lbl>QA Category Scores Screenshot</Lbl>
          <FindGuide>
            <strong>Zendesk QA</strong> → Analytics → AutoQA dashboard → the category breakdown table showing each category (Grammar, Empathy, Solution, etc.) with scores. Take a screenshot that includes the <strong>Global Average column</strong> if visible. Claude will extract all values automatically.
          </FindGuide>
          <DropZone files={files} onAdd={addFile} onRemove={removeFile}
            label="Upload QA category screenshot — scores extracted automatically" />
          <AIStatusBadge status={imgStatus} label="Category scores" />

          {data.extractedData?.categories && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.inkMid, textTransform: "uppercase",
                letterSpacing: "0.07em", marginBottom: 8 }}>Extracted Scores</div>
              <div style={{ display: "grid", gap: 4 }}>
                {data.extractedData.categories.map(cat => {
                  const diff = cat.score != null && cat.benchmark != null ? cat.score - cat.benchmark : null;
                  const col = diff === null ? T.inkLight : diff >= 0 ? T.green : diff >= -15 ? T.amber : T.red;
                  return (
                    <div key={cat.name} style={{ display: "grid", gridTemplateColumns: "100px 1fr 60px 65px",
                      gap: 10, alignItems: "center", padding: "6px 0",
                      borderBottom: `1px solid ${T.border}` }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: T.ink }}>{cat.name}</span>
                      <div style={{ position: "relative", height: 7, background: T.bg, borderRadius: 3 }}>
                        {cat.score != null && (
                          <div style={{ position: "absolute", inset: 0, width: `${Math.min(100, cat.score)}%`,
                            background: col, borderRadius: 3 }} />
                        )}
                        {cat.benchmark != null && (
                          <div style={{ position: "absolute", top: -3, left: `${cat.benchmark}%`,
                            width: 2, height: 13, background: T.dark, borderRadius: 1, transform: "translateX(-50%)" }} />
                        )}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: col, textAlign: "right" }}>
                        {cat.score != null ? `${cat.score}%` : "—"}
                      </span>
                      <span style={{ fontSize: 11, color: T.inkLight, textAlign: "right" }}>
                        {cat.benchmark != null ? `${cat.benchmark}%` : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <Lbl>Channel inconsistency detail</Lbl>
              <Txta value={data.channelDetail} onChange={set("channelDetail")} rows={3}
                placeholder="e.g. Email scores significantly below chat on Empathy and Solution — leave blank to use default message" />
              <p style={{ margin: "5px 0 0", fontSize: 11, color: T.inkLight }}>
                Channel inconsistency is always flagged. Add specifics if known.
              </p>
            </div>
            <div>
              <Lbl>Churn risk tickets (%)</Lbl>
              <Inp value={data.churnPct} onChange={set("churnPct")} placeholder="e.g. 12" type="number" />
              <p style={{ margin: "5px 0 0", fontSize: 11, color: T.inkLight }}>
                Leave blank to use default message. Churn risk is always flagged.
              </p>
            </div>
          </div>
          <Sp h={14} />
          <Lbl>Additional QA Notes</Lbl>
          <Txta value={data.notes} onChange={set("notes")} rows={3}
            placeholder="Agent team breakdown, peak period issues, other observations..." />
        </Card>

        <CustomPromptsSection
          cxName={data._companyName}
          website={data._website}
          industry={data._industry}
          value={data.customPrompts || {}}
          onChange={set("customPrompts")}
        />
      </>}
    </div>
  );
}

// ─── AI AGENTS STEP ───────────────────────────────────────────────────────────
function AgentsStep({ data, onChange, skipped, onSkip, apiKey }) {
  const set = f => v => onChange({ ...data, [f]: v });
  const [files, setFiles] = useState([]);
  const [imgStatus, setImgStatus] = useState("idle");

  const addFile = f => {
    setFiles(p => [...p, f]);
    analyseFiles([...files, f]);
  };
  const removeFile = id => setFiles(p => p.filter(f => f.id !== id));

  const analyseFiles = async (allFiles) => {
    const processable = allFiles.filter(f =>
      f.type?.startsWith("image/") || f.type === "application/pdf"
    );
    if (!processable.length) return;
    setImgStatus("loading");
    try {
      const contentBlocks = processable.map(f => {
        if (f.type === "application/pdf") {
          return {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: f.dataUrl.split(",")[1] }
          };
        }
        return {
          type: "image",
          source: { type: "base64", media_type: f.type, data: f.dataUrl.split(",")[1] }
        };
      });
      const result = await callClaude({
        messages: [{
          role: "user",
          content: [
            ...contentBlocks,
            { type: "text", text: `Extract automation potential data from this report. The phases are CUMULATIVE — Phase 3 % is the TOTAL automation potential. Phase 2 % is the quick-win target (knowledge retrieval + procedures). Phase 1 is a sub-component of Phase 2.

Return ONLY valid JSON in exactly this structure:
{
  "totalTopics": 148,
  "phases": {
    "phase1": { "pct": 0, "label": "Knowledge Retrieval", "desc": "Topics automated with knowledge retrieval" },
    "phase2": { "pct": 48, "label": "Automation with Procedures", "desc": "Topics automated with procedures and dialogues" },
    "phase3": { "pct": 55, "label": "Automation with Integrations", "desc": "Topics automated with integrations / actions" }
  },
  "topTopicsPerPhase": {
    "phase1": [
      { "name": "Topic name", "ticketPct": 7, "arBenchmark": 95 },
      { "name": "Topic name", "ticketPct": 4, "arBenchmark": 84 }
    ],
    "phase2": [
      { "name": "Flight Rescheduling Issues", "ticketPct": 42, "arBenchmark": 53 },
      { "name": "Unable to find booking on website", "ticketPct": 5, "arBenchmark": 62 },
      { "name": "Flight Route Availability", "ticketPct": 4, "arBenchmark": 62 }
    ],
    "phase3": [
      { "name": "Third-party booking verification", "ticketPct": 5, "arBenchmark": 43 }
    ]
  }
}

Rules:
- totalTopics = total number of rows in the Use-case Automation Roadmap table (count ALL rows including those with 0%)
- For each phase, extract the top 3 topics BY HIGHEST ticketPct (% of tickets per support topic column)
- Only include topics that belong to that phase (Implementation Phase column)
- arBenchmark = the Benchmark AR Rate %
- If a phase has 0% automation potential, still include it in phases but set topTopicsPerPhase for that phase to an empty array []
- If a phase has fewer than 3 topics with data, include all available
- Use null for any values not visible
- Return only JSON, no other text.` }
          ]
        }],
        maxTokens: 1500,
        apiKey,
      });
      const clean = result.replace(/```json|```/g, "").trim();
      set("extractedData")(JSON.parse(clean));
      setImgStatus("done");
    } catch {
      setImgStatus("error");
    }
  };

  const ed = data.extractedData;

  return (
    <div>
      <StepHdr num="03" title="AI Agents" sub="Upload Automation Potential PDF — Claude extracts the 3-phase journey and top topics automatically." />
      <SkipBanner skipped={skipped} onChange={onSkip} label="AI Agents" />
      {!skipped && <>
        <Card>
          <Lbl>Automation Potential Report</Lbl>
          <FindGuide>
            <strong>Step 1 — Find the customer ID:</strong> Open the customer record in <strong>Salesforce</strong> or <strong>Zendesk Monitor</strong> and copy the Instance Account ID (a numeric ID, e.g. 2148950).
            <br /><br />
            <strong>Step 2 — Open the Blueprint:</strong> Go to <a href="https://zendeskbi.cloud.looker.com/folders/3221" target="_blank" rel="noopener noreferrer" style={{ color: T.indigo, fontWeight: 700 }}>AI Agent Adoption Blueprints (Looker)</a>, search for the customer by their Account ID, and open their record.
            <br /><br />
            <strong>Step 3 — Download as PDF:</strong> Click the download icon → set Format to <strong>PDF</strong> → tick <strong>"Expand tables to show all rows"</strong> (essential — captures all topics) → click Download.
            <br /><br />
            Upload the PDF here — Claude will extract phase percentages, total topic count, and top topics automatically.
          </FindGuide>
          <DropZone files={files} onAdd={addFile} onRemove={removeFile} accept="image/*,.pdf"
            label="Upload Automation Potential PDF — phase data extracted automatically" />
          <AIStatusBadge status={imgStatus} label="Automation data" />

          {ed?.phases && (
            <div style={{ marginTop: 16 }}>
              {ed.totalTopics && (
                <div style={{ marginBottom: 10, padding: "8px 12px", background: T.xxlight,
                  border: `1px solid ${T.border}`, borderRadius: 8, display: "inline-flex",
                  alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.dark }}>{ed.totalTopics}</span>
                  <span style={{ fontSize: 12, color: T.inkMid }}>support topics identified</span>
                </div>
              )}
              <div style={{ fontSize: 11, fontWeight: 700, color: T.inkMid, textTransform: "uppercase",
                letterSpacing: "0.07em", marginBottom: 10 }}>Automation Potential — Phase Journey</div>
              {/* Phase 1 hidden if 0% */}
              {(ed.phases.phase1?.pct ?? 0) === 0 && (
                <div style={{ fontSize: 11, color: T.inkLight, marginBottom: 10, fontStyle: "italic" }}>
                  Phase 1 (Knowledge Retrieval): 0% — excluded from report
                </div>
              )}
              <div style={{ display: "grid", gap: 10, marginBottom: 16,
                gridTemplateColumns: (ed.phases.phase1?.pct ?? 0) > 0 ? "1fr 1fr 1fr" : "1fr 1fr" }}>
                {[
                  ["phase1", "#C084FC", "#7E22CE"],
                  ["phase2", "#A855F7", "#581C87"],
                  ["phase3", "#6B21A8", "#3B0764"],
                ].filter(([key]) => {
                  if (key === "phase1" && (ed.phases.phase1?.pct ?? 0) === 0) return false;
                  return true;
                }).map(([key, barColor, textColor]) => {
                  const ph = ed.phases[key];
                  if (!ph) return null;
                  const pct = ph.pct ?? 0;
                  const isQuickWin = key === "phase2";
                  const isTarget = key === "phase3";
                  return (
                    <div key={key} style={{ background: T.xxlight, borderRadius: 10,
                      border: `1.5px solid ${isQuickWin ? T.mid : isTarget ? T.dark : T.border}`,
                      padding: "12px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: T.inkMid,
                          textTransform: "uppercase", letterSpacing: "0.07em" }}>
                          {ph.label}
                        </div>
                        {isQuickWin && (
                          <span style={{ fontSize: 9, fontWeight: 800, background: T.mid,
                            color: "#fff", padding: "2px 6px", borderRadius: 4, letterSpacing: "0.05em" }}>
                            QUICK WIN
                          </span>
                        )}
                        {isTarget && (
                          <span style={{ fontSize: 9, fontWeight: 800, background: T.dark,
                            color: "#fff", padding: "2px 6px", borderRadius: 4, letterSpacing: "0.05em" }}>
                            AR TARGET
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: T.inkLight, marginBottom: 10 }}>{ph.desc}</div>
                      <div style={{ height: 28, background: T.bg, borderRadius: 6,
                        border: `1px solid ${T.border}`, position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0,
                          width: `${Math.min(100, pct)}%`, background: barColor,
                          borderRadius: 6, transition: "width 0.6s ease" }} />
                        <div style={{ position: "absolute", inset: 0, display: "flex",
                          alignItems: "center", paddingLeft: 10 }}>
                          <span style={{ fontSize: 13, fontWeight: 800,
                            color: pct > 20 ? "#fff" : textColor }}>{pct}%</span>
                        </div>
                      </div>
                      <div style={{ fontSize: 10, color: T.inkLight, marginTop: 5 }}>
                        {isTarget ? "⭐ Total automation potential (cumulative)" : "Cumulative"}
                      </div>
                      {ed.topTopicsPerPhase?.[key]?.length > 0 && (
                        <div style={{ marginTop: 10, borderTop: `1px solid ${T.border}`, paddingTop: 8 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: T.inkMid,
                            textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                            Top topics
                          </div>
                          {ed.topTopicsPerPhase[key].map((t, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between",
                              alignItems: "center", marginBottom: 4 }}>
                              <span style={{ fontSize: 11, color: T.ink, flex: 1,
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                maxWidth: "65%" }}>{t.name}</span>
                              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: T.mid }}>{t.ticketPct}%</span>
                                {t.arBenchmark != null && (
                                  <span style={{ fontSize: 10, color: T.inkLight }}>AR {t.arBenchmark}%</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <Notice type="info">
                <strong>Phase 2 ({ed.phases.phase2?.pct}%)</strong> is the quick-win target — achievable with knowledge retrieval and procedures.{" "}
                <strong>Phase 3 ({ed.phases.phase3?.pct}%)</strong> is the <em>initial</em> automation potential based on what Zendesk customers with similar use cases achieve today — not a ceiling. The goal is to extend this towards <strong>80%</strong> by building out their unique topics and deeper integrations.
              </Notice>
            </div>
          )}
        </Card>

        <Card>
          <Lbl>Additional Notes</Lbl>
          <Txta value={data.notes} onChange={set("notes")} rows={3}
            placeholder="Data quality caveats, use cases to emphasise or exclude, automation readiness context..." />
        </Card>
      </>}
    </div>
  );
}

// ─── SETTINGS STEP ───────────────────────────────────────────────────────────
function SettingsStep({ data, onChange }) {
  const set = f => v => onChange({ ...data, [f]: v });
  return (
    <div>
      <StepHdr num="05" title="Report Settings" sub="Language, rep details, and output configuration." />
      <Card>
        <Lbl required>Report Language</Lbl>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => set("language")(l.code)}
              style={{ padding: "10px 16px", borderRadius: 9, textAlign: "center",
                border: `1.5px solid ${data.language === l.code ? T.dark : T.border}`,
                background: data.language === l.code ? T.dark : T.white,
                color: data.language === l.code ? "#fff" : T.ink,
                fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 18 }}>{l.flag}</span>{l.label}
            </button>
          ))}
        </div>
        {data.language && data.language !== "en" && (
          <Notice type="info" style={{ marginTop: 10 }}>
            All report text — section headers, narrative, labels, and AI-generated content — will be produced in {LANGUAGES.find(l => l.code === data.language)?.label}.
          </Notice>
        )}
      </Card>
      <Card>
        <Lbl>Prepared By</Lbl>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><Lbl>Name</Lbl><Inp value={data.repName} onChange={set("repName")} placeholder="Jane Smith" /></div>
          <div><Lbl>Email</Lbl><Inp value={data.repEmail} onChange={set("repEmail")} placeholder="jane@zendesk.com" type="email" /></div>
        </div>
      </Card>
      <Card>
        <Lbl>Report Options</Lbl>
        {[["confidential", "Mark as Confidential"], ["showDate", "Include generation date"],
          ["showPreparedBy", "Show 'Prepared by' on cover"]].map(([k, label]) => (
          <label key={k} style={{ display: "flex", alignItems: "center", gap: 10,
            padding: "8px 0", borderBottom: `1px solid ${T.border}`, cursor: "pointer" }}>
            <div onClick={() => set(k)(!data[k])}
              style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                border: `2px solid ${data[k] ? T.dark : T.borderMid}`,
                background: data[k] ? T.dark : T.white,
                display: "flex", alignItems: "center", justifyContent: "center" }}>
              {data[k] && <Ic d={D.check} s={10} c="#fff" sw={3} />}
            </div>
            <span style={{ fontSize: 13.5, color: T.ink }}>{label}</span>
          </label>
        ))}
      </Card>
    </div>
  );
}

// ─── DRAFT & EDIT STEP ───────────────────────────────────────────────────────
function DraftStep({ allData, onGenerate, generating, apiKey }) {
  const [draftStatus, setDraftStatus] = useState("idle");
  const [draft, setDraft] = useState(null);
  const [activeSection, setActiveSection] = useState(0);
  const [progress, setProgress] = useState({ pct: 0, label: "", done: [] });

  const sectionKeys = ["disclaimer", "cx", "qa", "agents"].filter(k => {
    if (k === "disclaimer") return true;
    return !allData.skipped[k];
  });

  // Estimated seconds per section (rough but realistic)
  const SECTION_TIMES = { disclaimer: 4, cx: 18, qa: 16, agents: 16, conclusion: 10 };
  const SECTION_LABELS_PROGRESS = {
    disclaimer: "Writing disclaimer…",
    cx: "Researching CX overview…",
    qa: "Analysing QA findings…",
    agents: "Building automation section…",
    conclusion: "Writing conclusion & next steps…",
  };

  const DISCLAIMER_TEXT = (companyName, lang) =>
    `Write a single concise disclaimer sentence (max 2 sentences) for an AI Snapshot report about ${companyName}, in ${lang}.
Cover: prepared by a Zendesk AI Specialist with AI assistance; benchmarks are anonymised and directional, not guaranteed; treat as a starting point for discussion.
Tone: professional, brief. No header. No "About this report:" prefix. Write in ${lang}.`;

  const SECTION_PROMPTS = {
    disclaimer: (d) => {
      const lang = LANGUAGES.find(l => l.code === d.settings.language)?.label || "English";
      return DISCLAIMER_TEXT(d.cx.name || "this customer", lang);
    },
    cx: (d) => {
      const lang = LANGUAGES.find(l => l.code === d.settings.language)?.label || "English";
      return `You are a senior Zendesk AI specialist writing a client-facing CX Overview for an AI Snapshot report about ${d.cx.name}.

Write in ${lang}. Tone: expert, consultative, evidence-based. NOT a sales pitch.

Input data:
BULLSEYE CONTEXT (Account Brief + Value Selling Summary — may contain both or either): ${d.cx.bullseyeContext || "Not provided"}
WEB RESEARCH: ${d.cx.webResearch || "Not provided"}
ADDITIONAL CONTEXT: ${d.cx.additionalContext || ""}

Write the following sub-sections:

1. **Company Overview** (2–3 sentences MAX)
   - Who they are and their scale — only facts relevant to customer service operations
   - Any existing or planned relationship with Zendesk (pull from Account Brief if mentioned)
   - Do NOT mention operational details unrelated to CX (e.g. hangar locations, fuel costs, aircraft orders)

2. **Existing AI & Chatbot**
   - What AI/chatbot they currently use, with its name if known
   - IMPORTANT: Any claims about capability or performance (e.g. "handles 80% of queries") MUST be attributed — write "X claims..." or "According to [source]..." — do not state as fact
   - Identified capability gaps or limitations

3. **Customer Sentiment** (3–4 bullets with specific evidence)
   - Themes from reviews, Reddit, App Store — cite the source for each point
   - Only include themes directly relevant to customer service quality

4. **Top 5 CX Priorities** — MUST be a markdown table with columns: Priority | Issue | Business Impact
   - This table is REQUIRED — do not skip it or merge it with other sections
   - Focus on issues Zendesk AI can directly address (support quality, resolution speed, automation, agent consistency)
   - Do NOT include items unrelated to CS operations (e.g. pricing strategy, product features)
   - Place this table BEFORE Key Metrics

5. **Key Metrics vs Benchmark**
   ${d.cx.bullseyeContext ? `- Pull CSAT, FRT, Resolution Time, Zero-Touch from the Bullseye Context
   - Show as a markdown table: Metric | Value | Benchmark | Status
   - EXCLUDE any metric where the value is 0% or clearly inaccurate (omit it entirely)
   - Only include metrics that are meaningful signals of CS performance` : `- OMIT THIS SECTION ENTIRELY — no Bullseye data was provided. Do not write this section or any placeholder.`}

No fluff. Max 450 words.`;
    },
    qa: (d) => {
      const cats = d.qa.extractedData?.categories || [];
      const lang = LANGUAGES.find(l => l.code === d.settings.language)?.label || "English";
      const churnLine = d.qa.churnPct
        ? `Churn risk tickets detected: approximately ${d.qa.churnPct}% of ticket volume flagged as churn risk.`
        : `Churn risk tickets detected (exact % not provided — use language like "a significant proportion").`;
      const channelLine = d.qa.channelDetail
        ? `Channel inconsistency detail: ${d.qa.channelDetail}`
        : `Channel inconsistency detected across support channels (no specific detail provided — use generic framing).`;
      const selectedPrompts = d.qa.customPrompts?.included
        ? (d.qa.customPrompts?.prompts?.filter(p => p.selected) || [])
        : [];
      const customPromptsLine = selectedPrompts.length
        ? selectedPrompts.map(p =>
            `[${p.type}] ${p.name}: "${p.prompt}" — Why relevant: ${p.rationale || "specific to this customer"}`
          ).join("\n")
        : "";
      return `Write a QA Audit section for ${d.cx.name}'s AI Snapshot report in ${lang}.

Overall AQS (Auto Quality Score): ${d.qa.overallScore}% vs Zendesk benchmark: ${QA_BENCHMARK}%
Category data: ${JSON.stringify(cats)}
${channelLine}
${churnLine}
${customPromptsLine}
Notes: ${d.qa.notes || ""}

Write in ${lang} with these parts:
1. **Headline finding** — one sharp sentence summarising the gap vs ${QA_BENCHMARK}% benchmark
2. **Strengths** — categories at or above benchmark (specific numbers)
3. **Critical gaps** — categories most below benchmark with business impact
4. **Channel & Churn risk** — inconsistency is confirmed across channels${d.qa.channelDetail ? " with the detail provided" : ""}. Churn risk tickets are always present — explain the real-time escalation risk this creates.
5. **What this means** — connect QA gaps to business outcomes (CSAT, resolution quality, customer retention)
${customPromptsLine ? `
6. **Zendesk QA Custom Prompts**
Write this as a standalone sub-section. Structure:

Opening (2 sentences max): Zendesk QA's **Custom Prompts** feature lets ${d.cx.name} go beyond the standard AutoQA categories — creating AI-powered grading criteria and Spotlight tags tailored specifically to their business. There are two types: **Grading** prompts automatically score every agent conversation against a specific behaviour; **Spotlight** prompts use AI to tag conversations by topic or risk pattern, surfacing them for review without manual trawling.

Then introduce the suggested prompts: "Based on our research into ${d.cx.name}'s business and support context, here are a few prompts worth considering:"

For each selected prompt below, write a short entry with its type badge, the prompt title, the actual prompt question in quotes, and 1 sentence on why it's relevant to ${d.cx.name} specifically:
${customPromptsLine}

Keep it concise — this should feel like expert advice from a QA consultant, not a feature list.` : ""}

Then add a **Zendesk Copilot** closing section (use a header):
- 2–3 sentences on how Copilot raises consistency and agent speed by surfacing suggested replies, macros, and procedures in real time as agents type — no manual searching required
- Mention real-time QA scoring enables supervisors to identify and escalate churn-risk tickets as they happen
- Then write: "Here are a couple of examples of macros that could immediately help ${d.cx.name}'s agents respond faster and more consistently:"
- Then generate **2 concrete example Macros** focused on agent speed and response consistency — NOT complex integrations. Each macro should be something an agent could apply in seconds during a live conversation. Format each cleanly as:

  **[Macro Name]**
  *When to use:* [one sentence trigger]
  *What it does:* [one sentence describing the pre-written response or action it inserts]
  *Addresses:* [which specific QA gap it fixes]

- Keep the Action description to one plain sentence — no boxes, no capitals, no technical implementation detail

Max 420 words. In ${lang}.`;
    },
    agents: (d) => {
      const lang = LANGUAGES.find(l => l.code === d.settings.language)?.label || "English";
      const ed = d.agents.extractedData;
      const phases = ed?.phases;
      const topics = ed?.topTopicsPerPhase;
      const phase1pct = phases?.phase1?.pct ?? 0;
      const phase2pct = phases?.phase2?.pct;
      const phase3pct = phases?.phase3?.pct;
      const totalTopics = ed?.totalTopics;
      const phase1excluded = phase1pct === 0;

      return `Write an AI Agents section for ${d.cx.name}'s AI Snapshot report in ${lang}.

CONTEXT: Zendesk's Automation Potential analysis — ${totalTopics ?? "support"} topics mapped against real benchmark automation rates from across the Zendesk customer base.

Phase data (CUMULATIVE — each phase builds on the previous):
- Phase 1 (Knowledge Retrieval): ${phase1pct}% ${phase1excluded ? "— 0%, EXCLUDE from report entirely" : "← THIS IS THE QUICK WIN TARGET"}
- Phase 2 (Procedures & Dialogues): ${phase2pct}% ${!phase1excluded ? "← INTERMEDIATE target" : "← THIS IS THE QUICK WIN TARGET"}
- Phase 3 (Integrations): ${phase3pct}% ← INITIAL AR TARGET (what similar Zendesk customers achieve today — not the ceiling)
- Ultimate goal: 80% through unique topic development and deeper integrations

Total topics: ${totalTopics ?? "not provided"}
Top topics per phase: ${JSON.stringify(topics, null, 2)}
Notes: ${d.agents.notes || "none"}

Write in ${lang} with these parts:

1. **What This Analysis Shows** (2–3 sentences)
Explain this maps their ${totalTopics} support topics against Zendesk benchmark data. State that phases are cumulative — each builds on the last.

2. **The Automation Journey** — break out each active phase clearly:
${!phase1excluded ? `
   **Phase 1 — Quick Win (${phase1pct}%):** Knowledge Retrieval. These topics can be automated immediately using existing knowledge bases and FAQs. Name the top 2–3 topics from the data.
   **Phase 2 — Intermediate (${phase2pct}%):** Add procedures and dialogues for more complex flows. Name the top 2–3 topics.
   **Phase 3 — Initial AR Target (${phase3pct}%):** With system integrations, this is what similar Zendesk customers already achieve. Name the top 2–3 topics.
` : `
   **Phase 2 — Quick Win (${phase2pct}%):** Using procedures and dialogues. Name top 2–3 topics.
   **Phase 3 — Initial AR Target (${phase3pct}%):** With integrations — what similar customers already achieve. Name top 2–3 topics.
`}
   Then state: the 80% mark is the ultimate ambition, achievable by building out ${d.cx.name}'s unique topic coverage and deeper integrations over time.

3. Make clear these are benchmark-grounded directional targets, not guarantees.

End with one italicised footnote: *Benchmark figures are based on anonymised data from Zendesk customers with similar support topics. Results may vary.*

Confident, evidence-based. Max 340 words. In ${lang}.`;
    },
  };

  const generateDraft = async () => {
    setDraftStatus("loading");
    const allKeys = [...sectionKeys, "conclusion"];
    const totalTime = allKeys.reduce((s, k) => s + (SECTION_TIMES[k] || 10), 0);
    let elapsed = 0;
    setProgress({ pct: 0, label: SECTION_LABELS_PROGRESS[allKeys[0]] || "Starting…", done: [] });

    try {
      const sections = {};
      for (let i = 0; i < allKeys.length; i++) {
        const key = allKeys[i];
        setProgress(p => ({ ...p, label: SECTION_LABELS_PROGRESS[key] || `Writing ${key}…`, pct: Math.round((elapsed / totalTime) * 100) }));

        // Animate progress during generation
        const sectionTime = SECTION_TIMES[key] || 10;
        let ticks = 0;
        const ticker = setInterval(() => {
          ticks++;
          const sectionPct = Math.min(ticks / (sectionTime * 2), 0.9);
          const overallPct = Math.round(((elapsed + sectionPct * sectionTime) / totalTime) * 100);
          setProgress(p => ({ ...p, pct: Math.min(overallPct, 97) }));
        }, 500);

        if (key === "conclusion") {
          sections[key] = await callClaude({
            system: "Expert Zendesk AI Specialist writing executive summary.",
            messages: [{
              role: "user",
              content: `Write a Conclusion & Next Steps section for ${allData.cx.name}'s AI Snapshot in ${LANGUAGES.find(l => l.code === allData.settings.language)?.label || "English"}.

CX issues identified: ${allData.cx.webResearch?.slice(0, 300) || "various CX gaps"}
QA gap: ${allData.qa.overallScore ? `${allData.qa.overallScore}% vs ${QA_BENCHMARK}% benchmark (${(parseFloat(allData.qa.overallScore) - QA_BENCHMARK).toFixed(0)}pts gap)` : "not provided"}
Automation quick-win target: ${allData.agents.extractedData?.phases?.phase1?.pct > 0 ? `Phase 1 ${allData.agents.extractedData.phases.phase1.pct}%` : `Phase 2 ${allData.agents.extractedData?.phases?.phase2?.pct ?? "unknown"}%`}
Automation initial AR target (Phase 3): ${allData.agents.extractedData?.phases?.phase3?.pct ?? "unknown"}% — 80% is the ultimate goal
Total topics mapped: ${allData.agents.extractedData?.totalTopics ?? "unknown"}

Write:
1. **Summary** — 3–4 bullet points connecting all findings into a coherent narrative
2. **Recommended Next Steps** — 3 concrete actions (QA deep dive, Copilot activation, AI Agents pilot)
3. **Call to action** — one sentence inviting them to an Innovation Day

Max 200 words. In ${LANGUAGES.find(l => l.code === allData.settings.language)?.label || "English"}.`
            }],
            maxTokens: 400,
            apiKey,
          });
        } else {
          const prompt = SECTION_PROMPTS[key]?.(allData);
          if (prompt) sections[key] = await callClaude({
            system: "You are an expert Zendesk AI Specialist writing a client-facing AI Snapshot report. Write clearly, confidently, and with evidence. Use markdown formatting.",
            messages: [{ role: "user", content: prompt }],
            maxTokens: 900,
            apiKey,
          });
        }

        clearInterval(ticker);
        elapsed += sectionTime;
        setProgress(p => ({ ...p, done: [...p.done, key], pct: Math.round((elapsed / totalTime) * 100) }));
      }
      setProgress(p => ({ ...p, pct: 100, label: "Complete!" }));
      await new Promise(r => setTimeout(r, 400));
      setDraft(sections);
      setDraftStatus("done");
    } catch (e) {
      setDraftStatus("error");
    }
  };

  const sectionLabels = { disclaimer: "📋 Disclaimer", cx: "CX Overview", qa: "QA Audit", agents: "AI Agents", conclusion: "Conclusion" };
  const allSections = [...sectionKeys, "conclusion"];

  return (
    <div>
      <StepHdr num="05" title="Draft & Edit" sub="Review AI-generated report sections including disclaimer, CX, QA, AI Agents and Conclusion. Edit before PDF export." />

      {draftStatus === "idle" && (
        <Card style={{ background: T.xxlight, border: `1px solid ${T.light}` }}>
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.dark, marginBottom: 6 }}>
              Ready to draft your {allData.cx.name || "customer"} AI Snapshot
            </div>
            <div style={{ fontSize: 13, color: T.inkMid, marginBottom: 18 }}>
              Claude will write all {allSections.length} report sections using your inputs. Review and edit before PDF export.
            </div>
            <Btn variant="ai" icon="zap" size="lg" onClick={generateDraft}>
              Generate Report Draft
            </Btn>
          </div>
        </Card>
      )}

      {draftStatus === "loading" && (() => {
        const allKeys = [...sectionKeys, "conclusion"];
        return (
          <Card style={{ background: T.dark, border: "none" }}>
            <div style={{ padding: "8px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Ic d={D.spin} s={16} c={T.light} sw={2} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                    Generating AI Snapshot…
                  </span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 800, color: T.light }}>{progress.pct}%</span>
              </div>
              {/* Main progress bar */}
              <div style={{ height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 4, overflow: "hidden", marginBottom: 10 }}>
                <div style={{ height: "100%", borderRadius: 4, background: `linear-gradient(90deg, ${T.teal}, ${T.light})`,
                  width: `${progress.pct}%`, transition: "width 0.5s ease" }} />
              </div>
              {/* Current section label */}
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 14 }}>{progress.label}</div>
              {/* Section chips */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {allKeys.map(k => {
                  const isDone = progress.done.includes(k);
                  const isCurrent = progress.label === SECTION_LABELS_PROGRESS[k];
                  const labels = { disclaimer: "Disclaimer", cx: "CX Overview", qa: "QA Audit", agents: "AI Agents", conclusion: "Conclusion" };
                  return (
                    <div key={k} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px",
                      borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: isDone ? T.green : isCurrent ? T.mid : "rgba(255,255,255,0.08)",
                      color: isDone || isCurrent ? "#fff" : "rgba(255,255,255,0.4)",
                      border: `1px solid ${isDone ? T.green : isCurrent ? T.teal : "rgba(255,255,255,0.1)"}`,
                      transition: "all 0.3s" }}>
                      {isDone ? <Ic d={D.check} s={10} c="#fff" sw={2.5} /> : isCurrent ? <Ic d={D.spin} s={10} c="#fff" sw={2} /> : null}
                      {labels[k]}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        );
      })()}

      {draftStatus === "error" && (
        <Notice type="warn">Draft generation failed. Check your inputs and try again.</Notice>
      )}

      {draft && (
        <>
          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
            {allSections.filter(k => draft[k]).map((k, i) => (
              <button key={k} onClick={() => setActiveSection(i)}
                style={{ padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                  border: `1.5px solid ${activeSection === i ? T.dark : T.border}`,
                  background: activeSection === i ? T.dark : T.white,
                  color: activeSection === i ? "#fff" : T.inkMid, cursor: "pointer" }}>
                {sectionLabels[k]}
              </button>
            ))}
          </div>

          {allSections.filter(k => draft[k]).map((k, i) => (
            activeSection === i && (
              <Card key={k}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.dark }}>{sectionLabels[k]}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Btn variant="ghost" size="sm" icon="copy"
                      onClick={() => navigator.clipboard.writeText(draft[k])}>Copy</Btn>
                    <Btn variant="ghost" size="sm" icon="trash"
                      onClick={() => { const d = {...draft}; d[k] = ""; setDraft(d); }}>Clear</Btn>
                  </div>
                </div>
                <Txta value={draft[k]} onChange={v => setDraft(p => ({ ...p, [k]: v }))}
                  rows={14} style={{ lineHeight: 1.75, fontSize: 13 }} />
              </Card>
            )
          ))}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8 }}>
            <Btn variant="secondary" icon="zap" onClick={generateDraft} loading={draftStatus === "loading"}>
              Regenerate All
            </Btn>
            <Btn variant="success" icon="pdf" size="lg" onClick={() => onGenerate(draft)}>
              ⬇ Download Report
            </Btn>
          </div>
        </>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const initData = () => ({
  cx: { name: "", website: "", industry: "", bullseyeContext: "",
    additionalContext: "", searchPrompt: "", webResearch: "" },
  qa: { overallScore: "", extractedData: null, channelDetail: "", churnPct: "", notes: "", customPrompts: {} },
  agents: { extractedData: null, notes: "" },
  settings: { language: "en", repName: "", repEmail: "",
    confidential: true, showDate: true, showPreparedBy: true },
  skipped: { cx: false, qa: false, agents: false },
});

export default function App() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initData());
  const [generating, setGenerating] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // API Key Management
  const [apiKey, setAPIKey] = useState(getStoredAPIKey());
  const [showAPIKeyModal, setShowAPIKeyModal] = useState(!getStoredAPIKey());

  const handleSaveAPIKey = (key) => {
    setStoredAPIKey(key);
    setAPIKey(key);
  };

  // Inject CSS spin animation once - MUST BE BEFORE EARLY RETURN
  useEffect(() => {
    if (document.getElementById("zd-spin-style")) return;
    const s = document.createElement("style");
    s.id = "zd-spin-style";
    s.textContent = `@keyframes zd-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .zd-spinning { animation: zd-spin 0.8s linear infinite; display: inline-block; }`;
    document.head.appendChild(s);
  }, []);

  // Show API key modal if no key is stored
  if (!apiKey || showAPIKeyModal) {
    console.log("Showing API Key Modal", { apiKey, showAPIKeyModal });
    return (
      <div style={{ minHeight: "100vh", background: T.bg }}>
        <APIKeyConfig
          apiKey={apiKey || ""}
          onSave={handleSaveAPIKey}
          onClose={() => {
            console.log("Closing API Key Modal");
            setShowAPIKeyModal(false);
          }}
        />
      </div>
    );
  }

  const set = section => val => setData(p => ({ ...p, [section]: val }));
  const setSkip = key => val => setData(p => ({ ...p, skipped: { ...p.skipped, [key]: val } }));

  const handleExport = (draft) => {
    // Build and download as HTML file — user opens it and prints to PDF
    // This avoids all popup blocking issues
    const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

    // Zendesk 2025 brand tokens
    const ZD = {
      licorice: "#11110D", coconut: "#FFFFFF", matcha: "#D1F470",
      sesame: "#F5F5F2", sesame200: "#E5E5E2", fern: "#203524", shamrock: "#2D4C33",
      cactus: "#A1D78F", matchaDark: "#355E34",
    };

    // Markdown → HTML converter
    const md = (text = "") => {
      let html = text
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/^### (.+)$/gm, `<h4 style="font-size:13px;font-weight:700;color:${ZD.licorice};margin:20px 0 6px;letter-spacing:-0.01em">$1</h4>`)
        .replace(/^## (.+)$/gm, `<h3 style="font-size:15px;font-weight:700;color:${ZD.licorice};margin:24px 0 8px;letter-spacing:-0.02em">$1</h3>`)
        .replace(/^# (.+)$/gm, `<h2 style="font-size:18px;font-weight:700;color:${ZD.licorice};margin:28px 0 10px;letter-spacing:-0.02em">$1</h2>`)
        .replace(/^\|(.+)\|$/gm, (row) => {
          const cells = row.split("|").filter(c => c.trim() !== "");
          return `<tr>${cells.map(c => `<td style="padding:7px 12px;border-bottom:1px solid ${ZD.sesame200};font-size:12px;line-height:1.5">${c.trim()}</td>`).join("")}</tr>`;
        })
        .replace(/^[-•] (.+)$/gm, `<li style="margin:5px 0;line-height:1.65;font-size:13px">$1</li>`)
        .replace(/^(\d+)\. (.+)$/gm, `<li style="margin:5px 0;line-height:1.65;font-size:13px">$2</li>`);

      // Wrap consecutive <tr> in table
      html = html.replace(/(<tr>[\s\S]*?<\/tr>\n?)+/g, m =>
        `<table style="width:100%;border-collapse:collapse;margin:12px 0;background:${ZD.sesame};border-radius:8px;overflow:hidden">${m}</table>`);
      // Wrap consecutive <li> in ul
      html = html.replace(/(<li[^>]*>[\s\S]*?<\/li>\n?)+/g, m =>
        `<ul style="margin:10px 0 10px 20px;padding:0">${m}</ul>`);
      // Wrap remaining lines in <p>
      html = html.replace(/^(?!<[htuol]|\s*$)(.+)$/gm,
        `<p style="margin:8px 0;line-height:1.7;font-size:13px;color:${ZD.licorice}">$1</p>`);
      return html;
    };

    const qaGap = data.qa.overallScore ? (parseFloat(data.qa.overallScore) - QA_BENCHMARK).toFixed(1) : null;
    const phase2 = data.agents.extractedData?.phases?.phase2?.pct;
    const phase3 = data.agents.extractedData?.phases?.phase3?.pct;
    const totalTopics = data.agents.extractedData?.totalTopics;

    // Encapsulated icon (black circle + emoji) for section headers
    const sectionIcon = { cx: "◎", qa: "◈", agents: "◆", conclusion: "▶" };

    const sectionBlock = (key, label) => {
      if (!draft[key] || data.skipped[key]) return "";
      return `
        <div style="margin-bottom:40px">
          <!-- Section header bar -->
          <div style="background:${ZD.licorice};border-radius:12px;padding:14px 20px;margin-bottom:20px;display:flex;align-items:center;gap:14px">
            <div style="width:32px;height:32px;border-radius:50%;background:${ZD.matcha};display:flex;align-items:center;justify-content:center;flex-shrink:0">
              <span style="font-size:14px;color:${ZD.licorice};font-weight:900">${sectionIcon[key]}</span>
            </div>
            <span style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${ZD.coconut}">${label}</span>
          </div>
          <!-- Content -->
          <div style="padding:0 4px;color:${ZD.licorice}">
            ${md(draft[key])}
          </div>
        </div>`;
    };

    // Zendesk wordmark as SVG text (fallback since font not available)
    const zdWordmark = `<span style="font-family:'Arial Rounded MT Bold','Nunito',Arial,sans-serif;font-size:26px;font-weight:300;letter-spacing:-0.04em;color:${ZD.coconut}">zendesk</span>`;

    const html = `<!DOCTYPE html><html lang="en"><head>
    <meta charset="UTF-8">
    <title>AI Snapshot — ${data.cx.name}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
        color: ${ZD.licorice};
        background: ${ZD.coconut};
        font-size: 13px;
        line-height: 1.6;
        -webkit-font-smoothing: antialiased;
      }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .no-print { display: none !important; }
        @page { margin: 1.5cm 1.8cm; size: A4; }
        div { page-break-inside: auto !important; }
        h2, h3, h4 { page-break-after: avoid; orphans: 3; widows: 3; }
        p, li { orphans: 3; widows: 3; }
      }
      strong { font-weight: 700; }
      em { font-style: italic; }
    </style>
    </head><body>

    <!-- ═══ COVER PAGE ═══ -->
    <div style="background:${ZD.fern};position:relative;overflow:hidden;padding:52px 56px 48px">

      <!-- Matcha accent bar (left edge, like Zendesk Relate) -->
      <div style="position:absolute;left:0;top:0;bottom:0;width:8px;background:${ZD.matcha}"></div>

      <!-- Matcha geometric blob top-right -->
      <div style="position:absolute;right:-60px;top:-60px;width:220px;height:220px;border-radius:50%;background:${ZD.matcha};opacity:0.12"></div>
      <div style="position:absolute;right:40px;top:20px;width:80px;height:80px;border-radius:50%;background:${ZD.matcha};opacity:0.18"></div>

      <!-- Logo row -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:52px;position:relative">
        ${zdWordmark}
        ${data.settings.confidential ? `
        <span style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;
          color:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.2);
          padding:4px 12px;border-radius:4px">Confidential</span>` : ""}
      </div>

      <!-- Eyebrow -->
      <div style="font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;
        color:${ZD.matcha};margin-bottom:12px">AI Snapshot · CX & AI Intelligence Report</div>

      <!-- Company name — big H1 -->
      <div style="font-size:52px;font-weight:800;letter-spacing:-0.04em;line-height:1.0;
        color:${ZD.coconut};margin-bottom:10px">${data.cx.name || "Customer"}</div>

      ${data.cx.industry ? `<div style="font-size:14px;color:rgba(255,255,255,0.5);font-weight:400;margin-top:6px">${data.cx.industry}</div>` : ""}

      <!-- Bottom meta -->
      <div style="position:absolute;bottom:40px;left:56px;right:56px;display:flex;justify-content:space-between;align-items:flex-end">
        <div style="font-size:12px;color:rgba(255,255,255,0.4)">
          ${data.settings.showDate ? today : ""}
        </div>
        <div style="text-align:right">
          ${data.settings.showPreparedBy && data.settings.repName
            ? `<div style="font-size:12px;font-weight:600;color:rgba(255,255,255,0.6)">Prepared by ${data.settings.repName}</div>` : ""}
          ${data.settings.showPreparedBy && data.settings.repEmail
            ? `<div style="font-size:11px;color:rgba(255,255,255,0.35)">${data.settings.repEmail}</div>` : ""}
        </div>
      </div>
    </div>

    <!-- ═══ KEY METRICS STRIP ═══ -->
    ${(data.qa.overallScore || phase2 || phase3) ? `
    <div style="background:${ZD.sesame};border-bottom:2px solid ${ZD.sesame200};padding:24px 56px;display:flex;gap:0;align-items:stretch">
      ${data.qa.overallScore ? `
      <div style="flex:1;padding-right:32px;border-right:1px solid ${ZD.sesame200}">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:#888;margin-bottom:6px">AutoQA Score</div>
        <div style="font-size:36px;font-weight:800;letter-spacing:-0.04em;color:${qaGap && parseFloat(qaGap) >= 0 ? ZD.matchaDark : "#B91C1C"};line-height:1">${data.qa.overallScore}%</div>
        <div style="font-size:12px;color:#666;margin-top:4px">${qaGap ? `${parseFloat(qaGap) >= 0 ? "+" : ""}${qaGap}pts vs ${QA_BENCHMARK}% benchmark` : `vs ${QA_BENCHMARK}% benchmark`}</div>
      </div>` : ""}
      ${phase2 ? `
      <div style="flex:1;padding:0 32px;border-right:1px solid ${ZD.sesame200}">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:#888;margin-bottom:6px">Quick-Win Automation</div>
        <div style="font-size:36px;font-weight:800;letter-spacing:-0.04em;color:${ZD.shamrock};line-height:1">${phase2}%</div>
        <div style="font-size:12px;color:#666;margin-top:4px">Phase 2 · Procedures & dialogues</div>
      </div>` : ""}
      ${phase3 ? `
      <div style="flex:1;padding-left:32px">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:#888;margin-bottom:6px">Automation Potential</div>
        <div style="font-size:36px;font-weight:800;letter-spacing:-0.04em;color:${ZD.fern};line-height:1">${phase3}%</div>
        <div style="font-size:12px;color:#666;margin-top:4px">Initial target → <strong>80%</strong> goal${totalTopics ? ` · ${totalTopics} topics mapped` : ""}</div>
      </div>` : ""}
    </div>` : ""}

    <!-- ═══ BODY ═══ -->
    <div style="padding:44px 56px 60px;background:${ZD.coconut}">
      ${sectionBlock("cx", "CX Overview")}
      ${sectionBlock("qa", "QA Audit")}
      ${sectionBlock("agents", "AI Agents")}
      ${sectionBlock("conclusion", "Conclusion & Next Steps")}

      <!-- FOOTER -->
      <div style="margin-top:56px;padding-top:16px;border-top:2px solid ${ZD.licorice};display:flex;justify-content:space-between;align-items:center">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:16px;height:16px;border-radius:3px;background:${ZD.matcha}"></div>
          <span style="font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${ZD.licorice}">zendesk</span>
          <span style="font-size:11px;color:#999">· AI Snapshot · Internal Use Only</span>
        </div>
        <span style="font-size:11px;color:#999">${data.cx.name} · ${today}</span>
      </div>
    </div>

    <!-- ═══ PRINT CONTROLS ═══ -->
    <div class="no-print" style="position:fixed;bottom:28px;right:28px;display:flex;gap:10px;z-index:999">
      <div style="background:#11110D;color:#fff;padding:10px 16px;border-radius:8px;font-size:12px;max-width:260px;line-height:1.5">
        <strong>To save as PDF:</strong> Press <kbd style="background:#333;padding:1px 5px;border-radius:3px">Ctrl+P</kbd> (or <kbd style="background:#333;padding:1px 5px;border-radius:3px">⌘P</kbd>) → set destination to <strong>"Save as PDF"</strong>
      </div>
      <button onclick="window.print()"
        style="background:${ZD.matcha};color:${ZD.licorice};border:none;padding:13px 26px;
          border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;
          box-shadow:0 4px 24px rgba(0,0,0,0.18);font-family:inherit;letter-spacing:-0.01em">
        🖨 Print / Save as PDF
      </button>
    </div>

    </body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AI-Snapshot-${(data.cx.name || "Customer").replace(/\s+/g, "-")}-${new Date().toISOString().slice(0,10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const stepDone = (id) => {
    if (id === "cx") return !!data.cx.name;
    if (id === "qa") return !!(data.qa.overallScore || data.skipped.qa);
    if (id === "agents") return !!(data.agents.extractedData || data.agents.notes || data.skipped.agents);
    if (id === "settings") return !!data.settings.language;
    return false;
  };

  const lang = LANGUAGES.find(l => l.code === data.settings.language);

  return (
    <div style={{ minHeight: "100vh", background: T.bg,
      fontFamily: "'DM Sans', 'Outfit', system-ui, -apple-system, sans-serif" }}>

      {/* NAV BAR */}
      <div style={{ background: T.dark, height: 52, display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 22px", position: "sticky",
        top: 0, zIndex: 200, boxShadow: "0 1px 0 rgba(255,255,255,0.06), 0 4px 20px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, background: T.light, borderRadius: 7,
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Ic d={D.zap} s={15} c={T.dark} sw={2} fill={T.dark} />
            </div>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 14, letterSpacing: "-0.025em" }}>
              AI Snapshot
            </span>
          </div>
          <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.15)" }} />
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11.5, letterSpacing: "0.02em" }}>
            ZENDESK INTERNAL — AI SPECIALIST TEAM
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setShowAPIKeyModal(true)}
            style={{ padding: "5px 10px", background: "rgba(255,255,255,0.08)",
              borderRadius: 5, border: "none", color: "rgba(255,255,255,0.6)",
              fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
              transition: "all 0.15s" }}
            onMouseEnter={e => e.target.style.background = "rgba(255,255,255,0.15)"}
            onMouseLeave={e => e.target.style.background = "rgba(255,255,255,0.08)"}>
            <Ic d={D.key} s={13} c="rgba(255,255,255,0.6)" />
            API Key
          </button>
          {lang && (
            <div style={{ padding: "3px 10px", background: "rgba(255,255,255,0.08)",
              borderRadius: 5, color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
              {lang.flag} {lang.label}
            </div>
          )}
          {data.cx.name && (
            <div style={{ padding: "3px 10px", background: T.mid, borderRadius: 5,
              color: "#fff", fontSize: 12, fontWeight: 600 }}>{data.cx.name}</div>
          )}
        </div>
      </div>

      {/* STEP TABS */}
      <div style={{ background: T.white, borderBottom: `1px solid ${T.border}`,
        position: "sticky", top: 52, zIndex: 100 }}>
        <div style={{ maxWidth: 840, margin: "0 auto", display: "flex" }}>
          {STEPS.map((s, i) => {
            const active = step === i;
            const done = stepDone(s.id);
            const skipped = data.skipped[s.id];
            return (
              <button key={s.id} onClick={() => setStep(i)}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 4, padding: "11px 4px 10px",
                  borderBottom: active ? `2.5px solid ${T.dark}` : "2.5px solid transparent",
                  border: "none", background: "none", cursor: "pointer",
                  color: active ? T.dark : done ? T.green : T.inkLight,
                  marginBottom: -1, transition: "all 0.12s" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%",
                  background: active ? T.dark : done ? T.green : skipped ? T.inkLight : T.bg,
                  border: `1.5px solid ${active ? T.dark : done ? T.green : T.borderMid}`,
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 9, fontWeight: 800,
                    color: active || done ? "#fff" : T.inkLight }}>{s.num}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: active ? 700 : 500,
                  letterSpacing: active ? "-0.01em" : "0" }}>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 840, margin: "0 auto", padding: "26px 20px 80px" }}>
        {step === 0 && <CXStep data={data.cx} onChange={set("cx")} skipped={data.skipped.cx} onSkip={setSkip("cx")} apiKey={apiKey} />}
        {step === 1 && <QAStep data={{...data.qa, _companyName: data.cx.name, _website: data.cx.website, _industry: data.cx.industry}} onChange={v => set("qa")({...v, _companyName: undefined, _website: undefined, _industry: undefined})} skipped={data.skipped.qa} onSkip={setSkip("qa")} apiKey={apiKey} />}
        {step === 2 && <AgentsStep data={data.agents} onChange={set("agents")} skipped={data.skipped.agents} onSkip={setSkip("agents")} apiKey={apiKey} />}
        {step === 3 && <SettingsStep data={data.settings} onChange={set("settings")} />}
        {step === 4 && <DraftStep allData={data} onGenerate={handleExport} generating={generating} apiKey={apiKey} />}

        {/* NAV */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
          marginTop: 28, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
          <Btn variant="ghost" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>
            ← Back
          </Btn>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 11.5, color: T.inkLight }}>{step + 1} / {STEPS.length}</span>
            {step < STEPS.length - 1 ? (
              <Btn variant="primary" onClick={() => setStep(s => s + 1)}>
                {step === STEPS.length - 2 ? "Review Draft →" : "Next →"}
              </Btn>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── SECURITY DISCLAIMER ── */}
      <div style={{ maxWidth: 840, margin: "0 auto", padding: "0 20px 24px" }}>
        <div style={{ background: T.xxlight, border: `1px solid ${T.border}`, borderRadius: 8,
          padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flexShrink: 0, marginTop: 1 }}>
            <Ic d={D.info} s={16} c={T.mid} sw={2} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.dark, marginBottom: 4,
              textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Privacy & Security Notice
            </div>
            <div style={{ fontSize: 12, color: T.inkMid, lineHeight: 1.6 }}>
              <strong style={{ color: T.ink }}>No data is stored on servers.</strong> All customer data you enter is processed locally in your browser and sent directly to Anthropic's API for AI analysis. Reports are generated client-side and downloaded to your computer. This application hosts only code files—no databases, no data storage, no server-side processing.
            </div>
          </div>
        </div>
      </div>

      {/* ── DOWNLOAD TOAST ── */}
      {downloaded && (
        <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 9999,
          background: T.dark, color: "#fff", borderRadius: 12, padding: "16px 20px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)", display: "flex", alignItems: "flex-start",
          gap: 14, maxWidth: 340, border: `1px solid rgba(255,255,255,0.1)` }}>
          <div style={{ width: 36, height: 36, background: T.green, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Ic d={D.check} s={18} c="#fff" sw={2.5} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 4 }}>Report downloaded</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>
              Open the <strong style={{ color: "#fff" }}>.html file</strong> in Chrome → press{" "}
              <strong style={{ color: T.light }}>⌘P</strong> / <strong style={{ color: T.light }}>Ctrl+P</strong> →
              click <strong style={{ color: "#fff" }}>More settings</strong> → tick{" "}
              <strong style={{ color: T.light }}>Background graphics</strong> → Save as PDF.
            </div>
            <button onClick={() => setDownloaded(false)}
              style={{ marginTop: 10, fontSize: 11.5, color: T.light, background: "none",
                border: "none", cursor: "pointer", padding: 0, fontWeight: 600 }}>
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
