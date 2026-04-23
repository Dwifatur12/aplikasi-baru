import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Video, Users, Calendar, Clock, Phone, FileText, 
  CheckCircle2, AlertCircle, X, Search, Filter, LogIn, LogOut,
  Moon, Sun, ChevronRight, Activity, MessageSquare, Trash2,
  Check, PhoneCall, Info, UserCheck, Loader2, Download, Database,
  Upload, Printer, FileDown, Settings
} from 'lucide-react';

// ==========================================
// KONFIGURASI DATABASE & FIREBASE
// ==========================================
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
  apiKey: "mock-key", authDomain: "mock.firebaseapp.com", projectId: "mock-id"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'sitaba-kalabahi-v1';

// ==========================================
// FUNGSI HELPER GLOBAL
// ==========================================
const formatDateIndo = (date) => {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Makassar', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }).format(new Date(date));
};

const formatPhoneWA = (phone) => {
  let cleaned = ('' + phone).replace(/\D/g, '');
  if (cleaned.startsWith('0')) cleaned = '62' + cleaned.substring(1);
  return cleaned;
};

const formatLiveTime = (date) => {
  const optionsDate = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const optionsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
  return `${new Intl.DateTimeFormat('id-ID', optionsDate).format(date)} - ${new Intl.DateTimeFormat('id-ID', optionsTime).format(date)} WITA`;
};

// ==========================================
// KOMPONEN UTAMA
// ==========================================
export default function App() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('darkMode') !== 'false');
  const [toast, setToast] = useState(null);
  
  // State Navigasi
  const [currentView, setCurrentView] = useState('public'); // public, admin-login, admin-dashboard
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('sitabaAdmin');
    return saved ? JSON.parse(saved) : null;
  });

  const [dataKunjungan, setDataKunjungan] = useState([]);
  const [masterWbp, setMasterWbp] = useState([]); 
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [credForm, setCredForm] = useState({ username: '', password: '' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('darkMode', isDarkMode);
  }, [isDarkMode]);

  // Efek Jam Live
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Manajemen Akses Admin
  const getAdminCreds = () => {
    const creds = localStorage.getItem('sapaAdminCreds');
    return creds ? JSON.parse(creds) : { username: 'kalabahi', password: 'pastiwbk' };
  };

  const handleSaveCreds = (e) => {
    e.preventDefault();
    localStorage.setItem('sapaAdminCreds', JSON.stringify(credForm));
    setShowSettings(false);
    showToast("Username dan Password berhasil diubah!");
  };

  const openSettings = () => {
    setCredForm(getAdminCreds());
    setShowSettings(true);
  };

  // Auth Initialization
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) { console.error("Auth failed", e); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => { 
      setFirebaseUser(user); 
      setIsAuthReady(true); 
    });
    return () => unsubscribe();
  }, []);

  // Fetch Data
  useEffect(() => {
    if (!firebaseUser) return;
    const unsubKunjungan = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'kunjungan'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.timestamp - a.timestamp);
      setDataKunjungan(data);
    });
    
    const unsubWbp = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'wbp'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMasterWbp(data);
    });
    
    return () => { unsubKunjungan(); unsubWbp(); };
  }, [firebaseUser]);

  if (!isAuthReady) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Video size={60} className="text-emerald-500 animate-pulse" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b1120] text-slate-950 dark:text-slate-100 transition-colors duration-500 font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;400;600;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        
        .glass-card { 
          background: rgba(255, 255, 255, 0.65); 
          backdrop-filter: blur(24px); 
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.8); 
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.02) inset; 
        }
        .dark .glass-card { 
          background: rgba(15, 23, 42, 0.5); 
          border: 1px solid rgba(255, 255, 255, 0.08); 
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.02) inset; 
        }
        
        .btn-3d { 
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
          box-shadow: 0 6px 0 rgba(16, 185, 129, 0.6), 0 15px 20px rgba(16, 185, 129, 0.3); 
        }
        .btn-3d:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 0 rgba(16, 185, 129, 0.6), 0 20px 25px rgba(16, 185, 129, 0.4);
        }
        .btn-3d:active { 
          transform: translateY(4px); 
          box-shadow: 0 2px 0 rgba(16, 185, 129, 0.6), 0 5px 10px rgba(16, 185, 129, 0.2); 
        }
        
        .btn-3d-blue { 
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
          box-shadow: 0 6px 0 rgba(37, 99, 235, 0.6), 0 15px 20px rgba(37, 99, 235, 0.3); 
        }
        .btn-3d-blue:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 0 rgba(37, 99, 235, 0.6), 0 20px 25px rgba(37, 99, 235, 0.4);
        }
        .btn-3d-blue:active { 
          transform: translateY(4px); 
          box-shadow: 0 2px 0 rgba(37, 99, 235, 0.6), 0 5px 10px rgba(37, 99, 235, 0.2); 
        }

        .premium-input {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        }
        .dark .premium-input {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(51, 65, 85, 0.5);
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
        }
        .premium-input:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15), inset 0 2px 4px rgba(0,0,0,0.02);
          background: #ffffff;
        }
        .dark .premium-input:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15), inset 0 2px 4px rgba(0,0,0,0.2);
          background: #0f172a;
        }

        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark ::-webkit-scrollbar-thumb { background: #334155; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .dark ::-webkit-scrollbar-thumb:hover { background: #475569; }

        input[type="date"]::-webkit-calendar-picker-indicator, input[type="time"]::-webkit-calendar-picker-indicator { cursor: pointer; filter: brightness(0); opacity: 0.5; transition: all 0.3s; }
        .dark input[type="date"]::-webkit-calendar-picker-indicator, .dark input[type="time"]::-webkit-calendar-picker-indicator { filter: brightness(0) invert(1); opacity: 0.8; }
        input[type="date"]::-webkit-calendar-picker-indicator:hover, input[type="time"]::-webkit-calendar-picker-indicator:hover { opacity: 1; transform: scale(1.1); }
      `}</style>

      {/* DYNAMIC BACKGROUND BLOBS */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-emerald-400/20 dark:bg-emerald-600/10 rounded-full blur-[100px] -z-10 animate-pulse pointer-events-none mix-blend-multiply dark:mix-blend-lighten" style={{animationDuration: '8s'}}></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[120px] -z-10 animate-pulse pointer-events-none mix-blend-multiply dark:mix-blend-lighten" style={{animationDuration: '10s'}}></div>
      <div className="fixed top-[40%] left-[60%] w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-[80px] -z-10 animate-pulse pointer-events-none mix-blend-multiply dark:mix-blend-lighten" style={{animationDuration: '12s'}}></div>

      {/* GLOBAL TOAST */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[300] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-10 fade-in duration-300 backdrop-blur-md border ${toast.type === 'error' ? 'bg-rose-600/90 border-rose-500 text-white' : 'bg-emerald-600/90 border-emerald-500 text-white'}`}>
          {toast.type === 'error' ? <AlertCircle size={22}/> : <CheckCircle2 size={22}/>}
          <span className="text-xs font-bold uppercase tracking-widest text-white">{toast.message}</span>
        </div>
      )}

      {/* HEADER GLOBAL */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center pointer-events-none transition-all">
        <div className="glass-card px-5 py-3 rounded-2xl pointer-events-auto flex items-center gap-3 shadow-lg hover:shadow-xl transition-shadow">
          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl">
            <Video className="text-emerald-600 dark:text-emerald-400" size={20} />
          </div>
          <span className="font-black tracking-tighter text-[15px] bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400">SAPA KALABAHI</span>
        </div>
        <div className="flex gap-3 pointer-events-auto items-center">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 glass-card rounded-full text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 mr-2 shadow-sm">
            <Clock size={14} className="text-blue-500" />
            {formatLiveTime(currentTime)}
          </div>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-3.5 glass-card rounded-2xl hover:scale-105 hover:shadow-lg transition-all text-slate-600 dark:text-slate-300 border border-transparent hover:border-slate-300 dark:hover:border-slate-700">
            {isDarkMode ? <Sun size={18} className="text-amber-400"/> : <Moon size={18} className="text-indigo-600"/>}
          </button>
          {currentView === 'public' && !adminUser && (
            <button onClick={() => setCurrentView('admin-login')} className="p-3.5 glass-card rounded-2xl hover:scale-105 hover:shadow-lg transition-all text-blue-600 dark:text-blue-400 border border-transparent hover:border-blue-200 dark:hover:border-blue-900/50" title="Login Petugas">
              <Shield size={18} />
            </button>
          )}
          {adminUser && currentView !== 'public' && (
            <>
              <button onClick={openSettings} className="p-3.5 glass-card rounded-2xl hover:scale-105 hover:shadow-lg transition-all text-slate-600 dark:text-slate-300 border border-transparent hover:border-slate-300 dark:hover:border-slate-700" title="Ubah Akun Petugas">
                <Settings size={18} />
              </button>
              <button onClick={() => { localStorage.removeItem('sitabaAdmin'); setAdminUser(null); setCurrentView('public'); showToast("Berhasil Keluar"); }} className="p-3.5 bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-900/20 dark:border-rose-900/50 dark:text-rose-400 rounded-2xl hover:scale-105 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all shadow-sm" title="Keluar dari Dashboard">
                <LogOut size={18} />
              </button>
            </>
          )}
        </div>
      </header>

      <div className="pt-24 pb-12 px-6 min-h-screen relative z-10">
        {/* ROUTING SEDERHANA */}
        {currentView === 'public' && <PublicPortal db={db} appId={appId} showToast={showToast} firebaseUser={firebaseUser} dataKunjungan={dataKunjungan} masterWbp={masterWbp} />}
        {currentView === 'admin-login' && <AdminLogin onLogin={(u) => { setAdminUser(u); localStorage.setItem('sitabaAdmin', JSON.stringify(u)); setCurrentView('admin-dashboard'); showToast("Login Berhasil"); }} onBack={() => setCurrentView('public')} showToast={showToast} getAdminCreds={getAdminCreds} />}
        {currentView === 'admin-dashboard' && <AdminDashboard dataKunjungan={dataKunjungan} db={db} appId={appId} showToast={showToast} masterWbp={masterWbp} />}

        {/* MODAL UBAH AKUN PETUGAS */}
        {showSettings && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="glass-card p-8 rounded-3xl w-full max-w-sm shadow-2xl relative border border-white/20 dark:border-slate-700/50">
              <button onClick={() => setShowSettings(false)} className="absolute top-6 right-6 p-2 text-slate-500 hover:text-rose-500 transition-colors"><X size={16}/></button>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                <Settings size={24} className="text-blue-600 dark:text-blue-400"/>
              </div>
              <h3 className="text-lg font-black mb-1 text-slate-900 dark:text-white">Pengaturan Akun</h3>
              <p className="text-[10px] font-bold text-slate-500 mb-6 uppercase tracking-widest">Ubah Akses Login Petugas</p>
              
              <form onSubmit={handleSaveCreds} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Username Baru</label>
                  <input type="text" value={credForm.username} onChange={e=>setCredForm({...credForm, username: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:border-blue-500 transition-colors" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Password Baru</label>
                  <input type="text" value={credForm.password} onChange={e=>setCredForm({...credForm, password: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:border-blue-500 transition-colors" required />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowSettings(false)} className="flex-1 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">Batal</button>
                  <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20">Simpan</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// VIEW: PORTAL PUBLIK (FORM PENDAFTARAN)
// ==========================================
function PublicPortal({ db, appId, showToast, firebaseUser, dataKunjungan, masterWbp }) {
  const [formData, setFormData] = useState({
    namaPengunjung: '', nik: '', noWa: '', alamat: '', namaWbp: '', hubungan: '', tanggal: '', sesi: ''
  });
  const [ktpFile, setKtpFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const [showCekStatus, setShowCekStatus] = useState(false);
  const [cekId, setCekId] = useState('');
  const [cekResult, setCekResult] = useState(null);

  const handleCekStatus = () => {
    if (!cekId) return;
    const found = dataKunjungan.find(d => d.id.slice(-6).toUpperCase() === cekId.toUpperCase());
    if (found) setCekResult(found);
    else showToast("Kode Antrean tidak ditemukan", "error");
  };

  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    if (selectedDate.getDay() === 0) {
      showToast("Hari Minggu libur pelayanan. Silakan pilih hari lain.", "error");
      setFormData({...formData, tanggal: '', sesi: ''});
    } else {
      setFormData({...formData, tanggal: e.target.value, sesi: ''});
    }
  };

  const getSesiOptions = (tanggalStr) => {
    if (!tanggalStr) return [];
    const date = new Date(tanggalStr);
    const day = date.getDay();
    if (day === 0) return []; 
    
    let options = [];
    if (day >= 1 && day <= 4) { 
      options = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
    } else if (day === 5) { 
      options = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30'];
    } else if (day === 6) { 
      options = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
    }
    return options;
  };

  const availableSesi = getSesiOptions(formData.tanggal);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 800000) return showToast("Ukuran foto maksimal 800KB", "error");
      const reader = new FileReader();
      reader.onloadend = () => setKtpFile(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firebaseUser) return showToast("Sistem belum siap, tunggu sebentar.", "error");
    if (!ktpFile) return showToast("Harap lampirkan foto KTP/Identitas", "error");
    
    if (formData.nik.length !== 16) return showToast("NIK wajib 16 digit angka", "error");
    if (!formData.sesi) return showToast("Silakan pilih jam sesi", "error");

    const kuotaTerpakai = dataKunjungan.filter(d => d.tanggal === formData.tanggal && d.sesi === formData.sesi && d.status !== 'Ditolak').length;
    if (kuotaTerpakai >= 10) {
      return showToast(`Mohon maaf, Kuota Sesi ${formData.sesi} di tanggal ini sudah penuh (Maks 10 pendaftar). Silakan pilih sesi atau tanggal lain.`, "error");
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        ktpBase64: ktpFile,
        status: 'Menunggu',
        timestamp: Date.now(),
        tanggalFormat: formatDateIndo(formData.tanggal)
      };
      
      const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'kunjungan'), payload);
      setSuccessData({ id: docRef.id.slice(-6).toUpperCase(), ...payload });
      showToast("Pendaftaran Berhasil Dikirim!");
      
      setFormData({ namaPengunjung: '', nik: '', noWa: '', alamat: '', namaWbp: '', hubungan: '', tanggal: '', sesi: '' });
      setKtpFile(null);
    } catch (err) {
      showToast("Gagal mengirim pendaftaran. Coba lagi.", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="max-w-md mx-auto mt-10 animate-in zoom-in duration-500">
        <div className="glass-card p-10 rounded-[3rem] text-center shadow-2xl border-emerald-500/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
          <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-emerald-100 dark:ring-emerald-900/50">
            <CheckCircle2 size={48} className="text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black mb-2 text-slate-900 dark:text-white tracking-tight">Berhasil!</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-8 leading-relaxed">Harap simpan kode antrean ini</p>
          
          <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 p-8 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 mb-8 shadow-inner relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
            <p className="text-[10px] font-black uppercase text-slate-400 mb-2 relative z-10">Kode Antrean Anda</p>
            <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-600 to-blue-600 tracking-[0.2em] relative z-10 drop-shadow-sm">{successData.id}</p>
          </div>

          <div className="text-left space-y-4 text-xs font-bold bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-6 rounded-3xl border border-blue-100/50 dark:border-blue-900/30 text-slate-700 dark:text-slate-300 shadow-sm">
            <p className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 flex items-center gap-2"><Calendar size={14}/> Jadwal</span> 
              <span className="text-right text-slate-900 dark:text-white">{successData.tanggalFormat}</span>
            </p>
            <p className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 flex items-center gap-2"><Clock size={14}/> Sesi</span> 
              <span className="text-right text-slate-900 dark:text-white">{successData.sesi}</span>
            </p>
            <p className="flex justify-between items-center">
              <span className="text-slate-400 flex items-center gap-2"><Users size={14}/> WBP</span> 
              <span className="text-right text-slate-900 dark:text-white">{successData.namaWbp}</span>
            </p>
          </div>

          <div className="mt-8 p-5 bg-amber-50/80 dark:bg-amber-900/10 rounded-3xl border border-amber-200/50 dark:border-amber-800/30">
            <p className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-500 leading-relaxed flex items-start gap-3 text-left">
              <Info size={20} className="shrink-0 mt-0.5 text-amber-500"/>
              Petugas akan memverifikasi data Anda. Jika disetujui, kami akan menghubungi via WhatsApp Video Call pada jadwal di atas. Pastikan WA Anda aktif.
            </p>
          </div>

          <button onClick={() => setSuccessData(null)} className="w-full py-5 mt-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:scale-[1.02] hover:shadow-xl transition-all">Kembali ke Beranda</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center min-h-[80vh]">
      {/* Kolom Kiri: Info */}
      <div className="lg:col-span-5 space-y-10 animate-in slide-in-from-left duration-1000">
        <div className="flex flex-wrap items-center gap-4">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200/50 dark:border-emerald-800/30 shadow-sm">
            <div className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></div>
            Layanan Aktif 100% Online
          </div>
          <button onClick={() => { setShowCekStatus(true); setCekResult(null); setCekId(''); }} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-200/50 dark:border-blue-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md hover:-translate-y-0.5 transition-all">
            <Search size={14} /> Cek Status Pendaftaran
          </button>
        </div>
        
        <div>
          <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[1.05] text-slate-900 dark:text-white mb-6">
            SAPA <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600">KALABAHI</span>
          </h1>
          
          <p className="leading-relaxed max-w-md">
            <span className="inline-block text-[15px] font-black text-slate-800 dark:text-slate-100 bg-emerald-500/10 dark:bg-emerald-400/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 shadow-sm backdrop-blur-sm tracking-wide">
              Sistem Antrean Panggilan Antarkeluarga Lapas Kalabahi.
            </span>
            <span className="block mt-4 text-[14px] font-semibold text-slate-600 dark:text-slate-400">
              Daftar secara mandiri, tunggu verifikasi, dan kami akan menghubungi Anda via WhatsApp Video Call.
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4">
          <div className="glass-card p-6 rounded-3xl border border-white/40 dark:border-white/5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
              <Clock size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-black text-xs uppercase mb-2 tracking-wide text-slate-800 dark:text-slate-200">Jam Layanan</h3>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
              <span className="block mb-1"><b className="text-slate-700 dark:text-slate-300">Senin-Kamis & Sabtu:</b><br/>08:00 - 12:00 WITA</span>
              <span className="block mb-1"><b className="text-slate-700 dark:text-slate-300">Jumat:</b> 08:00 - 11:00 WITA</span>
              <span className="block text-rose-500">Minggu/Libur: Tutup</span>
            </p>
          </div>
          <div className="glass-card p-6 rounded-3xl border border-white/40 dark:border-white/5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
              <PhoneCall size={24} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-black text-xs uppercase mb-2 tracking-wide text-slate-800 dark:text-slate-200">Syarat Panggilan</h3>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">Pastikan nomor yang didaftarkan terhubung dengan WhatsApp aktif dan memiliki koneksi internet/kuota yang stabil saat jadwal tiba.</p>
          </div>
        </div>
      </div>

      {/* Kolom Kanan: Form */}
      <div className="lg:col-span-7 animate-in slide-in-from-right duration-1000 delay-150 relative">
        <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500/20 to-blue-600/20 rounded-[3.5rem] blur-xl opacity-50 dark:opacity-30"></div>
        <div className="glass-card p-8 md:p-12 rounded-[3rem] shadow-2xl relative border border-white/40 dark:border-slate-700/50 bg-white/70 dark:bg-slate-900/60">
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black flex items-center gap-3 text-slate-900 dark:text-white"><UserCheck className="text-emerald-500" size={28}/> Form Registrasi</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-2">Isi formulir dengan data KTP asli</p>
            </div>
            <div className="hidden sm:flex w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center text-slate-400">
              <FileText size={20}/>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-0 relative">
            
            {/* --- BAGIAN 1: DATA DIRI PENGUNJUNG --- */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-xs font-black">1</span>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                  Data Diri Pengunjung
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 ml-1">🧑 Nama Lengkap</label>
                  <input type="text" value={formData.namaPengunjung} onChange={e=>setFormData({...formData, namaPengunjung: e.target.value.toUpperCase()})} placeholder="Sesuai KTP" className="w-full px-5 py-4 premium-input rounded-2xl text-xs font-bold uppercase outline-none transition-all" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 ml-1">💳 Nomor NIK</label>
                  <input type="number" value={formData.nik} onChange={e=>{const val = e.target.value.slice(0,16); setFormData({...formData, nik: val})}} placeholder="16 Digit NIK KTP..." className="w-full px-5 py-4 premium-input rounded-2xl text-xs font-bold outline-none transition-all" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 ml-1">📱 Nomor WhatsApp</label>
                  <input type="number" value={formData.noWa} onChange={e=>setFormData({...formData, noWa: e.target.value})} placeholder="08..." className="w-full px-5 py-4 premium-input rounded-2xl text-xs font-bold outline-none transition-all" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 ml-1">🤝 Hubungan dgn WBP</label>
                  <select value={formData.hubungan} onChange={e=>setFormData({...formData, hubungan: e.target.value})} className="w-full px-5 py-4 premium-input rounded-2xl text-xs font-bold uppercase outline-none appearance-none cursor-pointer transition-all" required>
                    <option value="">-- Pilih Hubungan --</option>
                    <option value="Orang Tua">Orang Tua</option>
                    <option value="Suami / Istri">Suami / Istri</option>
                    <option value="Anak">Anak</option>
                    <option value="Saudara Kandung">Saudara Kandung</option>
                    <option value="Lainnya">Keluarga Lainnya / Kuasa Hukum</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 ml-1">📍 Alamat Domisili</label>
                <input type="text" value={formData.alamat} onChange={e=>setFormData({...formData, alamat: e.target.value})} placeholder="Ketik RT/RW, Desa, Kecamatan..." className="w-full px-5 py-4 premium-input rounded-2xl text-xs font-bold outline-none transition-all" required />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 ml-1">🪪 Upload KTP/Identitas</label>
                <div className="relative group">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="ktp-upload" required />
                  <label htmlFor="ktp-upload" className={`w-full flex flex-col items-center justify-center gap-3 px-5 py-8 border-2 border-dashed rounded-3xl text-xs font-bold cursor-pointer transition-all ${ktpFile ? 'border-emerald-500 text-emerald-600 bg-emerald-50/80 dark:bg-emerald-900/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-slate-300 dark:border-slate-700 text-slate-500 bg-white/50 dark:bg-slate-900/30 group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:border-slate-400'}`}>
                    <div className={`p-3 rounded-full ${ktpFile ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      {ktpFile ? <CheckCircle2 size={24} className="text-emerald-500" /> : <Upload size={24} className="text-slate-400" />}
                    </div>
                    <span>{ktpFile ? '✓ Foto KTP Siap (Klik untuk ubah)' : 'Klik untuk Ambil / Pilih File Foto KTP'}</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent my-10"></div>

            {/* --- BAGIAN 2: TUJUAN KUNJUNGAN --- */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs font-black">2</span>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-700 dark:text-blue-400">
                  Tujuan Kunjungan
                </h3>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 ml-1">👤 Nama Warga Binaan</label>
                <input list="wbp-list" value={formData.namaWbp} onChange={e=>setFormData({...formData, namaWbp: e.target.value.toUpperCase()})} placeholder="Ketik untuk mencari nama WBP..." className="w-full px-5 py-4 premium-input rounded-2xl text-xs font-bold uppercase outline-none transition-all shadow-sm" required />
                <datalist id="wbp-list">
                  {masterWbp.map(w => <option key={w.id} value={w.nama} />)}
                </datalist>
              </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent my-10"></div>

            {/* --- BAGIAN 3: JADWAL LAYANAN --- */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-xs font-black">3</span>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">
                  Jadwal Layanan
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50/50 dark:bg-slate-900/30 p-5 rounded-3xl border border-slate-100 dark:border-slate-800/50">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 ml-1">📅 Tanggal Rencana</label>
                  <input type="date" value={formData.tanggal} min={new Date().toISOString().split('T')[0]} onChange={handleDateChange} className="w-full px-5 py-4 premium-input rounded-2xl text-[11px] font-bold uppercase outline-none transition-all dark:[color-scheme:dark] cursor-pointer" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 ml-1">⏰ Pilih Sesi Jam</label>
                  <div className="relative">
                    <select value={formData.sesi} onChange={e=>setFormData({...formData, sesi: e.target.value})} disabled={!formData.tanggal || availableSesi.length === 0} className="w-full px-5 py-4 premium-input rounded-2xl text-[11px] font-bold uppercase outline-none appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                      <option value="">{formData.tanggal ? '-- Pilih Jam Sesi --' : 'Pilih Tanggal Dulu'}</option>
                      {availableSesi.map(s => <option key={s} value={`${s} WITA`}>{s} WITA</option>)}
                    </select>
                    <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" size={16}/>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] mt-10 btn-3d flex justify-center items-center gap-3">
              {loading ? <Loader2 className="animate-spin" size={20}/> : <><Check size={18}/> Kirim Form Antrean</>}
            </button>
          </form>
        </div>
      </div>

      {/* FITUR 3: MODAL CEK STATUS */}
      {showCekStatus && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass-card p-10 rounded-[3rem] w-full max-w-sm shadow-[0_0_50px_rgba(37,99,235,0.2)] relative border border-blue-500/30">
            <button onClick={() => setShowCekStatus(false)} className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-rose-500 hover:bg-rose-50 transition-colors"><X size={16}/></button>
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6">
              <Search size={32} className="text-blue-600 dark:text-blue-400"/>
            </div>
            <h3 className="text-2xl font-black mb-1 text-slate-900 dark:text-white">Cek Status</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-8">Lacak Pendaftaran Anda</p>
            
            <div className="space-y-4">
              <input type="text" placeholder="Ketik 6 Digit Kode..." value={cekId} onChange={e => setCekId(e.target.value.toUpperCase())} maxLength={6} className="w-full px-5 py-4 premium-input rounded-2xl text-center text-xl font-black tracking-[0.5em] outline-none focus:border-blue-500 transition-all placeholder:tracking-normal placeholder:text-sm placeholder:font-semibold" />
              <button onClick={handleCekStatus} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest btn-3d-blue">Cari Data</button>
            </div>

            {cekResult && (
              <div className="mt-8 p-6 rounded-3xl border bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-slate-200 dark:border-slate-700 text-left space-y-3 animate-in zoom-in duration-300 shadow-inner">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-3 border-b border-slate-200 dark:border-slate-700 pb-3">Hasil Ditemukan</p>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Pengunjung</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{cekResult.namaPengunjung}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">WBP / Jadwal</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{cekResult.namaWbp}</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{cekResult.tanggalFormat} - {cekResult.sesi}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-3 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-slate-500">Status:</span>
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${cekResult.status === 'Menunggu' ? 'bg-amber-100 text-amber-700' : cekResult.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-700' : cekResult.status === 'Ditolak' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>{cekResult.status}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// VIEW: LOGIN ADMIN LAPAS
// ==========================================
function AdminLogin({ onLogin, onBack, showToast, getAdminCreds }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const creds = getAdminCreds();
    if (username === creds.username && password === creds.password) {
      onLogin({ username: 'Petugas Layanan', role: 'admin' });
    } else {
      showToast("Username atau Password Salah!", "error");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center animate-in zoom-in duration-500">
      <div className="glass-card p-10 rounded-[3rem] w-full max-w-sm text-center border border-white/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none"><Shield size={120} /></div>
        <button onClick={onBack} className="absolute top-6 left-6 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
          <X size={16} />
        </button>

        <Shield size={50} className="text-blue-600 dark:text-blue-500 mx-auto mb-6 mt-4 drop-shadow-lg" />
        <h1 className="text-2xl font-black tracking-tighter dark:text-white leading-tight text-slate-900">Login Petugas</h1>
        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-2 mb-8">Akses Dashboard SAPA KALABAHI</p>

        <form onSubmit={handleSubmit} className="space-y-5 text-left relative z-10">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-5 py-4 bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm transition-all" placeholder="Masukkan Username..." required autoFocus />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-5 py-4 bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-blue-500 font-black text-center tracking-[0.3em] text-sm transition-all" placeholder="******" required />
          </div>
          <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest btn-3d-blue transition-colors mt-2">Masuk Dashboard</button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// VIEW: DASHBOARD ADMIN (KELOLA KUNJUNGAN)
// ==========================================
function AdminDashboard({ dataKunjungan, db, appId, showToast, masterWbp }) {
  const [adminView, setAdminView] = useState('kunjungan');
  const [activeTab, setActiveTab] = useState('Menunggu'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null); 
  const [newWbpName, setNewWbpName] = useState(''); 
  const [newWbpStatus, setNewWbpStatus] = useState('Narapidana'); 

  const [filterTime, setFilterTime] = useState('Semua');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const [selectedKunjungan, setSelectedKunjungan] = useState([]);
  const [selectedWbp, setSelectedWbp] = useState([]);
  const [searchWbp, setSearchWbp] = useState('');
  
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: null });

  useEffect(() => { setSelectedKunjungan([]); }, [activeTab, adminView]);
  useEffect(() => { setSelectedWbp([]); }, [adminView]);

  const filteredWbp = masterWbp.filter(w => w.nama.toLowerCase().includes(searchWbp.toLowerCase()) || (w.status && w.status.toLowerCase().includes(searchWbp.toLowerCase())));

  useEffect(() => {
    const loadScript = (src) => {
      if (!document.querySelector(`script[src="${src}"]`)) {
        const s = document.createElement('script');
        s.src = src;
        document.head.appendChild(s);
      }
    };
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
  }, []);

  const handleUpdateStatus = async (id, statusBaru) => {
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'kunjungan', id), { status: statusBaru });
      showToast(`Status diubah menjadi ${statusBaru}`);
    } catch (e) {
      showToast("Gagal mengubah status", "error");
    }
  };

  const handleWA = (noWa, nama, jadwal) => {
    const formattedNum = formatPhoneWA(noWa);
    const text = `Halo Bapak/Ibu ${nama},\n\nIni adalah layanan SAPA Lapas Kelas IIB Kalabahi.\nPendaftaran kunjungan virtual Anda untuk jadwal *${jadwal}* telah *DISETUJUI*.\n\nMohon bersiap, petugas akan segera menghubungi Anda melalui Video Call nomor ini.\nTerima Kasih.`;
    window.open(`https://wa.me/${formattedNum}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleDelete = (id) => {
    setConfirmDialog({
      isOpen: true,
      message: "Yakin ingin menghapus data ini permanen?",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'kunjungan', id));
          showToast("Data dihapus");
        } catch (e) { showToast("Gagal hapus", "error"); }
        setConfirmDialog({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  const handleExportExcelKunjungan = () => {
    if (!window.XLSX) return showToast("Library Excel belum siap", "error");
    const data = filteredData.map((d, i) => ({
      'No': i + 1, 'Kode': d.id.slice(-6).toUpperCase(), 'Tanggal': d.tanggalFormat,
      'Sesi': d.sesi, 'Pengunjung': d.namaPengunjung, 'NIK': d.nik, 'Alamat': d.alamat || '-',
      'No WA': d.noWa, 'WBP': d.namaWbp, 'Hubungan': d.hubungan, 'Status': d.status
    }));
    const ws = window.XLSX.utils.json_to_sheet(data);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Kunjungan");
    window.XLSX.writeFile(wb, `Laporan_Kunjungan_${activeTab}.xlsx`);
    showToast("Excel Kunjungan berhasil diunduh");
  };

  const handleExportWordKunjungan = () => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Data Kunjungan</title></head><body>";
    const footer = "</body></html>";
    let html = "<h2 style='text-align:center; font-family: Arial;'>Laporan Kunjungan Virtual</h2><table border='1' style='width:100%; border-collapse:collapse; font-family: Arial; font-size:12px;'><tr><th style='padding:5px; background:#f0f0f0;'>No</th><th style='padding:5px; background:#f0f0f0;'>Tanggal</th><th style='padding:5px; background:#f0f0f0;'>Sesi</th><th style='padding:5px; background:#f0f0f0;'>Pengunjung</th><th style='padding:5px; background:#f0f0f0;'>Alamat</th><th style='padding:5px; background:#f0f0f0;'>WBP</th><th style='padding:5px; background:#f0f0f0;'>Status</th></tr>";
    
    filteredData.forEach((d, i) => { 
      html += `<tr><td style='padding:5px; text-align:center;'>${i+1}</td><td style='padding:5px;'>${d.tanggalFormat}</td><td style='padding:5px;'>${d.sesi}</td><td style='padding:5px;'>${d.namaPengunjung}</td><td style='padding:5px;'>${d.alamat || '-'}</td><td style='padding:5px;'>${d.namaWbp}</td><td style='padding:5px;'>${d.status}</td></tr>`; 
    });
    html += "</table>";
    
    const blob = new Blob(['\ufeff', header + html + footer], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Kunjungan_${activeTab}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Word berhasil diunduh");
  };

  const handlePrintKunjungan = () => {
    const printWindow = window.open('', '_blank');
    let html = `
      <html><head><title>Laporan Kunjungan SAPA KALABAHI</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #000; background: #fff; }
        h2 { text-align: center; margin-bottom: 20px; font-size: 18px; text-transform: uppercase; }
        table { border-collapse: collapse; width: 100%; font-size: 12px; margin-top: 10px; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; text-transform: uppercase; }
        .text-center { text-align: center; }
      </style>
      </head><body>
        <h2>Laporan Kunjungan Virtual<br/>Lapas Kelas IIB Kalabahi</h2>
        <table>
          <tr><th width="5%" class="text-center">No</th><th>Tanggal & Sesi</th><th>Pengunjung</th><th>Alamat</th><th>WBP</th><th>Status</th></tr>
    `;
    filteredData.forEach((d, i) => { 
      html += `<tr><td class="text-center">${i+1}</td><td>${d.tanggalFormat}<br/>${d.sesi}</td><td>${d.namaPengunjung}<br/>NIK: ${d.nik}</td><td>${d.alamat || '-'}</td><td>${d.namaWbp}<br/>Hub: ${d.hubungan}</td><td>${d.status}</td></tr>`; 
    });
    html += `
        </table>
      <script>
        window.onload = () => { window.print(); };
      </script>
      </body></html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleAddWbp = async (e) => {
    e.preventDefault();
    if (!newWbpName) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'wbp'), { 
        nama: newWbpName.toUpperCase(),
        status: newWbpStatus
      });
      setNewWbpName('');
      showToast("WBP berhasil ditambahkan");
    } catch (err) { showToast("Gagal menambah WBP", "error"); }
  };

  const handleDeleteWbp = (id) => {
    setConfirmDialog({
      isOpen: true,
      message: "Hapus WBP ini dari database?",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'wbp', id));
          showToast("WBP dihapus");
        } catch (err) { showToast("Gagal menghapus WBP", "error"); }
        setConfirmDialog({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  const handleBulkDeleteKunjungan = () => {
    setConfirmDialog({
      isOpen: true,
      message: `Hapus ${selectedKunjungan.length} data kunjungan terpilih secara permanen?`,
      onConfirm: async () => {
        try {
          await Promise.all(selectedKunjungan.map(id => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'kunjungan', id))));
          setSelectedKunjungan([]);
          showToast(`${selectedKunjungan.length} Data kunjungan dihapus`);
        } catch (e) { showToast("Gagal hapus data", "error"); }
        setConfirmDialog({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  const handleBulkDeleteWbp = () => {
    setConfirmDialog({
      isOpen: true,
      message: `Hapus ${selectedWbp.length} WBP terpilih secara permanen?`,
      onConfirm: async () => {
        try {
          await Promise.all(selectedWbp.map(id => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'wbp', id))));
          setSelectedWbp([]);
          showToast(`${selectedWbp.length} Data WBP dihapus`);
        } catch (e) { showToast("Gagal hapus data", "error"); }
        setConfirmDialog({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  const handleImportWbp = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!window.XLSX) return showToast("Sistem sedang memuat library Excel, mohon tunggu sebentar.", "error");

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = window.XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = window.XLSX.utils.sheet_to_json(ws);
        
        let successCount = 0;
        for (let row of data) {
          const nama = row['Nama'] || row['nama'] || row['NAMA'];
          const status = row['Status'] || row['status'] || row['STATUS'] || 'Narapidana';
          
          if (nama) {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'wbp'), {
              nama: String(nama).toUpperCase(),
              status: String(status)
            });
            successCount++;
          }
        }
        showToast(`Berhasil mengimpor ${successCount} data WBP`);
      } catch (err) {
        showToast("Gagal membaca file Excel. Pastikan format sesuai.", "error");
      }
      e.target.value = null;
    };
    reader.readAsBinaryString(file);
  };

  const handleExportExcelWbp = () => {
    if (!window.XLSX) return showToast("Library Excel belum siap", "error");
    const data = filteredWbp.map((w, i) => ({ 
      'No': i + 1, 
      'Nama Lengkap': w.nama, 
      'Status': w.status || 'Narapidana' 
    }));
    const ws = window.XLSX.utils.json_to_sheet(data);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Data WBP");
    window.XLSX.writeFile(wb, "Data_WBP_Kalabahi.xlsx");
    showToast("File Excel berhasil diunduh");
  };

  const handleExportWordWbp = () => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Data WBP</title></head><body>";
    const footer = "</body></html>";
    let html = "<h2 style='text-align:center; font-family: Arial;'>Daftar Warga Binaan Pemasyarakatan</h2><table border='1' style='width:100%; border-collapse:collapse; font-family: Arial;'><tr><th style='padding:8px; background:#f0f0f0;'>No</th><th style='padding:8px; background:#f0f0f0;'>Nama Lengkap</th><th style='padding:8px; background:#f0f0f0;'>Status</th></tr>";
    
    filteredWbp.forEach((w, i) => { 
      html += `<tr><td style='padding:8px; text-align:center;'>${i+1}</td><td style='padding:8px;'>${w.nama}</td><td style='padding:8px;'>${w.status || 'Narapidana'}</td></tr>`; 
    });
    html += "</table>";
    
    const blob = new Blob(['\ufeff', header + html + footer], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Data_WBP_Kalabahi.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("File Word berhasil diunduh");
  };

  const handlePrintOrPdfWbp = (isPdf = false) => {
    const printWindow = window.open('', '_blank');
    let html = `
      <html><head><title>Data WBP Lapas Kalabahi</title>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #000; background: #fff; }
        h2 { text-align: center; margin-bottom: 20px; font-size: 20px; text-transform: uppercase; }
        table { border-collapse: collapse; width: 100%; font-size: 13px; margin-top: 10px; }
        th, td { border: 1px solid #000; padding: 10px; text-align: left; }
        th { background-color: #f4f4f4; text-transform: uppercase; }
        .text-center { text-align: center; }
      </style>
      </head><body>
      <div id="print-area">
        <h2>Daftar Warga Binaan Pemasyarakatan<br/>Lapas Kelas IIB Kalabahi</h2>
        <table>
          <tr><th width="10%" class="text-center">No</th><th>Nama Lengkap</th><th width="30%">Status</th></tr>
    `;
    
    filteredWbp.forEach((w, i) => { 
      html += `<tr><td class="text-center">${i+1}</td><td>${w.nama}</td><td>${w.status || 'Narapidana'}</td></tr>`; 
    });
    
    html += `
        </table>
      </div>
      <script>
        window.onload = () => {
          if (${isPdf}) {
            const opt = { 
              margin: 0.5, 
              filename: 'Data_WBP_Kalabahi.pdf', 
              image: { type: 'jpeg', quality: 0.98 }, 
              html2canvas: { scale: 2 }, 
              jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } 
            };
            html2pdf().set(opt).from(document.getElementById('print-area')).save().then(() => window.close());
          } else {
            window.print();
          }
        };
      </script>
      </body></html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const stats = {
    menunggu: dataKunjungan.filter(d => d.status === 'Menunggu').length,
    disetujui: dataKunjungan.filter(d => d.status === 'Disetujui').length,
    total: dataKunjungan.length
  };

  const filteredData = dataKunjungan.filter(d => {
    const matchTab = d.status === activeTab;
    const matchSearch = d.namaPengunjung.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        d.namaWbp.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        d.id.includes(searchTerm.toUpperCase());
    
    let matchDate = true;
    const todayObj = new Date();
    const y = todayObj.getFullYear();
    const m = String(todayObj.getMonth() + 1).padStart(2, '0');
    const day = String(todayObj.getDate()).padStart(2, '0');
    const todayStrExact = `${y}-${m}-${day}`;

    if (filterTime === 'Harian') {
      matchDate = d.tanggal === todayStrExact;
    } else if (filterTime === 'Mingguan') {
      const currentDay = todayObj.getDay() || 7;
      const monObj = new Date(todayObj); monObj.setDate(todayObj.getDate() - currentDay + 1);
      const sunObj = new Date(monObj); sunObj.setDate(monObj.getDate() + 6);
      const tDate = new Date(d.tanggal);
      matchDate = tDate >= monObj.setHours(0,0,0,0) && tDate <= sunObj.setHours(23,59,59,999);
    } else if (filterTime === 'Bulanan') {
      matchDate = d.tanggal.startsWith(`${y}-${m}`);
    } else if (filterTime === 'Custom') {
      if (customStart && customEnd) matchDate = d.tanggal >= customStart && d.tanggal <= customEnd;
      else if (customStart) matchDate = d.tanggal >= customStart;
      else if (customEnd) matchDate = d.tanggal <= customEnd;
    }

    return matchTab && matchSearch && matchDate;
  });

  const toggleSelectAllKunjungan = () => {
    if (selectedKunjungan.length === filteredData.length && filteredData.length > 0) setSelectedKunjungan([]);
    else setSelectedKunjungan(filteredData.map(d => d.id));
  };

  const toggleSelectAllWbp = () => {
    if (selectedWbp.length === filteredWbp.length && filteredWbp.length > 0) setSelectedWbp([]);
    else setSelectedWbp(filteredWbp.map(w => w.id));
  };

  return (
    <div className="max-w-7xl mx-auto animate-in slide-in-from-bottom-8 duration-700">
      
      {/* TAB NAVIGASI UTAMA ADMIN */}
      <div className="flex gap-4 mb-8 glass-card p-3 rounded-3xl w-fit relative z-10 shadow-lg">
        <button onClick={() => setAdminView('kunjungan')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${adminView === 'kunjungan' ? 'bg-blue-600 shadow-md text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
          <Monitor size={16}/> Kelola Kunjungan
        </button>
        <button onClick={() => setAdminView('wbp')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${adminView === 'wbp' ? 'bg-emerald-600 shadow-md text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
          <Database size={16}/> Master Data WBP
        </button>
      </div>

      {adminView === 'kunjungan' ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-card p-6 rounded-[2rem] flex items-center gap-5 shadow-lg border-l-4 border-l-amber-500 hover:-translate-y-1 transition-transform">
              <div className="p-4 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-2xl shadow-inner"><Clock size={28}/></div>
              <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Menunggu Verifikasi</p><h3 className="text-3xl font-black text-slate-900 dark:text-white">{stats.menunggu}</h3></div>
            </div>
            <div className="glass-card p-6 rounded-[2rem] flex items-center gap-5 shadow-lg border-l-4 border-l-emerald-500 hover:-translate-y-1 transition-transform">
              <div className="p-4 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-2xl shadow-inner"><CheckCircle2 size={28}/></div>
              <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Kunjungan Disetujui</p><h3 className="text-3xl font-black text-slate-900 dark:text-white">{stats.disetujui}</h3></div>
            </div>
            <div className="glass-card p-6 rounded-[2rem] flex items-center gap-5 shadow-lg border-l-4 border-l-blue-500 hover:-translate-y-1 transition-transform">
              <div className="p-4 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-2xl shadow-inner"><Users size={28}/></div>
              <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Registrasi</p><h3 className="text-3xl font-black text-slate-900 dark:text-white">{stats.total}</h3></div>
            </div>
          </div>

      {/* Main Table Area */}
      <div className="glass-card rounded-[3rem] shadow-2xl overflow-hidden border border-white/40 dark:border-slate-700/50 bg-white/70 dark:bg-slate-900/70">
        <div className="p-8 border-b border-slate-200/60 dark:border-slate-800 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-3"><Monitor size={24} className="text-blue-600"/> Kelola Kunjungan Virtual</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-2">Daftar Registrasi Keluarga WBP</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
             <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-2xl w-full sm:w-auto overflow-x-auto shadow-inner">
              {['Menunggu', 'Disetujui', 'Selesai', 'Ditolak'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-800 shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'}`}>
                  {tab} {tab === 'Menunggu' && stats.menunggu > 0 && <span className="ml-1.5 bg-rose-500 text-white px-2 py-0.5 rounded-full text-[9px] shadow-sm animate-pulse">{stats.menunggu}</span>}
                </button>
              ))}
            </div>
            <div className="flex gap-2 w-full sm:w-auto flex-wrap">
              <button onClick={handleExportExcelKunjungan} className="px-4 py-3 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-200 transition-colors flex items-center justify-center gap-2 shadow-sm" title="Export Excel">
                <Download size={16}/> Excel
              </button>
              <button onClick={handleExportWordKunjungan} className="px-4 py-3 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-200 transition-colors flex items-center justify-center gap-2 shadow-sm" title="Export Word">
                <FileText size={16}/> Word
              </button>
              <button onClick={handlePrintKunjungan} className="px-4 py-3 bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 dark:hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-sm" title="Cetak PDF/Print">
                <Printer size={16}/> Print
              </button>
            </div>
          </div>
        </div>

        {/* Filter Toolbar Kunjungan */}
        <div className="px-8 py-5 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-200/60 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Filter size={18} className="text-slate-400"/>
            <select value={filterTime} onChange={(e) => setFilterTime(e.target.value)} className="px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-bold outline-none cursor-pointer shadow-sm hover:border-blue-400 transition-colors">
              <option value="Semua">Semua Waktu</option>
              <option value="Harian">Harian (Hari Ini)</option>
              <option value="Mingguan">Mingguan (Minggu Ini)</option>
              <option value="Bulanan">Bulanan (Bulan Ini)</option>
              <option value="Custom">Custom Tanggal</option>
            </select>
            {filterTime === 'Custom' && (
              <div className="flex items-center gap-2">
                <input type="date" value={customStart} onChange={e=>setCustomStart(e.target.value)} className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-bold outline-none dark:[color-scheme:dark] shadow-sm" title="Mulai Tanggal" />
                <span className="text-slate-400 font-bold">-</span>
                <input type="date" value={customEnd} onChange={e=>setCustomEnd(e.target.value)} className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-bold outline-none dark:[color-scheme:dark] shadow-sm" title="Sampai Tanggal" />
              </div>
            )}
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            {selectedKunjungan.length > 0 && (
              <button onClick={handleBulkDeleteKunjungan} className="bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400 px-5 py-3 rounded-xl transition-colors shrink-0 flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-sm">
                <Trash2 size={16}/> Hapus ({selectedKunjungan.length})
              </button>
            )}
            <div className="relative w-full sm:w-72 shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Cari Kode / Nama..." className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-bold outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto relative">
          <table className="w-full text-left min-w-[1100px]">
            <thead className="bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-500 dark:text-slate-400 uppercase text-[10px] font-black tracking-widest sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-5 w-12 text-center">
                  <input type="checkbox" checked={selectedKunjungan.length === filteredData.length && filteredData.length > 0} onChange={toggleSelectAllKunjungan} className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer transition-colors"/>
                </th>
                <th className="px-4 py-5">Identitas Pengunjung</th>
                <th className="px-6 py-5">Tujuan (WBP)</th>
                <th className="px-6 py-5">Jadwal Sesi</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Aksi Petugas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredData.length === 0 ? (
                <tr><td colSpan="6" className="px-8 py-24 text-center opacity-40"><FileText size={60} className="mx-auto mb-5"/><p className="text-[11px] font-black uppercase tracking-widest">Tidak ada data di tab {activeTab}</p></td></tr>
              ) : (
                filteredData.map(item => (
                  <tr key={item.id} className={`transition-all duration-300 hover:shadow-md ${selectedKunjungan.includes(item.id) ? 'bg-emerald-50/80 dark:bg-emerald-900/20' : 'bg-white/40 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800/80'}`}>
                    <td className="px-6 py-5 text-center">
                      <input type="checkbox" checked={selectedKunjungan.includes(item.id)} onChange={() => setSelectedKunjungan(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id])} className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer"/>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-start gap-4">
                        <button onClick={() => setSelectedPhoto(item.ktpBase64)} className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden shrink-0 hover:scale-110 transition-transform ring-2 ring-transparent hover:ring-blue-500 cursor-zoom-in shadow-sm" title="Klik Lihat KTP">
                          {item.ktpBase64 ? <img src={item.ktpBase64} className="w-full h-full object-cover" alt="KTP"/> : <User className="w-full h-full p-3 text-slate-400"/>}
                        </button>
                        <div>
                          <p className="font-black text-[13px] text-slate-900 dark:text-white leading-tight flex items-center gap-2 mb-1">
                            {item.namaPengunjung}
                            <span className="text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-lg font-mono tracking-widest">{item.id.slice(-6).toUpperCase()}</span>
                          </p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">NIK: {item.nik}</p>
                          <p className="text-[10px] font-bold text-slate-500 mt-1 line-clamp-1 max-w-[200px]" title={item.alamat}>Alamat: {item.alamat || '-'}</p>
                          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1.5"><Phone size={12}/> {item.noWa}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-black text-[13px] text-slate-900 dark:text-white">{item.namaWbp}</p>
                      <span className="inline-block mt-1.5 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm">{item.hubungan}</span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-bold text-[12px] text-slate-900 dark:text-white flex items-center gap-1.5"><Calendar size={14} className="text-slate-400"/> {item.tanggalFormat}</p>
                      <p className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase mt-2 flex items-center gap-1.5"><Clock size={14}/> {item.sesi}</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${item.status === 'Menunggu' ? 'bg-amber-100 text-amber-700' : item.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-700' : item.status === 'Selesai' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>{item.status}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        {item.status === 'Menunggu' && (
                          <>
                            <button onClick={() => handleUpdateStatus(item.id, 'Disetujui')} className="p-2.5 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm" title="Setujui Kunjungan"><Check size={18}/></button>
                            <button onClick={() => handleUpdateStatus(item.id, 'Ditolak')} className="p-2.5 bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm" title="Tolak Kunjungan"><X size={18}/></button>
                          </>
                        )}
                        {item.status === 'Disetujui' && (
                          <>
                            <button onClick={() => handleWA(item.noWa, item.namaPengunjung, `${item.tanggalFormat} - ${item.sesi}`)} className="p-2.5 bg-emerald-500 text-white rounded-xl hover:scale-110 hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all shadow-md flex items-center justify-center animate-pulse" title="Hubungi via WhatsApp"><PhoneCall size={18}/></button>
                            <button onClick={() => handleUpdateStatus(item.id, 'Selesai')} className="p-2.5 bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm" title="Tandai Selesai"><CheckCircle2 size={18}/></button>
                          </>
                        )}
                        <div className="w-px h-10 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                        <button onClick={() => handleDelete(item.id)} className="p-2.5 bg-slate-100 text-slate-400 dark:bg-slate-800 rounded-xl hover:text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all shadow-sm" title="Hapus Permanen Data Ini"><Trash2 size={18}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal KTP */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-3xl w-full animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedPhoto(null)} className="absolute -top-16 right-0 p-3 bg-white/10 rounded-full text-white hover:bg-rose-500 transition-colors backdrop-blur-md"><X size={24}/></button>
            <img src={selectedPhoto} className="w-full h-auto max-h-[85vh] object-contain rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-white/20" alt="KTP Detail" />
          </div>
        </div>
      )}
      </>
      ) : (
        /* VIEW DATABASE WBP */
        <div className="glass-card rounded-[3rem] shadow-2xl overflow-hidden border border-white/40 dark:border-slate-700/50 bg-white/70 dark:bg-slate-900/70 p-8">
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10">
                <div>
                  <h2 className="text-2xl font-black flex items-center gap-3 text-slate-900 dark:text-white"><Database size={28} className="text-emerald-500"/> Master Data WBP</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-2">Daftar Warga Binaan Pemasyarakatan</p>
                </div>
                
                <div className="flex flex-wrap gap-3 w-full xl:w-auto bg-slate-50 dark:bg-slate-800/50 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                  <input type="file" accept=".xlsx, .xls" id="import-excel" className="hidden" onChange={handleImportWbp} />
                  <label htmlFor="import-excel" className="px-5 py-3 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-200 transition-colors cursor-pointer flex items-center gap-2 grow sm:grow-0 justify-center shadow-sm">
                    <Upload size={16}/> Import Excel
                  </label>
                  <div className="w-px h-10 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
                  <button onClick={handleExportExcelWbp} className="px-5 py-3 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-200 transition-colors flex items-center gap-2 grow sm:grow-0 justify-center shadow-sm">
                    <Download size={16}/> Excel
                  </button>
                  <button onClick={handleExportWordWbp} className="px-5 py-3 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-200 transition-colors flex items-center gap-2 grow sm:grow-0 justify-center shadow-sm">
                    <FileText size={16}/> Word
                  </button>
                  <button onClick={() => handlePrintOrPdfWbp(true)} className="px-5 py-3 bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-200 transition-colors flex items-center gap-2 grow sm:grow-0 justify-center shadow-sm">
                    <FileDown size={16}/> PDF
                  </button>
                  <button onClick={() => handlePrintOrPdfWbp(false)} className="px-5 py-3 bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 dark:hover:bg-white transition-colors flex items-center gap-2 grow sm:grow-0 justify-center shadow-sm">
                    <Printer size={16}/> Print
                  </button>
                </div>
              </div>

              {/* Form Tambah */}
              <div className="bg-white/50 dark:bg-slate-900/40 p-6 rounded-[2rem] mb-10 border border-slate-200/60 dark:border-slate-800 shadow-sm backdrop-blur-sm">
                <form onSubmit={handleAddWbp} className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-2 mb-2 block">Nama Lengkap WBP</label>
                    <input type="text" value={newWbpName} onChange={e => setNewWbpName(e.target.value)} placeholder="Ketik nama lengkap..." className="w-full px-6 py-4 premium-input rounded-2xl text-[13px] font-bold outline-none uppercase" required />
                  </div>
                  <div className="w-full md:w-64">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-2 mb-2 block">Status Binaan</label>
                    <select value={newWbpStatus} onChange={e => setNewWbpStatus(e.target.value)} className="w-full px-6 py-4 premium-input rounded-2xl text-[13px] font-bold outline-none uppercase cursor-pointer">
                      <option value="Narapidana">Narapidana</option>
                      <option value="Tahanan">Tahanan</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button type="submit" className="w-full md:w-auto px-10 py-4 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/30 transition-all shrink-0 h-[52px] mt-auto">Tambah Data</button>
                  </div>
                </form>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex items-center gap-3 w-full sm:w-auto bg-white/50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <input type="checkbox" checked={selectedWbp.length === filteredWbp.length && filteredWbp.length > 0} onChange={toggleSelectAllWbp} className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer ml-2 transition-colors"/>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Pilih Semua ({selectedWbp.length})</span>
                  {selectedWbp.length > 0 && (
                    <button onClick={handleBulkDeleteWbp} className="ml-3 bg-rose-500 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 transition-colors shadow-md">
                      Hapus
                    </button>
                  )}
                </div>
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" value={searchWbp} onChange={e => setSearchWbp(e.target.value)} placeholder="Cari Nama / Status WBP..." className="w-full pl-11 pr-5 py-3.5 premium-input rounded-xl text-xs font-bold outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredWbp.length === 0 ? (
                  <div className="col-span-full py-20 text-center opacity-40">
                    <Database size={64} className="mx-auto mb-6 text-slate-400"/>
                    <p className="text-xs font-black uppercase tracking-widest">Database WBP Kosong / Tidak Ditemukan</p>
                  </div>
                ) : (
                  filteredWbp.map(wbp => (
                    <div key={wbp.id} className={`flex justify-between items-center p-5 rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md ${selectedWbp.includes(wbp.id) ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-900/30 dark:border-emerald-700 scale-[1.02]' : 'bg-white/60 border-slate-200 dark:bg-slate-800/60 dark:border-slate-700 hover:-translate-y-1'}`}>
                      <div className="flex items-center gap-4">
                        <input type="checkbox" checked={selectedWbp.includes(wbp.id)} onChange={() => setSelectedWbp(prev => prev.includes(wbp.id) ? prev.filter(i => i !== wbp.id) : [...prev, wbp.id])} className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer shrink-0"/>
                        <div>
                          <p className="font-black text-[13px] uppercase text-slate-900 dark:text-white leading-tight">{wbp.nama}</p>
                          <p className="inline-block mt-1.5 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400">{wbp.status || 'Narapidana'}</p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteWbp(wbp.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-xl transition-all shrink-0" title="Hapus WBP">
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Modal Konfirmasi Hapus Custom */}
          {confirmDialog.isOpen && (
            <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="glass-card p-8 rounded-3xl w-full max-w-sm shadow-2xl relative text-center border border-rose-500/30">
                <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={32} className="text-rose-600 dark:text-rose-500"/>
                </div>
                <h3 className="text-lg font-black mb-2 text-slate-900 dark:text-white">Konfirmasi Hapus</h3>
                <p className="text-sm font-bold text-slate-500 mb-8">{confirmDialog.message}</p>
                
                <div className="flex gap-3">
                  <button onClick={() => setConfirmDialog({ isOpen: false, message: '', onConfirm: null })} className="flex-1 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">Batal</button>
                  <button onClick={confirmDialog.onConfirm} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-700 transition-colors shadow-md shadow-rose-600/20">Ya, Hapus</button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

// Icon Tambahan yang dipanggil
function Monitor(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>; }
function User(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
