import React, { useState, useEffect } from 'react';
import { ScanStatus } from '../types';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface ScannerOverlayProps {
  status: ScanStatus;
  onComplete: () => void;
  title?: string;
  isCreatingRestorePoint?: boolean;
}

const FILE_PATHS = [
  'C:\\Windows\\System32\\drivers\\etc\\hosts',
  'C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions',
  'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run',
  'C:\\Windows\\System32\\ntoskrnl.exe',
  'C:\\Windows\\System32\\lsass.exe',
  'C:\\Users\\Public\\Downloads\\hidden_installer.tmp',
  'C:\\Windows\\Temp\\~DF3821.tmp',
  'Network Stack: Port 8080 (ESTABLISHED)',
  'Browser: Cookies Analysis (Cross-Site Tracking detected)',
  'Registry: Shell Open Command override check'
];

const ScannerOverlay: React.FC<ScannerOverlayProps> = ({ status, onComplete, title, isCreatingRestorePoint }) => {
  const [currentFile, setCurrentFile] = useState('');
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    if (status === ScanStatus.SCANNING && !isCreatingRestorePoint) {
      let currentIdx = 0;
      const interval = setInterval(() => {
        if (currentIdx < FILE_PATHS.length) {
          const file = FILE_PATHS[currentIdx];
          setCurrentFile(file);
          setLog(prev => [...prev.slice(-8), `[SCAN] Checking: ${file}`]);
          setProgress(Math.round(((currentIdx + 1) / FILE_PATHS.length) * 100));
          currentIdx++;
        } else {
          clearInterval(interval);
          setTimeout(() => onComplete(), 1000);
        }
      }, 300);
      return () => clearInterval(interval);
    } else if (status === ScanStatus.IDLE) {
      setLog([]);
      setProgress(0);
      setCurrentFile('');
    }
  }, [status, isCreatingRestorePoint, onComplete]);

  if (status === ScanStatus.IDLE) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6 backdrop-blur-md">
      <div className="w-full max-w-3xl relative border border-blue-500/30 rounded-lg p-8 bg-gray-900 shadow-2xl overflow-hidden">
        <div className="scan-line"></div>
        
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-blue-400 mono uppercase">
            {isCreatingRestorePoint 
              ? 'INITIALIZING SAFETY PROTOCOL' 
              : (title || 'SYSTEM DEEP SCAN IN PROGRESS')}
          </h2>
          <div className="text-blue-500 font-bold mono">{isCreatingRestorePoint ? '--' : `${progress}%`}</div>
        </div>

        {/* Restore Point Status indicator */}
        {isCreatingRestorePoint && (
          <div className="flex items-center gap-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-8 animate-pulse">
            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            <div className="flex-1">
              <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Mandatory Protection</div>
              <div className="text-sm font-bold text-white">Creating Windows System Restore Point...</div>
            </div>
          </div>
        )}

        <div className="w-full bg-gray-800 rounded-full h-4 mb-8 overflow-hidden border border-gray-700">
          <div 
            className={`h-full transition-all duration-300 shadow-[0_0_10px_#3b82f6] ${isCreatingRestorePoint ? 'bg-blue-400/30 w-full' : 'bg-blue-600'}`} 
            style={{ width: isCreatingRestorePoint ? '100%' : `${progress}%` }}
          ></div>
        </div>

        <div className="bg-black/50 p-4 rounded border border-gray-800 h-64 overflow-y-auto mb-6">
          <div className="text-green-500 mono text-sm mb-2">Initialize Core.System.Heuristics... OK</div>
          {isCreatingRestorePoint ? (
            <div className="text-yellow-500 mono text-sm mb-2 animate-pulse">[VSS] Communicating with Volume Shadow Copy Service...</div>
          ) : (
            <>
              <div className="text-green-500 mono text-sm mb-2">System Restore Point Checkpoint: AX-SEC-SNAPSHOT... OK</div>
              <div className="text-green-500 mono text-sm mb-2">Connecting to Global Threat Intelligence... OK</div>
              {title && <div className="text-yellow-500 mono text-sm mb-2">Executing Module: {title}... ACTIVE</div>}
              {log.map((line, i) => (
                <div key={i} className="text-blue-300 mono text-xs mb-1 font-light">{line}</div>
              ))}
            </>
          )}
          {!isCreatingRestorePoint && currentFile && (
            <div className="text-blue-400 mono text-sm mt-4 animate-pulse">
              &gt; {currentFile}
            </div>
          )}
        </div>

        <div className="flex justify-center">
            <div className="text-xs text-gray-500 uppercase tracking-widest animate-pulse">
                Engaging Windows Native Security Interface v10.0.22631
            </div>
        </div>
      </div>
    </div>
  );
};

export default ScannerOverlay;