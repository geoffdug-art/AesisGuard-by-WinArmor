import React from 'react';
import { Threat } from '../types';
import { ShieldAlert, Zap, AlertCircle, Ghost } from 'lucide-react';

interface ThreatMapProps {
  threats: Threat[];
}

const ThreatMap: React.FC<ThreatMapProps> = ({ threats }) => {
  // Simple equirectangular projection for the SVG
  const getCoords = (lat: number, lng: number) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };

  const getIcon = (type: string, severity: string) => {
    const color = severity === 'Critical' ? 'text-red-500' : severity === 'High' ? 'text-orange-500' : 'text-yellow-500';
    switch (type) {
      case 'Ransomware': return <ShieldAlert className={`w-4 h-4 ${color}`} />;
      case 'Trojan': return <Ghost className={`w-4 h-4 ${color}`} />;
      case 'Spyware': return <Zap className={`w-4 h-4 ${color}`} />;
      default: return <AlertCircle className={`w-4 h-4 ${color}`} />;
    }
  };

  return (
    <div className="relative w-full bg-black/40 border border-white/10 rounded-[2rem] overflow-hidden p-6 mb-8 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Global Threat Vector Visualization</h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> Critical
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div> High
          </div>
        </div>
      </div>

      <div className="relative aspect-[2/1] w-full">
        <svg viewBox="0 0 800 400" className="w-full h-full opacity-20 filter grayscale contrast-125">
          {/* Simplified World Map Paths */}
          <path fill="currentColor" className="text-blue-500" d="M100,150 L120,140 L150,160 L180,150 L200,180 L180,220 L150,210 L120,230 Z M300,100 L350,80 L400,100 L420,150 L400,200 L350,220 L300,200 Z M500,120 L550,110 L600,130 L620,180 L600,240 L550,260 L500,230 Z M650,200 L700,190 L750,210 L760,260 L730,300 L680,290 Z M150,300 L200,280 L250,300 L260,350 L220,380 L170,360 Z" />
          <circle cx="400" cy="200" r="180" fill="none" stroke="currentColor" className="text-blue-500/10" strokeWidth="0.5" />
          <line x1="0" y1="200" x2="800" y2="200" stroke="currentColor" className="text-blue-500/5" strokeWidth="0.5" />
          <line x1="400" y1="0" x2="400" y2="400" stroke="currentColor" className="text-blue-500/5" strokeWidth="0.5" />
        </svg>

        {/* Dynamic Markers */}
        <div className="absolute inset-0">
          {threats.map((threat, i) => {
            const { x, y } = getCoords(threat.origin.lat, threat.origin.lng);
            const severityColor = threat.severity === 'Critical' ? 'bg-red-500' : threat.severity === 'High' ? 'bg-orange-500' : 'bg-yellow-500';
            
            return (
              <div 
                key={i} 
                className="absolute transition-all duration-1000 group"
                style={{ left: `${(x / 800) * 100}%`, top: `${(y / 400) * 100}%` }}
              >
                <div className="relative -translate-x-1/2 -translate-y-1/2">
                  <div className={`absolute inset-0 rounded-full blur-md animate-ping ${severityColor} opacity-40`} />
                  <div className={`w-8 h-8 rounded-full border border-white/20 bg-black/80 flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-125 z-10`}>
                    {getIcon(threat.type, threat.severity)}
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    <div className="bg-black/90 border border-white/10 p-3 rounded-xl whitespace-nowrap backdrop-blur-md shadow-2xl">
                      <div className="text-[10px] font-black uppercase text-cyan-400 mb-1">{threat.name}</div>
                      <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{threat.origin.country}</div>
                      <div className={`text-[8px] font-black uppercase mt-1 ${threat.severity === 'Critical' ? 'text-red-500' : 'text-orange-500'}`}>{threat.severity} Risk</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-4 flex gap-6 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
        {threats.map((threat, i) => (
          <div key={i} className="shrink-0 flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
            <div className={`w-2 h-2 rounded-full ${threat.severity === 'Critical' ? 'bg-red-500' : 'bg-orange-500'}`} />
            <span className="text-[9px] font-black uppercase text-gray-300 tracking-widest whitespace-nowrap">{threat.origin.country}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThreatMap;