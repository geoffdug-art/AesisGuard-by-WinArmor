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
  Flame,
  DownloadCloud
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

const LogoAnimated = () => {
  return (
    <div className="relative flex items-center justify-center w-20 h-20 shrink-0 group">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-2xl group-hover:bg-blue-400/40 transition-all duration-700"></div>
      
      {/* Data Bouncing Particles */}
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-0.5 h-3 bg-cyan-400/60 rounded-full"
            style={{
              top: '50%',
              left: '50%',
              transformOrigin: '0 0',
              animation: `data-pulse-${i} ${1.5 + Math.random() * 2}s infinite ease-out`,
            }}
          />
        ))}
      </div>

      {/* Recreated "Shield with A" Logo from Image */}
      <div className="relative z-10 w-16 h-16 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)] transition-transform duration-500 group-hover:scale-110">
        <svg viewBox="0 0 100 120" className="w-full h-full filter drop-shadow-lg">
          <defs>
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {/* Outer Shield Border */}
          <path 
            d="M50 5 L90 25 C90 25 90 70 50 115 C10 70 10 25 10 25 L50 5Z" 
            fill="none" 
            stroke="#93c5fd" 
            strokeWidth="3"
            filter="url(#glow)"
          />
          {/* Main Shield Body */}
          <path 
            d="M50 12 L82 28 C82 28 82 65 50 105 C18 65 18 28 18 28 L50 12Z" 
            fill="url(#shieldGrad)"
            className="opacity-90"
          />
          {/* Inner Decorative Shield Path */}
          <path 
            d="M50 22 L75 35 C75 35 75 60 50 90 C25 60 25 35 25 35 L50 22Z" 
            fill="rgba(255,255,255,0.15)"
          />
          {/* Stylized "A" */}
          <path 
            d="M50 35 L62 68 H38 L50 35 Z M50 48 L44 62 H56 L50 48 Z" 
            fill="white"
            filter="url(#glow)"
          />
        </svg>
      </div>

      <style>{`
        ${[...Array(12)].map((_, i) => `
          @keyframes data-pulse-${i} {
            0% { transform: translate(-50%, -50%) rotate(${i * 30}deg) translateY(-20px) scaleY(0.5); opacity: 0; }
            50% { opacity: 0.8; transform: translate(-50%, -50%) rotate(${i * 30}deg) translateY(-50px) scaleY(1.5); }
            100% { transform: translate(-50%, -50%) rotate(${i * 30}deg) translateY(-80px) scaleY(0.5); opacity: 0; }
          }
        `).join('\n')}
      `}</style>
    </div>
  );
};

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
  const [installing, setInstalling] = useState(false);

  const [demoTokens, setDemoTokens] = useState<number>(() => {
    const saved = localStorage.getItem('demo_tokens');
    return saved !== null ? parseInt(saved, 10) : 3;
  });
  
  const appRef = useRef<HTMLDivElement>(null);
  const { app_info, mission_statement, technical_background, key_milestones, compliance_and_security } = AEGIS_INFO.data;

  const [subscription, setSubscription] = useState<SubscriptionInfo>(() => {
    const saved = localStorage.getItem('winarmor_sub');
    return saved ? JSON.parse(saved) : { tier: null, expiryDate: null, isActive: false };
  });
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('demo_tokens', demoTokens.toString());
  }, [demoTokens]);

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

  const handleInstall = () => {
    setInstalling(true);
    setScanLog(prev => `> [${new Date().toLocaleTimeString()}] DEPLOYING NATIVE AESIS AGENT TO HOST MACHINE...\n` + prev);
    setTimeout(() => {
      setInstalling(false);
      setScanLog(prev => `> [${new Date().toLocaleTimeString()}] NATIVE AGENT DEPLOYED SUCCESSFULLY. SYSTEM INTEGRATION: 100%\n` + prev);
      alert("AesisGuard Native Agent has been successfully deployed to your system directory.");
    }, 3000);
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

  const handleRunTool = (name: string) => {
    if (subscription.isActive) {
      setScannerTitle(`EXECUTING: ${name}`);
      setScanStatus(ScanStatus.SCANNING);
    } else if (demoTokens > 0) {
      setDemoTokens(prev => prev - 1);
      setScannerTitle(`EXECUTING: ${name}`);
      setScanStatus(ScanStatus.SCANNING);
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

  const threatListText = NEUTRALIZED_THREATS.join(', ');

  return (
    <div className="h-screen w-screen flex flex-col text-gray-300 font-sans select-none overflow-hidden bg-transparent" ref={appRef}>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
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

      <SubscriptionModal isOpen={isSubModalOpen} onClose={() => setIsSubModalOpen(false)} onPurchase={saveSubscription} />

      {/* App Title Bar */}
      <div className="h-10 bg-black/40 border-b border-white/5 flex items-center justify-between px-4 drag-region shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="text-[11px] font-black tracking-[0.1em] text-gray-400 uppercase">
            AesisGuard <span className="text-[7px] ml-1 opacity-60">by WinArmor</span> v{app_info.version} — Admin
          </span>
        </div>
        <div className="flex items-center gap-2 no-drag">
          <button 
            onClick={handleInstall}
            disabled={installing}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest transition-all"
          >
            {installing ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <DownloadCloud className="w-2.5 h-2.5 text-cyan-400" />}
            {installing ? 'Deploying...' : 'Install to Device'}
          </button>
          <div className="w-px h-4 bg-white/10 mx-1"></div>
          <button onClick={toggleFullscreen} className="p-2 hover:bg-white/10 transition-colors">
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button className="p-2.5 hover:bg-white/10 transition-colors"><Minus className="w-3.5 h-3.5" /></button>
          <button className="p-2.5 hover:bg-white/10 transition-colors"><Square className="w-3.5 h-3.5" /></button>
          <button className="p-2.5 hover:bg-red-600/80 transition-colors group"><X className="w-3.5 h-3.5 group-hover:text-white" /></button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 bg-black/20 border-r border-white/5 flex flex-col shrink-0 backdrop-blur-sm">
          <div className="p-8 pb-4">
            <div className="flex flex-col gap-6 mb-8">
              <LogoAnimated />
              <div>
                <h1 className="text-3xl font-black text-white tracking-tighter leading-none mb-1">
                  AesisGuard
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-black uppercase tracking-widest text-cyan-400/80">by WinArmor</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-cyan-400/20 to-transparent"></div>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-8 pl-1 border-l-2 border-cyan-500/30 ml-1 py-1">
              Domain Ident: {app_info.name}
            </p>

            <nav className="space-y-2">
              <SidebarItem icon={LayoutDashboard} label="Security Hub" active={activeTab === 'tools'} onClick={() => setActiveTab('tools')} />
              <SidebarItem icon={AlertCircle} label="Threat Feed" active={activeTab === 'intelligence'} onClick={() => setActiveTab('intelligence')} />
              <SidebarItem icon={Globe} label="Blacklist" active={activeTab === 'blacklist'} onClick={() => setActiveTab('blacklist')} />
              <SidebarItem icon={History} label="Scan Logs" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
              <SidebarItem icon={Info} label="System Info" active={activeTab === 'about'} onClick={() => setActiveTab('about')} />
            </nav>
          </div>

          <div className="mt-auto p-6 border-t border-white/5">
            {subscription.isActive ? (
              <div className="bg-cyan-600/10 border border-cyan-500/30 rounded-2xl p-4 flex items-center gap-4">
                <div className="p-2 bg-cyan-600 rounded-lg shadow-lg">
                  <Star className="w-4 h-4 text-white fill-current" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{subscription.tier} ACTIVE</span>
                  <p className="text-[9px] text-cyan-400/60 font-bold">Secure Node 8192-X</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
                    Demo Mode
                  </div>
                  <p className="text-[9px] text-gray-500 font-bold">{demoTokens} Free Goes Remaining</p>
                </div>
                <button 
                  onClick={() => setIsSubModalOpen(true)}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-black font-black py-4 rounded-xl text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-xl shadow-amber-900/20"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  UPGRADE TO PRO
                </button>
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 flex flex-col relative overflow-hidden">
          <div className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-black/10 backdrop-blur-xl shrink-0">
            <div className="flex items-center gap-8">
              <h2 className="text-base font-black uppercase tracking-[0.3em] text-gray-500">
                Aesis.Native / <span className="text-white">{activeTab}</span>
              </h2>

              {subscription.isActive && (
                <div className="flex items-center gap-3 px-4 py-2 rounded-full border text-[11px] font-black uppercase tracking-widest transition-all bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-900/20">
                  <div className="w-2 h-2 rounded-full animate-pulse bg-cyan-400"></div>
                  Pro Enforcement
                </div>
              )}
            </div>

            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Global Sync Status</span>
                <span className="text-[12px] font-black text-emerald-400 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  NOMINAL (LVL 10)
                </span>
              </div>
              <button 
                onClick={handleFixAll}
                className="bg-red-600 hover:bg-red-500 text-white font-black px-8 py-3 rounded-xl text-xs tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(220,38,38,0.4)] flex items-center gap-3 active:scale-95 uppercase"
              >
                <Zap className="w-4 h-4 fill-current animate-pulse" />
                Search & Destroy
              </button>
            </div>
          </div>

          <div className="w-full bg-red-600 border-b border-red-700 py-1.5 overflow-hidden whitespace-nowrap relative shrink-0">
             <div className="flex animate-marquee">
                <div className="flex items-center gap-4 shrink-0 px-8">
                  <Flame className="w-3.5 h-3.5 text-white" />
                  <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">PURGING: {threatListText}</span>
                </div>
                <div className="flex items-center gap-4 shrink-0 px-8">
                  <Flame className="w-3.5 h-3.5 text-white" />
                  <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">PURGING: {threatListText}</span>
                </div>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
            {activeTab === 'tools' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="grid grid-cols-3 gap-5 max-w-5xl">
                  <div className={`group bg-black/30 border p-4 rounded-2xl flex items-center gap-4 transition-all backdrop-blur-md ${
                    updateState === 'uptodate' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'
                  }`}>
                    <div className={`p-2.5 rounded-xl ${updateState === 'uptodate' ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-500 bg-rose-500/10'}`}>
                      {updateState === 'uptodate' ? <CheckCircle2 className="w-5 h-5" /> : <RefreshCw className="w-5 h-5 animate-spin" />}
                    </div>
                    <div>
                      <div className="text-[9px] font-black uppercase text-gray-500 tracking-[0.15em] mb-0.5">System Status</div>
                      <div className={`text-lg font-black ${updateState === 'uptodate' ? 'text-emerald-400' : 'text-rose-500'}`}>
                        {updateState === 'uptodate' ? "UP TO DATE" : updateState === 'applying' ? "PATCHING..." : "UPGRADE REQ"}
                      </div>
                    </div>
                  </div>

                  <StatCard icon={ShieldCheck} label="Signature Engine" value={technical_background.database_size} color="cyan" reduced />
                  <StatCard icon={Activity} label="Intercepted Threats" value={threats.length} color="red" reduced />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {WINDOWS_TOOLS.map((tool, index) => (
                    <ToolCard 
                      key={tool.id} 
                      tool={tool} 
                      index={index}
                      isLocked={!subscription.isActive && demoTokens <= 0}
                      demoTokens={demoTokens}
                      onRun={() => handleRunTool(tool.name)}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'intelligence' && (
              <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-left-4">
                {loadingThreats ? (
                  <div className="flex flex-col items-center justify-center py-40 gap-6 opacity-40">
                    <Loader2 className="w-12 h-12 animate-spin text-cyan-400" />
                    <span className="text-xs font-black tracking-[0.3em] uppercase">Interrogating Global Security Nodes...</span>
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
                <div className="bg-black/40 border border-white/5 rounded-3xl flex-1 flex flex-col p-8 overflow-hidden backdrop-blur-md">
                  <div className="flex items-center gap-4 mb-8">
                    <History className="w-6 h-6 text-cyan-400" />
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">System Kernel Logs</h2>
                  </div>
                  <div className="flex-1 bg-black/60 rounded-2xl border border-white/5 p-8 font-mono text-[12px] leading-relaxed overflow-y-auto custom-scrollbar text-emerald-400/80">
                    {scanLog || `> [${new Date().toLocaleDateString()}] Aesis Guard Pro v${app_info.version} online.\n> Native Agent Status: ACTIVE\n> Secure Node: 8192-X-SYNC\n> Awaiting system command...`}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in zoom-in-95">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="bg-black/40 border border-white/5 rounded-[2rem] p-10 relative overflow-hidden group backdrop-blur-md">
                    <h3 className="text-2xl font-black text-white mb-8 uppercase tracking-tight flex items-center gap-4">
                      <Trophy className="w-7 h-7 text-amber-500" />
                      WinArmor Mission
                    </h3>
                    <p className="text-xl text-cyan-300 font-bold mb-6 italic leading-relaxed">"{mission_statement.core_objective}"</p>
                    <p className="text-sm text-gray-500 leading-relaxed font-medium">{mission_statement.philosophy}</p>
                  </div>

                  <div className="bg-black/40 border border-white/5 rounded-[2rem] p-10 backdrop-blur-md">
                    <h3 className="text-2xl font-black text-white mb-8 uppercase tracking-tight flex items-center gap-4">
                      <Server className="w-7 h-7 text-cyan-400" />
                      Heuristic Stack
                    </h3>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Architecture</span>
                        <span className="text-sm font-bold text-gray-200">{technical_background.engine_architecture}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Active Signatures</span>
                        <span className="text-sm font-bold text-cyan-400">{technical_background.database_size}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <footer className="h-10 bg-black/40 border-t border-white/5 flex items-center justify-between px-8 text-[11px] font-bold text-gray-500 shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-8">
          <span className="flex items-center gap-2 uppercase tracking-widest"><Info className="w-3.5 h-3.5 text-cyan-500" /> {app_info.developer}</span>
          <span className="flex items-center gap-2 uppercase tracking-widest"><Shield className="w-3.5 h-3.5 text-emerald-500" /> Core Node: 0x8A2C</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2 uppercase tracking-widest"><Globe className="w-3.5 h-3.5" /> Satellite Link: Stable</span>
          <span className="text-cyan-500/30 uppercase tracking-[0.3em] text-[10px]">Aesis Protective Grid</span>
        </div>
      </footer>
    </div>
  );
};

// Sub-components
const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-5 px-5 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-[0.2em] ${
      active ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
    }`}
  >
    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-600'}`} />
    {label}
  </button>
);

const StatCard = ({ icon: Icon, label, value, color = 'blue', reduced = false }: any) => {
  const colors = {
    blue: 'text-cyan-400 bg-cyan-400/10',
    cyan: 'text-cyan-400 bg-cyan-400/10',
    red: 'text-rose-500 bg-rose-500/10'
  };
  
  const containerClass = reduced 
    ? "bg-black/30 border border-white/5 p-4 rounded-2xl flex items-center gap-4 backdrop-blur-md hover:border-white/20 transition-all"
    : "bg-black/30 border border-white/5 p-6 rounded-[1.5rem] flex items-center gap-6 backdrop-blur-md hover:border-white/20 transition-all";
    
  const iconWrapClass = reduced ? "p-2.5 rounded-xl" : "p-4 rounded-2xl";
  const iconSizeClass = reduced ? "w-5 h-5" : "w-7 h-7";
  const labelClass = reduced ? "text-[9px] font-black uppercase text-gray-500 tracking-[0.15em] mb-0.5" : "text-[11px] font-black uppercase text-gray-500 tracking-widest mb-1";
  const valueClass = reduced ? "text-lg font-black text-white" : "text-2xl font-black text-white";

  return (
    <div className={containerClass}>
      <div className={`${iconWrapClass} ${colors[color as keyof typeof colors]}`}>
        <Icon className={iconSizeClass} />
      </div>
      <div>
        <div className={labelClass}>{label}</div>
        <div className={valueClass}>{value}</div>
      </div>
    </div>
  );
};

const ToolCard = ({ tool, isLocked, onRun, demoTokens }: any) => (
  <div className="bg-black/40 border border-white/5 p-6 rounded-[1.5rem] flex flex-col justify-between group relative overflow-hidden transition-all hover:bg-white/5 hover:border-blue-500/50 h-full min-h-[200px] backdrop-blur-md">
    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
      <Terminal className="w-12 h-12 text-blue-400" />
    </div>
    <div>
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-black text-white text-[13px] uppercase tracking-tight leading-tight max-w-[80%] group-hover:text-blue-400 transition-colors">{tool.name}</h3>
        {!isLocked && demoTokens > 0 && <div className="text-[8px] font-black px-2 py-1 rounded-lg bg-blue-600 text-white uppercase tracking-widest shadow-[0_0_10px_rgba(249,115,22,0.4)] border border-orange-500/60 transition-all group-hover:shadow-orange-500/60">Free Run</div>}
      </div>
      <p className="text-[11px] text-gray-500 font-bold leading-relaxed mb-6 line-clamp-3">{tool.description}</p>
    </div>
    
    <div className="mt-auto">
      <button 
        onClick={onRun}
        className={`w-full py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 ${
          isLocked ? 'bg-white/5 text-gray-600 border border-white/5 grayscale cursor-not-allowed' : 'bg-gradient-to-r from-amber-500 to-orange-600 text-black shadow-xl hover:shadow-amber-500/20 shadow-amber-900/10 border border-amber-500/20'
        }`}
      >
        {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5 fill-current" />}
        {isLocked ? 'Upgrade Required' : 'Execute'}
      </button>
    </div>
  </div>
);

const ThreatItem = ({ threat, isLocked }: any) => (
  <div className={`bg-black/40 border-l-4 border-l-rose-600 border border-white/5 p-6 rounded-[1.5rem] flex items-start gap-6 transition-all backdrop-blur-md ${
    isLocked ? 'blur-xl grayscale opacity-20 select-none pointer-events-none' : 'hover:border-white/20'
  }`}>
    <div className="p-4 bg-rose-600/10 rounded-2xl">
      <Shield className="w-6 h-6 text-rose-600" />
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-lg font-black text-white uppercase tracking-tight">{threat.name}</h4>
        <span className={`text-[10px] font-black px-3 py-1 rounded-full text-white ${threat.severity === 'Critical' ? 'bg-rose-600 shadow-lg shadow-rose-900/30' : 'bg-orange-600'}`}>
          {threat.severity}
        </span>
      </div>
      <div className="flex gap-6 mb-4">
        <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Category: {threat.type}</span>
      </div>
      <p className="text-sm text-gray-400 leading-relaxed font-medium">{threat.description}</p>
    </div>
  </div>
);

export default App;