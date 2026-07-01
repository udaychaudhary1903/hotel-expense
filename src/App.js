import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  collection, 
  orderBy, 
  query 
} from "firebase/firestore";

// 🔥 PASTE YOUR FIREBASE CONFIG HERE
const firebaseConfig = {
  apiKey: "AIzaSyBBdI6WfOq0AHgodek1lrD6f71DbLDUErQ",
  authDomain: "restaurant-calc-4daa2.firebaseapp.com",
  projectId: "restaurant-calc-4daa2",
  storageBucket: "restaurant-calc-4daa2.firebasestorage.app",
  messagingSenderId: "650245627215",
  appId: "1:650245627215:web:69a9b35a822723d1b5393a",
  measurementId: "G-BG8PR431V5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const initialState = {
  date: new Date().toISOString().split("T")[0],
  TalwarUPISales: "",
  UdayUPISales: "",
  cashSales: "",
  talwarUPIOut: "",
  udayUPIOut: "",
  cashOut: "",
  prevCashInHand: "",
};

function formatINR(val) {
  const num = parseFloat(val) || 0;
  return "₹" + num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function SummaryCard({ label, value, color, sub }) {
  return (
    <div style={{
      background: color, borderRadius: 16, padding: "16px 18px",
      flex: 1, minWidth: 120, boxShadow: "0 2px 12px rgba(0,0,0,0.08)"
    }}>
      <div style={{ fontSize: 11, color: "#fff9", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#fff9", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "18px 16px", marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
      <div style={{ fontWeight: 800, fontSize: 15, color: "#1e1b4b", marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
      <span style={{ width: 100, fontSize: 12, fontWeight: 700, color: "#6b7280", flexShrink: 0 }}>{label}</span>
      {children}
    </div>
  );
}

function AmountInput({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative", flex: 1 }}>
      <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontWeight: 700, fontSize: 15 }}>₹</span>
      <input
        type="number" value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{
          width: "100%", padding: "10px 10px 10px 26px", borderRadius: 10,
          border: "1.5px solid #e5e7eb", fontSize: 15, fontWeight: 600,
          color: "#1e1b4b", background: "#fafafa", boxSizing: "border-box"
        }}
      />
    </div>
  );
}

function TotalBar({ label, value, bg, color, textColor }) {
  return (
    <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 10, background: bg, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontWeight: 700, color: textColor, fontSize: 14 }}>{label}</span>
      <span style={{ fontWeight: 800, fontSize: 18, color }}>{value}</span>
    </div>
  );
}

// ─── LOGIN SCREEN ───────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      const msgs = {
        "auth/email-already-in-use": "Email already registered. Please login.",
        "auth/user-not-found": "No account found. Please sign up.",
        "auth/wrong-password": "Wrong password. Try again.",
        "auth/invalid-email": "Invalid email address.",
        "auth/weak-password": "Password must be at least 6 characters.",
        "auth/invalid-credential": "Invalid email or password.",
      };
      setError(msgs[err.code] || "Something went wrong. Try again.");
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e3a5f 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Segoe UI', system-ui, sans-serif", padding: 20
    }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: "36px 28px", width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🍽️</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#1e1b4b" }}>Restaurant Tracker</div>
          <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>{isSignup ? "Create your account" : "Welcome back! Please login"}</div>
        </div>

        {isSignup && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>YOUR NAME</label>
            <input
              placeholder="e.g. Rahul Talwar"
              value={name} onChange={e => setName(e.target.value)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, color: "#1e1b4b", boxSizing: "border-box" }}
            />
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>EMAIL</label>
          <input
            type="email" placeholder="you@email.com"
            value={email} onChange={e => setEmail(e.target.value)}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, color: "#1e1b4b", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>PASSWORD</label>
          <input
            type="password" placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, color: "#1e1b4b", boxSizing: "border-box" }}
          />
        </div>

        {error && (
          <div style={{ background: "#fef2f2", color: "#dc2626", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading} style={{
          width: "100%", padding: "14px", borderRadius: 12, border: "none",
          background: loading ? "#a5b4fc" : "linear-gradient(90deg, #4f46e5, #7c3aed)",
          color: "#fff", fontWeight: 800, fontSize: 16, cursor: loading ? "not-allowed" : "pointer",
          boxShadow: "0 4px 16px rgba(79,70,229,0.35)"
        }}>
          {loading ? "Please wait..." : isSignup ? "Create Account" : "Login"}
        </button>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#6b7280" }}>
          {isSignup ? "Already have an account?" : "Don't have an account?"}
          <span onClick={() => { setIsSignup(!isSignup); setError(""); }}
            style={{ color: "#4f46e5", fontWeight: 700, cursor: "pointer", marginLeft: 6 }}>
            {isSignup ? "Login" : "Sign Up"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────
export default function RestaurantCalc() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [data, setData] = useState(initialState);
  const [history, setHistory] = useState([]);
  const [view, setView] = useState("today");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // Load history from Firestore when user logs in
  useEffect(() => {
    if (!user) return;
    setLoadingHistory(true);
    (async () => {
      try {
        const q = query(collection(db, "users", user.uid, "records"), orderBy("date", "desc"));
        const snap = await getDocs(q);
        const records = snap.docs.map(d => d.data());
        setHistory(records);
        // Auto-fill prev cash in hand from latest record
        if (records.length > 0) {
          setData(d => ({ ...d, prevCashInHand: records[0].cashInHand?.toString() || "" }));
        }
      } catch (e) {
        console.error(e);
      }
      setLoadingHistory(false);
    })();
  }, [user]);

  // Calculations
  const TalwarUPI = parseFloat(data.TalwarUPISales) || 0;
  const UdayUPI = parseFloat(data.UdayUPISales) || 0;
  const cashSales = parseFloat(data.cashSales) || 0;
  const totalSales = TalwarUPI + UdayUPI + cashSales;
  const talwarUPIOut = parseFloat(data.talwarUPIOut) || 0;
  const udayUPIOut = parseFloat(data.udayUPIOut) || 0;
  const cashOut = parseFloat(data.cashOut) || 0;
  const totalExpenses = talwarUPIOut + udayUPIOut + cashOut;
  const prevCashInHand = parseFloat(data.prevCashInHand) || 0;
  const profit = totalSales - totalExpenses;
  const cashInHand = prevCashInHand + cashSales - cashOut;

  async function saveDay() {
    if (!user) return;
    setSaving(true);
    const entry = {
      date: data.date,
      TalwarUPI, UdayUPI, cashSales, totalSales,
      talwarUPIOut, udayUPIOut, cashOut, totalExpenses,
      prevCashInHand, cashInHand, profit,
      savedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, "users", user.uid, "records", data.date), entry);
      const newHistory = [entry, ...history.filter(h => h.date !== data.date)].sort((a, b) => b.date.localeCompare(a.date));
      setHistory(newHistory);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);

      // ✅ move to next day after save
      const nextDate = new Date(data.date);
      nextDate.setDate(nextDate.getDate() + 1);
      const nextDateStr = nextDate.toISOString().split("T")[0];
      setData({
        ...initialState,
        date: nextDateStr,
        prevCashInHand: cashInHand.toString(), // carry forward cash in hand
      });

    } catch (e) {
      alert("Error saving: " + e.message);
    }
    setSaving(false);
  }

  function loadEntry(entry) {
    setData({
      date: entry.date,
      TalwarUPISales: entry.TalwarUPI?.toString() || "",
      UdayUPISales: entry.UdayUPI?.toString() || "",
      cashSales: entry.cashSales?.toString() || "",
      talwarUPIOut: entry.talwarUPIOut?.toString() || "",
      udayUPIOut: entry.udayUPIOut?.toString() || "",
      cashOut: entry.cashOut?.toString() || "",
      prevCashInHand: entry.prevCashInHand?.toString() || "",
    });
    setView("today");
  }

  async function deleteEntry(date, e) {
  e.stopPropagation(); // prevent loading the entry when clicking delete
  if (!window.confirm(`Delete record for ${date}? This cannot be undone.`)) return;
  try {
    await deleteDoc(doc(db, "users", user.uid, "records", date));
    setHistory(h => h.filter(r => r.date !== date));
  } catch (err) {
    alert("Error deleting: " + err.message);
  }
}

  function newDay() {
  // Get the latest date from history or current form date
  const baseDate = history.length > 0 ? history[0].date : data.date;
  const next = new Date(baseDate);
  next.setDate(next.getDate() + 1);
  const nextDateStr = next.toISOString().split("T")[0];

  const latestCash = history.length > 0 ? history[0].cashInHand : 0;
  setData({
    ...initialState,
    date: nextDateStr,
    prevCashInHand: latestCash?.toString() || "",
  });
}

  const profitColor = profit >= 0 ? "#16a34a" : "#dc2626";
  const cashInHandColor = cashInHand >= 0 ? "#0369a1" : "#dc2626";

  if (authLoading) {
    return (
      <div style={{
        minHeight: "100vh", background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e3a5f 100%)",
        display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16
      }}>
        <div style={{ fontSize: 40 }}>🍽️</div>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Loading...</div>
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e3a5f 100%)",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: "#1e1b4b", padding: "0 0 40px 0"
    }}>
      {/* Header */}
      <div style={{
        background: "rgba(255,255,255,0.07)", backdropFilter: "blur(10px)",
        padding: "14px 20px", display: "flex", alignItems: "center",
        justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)"
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>🍽️ Daily Summary</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
            {user.email}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {["today", "history"].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer",
              fontWeight: 600, fontSize: 12,
              background: view === v ? "#fff" : "rgba(255,255,255,0.12)",
              color: view === v ? "#312e81" : "#fff"
            }}>{v === "today" ? "Today" : "History"}</button>
          ))}
          <button onClick={() => signOut(auth)} style={{
            padding: "6px 12px", borderRadius: 20, border: "none",
            background: "rgba(255,100,100,0.2)", color: "#fca5a5",
            fontWeight: 600, fontSize: 12, cursor: "pointer"
          }}>Logout</button>
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px 0" }}>

        {view === "today" && (
          <>
            {/* Date + New Day */}
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 18 }}>
              <input type="date" value={data.date}
                onChange={e => setData(d => ({ ...d, date: e.target.value }))}
                style={{
                  flex: 1, padding: "10px 14px", borderRadius: 10, border: "none",
                  background: "rgba(255,255,255,0.92)", fontWeight: 600, fontSize: 14, color: "#1e1b4b"
                }} />
              <button onClick={newDay} style={{
                padding: "10px 14px", borderRadius: 10, border: "none",
                background: "rgba(255,255,255,0.15)", color: "#fff",
                fontWeight: 600, cursor: "pointer", fontSize: 13, whiteSpace: "nowrap"
              }}>+ New Day</button>
            </div>

            {/* Summary Cards */}
            <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
              <SummaryCard label="Total Sales" value={formatINR(totalSales)} color="#4f46e5" />
              <SummaryCard label="Expenses" value={formatINR(totalExpenses)} color="#b45309" />
              <SummaryCard label="Profit" value={formatINR(profit)} color={profit >= 0 ? "#15803d" : "#b91c1c"} sub={profit >= 0 ? "Today's earnings" : "In the red"} />
              <SummaryCard label="Cash in Hand" value={formatINR(cashInHand)} color={cashInHand >= 0 ? "#0369a1" : "#b91c1c"} sub="Closing balance" />
            </div>

            {/* Sales */}
            <Section title="💳 Sales Entry">
              <Row label="Talwar UPI"><AmountInput value={data.TalwarUPISales} onChange={v => setData(d => ({ ...d, TalwarUPISales: v }))} placeholder="0.00" /></Row>
              <Row label="Uday UPI"><AmountInput value={data.UdayUPISales} onChange={v => setData(d => ({ ...d, UdayUPISales: v }))} placeholder="0.00" /></Row>
              <Row label="Cash"><AmountInput value={data.cashSales} onChange={v => setData(d => ({ ...d, cashSales: v }))} placeholder="0.00" /></Row>
              <TotalBar label="Total Sales" value={formatINR(totalSales)} bg="rgba(79,70,229,0.1)" color="#4f46e5" textColor="#312e81" />
            </Section>

            {/* Expenses */}
            <Section title="📤 Expenses (Outflow)">
              <Row label="Talwar UPI Out"><AmountInput value={data.talwarUPIOut} onChange={v => setData(d => ({ ...d, talwarUPIOut: v }))} placeholder="0.00" /></Row>
              <Row label="Uday UPI Out"><AmountInput value={data.udayUPIOut} onChange={v => setData(d => ({ ...d, udayUPIOut: v }))} placeholder="0.00" /></Row>
              <Row label="Cash Out"><AmountInput value={data.cashOut} onChange={v => setData(d => ({ ...d, cashOut: v }))} placeholder="0.00" /></Row>
              <TotalBar label="Total Expenses" value={formatINR(totalExpenses)} bg="rgba(180,83,9,0.08)" color="#b45309" textColor="#92400e" />
            </Section>

            {/* Cash in Hand */}
            <Section title="💵 Cash in Hand">
              <Row label="Prev. Cash"><AmountInput value={data.prevCashInHand} onChange={v => setData(d => ({ ...d, prevCashInHand: v }))} placeholder="0.00" /></Row>
              <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 10, paddingLeft: 4 }}>Formula: Prev. Cash + Cash Sales − Cash Out</div>
              <TotalBar label="Cash in Hand (Closing)" value={formatINR(cashInHand)}
                bg={cashInHand >= 0 ? "rgba(3,105,161,0.08)" : "rgba(220,38,38,0.08)"}
                color={cashInHandColor} textColor={cashInHandColor} />
            </Section>

            {/* Day Summary */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#374151", marginBottom: 12 }}>📊 Day Summary</div>
              {[
                ["Talwar UPI Sales", formatINR(TalwarUPI), "#4f46e5"],
                ["Uday UPI Sales", formatINR(UdayUPI), "#7c3aed"],
                ["Cash Sales", formatINR(cashSales), "#0891b2"],
                ["Total Sales", formatINR(totalSales), "#374151"],
                ["Talwar UPI Out", `- ${formatINR(talwarUPIOut)}`, "#b45309"],
                ["Uday UPI Out", `- ${formatINR(udayUPIOut)}`, "#b45309"],
                ["Cash Out", `- ${formatINR(cashOut)}`, "#b45309"],
                ["Total Expenses", `- ${formatINR(totalExpenses)}`, "#92400e"],
                ["Prev. Cash in Hand", formatINR(prevCashInHand), "#0369a1"],
              ].map(([l, v, c]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>{l}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: c }}>{v}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, padding: "12px 14px", borderRadius: 10, background: profit >= 0 ? "#f0fdf4" : "#fef2f2", marginBottom: 8 }}>
                <span style={{ fontWeight: 800, fontSize: 15, color: profitColor }}>{profit >= 0 ? "✅ Net Profit" : "❌ Net Loss"}</span>
                <span style={{ fontWeight: 900, fontSize: 18, color: profitColor }}>{formatINR(Math.abs(profit))}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", borderRadius: 10, background: cashInHand >= 0 ? "#eff6ff" : "#fef2f2" }}>
                <span style={{ fontWeight: 800, fontSize: 15, color: cashInHandColor }}>💵 Cash in Hand</span>
                <span style={{ fontWeight: 900, fontSize: 18, color: cashInHandColor }}>{formatINR(cashInHand)}</span>
              </div>
            </div>

            <button onClick={saveDay} disabled={saving} style={{
              width: "100%", padding: "15px", borderRadius: 12, border: "none",
              background: saved ? "#16a34a" : saving ? "#a5b4fc" : "linear-gradient(90deg, #4f46e5, #7c3aed)",
              color: "#fff", fontWeight: 800, fontSize: 16, cursor: saving ? "not-allowed" : "pointer",
              boxShadow: "0 4px 16px rgba(79,70,229,0.35)", transition: "all 0.3s"
            }}>
              {saved ? "✅ Saved to Cloud!" : saving ? "Saving..." : "☁️ Save to Cloud"}
            </button>
          </>
        )}

        {view === "history" && (
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 16, marginBottom: 14 }}>
              📅 Past Records ({history.length})
            </div>
            {loadingHistory && (
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 14, padding: "30px 20px", textAlign: "center", color: "rgba(255,255,255,0.7)" }}>
                Loading your records...
              </div>
            )}
            {!loadingHistory && history.length === 0 && (
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 14, padding: "30px 20px", textAlign: "center", color: "rgba(255,255,255,0.6)" }}>
                No records saved yet. Fill today's data and save!
              </div>
            )}
            {history.map((entry, i) => (
              <div key={i} onClick={() => loadEntry(entry)} style={{
                background: "#fff", borderRadius: 14, padding: "16px 18px", marginBottom: 12,
                cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", transition: "transform 0.15s"
              }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.01)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontWeight: 800, color: "#1e1b4b", fontSize: 15 }}>
                    {new Date(entry.date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <span style={{
                    fontWeight: 800, fontSize: 13, padding: "3px 10px", borderRadius: 20,
                    background: entry.profit >= 0 ? "#dcfce7" : "#fee2e2",
                    color: entry.profit >= 0 ? "#15803d" : "#dc2626"
                  }}>
                    {entry.profit >= 0 ? "▲" : "▼"} {formatINR(Math.abs(entry.profit))}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {[
                    ["Sales", formatINR(entry.totalSales), "#4f46e5"],
                    ["T.UPI", formatINR(entry.TalwarUPI), "#7c3aed"],
                    ["U.UPI", formatINR(entry.UdayUPI), "#0891b2"],
                    ["Cash", formatINR(entry.cashSales), "#0369a1"],
                    ["Exp.", formatINR(entry.totalExpenses), "#b45309"],
                    ["💵 Hand", formatINR(entry.cashInHand), "#0369a1"],
                  ].map(([l, v, c]) => (
                    <div key={l}>
                      <div style={{ fontSize: 10, color: "#9ca3af" }}>{l}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: c }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
  <div style={{ fontSize: 11, color: "#d1d5db" }}>Tap to load & edit</div>
  <div style={{ display: "flex", gap: 6 }}>
    <button
      onClick={(e) => { e.stopPropagation(); loadEntry(entry); }}
      style={{
        background: "#eff6ff", border: "none", borderRadius: 8,
        color: "#3b82f6", fontWeight: 700, fontSize: 12,
        padding: "4px 10px", cursor: "pointer"
      }}
    >
      ✏️ Edit
    </button>
    <button
      onClick={(e) => deleteEntry(entry.date, e)}
      style={{
        background: "#fee2e2", border: "none", borderRadius: 8,
        color: "#dc2626", fontWeight: 700, fontSize: 12,
        padding: "4px 10px", cursor: "pointer"
      }}
    >
      🗑 Delete
    </button>
  </div>
</div>
                </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}