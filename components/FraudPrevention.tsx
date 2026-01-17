import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserCheck, AlertTriangle, Loader2 } from 'lucide-react';

interface FraudPreventionProps {
  onValidated: (score: number) => void;
}

const FraudPrevention: React.FC<FraudPreventionProps> = ({ onValidated }) => {
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'completed'>('idle');
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    setStatus('analyzing');
    // Simulate reCAPTCHA v3 behavioral signal collection and backend assessment
    const timer = setTimeout(() => {
      const humanScore = 0.75 + Math.random() * 0.25; // Simulated score: 1.0 is highly human
      setScore(humanScore);
      setStatus('completed');
      onValidated(humanScore);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onValidated]);

  return (
    <div className="bg-black/60 border border-white/10 rounded-[2.5rem] p-12 backdrop-blur-xl flex flex-col items-center justify-center text-center space-y-8 shadow-[0_0_80px_rgba(34,211,238,0.1)] max-w-lg mx-auto">
      {status === 'analyzing' ? (
        <>
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl animate-pulse"></div>
            <Loader2 className="w-20 h-20 text-cyan-500 animate-spin relative z-10" />
            <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-cyan-300 relative z-10" />
          </div>
          <div>
            <h4 className="text-xl font-black text-white uppercase tracking-[0.2em] mb-2">Fraud Prevention Agent</h4>
            <p className="text-[11px] text-cyan-400 font-black uppercase tracking-widest opacity-80 animate-pulse">
              Assessing Behavioral Signals & Network Integrity...
            </p>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5 max-w-[200px]">
            <div className="h-full bg-cyan-500 animate-[loading_3s_ease-in-out_infinite]"></div>
          </div>
        </>
      ) : (
        <>
          <div className={`p-6 rounded-full relative ${score! > 0.7 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            <div className={`absolute inset-0 rounded-full blur-xl opacity-50 ${score! > 0.7 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
            {score! > 0.7 ? <UserCheck className="w-16 h-16 relative z-10" /> : <AlertTriangle className="w-16 h-16 relative z-10" />}
          </div>
          <div>
            <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Behavioral Audit Complete</h4>
            <div className="mt-4 flex flex-col items-center gap-2">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Confidence Index (reCAPTCHA v3)</span>
              <span className={`text-4xl font-mono font-black ${score! > 0.7 ? 'text-emerald-400' : 'text-red-400'}`}>
                {(score! * 10).toFixed(1)}/10.0
              </span>
            </div>
            <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] text-gray-400 font-bold uppercase leading-relaxed tracking-wider">
                  {score! > 0.7 
                    ? 'No automated patterns detected. Integrity Verified. Transaction proceeding to secure node.' 
                    : 'Anomalous behavior detected. Anti-bot mitigation triggered. Manual verification required.'}
                </p>
            </div>
          </div>
        </>
      )}
      <style>{`
        @keyframes loading {
          0% { width: 0%; transform: translateX(0); }
          50% { width: 100%; transform: translateX(0); }
          100% { width: 0%; transform: translateX(200px); }
        }
      `}</style>
    </div>
  );
};

export default FraudPrevention;