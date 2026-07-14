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
  getDoc,
  deleteDoc,
  getDocs,
  collection,
  orderBy,
  query
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function formatINR(val) {
  const num = parseFloat(val) || 0;
  return "₹" + num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function SummaryCard({ label, value, color, sub }) {
  return (
    <div style={{ background: color, borderRadius: 16, padding: "16px 18px", flex: 1, minWidth: 120, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
      <div style={{ fontSize: 11, color: "#fff9", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginTop: 4 }}>{value}</div>
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
      <span style={{ width: 110, fontSize: 12, fontWeight: 700, color: "#6b7280", flexShrink: 0 }}>{label}</span>
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
        style={{ width: "100%", padding: "10px 10px 10px 26px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 15, fontWeight: 600, color: "#1e1b4b", background: "#fafafa", boxSizing: "border-box" }}
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
function LoginScreen() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e3a5f 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: "36px 28px", width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🍽️</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#1e1b4b" }}>Restaurant Tracker</div>
          <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>{isSignup ? "Create your account" : "Welcome back! Please login"}</div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>EMAIL</label>
          <input type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, color: "#1e1b4b", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>PASSWORD</label>
          <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, color: "#1e1b4b", boxSizing: "border-box" }} />
        </div>
        {error && <div style={{ background: "#fef2f2", color: "#dc2626", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>⚠️ {error}</div>}
        <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: loading ? "#a5b4fc" : "linear-gradient(90deg, #4f46e5, #7c3aed)", color: "#fff", fontWeight: 800, fontSize: 16, cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 16px rgba(79,70,229,0.35)" }}>
          {loading ? "Please wait..." : isSignup ? "Create Account" : "Login"}
        </button>
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#6b7280" }}>
          {isSignup ? "Already have an account?" : "Don't have an account?"}
          <span onClick={() => { setIsSignup(!isSignup); setError(""); }} style={{ color: "#4f46e5", fontWeight: 700, cursor: "pointer", marginLeft: 6 }}>
            {isSignup ? "Login" : "Sign Up"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── ONBOARDING SCREEN ──────────────────────────────────────────
function OnboardingScreen({ user, onComplete }) {
  const [restaurantName, setRestaurantName] = useState("");
  const [salesFields, setSalesFields] = useState([
    { id: 1, name: "UPI 1" },
    { id: 2, name: "UPI 2" },
    { id: 3, name: "Cash" }
  ]);
  const [expenseFields, setExpenseFields] = useState([
    { id: 1, name: "UPI 1 Out" },
    { id: 2, name: "UPI 2 Out" },
    { id: 3, name: "Cash Out" }
  ]);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);

  function addSalesField() {
    if (salesFields.length >= 6) return;
    setSalesFields(f => [...f, { id: Date.now(), name: "" }]);
  }

  function removeSalesField(id) {
    if (salesFields.length <= 1) return;
    setSalesFields(f => f.filter(x => x.id !== id));
  }

  function addExpenseField() {
    if (expenseFields.length >= 6) return;
    setExpenseFields(f => [...f, { id: Date.now(), name: "" }]);
  }

  function removeExpenseField(id) {
    if (expenseFields.length <= 1) return;
    setExpenseFields(f => f.filter(x => x.id !== id));
  }

  async function handleSave() {
    if (!restaurantName.trim()) { alert("Please enter your restaurant name"); return; }
    const invalidSales = salesFields.some(f => !f.name.trim());
    const invalidExp = expenseFields.some(f => !f.name.trim());
    if (invalidSales || invalidExp) { alert("Please fill all field names"); return; }
    setSaving(true);
    try {
      const config = {
        restaurantName: restaurantName.trim(),
        salesFields: salesFields.map(f => ({ id: f.id, name: f.name.trim() })),
        expenseFields: expenseFields.map(f => ({ id: f.id, name: f.name.trim() })),
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, "users", user.uid, "config", "setup"), config);
      onComplete(config);
    } catch (e) {
      alert("Error saving: " + e.message);
    }
    setSaving(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e3a5f 100%)", fontFamily: "'Segoe UI', system-ui, sans-serif", padding: "30px 16px" }}>
      <div style={{ maxWidth: 420, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 36 }}>⚙️</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginTop: 8 }}>Setup Your Restaurant</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>Customize your tracking fields</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{ width: 32, height: 32, borderRadius: "50%", background: step >= s ? "#fff" : "rgba(255,255,255,0.2)", color: step >= s ? "#312e81" : "#fff", fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>{s}</div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div style={{ background: "#fff", borderRadius: 20, padding: "24px 20px" }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#1e1b4b", marginBottom: 16 }}>🍽️ Restaurant Name</div>
            <input placeholder="e.g. Talwar Restaurant" value={restaurantName} onChange={e => setRestaurantName(e.target.value)}
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, color: "#1e1b4b", boxSizing: "border-box", marginBottom: 8 }} />
            <button onClick={() => restaurantName.trim() ? setStep(2) : alert("Please enter restaurant name")}
              style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(90deg, #4f46e5, #7c3aed)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", marginTop: 8 }}>
              Next →
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ background: "#fff", borderRadius: 20, padding: "24px 20px" }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#1e1b4b", marginBottom: 6 }}>💳 Sales Entry Fields</div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 16 }}>Add your UPI accounts and payment methods</div>
            {salesFields.map((field, idx) => (
              <div key={field.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <input placeholder={`Field ${idx + 1} name e.g. Talwar UPI`} value={field.name}
                  onChange={e => setSalesFields(f => f.map(x => x.id === field.id ? { ...x, name: e.target.value } : x))}
                  style={{ flex: 1, padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, color: "#1e1b4b" }} />
                {salesFields.length > 1 && (
                  <button onClick={() => removeSalesField(field.id)} style={{ background: "#fee2e2", border: "none", borderRadius: 8, color: "#dc2626", fontWeight: 800, cursor: "pointer", padding: "8px 12px", fontSize: 16 }}>×</button>
                )}
              </div>
            ))}
            {salesFields.length < 6 && (
              <button onClick={addSalesField} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "2px dashed #c7d2fe", background: "transparent", color: "#4f46e5", fontWeight: 700, cursor: "pointer", fontSize: 14, marginTop: 4 }}>
                + Add Field
              </button>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "1.5px solid #e5e7eb", background: "#fff", color: "#6b7280", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>← Back</button>
              <button onClick={() => setStep(3)} style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(90deg, #4f46e5, #7c3aed)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>Next →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ background: "#fff", borderRadius: 20, padding: "24px 20px" }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#1e1b4b", marginBottom: 6 }}>📤 Expense Fields</div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 16 }}>Add your expense/outflow categories</div>
            {expenseFields.map((field, idx) => (
              <div key={field.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <input placeholder={`Field ${idx + 1} name e.g. Cash Out`} value={field.name}
                  onChange={e => setExpenseFields(f => f.map(x => x.id === field.id ? { ...x, name: e.target.value } : x))}
                  style={{ flex: 1, padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, color: "#1e1b4b" }} />
                {expenseFields.length > 1 && (
                  <button onClick={() => removeExpenseField(field.id)} style={{ background: "#fee2e2", border: "none", borderRadius: 8, color: "#dc2626", fontWeight: 800, cursor: "pointer", padding: "8px 12px", fontSize: 16 }}>×</button>
                )}
              </div>
            ))}
            {expenseFields.length < 6 && (
              <button onClick={addExpenseField} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "2px dashed #c7d2fe", background: "transparent", color: "#4f46e5", fontWeight: 700, cursor: "pointer", fontSize: 14, marginTop: 4 }}>
                + Add Field
              </button>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "1.5px solid #e5e7eb", background: "#fff", color: "#6b7280", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>← Back</button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", background: saving ? "#a5b4fc" : "linear-gradient(90deg, #16a34a, #15803d)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: saving ? "not-allowed" : "pointer" }}>
                {saving ? "Saving..." : "✅ Complete Setup"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MONTHLY DASHBOARD ──────────────────────────────────────────
function MonthlyDashboard({ history, config }) {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const monthRecords = history.filter(r => {
    const d = new Date(r.date + "T00:00:00");
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  const totalSales = monthRecords.reduce((s, r) => s + (r.totalSales || 0), 0);
  const totalExpenses = monthRecords.reduce((s, r) => s + (r.totalExpenses || 0), 0);
  const totalProfit = monthRecords.reduce((s, r) => s + (r.profit || 0), 0);
  const lastCashInHand = monthRecords.length > 0 ? monthRecords[monthRecords.length - 1].cashInHand : 0;

  const salesTotals = config.salesFields.map(field => ({
  name: field.name,
  total: monthRecords.reduce((s, r) => {
    const values = r.salesValues || {};
    const key = Object.keys(values).find(k => String(k) === String(field.id));
    return s + (key ? Number(values[key]) : 0);
  }, 0)
}));

const expenseTotals = config.expenseFields.map(field => ({
  name: field.name,
  total: monthRecords.reduce((s, r) => {
    const values = r.expenseValues || {};
    const key = Object.keys(values).find(k => String(k) === String(field.id));
    return s + (key ? Number(values[key]) : 0);
  }, 0)
}));

  function prevMonth() {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1); }
    else setSelectedMonth(m => m - 1);
  }

  function nextMonth() {
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1); }
    else setSelectedMonth(m => m + 1);
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 16px" }}>
        <button onClick={prevMonth} style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", fontWeight: 800 }}>‹</button>
        <div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>{monthNames[selectedMonth]} {selectedYear}</div>
        <button onClick={nextMonth} style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", fontWeight: 800 }}>›</button>
      </div>

      {monthRecords.length === 0 ? (
        <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 14, padding: "40px 20px", textAlign: "center", color: "rgba(255,255,255,0.6)" }}>
          No records found for {monthNames[selectedMonth]} {selectedYear}
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <SummaryCard label="Total Sales" value={formatINR(totalSales)} color="#4f46e5" sub={`${monthRecords.length} days`} />
            <SummaryCard label="Total Expenses" value={formatINR(totalExpenses)} color="#b45309" />
            <SummaryCard label="Net Profit" value={formatINR(totalProfit)} color={totalProfit >= 0 ? "#15803d" : "#b91c1c"} sub={totalProfit >= 0 ? "This month" : "Net loss"} />
            <SummaryCard label="Cash in Hand" value={formatINR(lastCashInHand)} color="#0369a1" sub="End of month" />
          </div>

          <div style={{ background: "#fff", borderRadius: 16, padding: "18px 16px", marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#1e1b4b", marginBottom: 12 }}>💳 Sales Breakdown</div>
            {salesTotals.map((s, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>{s.name}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#4f46e5" }}>{formatINR(s.total)}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, background: "rgba(79,70,229,0.08)", marginTop: 8 }}>
              <span style={{ fontWeight: 800, color: "#312e81" }}>Total Sales</span>
              <span style={{ fontWeight: 900, color: "#4f46e5", fontSize: 16 }}>{formatINR(totalSales)}</span>
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 16, padding: "18px 16px", marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#1e1b4b", marginBottom: 12 }}>📤 Expense Breakdown</div>
            {expenseTotals.map((e, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>{e.name}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#b45309" }}>{formatINR(e.total)}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, background: "rgba(180,83,9,0.08)", marginTop: 8 }}>
              <span style={{ fontWeight: 800, color: "#92400e" }}>Total Expenses</span>
              <span style={{ fontWeight: 900, color: "#b45309", fontSize: 16 }}>{formatINR(totalExpenses)}</span>
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 16, padding: "18px 16px", marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#1e1b4b", marginBottom: 12 }}>📅 Daily Breakdown</div>
            {[...monthRecords].sort((a, b) => a.date.localeCompare(b.date)).map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>
                  {new Date(r.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
                <div style={{ display: "flex", gap: 12 }}>
                  <span style={{ fontSize: 12, color: "#4f46e5", fontWeight: 600 }}>{formatINR(r.totalSales)}</span>
                  <span style={{ fontSize: 12, color: "#b45309", fontWeight: 600 }}>-{formatINR(r.totalExpenses)}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: r.profit >= 0 ? "#16a34a" : "#dc2626" }}>{formatINR(r.profit)}</span>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", borderRadius: 10, background: totalProfit >= 0 ? "#f0fdf4" : "#fef2f2", marginTop: 10 }}>
              <span style={{ fontWeight: 800, color: totalProfit >= 0 ? "#16a34a" : "#dc2626" }}>{totalProfit >= 0 ? "✅ Net Profit" : "❌ Net Loss"}</span>
              <span style={{ fontWeight: 900, fontSize: 18, color: totalProfit >= 0 ? "#16a34a" : "#dc2626" }}>{formatINR(Math.abs(totalProfit))}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────
export default function RestaurantCalc() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [data, setData] = useState({ date: new Date().toISOString().split("T")[0], salesValues: {}, expenseValues: {}, prevCashInHand: "" });
  const [history, setHistory] = useState([]);
  const [view, setView] = useState("today");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { setUser(u); setAuthLoading(false); });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    setConfigLoading(true);
    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid, "config", "setup"));
        if (snap.exists()) setConfig(snap.data());
      } catch (e) { console.error(e); }
      setConfigLoading(false);
    })();
  }, [user]);

  useEffect(() => {
    if (!user || !config) return;
    setLoadingHistory(true);
    (async () => {
      try {
        const q = query(collection(db, "users", user.uid, "records"), orderBy("date", "desc"));
        const snap = await getDocs(q);
        const records = snap.docs.map(d => d.data());
        setHistory(records);
        if (records.length > 0) {
          setData(d => ({ ...d, prevCashInHand: records[0].cashInHand?.toString() || "" }));
        }
      } catch (e) { console.error(e); }
      setLoadingHistory(false);
    })();
  }, [user, config]);

  const totalSales = config ? config.salesFields.reduce((s, f) => s + (parseFloat(data.salesValues[f.id]) || 0), 0) : 0;
  const totalExpenses = config ? config.expenseFields.reduce((s, f) => s + (parseFloat(data.expenseValues[f.id]) || 0), 0) : 0;
  const prevCashInHand = parseFloat(data.prevCashInHand) || 0;
  const cashSalesField = config?.salesFields.find(f => f.name.toLowerCase().includes("cash"));
  const cashExpField = config?.expenseFields.find(f => f.name.toLowerCase().includes("cash"));
  const cashSalesVal = cashSalesField ? (parseFloat(data.salesValues[cashSalesField.id]) || 0) : 0;
  const cashExpVal = cashExpField ? (parseFloat(data.expenseValues[cashExpField.id]) || 0) : 0;
  const profit = totalSales - totalExpenses;
  const cashInHand = prevCashInHand + cashSalesVal - cashExpVal;

  async function saveDay() {
    if (!user || !config) return;
    setSaving(true);
    const entry = {
      date: data.date,
      salesValues: data.salesValues,
      expenseValues: data.expenseValues,
      totalSales, totalExpenses, profit,
      prevCashInHand, cashInHand,
      savedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, "users", user.uid, "records", data.date), entry);
      const newHistory = [entry, ...history.filter(h => h.date !== data.date)].sort((a, b) => b.date.localeCompare(a.date));
      setHistory(newHistory);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      const nextDate = new Date(data.date);
      nextDate.setDate(nextDate.getDate() + 1);
      setData({ date: nextDate.toISOString().split("T")[0], salesValues: {}, expenseValues: {}, prevCashInHand: cashInHand.toString() });
    } catch (e) { alert("Error saving: " + e.message); }
    setSaving(false);
  }

  function loadEntry(entry) {
    setData({ date: entry.date, salesValues: entry.salesValues || {}, expenseValues: entry.expenseValues || {}, prevCashInHand: entry.prevCashInHand?.toString() || "" });
    setView("today");
  }

  async function deleteEntry(date, e) {
    e.stopPropagation();
    if (!window.confirm(`Delete record for ${date}? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "records", date));
      setHistory(h => h.filter(r => r.date !== date));
    } catch (err) { alert("Error deleting: " + err.message); }
  }

  function newDay() {
    const baseDate = history.length > 0 ? history[0].date : data.date;
    const next = new Date(baseDate);
    next.setDate(next.getDate() + 1);
    const latestCash = history.length > 0 ? history[0].cashInHand : 0;
    setData({ date: next.toISOString().split("T")[0], salesValues: {}, expenseValues: {}, prevCashInHand: latestCash?.toString() || "" });
  }

  const profitColor = profit >= 0 ? "#16a34a" : "#dc2626";
  const cashInHandColor = cashInHand >= 0 ? "#0369a1" : "#dc2626";

  if (authLoading || configLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e3a5f 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 40 }}>🍽️</div>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Loading...</div>
      </div>
    );
  }

  if (!user) return <LoginScreen />;
  if (!config) return <OnboardingScreen user={user} onComplete={setConfig} />;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e3a5f 100%)", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#1e1b4b", padding: "0 0 40px 0" }}>

      {/* Header */}
      <div style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(10px)", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>🍽️ {config.restaurantName}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{user.email}</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          {["today", "history", "monthly"].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding: "6px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 11, background: view === v ? "#fff" : "rgba(255,255,255,0.12)", color: view === v ? "#312e81" : "#fff" }}>
              {v === "today" ? "Today" : v === "history" ? "History" : "Monthly"}
            </button>
          ))}
          <button onClick={() => signOut(auth)} style={{ padding: "6px 10px", borderRadius: 20, border: "none", background: "rgba(255,100,100,0.2)", color: "#fca5a5", fontWeight: 600, fontSize: 11, cursor: "pointer" }}>Logout</button>
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px 0" }}>

        {/* TODAY VIEW */}
        {view === "today" && (
          <>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 18 }}>
              <input type="date" value={data.date} onChange={e => setData(d => ({ ...d, date: e.target.value }))}
                style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "none", background: "rgba(255,255,255,0.92)", fontWeight: 600, fontSize: 14, color: "#1e1b4b" }} />
              <button onClick={newDay} style={{ padding: "10px 14px", borderRadius: 10, border: "none", background: "rgba(255,255,255,0.15)", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13, whiteSpace: "nowrap" }}>+ New Day</button>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
              <SummaryCard label="Total Sales" value={formatINR(totalSales)} color="#4f46e5" />
              <SummaryCard label="Expenses" value={formatINR(totalExpenses)} color="#b45309" />
              <SummaryCard label="Profit" value={formatINR(profit)} color={profit >= 0 ? "#15803d" : "#b91c1c"} sub={profit >= 0 ? "Today's earnings" : "In the red"} />
              <SummaryCard label="Cash in Hand" value={formatINR(cashInHand)} color={cashInHand >= 0 ? "#0369a1" : "#b91c1c"} sub="Closing" />
            </div>

            <Section title="💳 Sales Entry">
              {config.salesFields.map(field => (
                <Row key={field.id} label={field.name}>
                  <AmountInput value={data.salesValues[field.id] || ""} onChange={v => setData(d => ({ ...d, salesValues: { ...d.salesValues, [field.id]: v } }))} placeholder="0.00" />
                </Row>
              ))}
              <TotalBar label="Total Sales" value={formatINR(totalSales)} bg="rgba(79,70,229,0.1)" color="#4f46e5" textColor="#312e81" />
            </Section>

            <Section title="📤 Expenses (Outflow)">
              {config.expenseFields.map(field => (
                <Row key={field.id} label={field.name}>
                  <AmountInput value={data.expenseValues[field.id] || ""} onChange={v => setData(d => ({ ...d, expenseValues: { ...d.expenseValues, [field.id]: v } }))} placeholder="0.00" />
                </Row>
              ))}
              <TotalBar label="Total Expenses" value={formatINR(totalExpenses)} bg="rgba(180,83,9,0.08)" color="#b45309" textColor="#92400e" />
            </Section>

            <Section title="💵 Cash in Hand">
              <Row label="Prev. Cash">
                <AmountInput value={data.prevCashInHand} onChange={v => setData(d => ({ ...d, prevCashInHand: v }))} placeholder="0.00" />
              </Row>
              <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 10, paddingLeft: 4 }}>Formula: Prev. Cash + Cash Sales − Cash Out</div>
              <TotalBar label="Cash in Hand (Closing)" value={formatINR(cashInHand)} bg={cashInHand >= 0 ? "rgba(3,105,161,0.08)" : "rgba(220,38,38,0.08)"} color={cashInHandColor} textColor={cashInHandColor} />
            </Section>

            <div style={{ background: "#fff", borderRadius: 16, padding: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#374151", marginBottom: 12 }}>📊 Day Summary</div>
              {config.salesFields.map(f => (
                <div key={f.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>{f.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#4f46e5" }}>{formatINR(data.salesValues[f.id])}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: 13, color: "#374151", fontWeight: 700 }}>Total Sales</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#374151" }}>{formatINR(totalSales)}</span>
              </div>
              {config.expenseFields.map(f => (
                <div key={f.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>{f.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#b45309" }}>- {formatINR(data.expenseValues[f.id])}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: 13, color: "#92400e", fontWeight: 700 }}>Total Expenses</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#b45309" }}>- {formatINR(totalExpenses)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>Prev. Cash in Hand</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0369a1" }}>{formatINR(prevCashInHand)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, padding: "12px 14px", borderRadius: 10, background: profit >= 0 ? "#f0fdf4" : "#fef2f2", marginBottom: 8 }}>
                <span style={{ fontWeight: 800, fontSize: 15, color: profitColor }}>{profit >= 0 ? "✅ Net Profit" : "❌ Net Loss"}</span>
                <span style={{ fontWeight: 900, fontSize: 18, color: profitColor }}>{formatINR(Math.abs(profit))}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", borderRadius: 10, background: cashInHand >= 0 ? "#eff6ff" : "#fef2f2" }}>
                <span style={{ fontWeight: 800, fontSize: 15, color: cashInHandColor }}>💵 Cash in Hand</span>
                <span style={{ fontWeight: 900, fontSize: 18, color: cashInHandColor }}>{formatINR(cashInHand)}</span>
              </div>
            </div>

            <button onClick={saveDay} disabled={saving} style={{ width: "100%", padding: "15px", borderRadius: 12, border: "none", background: saved ? "#16a34a" : saving ? "#a5b4fc" : "linear-gradient(90deg, #4f46e5, #7c3aed)", color: "#fff", fontWeight: 800, fontSize: 16, cursor: saving ? "not-allowed" : "pointer", boxShadow: "0 4px 16px rgba(79,70,229,0.35)", transition: "all 0.3s" }}>
              {saved ? "✅ Saved to Cloud!" : saving ? "Saving..." : "☁️ Save to Cloud"}
            </button>
          </>
        )}

        {/* HISTORY VIEW */}
        {view === "history" && (
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 16, marginBottom: 14 }}>📅 Past Records ({history.length})</div>
            {loadingHistory && <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 14, padding: "30px 20px", textAlign: "center", color: "rgba(255,255,255,0.7)" }}>Loading...</div>}
            {!loadingHistory && history.length === 0 && <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 14, padding: "30px 20px", textAlign: "center", color: "rgba(255,255,255,0.6)" }}>No records saved yet!</div>}
            {history.map((entry, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", marginBottom: 12, cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", transition: "transform 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.01)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontWeight: 800, color: "#1e1b4b", fontSize: 15 }}>
                    {new Date(entry.date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <span style={{ fontWeight: 800, fontSize: 13, padding: "3px 10px", borderRadius: 20, background: entry.profit >= 0 ? "#dcfce7" : "#fee2e2", color: entry.profit >= 0 ? "#15803d" : "#dc2626" }}>
                    {entry.profit >= 0 ? "▲" : "▼"} {formatINR(Math.abs(entry.profit))}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {[
                    ["Sales", formatINR(entry.totalSales), "#4f46e5"],
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
                    <button onClick={(e) => { e.stopPropagation(); loadEntry(entry); }} style={{ background: "#eff6ff", border: "none", borderRadius: 8, color: "#3b82f6", fontWeight: 700, fontSize: 12, padding: "4px 10px", cursor: "pointer" }}>✏️ Edit</button>
                    <button onClick={(e) => deleteEntry(entry.date, e)} style={{ background: "#fee2e2", border: "none", borderRadius: 8, color: "#dc2626", fontWeight: 700, fontSize: 12, padding: "4px 10px", cursor: "pointer" }}>🗑 Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MONTHLY VIEW */}
        {view === "monthly" && <MonthlyDashboard history={history} config={config} />}

      </div>
    </div>
  );
}
