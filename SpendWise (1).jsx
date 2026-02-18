import { useState, useEffect } from "react";

const CATEGORIES = [
  { id: "food",          label: "Food & Dining",    icon: "🍽️", color: "#FF6B6B" },
  { id: "transport",     label: "Transport",         icon: "🚗", color: "#4ECDC4" },
  { id: "shopping",      label: "Shopping",          icon: "🛍️", color: "#FFE66D" },
  { id: "bills",         label: "Bills & Utilities", icon: "💡", color: "#A8E6CF" },
  { id: "health",        label: "Health",            icon: "💊", color: "#FF8B94" },
  { id: "entertainment", label: "Entertainment",     icon: "🎬", color: "#B4A7D6" },
  { id: "education",     label: "Education",         icon: "📚", color: "#78C8E6" },
  { id: "groceries",     label: "Groceries",         icon: "🛒", color: "#98D8C8" },
  { id: "other",         label: "Other",             icon: "📌", color: "#D4A5A5" },
];

const INVESTMENT_TIPS = [
  { title: "Emergency Fund First",  desc: "Save 3–6 months of expenses before investing. It's your financial safety net.", icon: "🛡️" },
  { title: "SIP in Mutual Funds",   desc: "Start a SIP with ₹500/month in index funds. Compounding works best over time.", icon: "📈" },
  { title: "PPF for Tax Saving",    desc: "Public Provident Fund offers ~7.1% returns with tax benefits under 80C.", icon: "🏦" },
  { title: "50/30/20 Rule",         desc: "50% needs, 30% wants, 20% savings & investments. Simple but powerful.", icon: "⚖️" },
  { title: "NPS for Retirement",    desc: "National Pension System gives additional ₹50,000 tax deduction under 80CCD(1B).", icon: "🌅" },
  { title: "Gold (Digital)",        desc: "Invest in Sovereign Gold Bonds for safe, interest-bearing gold exposure.", icon: "💰" },
];

const UPI_APPS = ["GPay", "PhonePe", "Paytm", "BHIM", "Amazon Pay"];

const generateId     = () => Math.random().toString(36).substr(2, 9);
const today          = () => new Date().toISOString().split("T")[0];
const formatCurrency = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const getGreeting    = () => { const h = new Date().getHours(); return h < 12 ? "Morning" : h < 17 ? "Afternoon" : "Evening"; };

export default function App() {
  const [screen,           setScreen]          = useState("signin");
  const [user,             setUser]            = useState(null);
  const [tab,              setTab]             = useState("dashboard");
  const [transactions,     setTransactions]    = useState([]);
  const [showPopup,        setShowPopup]       = useState(false);
  const [showAddManual,    setShowAddManual]   = useState(false);
  const [showProfile,      setShowProfile]     = useState(false);
  const [showSettings,     setShowSettings]    = useState(false);
  const [showClearConfirm, setShowClearConfirm]= useState(false);
  const [popupData,        setPopupData]       = useState({ amount:"", note:"", category:null, type:"expense" });
  const [manualData,       setManualData]      = useState({ amount:"", note:"", category:null, type:"expense" });
  const [signForm,         setSignForm]        = useState({ name:"", email:"", password:"", mode:"signin", budget:"", upiApp:"" });
  // savedSettings = committed values used by the rest of the app (not mutated by typing)
  const [savedSettings,    setSavedSettings]   = useState({ notifications:true, budget:"" });
  // draftSettings = temp copy mutated while settings modal is open; discarded on close, committed on Save
  const [draftSettings,    setDraftSettings]   = useState({ notifications:true, budget:"", name:"", email:"" });
  const [toast,            setToast]           = useState(null);
  const [upiSim,           setUpiSim]          = useState(false);
  const [upiAmount,        setUpiAmount]       = useState("");
  const [upiApp,           setUpiApp]          = useState("GPay");
  const [customCategories, setCustomCategories]= useState([]);
  const [showAddCategory,  setShowAddCategory] = useState(false);
  const [newCat,           setNewCat]          = useState({ label:"", icon:"📂", color:"#A78BFA" });

  useEffect(() => {
    const saved     = localStorage.getItem("spendwise_user");
    const savedTx   = localStorage.getItem("spendwise_tx");
    const savedSt   = localStorage.getItem("spendwise_settings");
    const savedCats = localStorage.getItem("spendwise_cats");
    if (saved) {
      const u = JSON.parse(saved);
      setUser(u);
      setScreen("main");
      setDraftSettings(p => ({ ...p, name:u.name, email:u.email }));
    }
    if (savedTx)   setTransactions(JSON.parse(savedTx));
    if (savedSt) {
      const st = JSON.parse(savedSt);
      setSavedSettings(st);
      setDraftSettings(p => ({ ...p, ...st }));
    }
    if (savedCats) setCustomCategories(JSON.parse(savedCats));
  }, []);

  useEffect(() => { localStorage.setItem("spendwise_tx", JSON.stringify(transactions)); }, [transactions]);

  const showToast = (msg, type="success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const handleSignIn = () => {
    if (!signForm.name || !signForm.email || !signForm.password) return showToast("Fill all fields", "error");
    const u = { name:signForm.name, email:signForm.email, avatar:signForm.name[0].toUpperCase() };
    const initBudget = signForm.budget||"";
    setUser(u);
    setSavedSettings(p => ({ ...p, budget:initBudget }));
    setDraftSettings({ notifications:true, budget:initBudget, name:u.name, email:u.email });
    localStorage.setItem("spendwise_user", JSON.stringify(u));
    setScreen("main");
    showToast(`Welcome, ${signForm.name}! 🎉`);
  };

  const handleLogout = () => {
    localStorage.removeItem("spendwise_user");
    setUser(null); setScreen("signin"); setTransactions([]); setShowProfile(false); setTab("dashboard");
    setSignForm({ name:"", email:"", password:"", mode:"signin", budget:"", upiApp:"" });
  };

  const addTransaction = (data) => {
    const tx = { id:generateId(), ...data, date:today(), time:new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}) };
    setTransactions(prev => [tx, ...prev]);
    showToast(data.type==="expense" ? "Expense added!" : "Income added!");
  };

  const deleteTransaction = (id) => { setTransactions(prev => prev.filter(t => t.id !== id)); showToast("Transaction removed"); };

  const simulateUPI = () => {
    if (!upiAmount || isNaN(upiAmount)) return showToast("Enter valid amount", "error");
    setUpiSim(false);
    setPopupData({ amount:upiAmount, note:`Paid via ${upiApp}`, category:null, type:"expense" });
    setShowPopup(true); setUpiAmount("");
  };

  const confirmPopup = () => {
    if (!popupData.category) return showToast("Pick a category", "error");
    addTransaction(popupData); setShowPopup(false);
  };

  const confirmManual = () => {
    if (!manualData.amount || !manualData.category) return showToast("Fill amount & category", "error");
    addTransaction(manualData); setShowAddManual(false);
    setManualData({ amount:"", note:"", category:null, type:"expense" });
  };

  // Open settings: reset draft to current saved values so previous unsaved changes don't persist
  const openSettings = () => {
    setDraftSettings({ notifications:savedSettings.notifications, budget:savedSettings.budget, name:user.name, email:user.email });
    setShowSettings(true);
  };

  const saveSettings = () => {
    if (!draftSettings.name || !draftSettings.email) return showToast("Name and email can't be empty", "error");
    const updatedUser = { ...user, name:draftSettings.name, email:draftSettings.email, avatar:draftSettings.name[0].toUpperCase() };
    const committed = { notifications:draftSettings.notifications, budget:draftSettings.budget };
    setUser(updatedUser);
    setSavedSettings(committed);
    localStorage.setItem("spendwise_user", JSON.stringify(updatedUser));
    localStorage.setItem("spendwise_settings", JSON.stringify({ ...committed, name:draftSettings.name, email:draftSettings.email }));
    setShowSettings(false);
    showToast("Settings saved ✓");
  };

  const clearAll = () => {
    setTransactions([]); localStorage.removeItem("spendwise_tx");
    setShowClearConfirm(false); setShowSettings(false); showToast("All transactions cleared");
  };

  const addCustomCategory = () => {
    if (!newCat.label.trim()) return showToast("Enter a category name", "error");
    const cat = { id:"custom_"+generateId(), label:newCat.label.trim(), icon:newCat.icon, color:newCat.color, custom:true };
    const updated = [...customCategories, cat];
    setCustomCategories(updated);
    localStorage.setItem("spendwise_cats", JSON.stringify(updated));
    setNewCat({ label:"", icon:"📂", color:"#A78BFA" });
    setShowAddCategory(false);
    showToast(`Category "${cat.label}" added!`);
  };

  const deleteCustomCategory = (id) => {
    const updated = customCategories.filter(c=>c.id!==id);
    setCustomCategories(updated);
    localStorage.setItem("spendwise_cats", JSON.stringify(updated));
    showToast("Category removed");
  };

  const allCategories = [...CATEGORIES, ...customCategories];

  const todayTx           = transactions.filter(t => t.date === today());
  const totalExpenseToday = todayTx.filter(t => t.type==="expense").reduce((s,t) => s+Number(t.amount), 0);
  const totalIncomeToday  = todayTx.filter(t => t.type==="income").reduce((s,t) => s+Number(t.amount), 0);
  const allExpenses       = transactions.filter(t => t.type==="expense");
  const catMap = {};
  allExpenses.forEach(t => { catMap[t.category] = (catMap[t.category]||0) + Number(t.amount); });
  const topCat  = Object.entries(catMap).sort((a,b) => b[1]-a[1]);
  const totalAll = allExpenses.reduce((s,t) => s+Number(t.amount), 0);

  // ── SIGN IN / SIGN UP ──────────────────────────────────────────────────────
  if (screen === "signin") {
    const isSignup = signForm.mode === "signup";
    return (
      <div style={S.signinBg}>
        <div style={S.blob1}/><div style={S.blob2}/>
        <div style={S.signinCard}>
          <div style={S.logoArea}>
            <div style={S.logoCircle}>💸</div>
            <h1 style={S.logoText}>SpendWise</h1>
            <p style={S.logoSub}>Track. Save. Grow.</p>
          </div>
          <div style={S.authTabRow}>
            {["signin","signup"].map(m => (
              <button key={m} style={{ ...S.authTab, ...(signForm.mode===m?S.authTabActive:{}) }}
                onClick={() => setSignForm(p=>({...p,mode:m,name:"",email:"",password:""}))}>
                {m==="signin"?"Sign In":"Sign Up"}
              </button>
            ))}
          </div>

          {!isSignup && (
            <div>
              <p style={S.formHeading}>Welcome back 👋</p>
              <label style={S.inputLabel}>Name</label>
              <input style={S.input} placeholder="Your name" value={signForm.name} onChange={e=>setSignForm(p=>({...p,name:e.target.value}))}/>
              <label style={S.inputLabel}>Email</label>
              <input style={S.input} placeholder="you@example.com" type="email" value={signForm.email} onChange={e=>setSignForm(p=>({...p,email:e.target.value}))}/>
              <label style={S.inputLabel}>Password</label>
              <input style={S.input} placeholder="••••••••" type="password" value={signForm.password} onChange={e=>setSignForm(p=>({...p,password:e.target.value}))}/>
              <button style={S.primaryBtn} onClick={handleSignIn}>Sign In →</button>
              <p style={S.switchText}>Don't have an account?{" "}<span style={S.switchLink} onClick={()=>setSignForm(p=>({...p,mode:"signup"}))}>Sign Up</span></p>
            </div>
          )}

          {isSignup && (
            <div>
              <p style={S.formHeading}>Create your account ✨</p>
              <label style={S.inputLabel}>Full Name</label>
              <input style={S.input} placeholder="Arjun Sharma" value={signForm.name} onChange={e=>setSignForm(p=>({...p,name:e.target.value}))}/>
              <label style={S.inputLabel}>Email</label>
              <input style={S.input} placeholder="you@example.com" type="email" value={signForm.email} onChange={e=>setSignForm(p=>({...p,email:e.target.value}))}/>
              <label style={S.inputLabel}>Password</label>
              <input style={S.input} placeholder="Min. 6 characters" type="password" value={signForm.password} onChange={e=>setSignForm(p=>({...p,password:e.target.value}))}/>
              <label style={S.inputLabel}>Monthly Budget (₹) <span style={S.optionalTag}>optional</span></label>
              <input style={S.input} placeholder="e.g. 15000" type="number" value={signForm.budget||""} onChange={e=>setSignForm(p=>({...p,budget:e.target.value}))}/>
              <label style={S.inputLabel}>Preferred UPI App <span style={S.optionalTag}>optional</span></label>
              <div style={S.upiChipRow}>
                {UPI_APPS.map(a=>(
                  <button key={a} style={{...S.upiChip,...(signForm.upiApp===a?S.upiChipActive:{})}} onClick={()=>setSignForm(p=>({...p,upiApp:a}))}>{a}</button>
                ))}
              </div>
              <button style={{...S.primaryBtn,marginTop:16}} onClick={handleSignIn}>Create Account →</button>
              <div style={S.featureList}>
                {["✅ Track daily expenses instantly","🔗 Simulate UPI payment import","📈 Get investment tips","📊 Daily spending summaries"].map(f=>(
                  <p key={f} style={S.featureItem}>{f}</p>
                ))}
              </div>
              <p style={S.switchText}>Already have an account?{" "}<span style={S.switchLink} onClick={()=>setSignForm(p=>({...p,mode:"signin"}))}>Sign In</span></p>
            </div>
          )}
          <p style={S.demoNote}>🔒 Demo mode — data stored locally on your device</p>
        </div>
        {toast && <Toast toast={toast}/>}
      </div>
    );
  }

  // ── MAIN APP ───────────────────────────────────────────────────────────────
  return (
    <div style={S.appBg}>

      {/* HEADER */}
      <div style={S.header}>
        <div>
          <p style={S.greeting}>Good {getGreeting()}, {user?.name?.split(" ")[0]} 👋</p>
          <p style={S.headerDate}>{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</p>
        </div>
        <div style={{position:"relative"}}>
          <div style={S.avatar} onClick={()=>setShowProfile(p=>!p)}>{user?.avatar}</div>
          {showProfile && (
            <>
              <div style={S.profileBackdrop} onClick={()=>setShowProfile(false)}/>
              <div style={S.profileDropdown}>
                <div style={S.profileTop}>
                  <div style={S.profileAvatarLg}>{user?.avatar}</div>
                  <div style={{marginLeft:12}}>
                    <p style={S.profileName}>{user?.name}</p>
                    <p style={S.profileEmail}>{user?.email}</p>
                  </div>
                </div>
                <div style={S.dropDivider}/>
                <button style={S.dropItem} onClick={()=>{setShowProfile(false);openSettings();}}>
                  <span style={S.dropIcon}>⚙️</span><span style={S.dropLabel}>Settings</span><span style={S.dropArrow}>›</span>
                </button>
                <button style={S.dropItem} onClick={()=>{showToast("Notifications coming soon!");setShowProfile(false);}}>
                  <span style={S.dropIcon}>🔔</span><span style={S.dropLabel}>Notifications</span><span style={S.dropArrow}>›</span>
                </button>
                <div style={S.dropDivider}/>
                <button style={{...S.dropItem,...S.dropLogout}} onClick={handleLogout}>
                  <span style={S.dropIcon}>🚪</span><span>Log Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* SUMMARY CARD */}
      <div style={S.summaryCard}>
        <div style={S.summaryRow}>
          <div>
            <p style={S.summaryLabel}>Today's Spend</p>
            <p style={S.summaryAmount}>{formatCurrency(totalExpenseToday)}</p>
          </div>
          <div style={{textAlign:"right"}}>
            <p style={S.summaryLabel}>Today's Income</p>
            <p style={{...S.summaryAmount,color:"#4ECDC4"}}>{formatCurrency(totalIncomeToday)}</p>
          </div>
        </div>
        {settings.budget && (
          <div style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{color:"#888",fontSize:12}}>Monthly Budget</span>
              <span style={{color:totalExpenseToday>Number(settings.budget)?"#FF6B6B":"#aaa",fontSize:12,fontWeight:600}}>
                {formatCurrency(totalExpenseToday)} / {formatCurrency(settings.budget)}
              </span>
            </div>
            <div style={S.progressBg}>
              <div style={{...S.progressFill,width:`${Math.min((totalExpenseToday/Number(settings.budget))*100,100)}%`,background:totalExpenseToday>Number(settings.budget)?"#FF6B6B":"#5B4FE8"}}/>
            </div>
          </div>
        )}
        {topCat[0] && (
          <p style={S.insightText}>💡 Most spent on <b>{allCategories.find(c=>c.id===topCat[0][0])?.label}</b> — {formatCurrency(topCat[0][1])} total</p>
        )}
      </div>

      {/* TAB NAV */}
      <div style={S.tabNav}>
        {[["dashboard","📊","Summary"],["transactions","📋","History"],["invest","📈","Invest"]].map(([t,icon,label])=>(
          <button key={t} style={{...S.navBtn,...(tab===t?S.navBtnActive:{})}} onClick={()=>setTab(t)}>
            <span>{icon}</span><span style={{fontSize:11}}>{label}</span>
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={S.content}>
        {tab==="dashboard"    && <Dashboard topCat={topCat} todayTx={todayTx} totalAll={totalAll} transactions={transactions} allCategories={allCategories}/>}
        {tab==="transactions" && <Transactions transactions={transactions} deleteTransaction={deleteTransaction} allCategories={allCategories}/>}
        {tab==="invest"       && <InvestTab/>}
      </div>

      {/* FABs */}
      <div style={S.fabArea}>
        <button style={S.fabSecondary} onClick={()=>setUpiSim(true)}>🔗 UPI</button>
        <button style={S.fab} onClick={()=>setShowAddManual(true)}>+ Add</button>
      </div>

      {/* UPI SIMULATOR */}
      {upiSim && (
        <Modal onClose={()=>setUpiSim(false)} title="🔗 Simulate UPI Payment">
          <p style={S.modalDesc}>Simulates reading your UPI payment. Only amount & app are accessed.</p>
          <select style={S.input} value={upiApp} onChange={e=>setUpiApp(e.target.value)}>
            {UPI_APPS.map(a=><option key={a}>{a}</option>)}
          </select>
          <input style={S.input} placeholder="Amount (₹)" type="number" value={upiAmount} onChange={e=>setUpiAmount(e.target.value)}/>
          <button style={S.primaryBtn} onClick={simulateUPI}>Import Payment →</button>
        </Modal>
      )}

      {/* CATEGORY POPUP */}
      {showPopup && (
        <div style={S.popupOverlay}>
          <div style={S.popup}>
            <p style={S.popupTitle}>💸 New Transaction Detected</p>
            <p style={S.popupAmount}>{formatCurrency(popupData.amount)}</p>
            <p style={S.popupNote}>{popupData.note}</p>
            <p style={S.popupQ}>Where did you spend this?</p>
            <div style={S.catGrid}>
              {allCategories.map(c=>(
                <button key={c.id} style={{...S.catBtn,...(popupData.category===c.id?{background:c.color,color:"#000"}:{})}}
                  onClick={()=>setPopupData(p=>({...p,category:c.id}))}>
                  <span style={{fontSize:18}}>{c.icon}</span>
                  <span style={{fontSize:10,marginTop:2}}>{c.label.split(" ")[0]}</span>
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:8,marginTop:12}}>
              <button style={S.secondaryBtn} onClick={()=>setShowPopup(false)}>Skip</button>
              <button style={S.primaryBtn} onClick={confirmPopup}>Save ✓</button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL ADD */}
      {showAddManual && (
        <Modal onClose={()=>setShowAddManual(false)} title="+ Add Transaction">
          <div style={S.typeToggle}>
            {["expense","income"].map(t=>(
              <button key={t} style={{...S.typeBtn,...(manualData.type===t?S.typeBtnActive:{})}}
                onClick={()=>setManualData(p=>({...p,type:t}))}>
                {t==="expense"?"💸 Expense":"💰 Income"}
              </button>
            ))}
          </div>
          <input style={S.input} placeholder="Amount (₹)" type="number" value={manualData.amount} onChange={e=>setManualData(p=>({...p,amount:e.target.value}))}/>
          <input style={S.input} placeholder="Note (optional)" value={manualData.note} onChange={e=>setManualData(p=>({...p,note:e.target.value}))}/>
          <p style={{color:"#aaa",fontSize:13,marginBottom:8}}>Select Category:</p>
          <div style={S.catGrid}>
            {allCategories.map(c=>(
              <button key={c.id} style={{...S.catBtn,...(manualData.category===c.id?{background:c.color,color:"#000"}:{})}}
                onClick={()=>setManualData(p=>({...p,category:c.id}))}>
                <span style={{fontSize:18}}>{c.icon}</span>
                <span style={{fontSize:10,marginTop:2}}>{c.label.split(" ")[0]}</span>
              </button>
            ))}
          </div>
          <button style={{...S.primaryBtn,marginTop:12}} onClick={confirmManual}>Add Transaction ✓</button>
        </Modal>
      )}

      {/* SETTINGS MODAL */}
      {showSettings && (
        <Modal onClose={()=>setShowSettings(false)} title="⚙️ Settings">
          {/* ACCOUNT — fully editable, uses draftSettings */}
          <div style={S.settingsSection}>
            <p style={S.settingsSectionTitle}>ACCOUNT</p>
            <label style={S.inputLabel}>Display Name</label>
            <input style={S.input} placeholder="Your name" value={draftSettings.name} onChange={e=>setDraftSettings(p=>({...p,name:e.target.value}))}/>
            <label style={S.inputLabel}>Email</label>
            <input style={S.input} type="email" placeholder="you@example.com" value={draftSettings.email} onChange={e=>setDraftSettings(p=>({...p,email:e.target.value}))}/>
          </div>

          {/* BUDGET — uses draftSettings, only applied on Save */}
          <div style={S.settingsSection}>
            <p style={S.settingsSectionTitle}>BUDGET</p>
            <label style={S.inputLabel}>Monthly Budget Goal (₹)</label>
            <input style={S.input} placeholder="e.g. 20000" type="number" value={draftSettings.budget} onChange={e=>setDraftSettings(p=>({...p,budget:e.target.value}))}/>
          </div>

          {/* PREFERENCES */}
          <div style={S.settingsSection}>
            <p style={S.settingsSectionTitle}>PREFERENCES</p>
            <div style={S.settingsRow}>
              <div>
                <p style={S.settingsLabel}>Transaction Notifications</p>
                <p style={S.settingsSubLabel}>Get alerted on every spend</p>
              </div>
              <div style={{...S.toggle,...(draftSettings.notifications?S.toggleOn:{})}} onClick={()=>setDraftSettings(p=>({...p,notifications:!p.notifications}))}>
                <div style={{...S.toggleThumb,...(draftSettings.notifications?S.toggleThumbOn:{})}}/>
              </div>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <button style={S.primaryBtn} onClick={saveSettings}>💾 Save Settings</button>

          {/* CUSTOM CATEGORIES */}
          <div style={{...S.settingsSection,marginTop:20}}>
            <p style={S.settingsSectionTitle}>CUSTOM CATEGORIES</p>
            {customCategories.length===0
              ? <p style={{color:"#555",fontSize:13,marginBottom:10}}>No custom categories yet</p>
              : customCategories.map(c=>(
                  <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #1a1a2e"}}>
                    <span style={{fontSize:20}}>{c.icon}</span>
                    <span style={{flex:1,color:"#ccc",fontSize:14}}>{c.label}</span>
                    <div style={{width:14,height:14,borderRadius:"50%",background:c.color}}/>
                    <button style={{background:"none",border:"none",color:"#555",cursor:"pointer",fontSize:13}} onClick={()=>deleteCustomCategory(c.id)}>✕</button>
                  </div>
                ))
            }
            <button style={{...S.secondaryBtn,width:"100%",marginTop:10}} onClick={()=>setShowAddCategory(true)}>+ Add Custom Category</button>
          </div>

          {/* DANGER ZONE */}
          <div style={{...S.settingsSection,marginTop:4}}>
            <p style={S.settingsSectionTitle}>DANGER ZONE</p>
            <button style={S.dangerBtn} onClick={()=>setShowClearConfirm(true)}>🗑️ Clear All Transactions</button>
          </div>
        </Modal>
      )}

      {/* ADD CUSTOM CATEGORY MODAL */}
      {showAddCategory && (
        <Modal onClose={()=>{setShowAddCategory(false);setNewCat({label:"",icon:"📂",color:"#A78BFA"});}} title="➕ New Category">
          <label style={S.inputLabel}>Category Name</label>
          <input style={S.input} placeholder="e.g. Pets, Travel, Rent..." value={newCat.label} onChange={e=>setNewCat(p=>({...p,label:e.target.value}))}/>
          <label style={S.inputLabel}>Pick an Icon</label>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>
            {["📂","🏠","✈️","🐾","🎮","🎵","💼","🏋️","🍺","🎁","💇","🚿","🌿","🔧","📱","👗","🎯","💈"].map(em=>(
              <button key={em} style={{background:newCat.icon===em?"#252545":"#0d0d1e",border:newCat.icon===em?"1px solid #5B4FE8":"1px solid #252545",borderRadius:8,padding:"6px 10px",fontSize:18,cursor:"pointer"}}
                onClick={()=>setNewCat(p=>({...p,icon:em}))}>{em}</button>
            ))}
          </div>
          <label style={S.inputLabel}>Pick a Color</label>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
            {["#FF6B6B","#4ECDC4","#FFE66D","#A8E6CF","#FF8B94","#B4A7D6","#78C8E6","#98D8C8","#A78BFA","#F97316","#34D399","#60A5FA","#F472B6","#FBBF24","#D4A5A5"].map(col=>(
              <button key={col} style={{width:28,height:28,borderRadius:"50%",background:col,border:newCat.color===col?"3px solid #fff":"2px solid transparent",cursor:"pointer"}}
                onClick={()=>setNewCat(p=>({...p,color:col}))}/>
            ))}
          </div>
          {/* Preview */}
          <div style={{background:"#0d0d1e",borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
            <div style={{width:40,height:40,borderRadius:12,background:newCat.color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{newCat.icon}</div>
            <span style={{color:newCat.label?"#fff":"#555",fontSize:15,fontWeight:600}}>{newCat.label||"Category Preview"}</span>
            <div style={{width:10,height:10,borderRadius:"50%",background:newCat.color,marginLeft:"auto"}}/>
          </div>
          <button style={S.primaryBtn} onClick={addCustomCategory}>Add Category ✓</button>
        </Modal>
      )}

      {/* CONFIRM CLEAR DIALOG */}
      {showClearConfirm && (
        <div style={S.confirmOverlay}>
          <div style={S.confirmBox}>
            <p style={{fontSize:40,margin:"0 0 10px"}}>⚠️</p>
            <p style={S.confirmTitle}>Clear All Transactions?</p>
            <p style={S.confirmDesc}>This will permanently delete your entire transaction history. This cannot be undone.</p>
            <div style={{display:"flex",gap:10,marginTop:20}}>
              <button style={{...S.secondaryBtn,padding:"13px 0"}} onClick={()=>setShowClearConfirm(false)}>Cancel</button>
              <button style={{...S.primaryBtn,background:"linear-gradient(135deg,#c0392b,#e74c3c)"}} onClick={clearAll}>Yes, Delete All</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast toast={toast}/>}
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ topCat, todayTx, totalAll, transactions, allCategories }) {
  const [selectedCats, setSelectedCats] = useState([]);

  const toggleCat = (id) => setSelectedCats(prev => prev.includes(id) ? prev.filter(c=>c!==id) : [...prev, id]);

  const filteredTx     = selectedCats.length===0 ? transactions : transactions.filter(t=>selectedCats.includes(t.category));
  const selectedExpense = filteredTx.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0);
  const selectedIncome  = filteredTx.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount),0);
  const net             = selectedIncome - selectedExpense;

  return (
    <div>
      <h3 style={S.sectionTitle}>Today's Breakdown</h3>
      {todayTx.length===0 ? (
        <div style={S.emptyState}>
          <p style={{fontSize:40}}>🌅</p>
          <p style={{color:"#888"}}>No transactions today yet</p>
          <p style={{color:"#666",fontSize:13}}>Use + Add or 🔗 UPI to log one</p>
        </div>
      ) : todayTx.map(t=><TxRow key={t.id} t={t} allCategories={allCategories}/>)}

      {topCat.length>0 && (
        <>
          <div style={S.catSectionHeader}>
            <h3 style={{...S.sectionTitle,margin:0}}>All-Time by Category</h3>
            <p style={S.catSelectHint}>{selectedCats.length===0?"Tap ✓ to filter":`${selectedCats.length} selected`}</p>
          </div>

          {/* Multi-select totals */}
          {selectedCats.length>0 && (
            <div style={S.selectionTotals}>
              <div style={S.selectionTotalItem}>
                <span style={{color:"#888",fontSize:11,marginBottom:2}}>💸 Spent</span>
                <span style={{color:"#FF6B6B",fontSize:17,fontWeight:800}}>{formatCurrency(selectedExpense)}</span>
              </div>
              <div style={S.selectionDivider}/>
              <div style={S.selectionTotalItem}>
                <span style={{color:"#888",fontSize:11,marginBottom:2}}>💰 Received</span>
                <span style={{color:"#4ECDC4",fontSize:17,fontWeight:800}}>{formatCurrency(selectedIncome)}</span>
              </div>
              <div style={S.selectionDivider}/>
              <div style={S.selectionTotalItem}>
                <span style={{color:"#888",fontSize:11,marginBottom:2}}>⚖️ Net</span>
                <span style={{color:net>=0?"#4ECDC4":"#FF6B6B",fontSize:17,fontWeight:800}}>{net>=0?"+ ":"- "}{formatCurrency(Math.abs(net))}</span>
              </div>
            </div>
          )}

          {topCat.map(([catId,amount])=>{
            const cat     = allCategories.find(c=>c.id===catId);
            const pct     = totalAll>0?(amount/totalAll)*100:0;
            const checked = selectedCats.includes(catId);
            return (
              <div key={catId} style={{...S.catRow,...(checked?{background:"#1a2035",borderRadius:12,padding:"8px 10px",marginBottom:10}:{})}}>
                <button style={{...S.checkBtn,...(checked?S.checkBtnOn:{})}} onClick={()=>toggleCat(catId)}>
                  {checked?"✓":""}
                </button>
                <span style={{fontSize:20,marginRight:10}}>{cat?.icon}</span>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{color:"#eee",fontSize:14}}>{cat?.label}</span>
                    <span style={{color:"#fff",fontSize:14,fontWeight:600}}>{formatCurrency(amount)}</span>
                  </div>
                  <div style={S.progressBg}>
                    <div style={{...S.progressFill,width:`${pct}%`,background:cat?.color}}/>
                  </div>
                </div>
              </div>
            );
          })}

          {selectedCats.length>0 && (
            <button style={S.clearSelBtn} onClick={()=>setSelectedCats([])}>✕ Clear selection</button>
          )}
        </>
      )}
    </div>
  );
}

// ── TRANSACTIONS ───────────────────────────────────────────────────────────────
function Transactions({ transactions, deleteTransaction, allCategories }) {
  return (
    <div>
      <h3 style={S.sectionTitle}>All Transactions</h3>
      {transactions.length===0 ? (
        <div style={S.emptyState}>
          <p style={{fontSize:40}}>📭</p>
          <p style={{color:"#888"}}>No transactions yet</p>
        </div>
      ) : transactions.map(t=><TxRow key={t.id} t={t} onDelete={()=>deleteTransaction(t.id)} allCategories={allCategories}/>)}
    </div>
  );
}

function TxRow({ t, onDelete, allCategories }) {
  const cats = allCategories || CATEGORIES;
  const cat = cats.find(c=>c.id===t.category);
  return (
    <div style={S.txRow}>
      <div style={{...S.txIcon,background:(cat?.color||"#888")+"33"}}>{cat?.icon||"📌"}</div>
      <div style={{flex:1}}>
        <p style={S.txLabel}>{t.note||cat?.label||"Transaction"}</p>
        <p style={S.txMeta}>{t.date} · {t.time}</p>
      </div>
      <div style={{textAlign:"right"}}>
        <p style={{...S.txAmount,color:t.type==="income"?"#4ECDC4":"#FF6B6B"}}>
          {t.type==="income"?"+":"-"}{formatCurrency(t.amount)}
        </p>
        {onDelete && <button style={S.deleteBtn} onClick={onDelete}>✕</button>}
      </div>
    </div>
  );
}

// ── INVEST ─────────────────────────────────────────────────────────────────────
function InvestTab() {
  return (
    <div>
      <h3 style={S.sectionTitle}>💡 Grow Your Money Safely</h3>
      <p style={{color:"#888",fontSize:13,marginBottom:16}}>Smart, low-risk strategies for Indian investors</p>
      {INVESTMENT_TIPS.map((tip,i)=>(
        <div key={i} style={S.investCard}>
          <span style={{fontSize:28}}>{tip.icon}</span>
          <div style={{marginLeft:12}}>
            <p style={S.investTitle}>{tip.title}</p>
            <p style={S.investDesc}>{tip.desc}</p>
          </div>
        </div>
      ))}
      <div style={S.disclaimer}>⚠️ General financial education only — not personalised investment advice. Consult a SEBI-registered advisor before investing.</div>
    </div>
  );
}

// ── MODAL ──────────────────────────────────────────────────────────────────────
function Modal({ onClose, title, children }) {
  return (
    <div style={S.modalOverlay}>
      <div style={S.modal}>
        <div style={S.modalHeader}>
          <p style={S.modalTitle}>{title}</p>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Toast({ toast }) {
  return <div style={{...S.toast,background:toast.type==="error"?"#FF6B6B":"#4ECDC4"}}>{toast.msg}</div>;
}

// ── STYLES ─────────────────────────────────────────────────────────────────────
const S = {
  signinBg:      { minHeight:"100vh", background:"linear-gradient(135deg,#0a0a14 0%,#13132a 50%,#0a0a14 100%)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Segoe UI',sans-serif", position:"relative", overflow:"hidden" },
  blob1:         { position:"fixed", top:-80, left:-80, width:260, height:260, borderRadius:"50%", background:"radial-gradient(circle,rgba(91,79,232,.18) 0%,transparent 70%)", pointerEvents:"none" },
  blob2:         { position:"fixed", bottom:-60, right:-60, width:220, height:220, borderRadius:"50%", background:"radial-gradient(circle,rgba(139,92,246,.15) 0%,transparent 70%)", pointerEvents:"none" },
  signinCard:    { background:"rgba(28,28,48,.97)", borderRadius:24, padding:"28px 28px 20px", width:360, boxShadow:"0 24px 80px rgba(0,0,0,.6)", border:"1px solid rgba(91,79,232,.15)", maxHeight:"95vh", overflowY:"auto", zIndex:1, position:"relative" },
  logoArea:      { textAlign:"center", marginBottom:22 },
  logoCircle:    { width:60, height:60, borderRadius:"50%", background:"linear-gradient(135deg,#5B4FE8,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 12px" },
  logoText:      { color:"#fff", fontSize:26, fontWeight:800, margin:"0 0 4px", letterSpacing:-1 },
  logoSub:       { color:"#666", fontSize:13, margin:0 },
  authTabRow:    { display:"flex", gap:4, marginBottom:18, background:"#0d0d1e", borderRadius:12, padding:4 },
  authTab:       { flex:1, background:"transparent", border:"none", color:"#666", padding:"9px 0", borderRadius:10, cursor:"pointer", fontSize:14 },
  authTabActive: { background:"linear-gradient(135deg,#5B4FE8,#8B5CF6)", color:"#fff", fontWeight:700 },
  formHeading:   { color:"#fff", fontWeight:700, fontSize:16, margin:"0 0 16px" },
  inputLabel:    { display:"block", color:"#888", fontSize:12, fontWeight:600, marginBottom:6, textTransform:"uppercase", letterSpacing:.8 },
  optionalTag:   { color:"#444", fontWeight:400, textTransform:"none", fontSize:11 },
  input:         { width:"100%", background:"#0d0d1e", border:"1px solid #252545", borderRadius:10, color:"#fff", padding:"11px 14px", fontSize:14, marginBottom:14, boxSizing:"border-box", outline:"none" },
  primaryBtn:    { width:"100%", background:"linear-gradient(135deg,#5B4FE8,#8B5CF6)", border:"none", color:"#fff", padding:14, borderRadius:12, fontSize:15, fontWeight:700, cursor:"pointer" },
  upiChipRow:    { display:"flex", flexWrap:"wrap", gap:6, marginBottom:4 },
  upiChip:       { background:"#0d0d1e", border:"1px solid #252545", borderRadius:20, color:"#888", padding:"6px 12px", fontSize:12, cursor:"pointer" },
  upiChipActive: { background:"#252545", border:"1px solid #5B4FE8", color:"#a89cf6" },
  featureList:   { background:"#0d0d1e", borderRadius:12, padding:"12px 14px", marginTop:14, marginBottom:12 },
  featureItem:   { color:"#777", fontSize:12, margin:"4px 0", lineHeight:1.5 },
  switchText:    { textAlign:"center", color:"#555", fontSize:13, marginTop:12 },
  switchLink:    { color:"#8B5CF6", cursor:"pointer", fontWeight:600 },
  demoNote:      { textAlign:"center", color:"#444", fontSize:11, marginTop:10 },

  appBg:      { minHeight:"100vh", background:"#0d0d16", fontFamily:"'Segoe UI',sans-serif", maxWidth:420, margin:"0 auto", paddingBottom:100 },
  header:     { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 20px 0" },
  greeting:   { color:"#fff", fontWeight:700, fontSize:18, margin:0 },
  headerDate: { color:"#666", fontSize:12, margin:"4px 0 0" },
  avatar:     { width:42, height:42, borderRadius:"50%", background:"linear-gradient(135deg,#5B4FE8,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:18, cursor:"pointer", userSelect:"none", boxShadow:"0 4px 14px rgba(91,79,232,.4)" },

  profileBackdrop: { position:"fixed", inset:0, zIndex:99 },
  profileDropdown: { position:"absolute", top:50, right:0, background:"#1a1a30", border:"1px solid #2a2a45", borderRadius:16, paddingTop:6, paddingBottom:6, minWidth:230, boxShadow:"0 16px 48px rgba(0,0,0,.7)", zIndex:100 },
  profileTop:      { display:"flex", alignItems:"center", padding:"12px 16px 10px" },
  profileAvatarLg: { width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#5B4FE8,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:16, flexShrink:0 },
  profileName:     { color:"#fff", fontWeight:700, fontSize:14, margin:"0 0 2px" },
  profileEmail:    { color:"#666", fontSize:12, margin:0 },
  dropDivider:     { height:1, background:"#252545", margin:"4px 0" },
  dropItem:        { display:"flex", alignItems:"center", width:"100%", background:"none", border:"none", color:"#ccc", padding:"11px 16px", cursor:"pointer", fontSize:14, textAlign:"left", gap:10, boxSizing:"border-box" },
  dropIcon:        { fontSize:16, width:22, flexShrink:0 },
  dropLabel:       { flex:1 },
  dropArrow:       { color:"#444", fontSize:18 },
  dropLogout:      { color:"#FF6B6B" },

  summaryCard:   { margin:"16px 20px", background:"linear-gradient(135deg,#1a1a35,#252540)", borderRadius:18, padding:20, border:"1px solid #2a2a45" },
  summaryRow:    { display:"flex", justifyContent:"space-between", marginBottom:12 },
  summaryLabel:  { color:"#888", fontSize:12, margin:"0 0 4px" },
  summaryAmount: { color:"#fff", fontSize:24, fontWeight:800, margin:0 },
  insightText:   { color:"#aaa", fontSize:13, margin:0, lineHeight:1.5 },

  tabNav:       { display:"flex", margin:"0 20px 8px", background:"#1a1a2e", borderRadius:12, padding:4, gap:4 },
  navBtn:       { flex:1, background:"transparent", border:"none", color:"#666", padding:"8px 4px", borderRadius:10, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, fontSize:18 },
  navBtnActive: { background:"#252545", color:"#5B4FE8" },
  content:      { padding:"0 20px 20px" },
  sectionTitle: { color:"#fff", fontWeight:700, fontSize:16, margin:"0 0 12px" },
  emptyState:   { textAlign:"center", padding:"40px 20px", color:"#666" },

  txRow:     { display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:"1px solid #1a1a2e" },
  txIcon:    { width:40, height:40, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 },
  txLabel:   { color:"#eee", fontSize:14, margin:0, fontWeight:500 },
  txMeta:    { color:"#555", fontSize:11, margin:"2px 0 0" },
  txAmount:  { fontSize:15, fontWeight:700, margin:0 },
  deleteBtn: { background:"none", border:"none", color:"#444", cursor:"pointer", fontSize:11, padding:"2px 4px" },

  catSectionHeader: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, marginTop:24 },
  catSelectHint:    { color:"#555", fontSize:12, margin:0 },
  catRow:           { display:"flex", alignItems:"center", marginBottom:12, transition:"all .15s" },
  progressBg:       { height:4, background:"#1a1a2e", borderRadius:4, marginTop:4, overflow:"hidden" },
  progressFill:     { height:"100%", borderRadius:4 },

  checkBtn:    { width:24, height:24, borderRadius:6, border:"1.5px solid #333", background:"#0d0d1e", color:"transparent", fontSize:13, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, marginRight:8, transition:"all .15s" },
  checkBtnOn:  { background:"#5B4FE8", border:"1.5px solid #5B4FE8", color:"#fff" },

  selectionTotals:    { display:"flex", background:"linear-gradient(135deg,#1a1a35,#1e1e40)", borderRadius:14, padding:"14px 8px", marginBottom:16, border:"1px solid #2a2a45" },
  selectionTotalItem: { flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 },
  selectionDivider:   { width:1, background:"#252545", margin:"0 6px" },
  clearSelBtn:        { background:"none", border:"none", color:"#555", fontSize:13, cursor:"pointer", marginTop:4, display:"block", width:"100%", textAlign:"center", padding:"6px 0" },

  investCard:  { display:"flex", alignItems:"flex-start", background:"#1a1a2e", borderRadius:14, padding:16, marginBottom:10 },
  investTitle: { color:"#fff", fontWeight:600, fontSize:14, margin:"0 0 4px" },
  investDesc:  { color:"#888", fontSize:13, margin:0, lineHeight:1.5 },
  disclaimer:  { background:"#1a1515", border:"1px solid #3a1515", borderRadius:12, padding:14, color:"#aa8888", fontSize:12, lineHeight:1.6, marginTop:12 },

  fabArea:      { position:"fixed", bottom:24, right:20, display:"flex", gap:10, alignItems:"center" },
  fab:          { background:"linear-gradient(135deg,#5B4FE8,#8B5CF6)", color:"#fff", border:"none", borderRadius:50, width:56, height:56, fontSize:20, cursor:"pointer", boxShadow:"0 8px 24px rgba(91,79,232,.4)", fontWeight:700 },
  fabSecondary: { background:"#1e1e35", color:"#aaa", border:"1px solid #2a2a45", borderRadius:20, padding:"10px 16px", fontSize:13, cursor:"pointer" },

  popupOverlay: { position:"fixed", inset:0, background:"rgba(0,0,0,.7)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:100 },
  popup:        { background:"#1e1e30", borderRadius:"20px 20px 0 0", padding:24, width:"100%", maxWidth:420 },
  popupTitle:   { color:"#aaa", fontSize:13, margin:"0 0 4px", fontWeight:600, textTransform:"uppercase", letterSpacing:1 },
  popupAmount:  { color:"#FF6B6B", fontSize:32, fontWeight:800, margin:"0 0 4px" },
  popupNote:    { color:"#666", fontSize:13, margin:"0 0 16px" },
  popupQ:       { color:"#eee", fontSize:14, fontWeight:600, margin:"0 0 12px" },
  catGrid:      { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 },
  catBtn:       { background:"#12121e", border:"1px solid #2a2a45", borderRadius:12, padding:"10px 4px", display:"flex", flexDirection:"column", alignItems:"center", cursor:"pointer", color:"#aaa" },

  modalOverlay: { position:"fixed", inset:0, background:"rgba(0,0,0,.7)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:100 },
  modal:        { background:"#1e1e30", borderRadius:"20px 20px 0 0", padding:24, width:"100%", maxWidth:420, maxHeight:"85vh", overflowY:"auto" },
  modalHeader:  { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 },
  modalTitle:   { color:"#fff", fontWeight:700, fontSize:16, margin:0 },
  modalDesc:    { color:"#888", fontSize:13, marginBottom:14 },
  closeBtn:     { background:"none", border:"none", color:"#666", cursor:"pointer", fontSize:18 },
  typeToggle:   { display:"flex", gap:8, marginBottom:14 },
  typeBtn:      { flex:1, background:"#12121e", border:"1px solid #2a2a45", borderRadius:10, color:"#888", padding:10, cursor:"pointer", fontSize:14 },
  typeBtnActive:{ background:"#252545", border:"1px solid #5B4FE8", color:"#fff" },
  secondaryBtn: { flex:1, background:"#12121e", border:"1px solid #2a2a45", borderRadius:12, color:"#888", padding:12, cursor:"pointer", fontSize:14 },

  settingsSection:      { marginBottom:20 },
  settingsSectionTitle: { color:"#555", fontSize:11, fontWeight:700, letterSpacing:1.2, margin:"0 0 10px" },
  settingsRow:          { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid #1a1a2e" },
  settingsLabel:        { color:"#ccc", fontSize:14, margin:"0 0 2px" },
  settingsSubLabel:     { color:"#666", fontSize:12, margin:0 },
  toggle:      { width:44, height:24, borderRadius:12, background:"#252545", position:"relative", cursor:"pointer" },
  toggleOn:    { background:"#5B4FE8" },
  toggleThumb: { position:"absolute", top:3, left:3, width:18, height:18, borderRadius:"50%", background:"#666", transition:"all .2s" },
  toggleThumbOn:{ left:23, background:"#fff" },
  dangerBtn:   { width:"100%", background:"#1a1015", border:"1px solid #3a1515", color:"#FF6B6B", borderRadius:12, padding:12, fontSize:14, cursor:"pointer" },

  confirmOverlay: { position:"fixed", inset:0, background:"rgba(0,0,0,.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:24, boxSizing:"border-box" },
  confirmBox:     { background:"#1e1e30", borderRadius:20, padding:28, width:"100%", maxWidth:300, textAlign:"center", border:"1px solid #3a1515", boxShadow:"0 20px 60px rgba(0,0,0,.7)" },
  confirmTitle:   { color:"#fff", fontWeight:800, fontSize:18, margin:"0 0 8px" },
  confirmDesc:    { color:"#888", fontSize:13, lineHeight:1.6, margin:0 },

  toast: { position:"fixed", bottom:100, left:"50%", transform:"translateX(-50%)", color:"#000", fontWeight:700, padding:"12px 24px", borderRadius:12, fontSize:14, zIndex:300, boxShadow:"0 8px 24px rgba(0,0,0,.3)", whiteSpace:"nowrap" },
};
