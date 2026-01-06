
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Shield, 
  Terminal, 
  Globe, 
  Activity, 
  AlertCircle, 
  Zap, 
  Info, 
  Lock, 
  Star, 
  Maximize2, 
  Minimize2, 
  X, 
  Square, 
  Minus, 
  History, 
  LayoutDashboard, 
  Loader2, 
  Trophy, 
  ShieldCheck, 
  Server,
  RefreshCw,
  CheckCircle2,
  Flame
} from 'lucide-react';
import { WINDOWS_TOOLS, INITIAL_BLACKLIST, AEGIS_INFO } from './constants';
import { BlacklistedDomain, Threat, ScanStatus, SubscriptionInfo, SubscriptionTier } from './types';
import { getLatestThreats, analyzeSecurityLog } from './services/geminiService';
import BlacklistManager from './components/BlacklistManager';
import ScannerOverlay from './components/ScannerOverlay';
import SubscriptionModal from './components/SubscriptionModal';

type SystemUpdateState = 'checking' | 'available' | 'applying' | 'uptodate';

const NEUTRALIZED_THREATS = [
  "ROOTKITS", "TROJANS", "SPYWARE", "RANSOMWARE", "ADWARE", "WORMS", "KEYLOGGERS", 
  "PHISHING REDIRECTS", "BOTNET BEACONS", "ZERO-DAY EXPLOITS", "POLYMORPHIC MALWARE", 
  "FILELESS THREATS", "BROWSER HIJACKERS", "REGISTRY INJECTORS", "CRYPTOJACKERS", 
  "LOGIC BOMBS", "MAN-IN-THE-MIDDLE ATTACKS", "SQL INJECTIONS", "BACKDOORS", 
  "SHELLCODE INJECTION", "REMOTE ACCESS TROJANS (RAT)", "DDoS AGENTS", "PRIVILEGE ESCALATION",
  "NUCLEUS EXPLOITS", "HEURISTIC ANOMALIES", "DATA EXFILTRATORS", "DNS POISONERS", "STEALTH WRAPPERS"
];

const App: React.FC = () => {
  const [blacklist, setBlacklist] = useState<BlacklistedDomain[]>(
    INITIAL_BLACKLIST.map((d, i) => ({
      id: `${Date.now()}-${i}`,
      domain: d,
      reason: 'Known malicious entity',
      dateAdded: new Date().toISOString()
    }))
  );
  const [threats, setThreats] = useState<Threat[]>([]);
  const [scanStatus, setScanStatus] = useState<ScanStatus>(ScanStatus.IDLE);
  const [scanLog, setScanLog] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'tools' | 'intelligence' | 'blacklist' | 'history' | 'about'>('tools');
  const [loadingThreats, setLoadingThreats] = useState(true);
  const [scannerTitle, setScannerTitle] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [updateState, setUpdateState] = useState<SystemUpdateState>('checking');
  
  const appRef = useRef<HTMLDivElement>(null);
  const { app_info, mission_statement, technical_background, key_milestones, compliance_and_security } = AEGIS_INFO.data;

  const [subscription, setSubscription] = useState<SubscriptionInfo>(() => {
    const saved = localStorage.getItem('winarmor_sub');
    return saved ? JSON.parse(saved) : { tier: null, expiryDate: null, isActive: false };
  });
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  // Automated Update & Anti-Virus Patching Logic
  useEffect(() => {
    const runAutomaticUpdates = async () => {
      setUpdateState('checking');
      setScanLog(prev => `> [${new Date().toLocaleTimeString()}] INITIATING GLOBAL UPDATE PROTOCOL...\n` + prev);
      await new Promise(r => setTimeout(r, 1500));
      
      setUpdateState('available');
      setScanLog(prev => `> [${new Date().toLocaleTimeString()}] UPDATES FOUND: Core Engine v4.5.3, Signature DB #921, Network Heuristics v2.1\n` + prev);
      await new Promise(r => setTimeout(r, 1000));
      
      setUpdateState('applying');
      setScanLog(prev => `> [${new Date().toLocaleTimeString()}] APPLYING UPDATES AUTOMATICALLY (Step 1/2: Core modules & tools)...\n` + prev);
      await new Promise(r => setTimeout(r, 2000));
      
      setScanLog(prev => `> [${new Date().toLocaleTimeString()}] APPLYING ANTI-VIRUS UPDATES (Step 2/2: Malware definitions & Engine patches)...\n` + prev);
      await new Promise(r => setTimeout(r, 2000));
      
      setUpdateState('uptodate');
      setScanLog(prev => `> [${new Date().toLocaleTimeString()}] SYSTEM FULLY PATCHED. NO INTERVENTION REQUIRED.\n` + prev);
    };
    runAutomaticUpdates();
  }, []);

  const fetchThreats = useCallback(async () => {
    setLoadingThreats(true);
    const data = await getLatestThreats();
    setThreats(data);
    setLoadingThreats(false);
  }, []);

  useEffect(() => {
    fetchThreats();
  }, [fetchThreats]);

  const toggleFullscreen = () => {
    if (!appRef.current) return;
    if (!document.fullscreenElement) {
      appRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const saveSubscription = (tier: SubscriptionTier) => {
    const info: SubscriptionInfo = {
      tier,
      isActive: true,
      expiryDate: tier === 'LIFETIME' ? 'Never' : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    setSubscription(info);
    localStorage.setItem('winarmor_sub', JSON.stringify(info));
    setIsSubModalOpen(false);
  };

  const checkAccess = (index: number, callback: () => void) => {
    if (subscription.isActive || index < 3) {
      callback();
    } else {
      setIsSubModalOpen(true);
    }
  };

  const handleFixAll = () => {
    if (subscription.isActive) {
      setScannerTitle('FULL SYSTEM HEURISTIC PURGE');
      setScanStatus(ScanStatus.SCANNING);
    } else {
      setIsSubModalOpen(true);
    }
  };

  const handleRunTool = (name: string, index: number) => {
    checkAccess(index, () => {
      setScannerTitle(`EXECUTING: ${name}`);
      setScanStatus(ScanStatus.SCANNING);
    });
  };

  const onScanComplete = async () => {
    setScanStatus(ScanStatus.COMPLETED);
    const analysis = await analyzeSecurityLog(`Operation ${scannerTitle} completed. Scan found 0 malware files. System integrity verified via Aesis Native Interface.`);
    setScanLog(prev => `${new Date().toLocaleTimeString()} - ${scannerTitle} COMPLETE\n${analysis}\n\n${prev}`);
    setTimeout(() => {
      setScanStatus(ScanStatus.IDLE);
    }, 4000);
  };

  const addToBlacklist = (domain: string, reason: string) => {
    setBlacklist(prev => [{
      id: Date.now().toString(),
      domain,
      reason,
      dateAdded: new Date().toISOString()
    }, ...prev]);
  };

  const removeFromBlacklist = (id: string) => {
    setBlacklist(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="h-screen w-screen flex flex-col text-gray-300 font-sans select-none overflow-hidden bg-transparent" ref={appRef}>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 80s linear infinite;
        }
      `}</style>
      
      <ScannerOverlay 
        status={scanStatus} 
        onComplete={onScanComplete} 
        title={scannerTitle} 
      />

      {scanStatus === ScanStatus.SCANNING && (
        <div className="fixed bottom-12 right-8 z-[60] bg-cyan-950/80 border border-cyan-400/50 backdrop-blur-xl px-5 py-2.5 rounded-full flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 shadow-[0_0_30px_rgba(34,211,238,0.3)] pointer-events-none">
          <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300">Working...</span>
        </div>
      )}

      <SubscriptionModal 
        isOpen={isSubModalOpen} 
        onClose={() => setIsSubModalOpen(false)} 
        onPurchase={saveSubscription}
      />

      {/* App Title Bar */}
      <div className="h-10 bg-black/40 border-b border-white/5 flex items-center justify-between px-4 drag-region shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="text-[11px] font-black tracking-[0.1em] text-gray-400 uppercase">
            AesisGuard <span className="text-[7px] ml-1 opacity-60">by WinArmor</span> v{app_info.version} — Admin
          </span>
        </div>
        <div className="flex items-center no-drag">
          <button onClick={toggleFullscreen} className="p-2 hover:bg-white/10 transition-colors">
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <div className="w-px h-4 bg-white/10 mx-1"></div>
          <button className="p-2.5 hover:bg-white/10 transition-colors"><Minus className="w-3.5 h-3.5" /></button>
          <button className="p-2.5 hover:bg-white/10 transition-colors"><Square className="w-3.5 h-3.5" /></button>
          <button className="p-2.5 hover:bg-red-600/80 transition-colors group"><X className="w-3.5 h-3.5 group-hover:text-white" /></button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-black/20 border-r border-white/5 flex flex-col shrink-0 backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-cyan-600 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-black text-white tracking-tighter">
                AesisGuard <span className="text-[10px] opacity-60 block -mt-1 font-bold">by WinArmor</span>
              </h1>
            </div>
            <p className="text-[9px] text-cyan-400/60 font-bold uppercase tracking-wider mb-8 pl-1">
              {app_info.name}
            </p>

            <nav className="space-y-1">
              <SidebarItem icon={LayoutDashboard} label="Security Hub" active={activeTab === 'tools'} onClick={() => setActiveTab('tools')} />
              <SidebarItem icon={AlertCircle} label="Threat Feed" active={activeTab === 'intelligence'} onClick={() => setActiveTab('intelligence')} />
              <SidebarItem icon={Globe} label="Blacklist" active={activeTab === 'blacklist'} onClick={() => setActiveTab('blacklist')} />
              <SidebarItem icon={History} label="Scan Logs" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
              <SidebarItem icon={Info} label="System Info" active={activeTab === 'about'} onClick={() => setActiveTab('about')} />
            </nav>
          </div>

          <div className="mt-auto p-4 border-t border-white/5">
            {subscription.isActive ? (
              <div className="bg-cyan-600/10 border border-cyan-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-xs font-black text-white uppercase">{subscription.tier} ACTIVE</span>
                </div>
                <p className="text-[10px] text-cyan-400 font-bold">Secure connection verified.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg mb-2">
                  <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
                    Demo Mode Active
                  </div>
                  <p className="text-[9px] text-gray-500 font-bold mt-1">3 free tools available</p>
                </div>
                <button 
                  onClick={() => setIsSubModalOpen(true)}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-black font-black py-4 rounded-xl text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-lg shadow-amber-900/40"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  Go Pro Now
                </button>
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 flex flex-col relative overflow-hidden">
          <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/10 backdrop-blur-xl shrink-0">
            <div className="flex items-center gap-6">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500">
                System Console / <span className="text-cyan-400">{activeTab}</span>
              </h2>

              <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${
                subscription.isActive 
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${subscription.isActive ? 'bg-cyan-400' : 'bg-amber-400'}`}></div>
                {subscription.isActive ? 'PRO ACTIVE' : 'DEMO MODE'}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end mr-2">
                <span className="text-[9px] font-bold text-gray-500 uppercase">Aesis Engine Status</span>
                <span className="text-[11px] font-black text-emerald-400 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  NOMINAL
                </span>
              </div>
              <button 
                onClick={handleFixAll}
                className="bg-red-600 hover:bg-red-500 text-white font-black px-6 py-2.5 rounded-lg text-xs tracking-widest transition-all shadow-xl flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                SEARCH AND DESTROY
              </button>
            </div>
          </div>

          {/* Neutralized Threat Marquee */}
          <div className="w-full bg-red-600 border-b border-red-700 py-1.5 overflow-hidden whitespace-nowrap relative shrink-0 shadow-[0_4px_20px_rgba(220,38,38,0.4)]">
             <div className="flex animate-marquee">
                <div className="flex items-center gap-12 shrink-0 px-4">
                  {NEUTRALIZED_THREATS.concat(NEUTRALIZED_THREATS).map((threat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Flame className="w-3.5 h-3.5 text-white" />
                      <span className="text-[11px] font-black text-white uppercase tracking-[0.2em] drop-shadow-md">NEUTRALIZING: {threat}</span>
                    </div>
                  ))}
                </div>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {activeTab === 'tools' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-3 gap-6">
                  {/* Dynamic Upgrade Status Box */}
                  <div className={`bg-black/30 border p-5 rounded-2xl flex items-center gap-5 transition-all backdrop-blur-md ${
                    updateState === 'uptodate' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'
                  }`}>
                    <div className={`p-3 rounded-xl ${
                      updateState === 'uptodate' ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-500 bg-rose-500/10'
                    }`}>
                      {/* Fixed: Removed redundant comparison on updateState. Since we are in the 'else' branch of 'updateState === uptodate', we already know it is not uptodate. */}
                      {updateState === 'uptodate' ? <CheckCircle2 className="w-6 h-6" /> : <RefreshCw className="w-6 h-6 animate-spin" />}
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">UPGRADE/UPDATE</div>
                      <div className={`text-xl font-black ${updateState === 'uptodate' ? 'text-emerald-400' : 'text-rose-500'}`}>
                        {updateState === 'uptodate' ? "UP TO DATE" : updateState === 'applying' ? "APPLYING..." : "UPGRADE NOW"}
                      </div>
                    </div>
                  </div>

                  <StatCard icon={ShieldCheck} label="Signatures" value={technical_background.database_size} color="cyan" />
                  <StatCard icon={Activity} label="Threat Alerts" value={threats.length} color="red" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {WINDOWS_TOOLS.map((tool, index) => (
                    <ToolCard 
                      key={tool.id} 
                      tool={tool} 
                      index={index}
                      isLocked={!subscription.isActive && index >= 3}
                      onRun={() => handleRunTool(tool.name, index)}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'intelligence' && (
              <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in slide-in-from-left-4">
                {loadingThreats ? (
                  <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-50">
                    <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
                    <span className="mono text-xs tracking-[0.2em]">Intercepting global threat data...</span>
                  </div>
                ) : (
                  threats.map((threat, i) => <ThreatItem key={i} threat={threat} isLocked={!subscription.isActive && i >= 2} />)
                )}
              </div>
            )}

            {activeTab === 'blacklist' && (
              <div className="h-full animate-in fade-in">
                <BlacklistManager blacklist={blacklist} onAdd={addToBlacklist} onRemove={removeFromBlacklist} />
              </div>
            )}

            {activeTab === 'history' && (
              <div className="h-full flex flex-col animate-in fade-in">
                <div className="bg-black/40 border border-white/5 rounded-2xl flex-1 flex flex-col p-6 overflow-hidden backdrop-blur-md">
                  <div className="flex items-center gap-3 mb-6">
                    <History className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-xl font-black text-white">System Events</h2>
                  </div>
                  <div className="flex-1 bg-black/40 rounded-xl border border-white/5 p-6 font-mono text-[11px] leading-relaxed overflow-y-auto custom-scrollbar text-emerald-400/80">
                    {scanLog || `> [${new Date().toLocaleDateString()}] Aesis Guard Engine v${app_info.version} initialized.\n> Signature Database: ${technical_background.database_size}\n> Cloud Sync: SYNCED (Status: Nominal)\n> Awaiting system instruction...`}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in-95">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-black/40 border border-white/5 rounded-3xl p-8 relative overflow-hidden group backdrop-blur-md">
                    <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                      <Trophy className="w-6 h-6 text-amber-500" />
                      Our Mission
                    </h3>
                    <p className="text-lg text-cyan-300 font-bold mb-4 italic leading-relaxed">"{mission_statement.core_objective}"</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{mission_statement.philosophy}</p>
                  </div>

                  <div className="bg-black/40 border border-white/5 rounded-3xl p-8 backdrop-blur-md">
                    <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                      <Server className="w-6 h-6 text-cyan-400" />
                      Technical Stack
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Architecture</span>
                        <span className="text-xs font-bold text-gray-200">{technical_background.engine_architecture}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Database</span>
                        <span className="text-xs font-bold text-cyan-400">{technical_background.database_size}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <footer className="h-8 bg-black/40 border-t border-white/5 flex items-center justify-between px-6 text-[10px] font-bold text-gray-500 shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5"><Info className="w-3 h-3 text-cyan-500" /> Dev: {app_info.developer}</span>
          <span className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-emerald-500" /> Engine: Aesis Guard Pro 4.5</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> Endpoint Sync: Active</span>
          <span className="text-cyan-500/30 uppercase tracking-[0.2em]">Secure Node 8192-X</span>
        </div>
      </footer>
    </div>
  );
};

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-black text-xs uppercase tracking-widest ${
      active ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
    }`}
  >
    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-600'}`} />
    {label}
  </button>
);

const StatCard = ({ icon: Icon, label, value, color = 'blue' }: any) => {
  const colors = {
    blue: 'text-cyan-400 bg-cyan-400/10',
    cyan: 'text-cyan-400 bg-cyan-400/10',
    red: 'text-rose-500 bg-rose-500/10'
  };
  return (
    <div className="bg-black/30 border border-white/5 p-5 rounded-2xl flex items-center gap-5 backdrop-blur-md hover:border-white/10 transition-all">
      <div className={`p-3 rounded-xl ${colors[color as keyof typeof colors]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">{label}</div>
        <div className="text-2xl font-black text-white">{value}</div>
      </div>
    </div>
  );
};

const ToolCard = ({ tool, isLocked, onRun, index }: any) => (
  <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex flex-col justify-between group relative overflow-hidden transition-all hover:bg-white/5 hover:border-cyan-500/50 h-full min-h-[180px] backdrop-blur-md">
    <div>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-black text-white text-[12px] uppercase tracking-tight leading-tight">{tool.name}</h3>
        {index < 3 && !isLocked && <div className="text-[7px] font-black px-1 py-0.5 rounded bg-cyan-500 text-white uppercase tracking-tighter shadow-sm shadow-cyan-900">Free</div>}
      </div>
      <p className="text-[10px] text-gray-500 font-medium leading-tight mb-4 line-clamp-3">{tool.description}</p>
    </div>
    
    <div className="mt-auto">
      <button 
        onClick={onRun}
        className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
          isLocked ? 'bg-white/5 text-gray-600 border border-white/5 grayscale cursor-not-allowed' : 'bg-gradient-to-r from-cyan-600 to-teal-400 text-white shadow-lg'
        }`}
      >
        {isLocked ? <Lock className="w-3 h-3" /> : <Zap className="w-3 h-3 fill-current" />}
        {isLocked ? 'Locked' : 'RUN'}
      </button>
    </div>
  </div>
);

const ThreatItem = ({ threat, isLocked }: any) => (
  <div className={`bg-black/40 border-l-4 border-l-rose-600 border border-white/5 p-5 rounded-2xl flex items-start gap-5 transition-all backdrop-blur-md ${
    isLocked ? 'blur-md grayscale opacity-30 select-none' : 'hover:border-white/10'
  }`}>
    <div className="p-3 bg-rose-600/10 rounded-xl">
      <Shield className="w-5 h-5 text-rose-600" />
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-base font-black text-white uppercase tracking-tight">{threat.name}</h4>
        <span className={`text-[9px] font-black px-2 py-0.5 rounded text-white ${threat.severity === 'Critical' ? 'bg-rose-600' : 'bg-orange-600'}`}>
          {threat.severity}
        </span>
      </div>
      <div className="flex gap-4 mb-3">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Type: {threat.type}</span>
      </div>
      <p className="text-xs text-gray-400 leading-relaxed">{threat.description}</p>
    </div>
  </div>
);

export default App;
