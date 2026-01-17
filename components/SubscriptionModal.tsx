import React, { useState, useEffect } from 'react';
import { X, Check, ShieldCheck, Zap, CreditCard, Loader2, Gift, ShoppingBag, ArrowLeft, Plus } from 'lucide-react';
import { SubscriptionTier, CartItem } from '../types';
import ShoppingCart from './ShoppingCart';
import FraudPrevention from './FraudPrevention';

interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  price: number;
  description: string;
  category: string;
  badge?: string;
  benefits: string[];
}

const PLANS: SubscriptionPlan[] = [
  { 
    id: '1DAY', 
    name: 'Emergency Pass', 
    price: 1.99, 
    category: 'TEMPORARY',
    description: '24h full system clearance',
    benefits: ['One-time deep scan', 'Priority virus removal', 'Adware shield active for 24h']
  },
  { 
    id: '1MONTH', 
    name: 'Basic Shield', 
    price: 4.99, 
    category: 'SUBSCRIPTION',
    description: 'Entry-level monthly protection',
    benefits: ['Standard heuristic scanner', 'Basic domain blacklist', 'Community support']
  },
  { 
    id: '6MONTHS', 
    name: 'Advanced Protection', 
    price: 7.99, 
    category: 'SUBSCRIPTION',
    description: 'Most popular for active users', 
    badge: 'BEST VALUE',
    benefits: ['Dynamic Threat Map access', 'Heuristic Purge (Search & Destroy)', 'Custom Blacklist management']
  },
  { 
    id: '1YEAR', 
    name: 'Pro Engine', 
    price: 12.99, 
    category: 'SUBSCRIPTION',
    description: 'For heavy system users',
    benefits: ['Offline Rootkit scanner', 'Native Agent deployment', 'Network Stack reset tools']
  },
  { 
    id: 'LIFETIME', 
    name: 'Elite Commander', 
    price: 18.99, 
    category: 'PERPETUAL',
    description: 'Forever secure, forever pro', 
    badge: 'ELITE',
    benefits: ['All Pro features forever', 'Early Zero-Day access', 'Heuristic Stack API access']
  },
];

const ADDONS: CartItem[] = [
  { id: 'zero-day', name: 'Zero-Day Priority+', price: 2.50, quantity: 1, category: 'MODULE', description: 'Early heuristic definitions' },
  { id: 'agent-2fa', name: 'Native Agent 2FA', price: 1.00, quantity: 1, category: 'SECURITY', description: 'Multi-factor device auth' },
  { id: 'global-sync', name: 'Global Threat Sync+', price: 1.50, quantity: 1, category: 'DATA', description: 'Real-time peer analysis' },
  { id: 'registry-harden', name: 'Registry Hardener', price: 3.99, quantity: 1, category: 'SYSTEM', description: 'Lock sensitive hives' },
];

const VALID_PROMO_CODES = [
  "AESI01", "GD66X9", "PRO77B", "WIN88Z", "ARM05Y", 
  "SEC11Q", "DEU22P", "XRT33L", "KOP44M", "ZXC55N"
];

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (tier: SubscriptionTier) => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onPurchase }) => {
  const [view, setView] = useState<'store' | 'checkout' | 'fraud'>('store');
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('winarmor_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  useEffect(() => {
    localStorage.setItem('winarmor_cart', JSON.stringify(cart));
  }, [cart]);

  if (!isOpen) return null;

  const addToCart = (item: CartItem | SubscriptionPlan) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { 
        id: item.id, 
        name: item.name, 
        price: item.price, 
        quantity: 1, 
        category: (item as any).category || 'Plan',
        description: item.description 
      }];
    });
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const handleCheckout = () => {
    setView('fraud');
  };

  const handleFraudValidated = (score: number) => {
    if (score > 0.7) {
      setIsProcessing(true);
      setTimeout(() => {
        // Find the most prominent subscription in the cart
        const subItem = cart.find(i => ['1DAY', '1MONTH', '6MONTHS', '1YEAR', 'LIFETIME'].includes(i.id));
        onPurchase((subItem?.id as SubscriptionTier) || '1MONTH');
        setCart([]);
        localStorage.removeItem('winarmor_cart');
        setIsProcessing(false);
      }, 2500);
    } else {
      setView('store');
    }
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (VALID_PROMO_CODES.includes(code)) {
      setPromoStatus('valid');
      setIsProcessing(true);
      setTimeout(() => {
        onPurchase('LIFETIME');
        setCart([]);
        localStorage.removeItem('winarmor_cart');
        setIsProcessing(false);
      }, 1500);
    } else {
      setPromoStatus('invalid');
      setTimeout(() => setPromoStatus('idle'), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-[#050608] border border-white/10 rounded-[3rem] w-full max-w-7xl h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-[0_0_120px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-500">
        
        {/* Main Interface */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Header */}
          <div className="h-20 border-b border-white/5 px-10 flex items-center justify-between shrink-0 bg-white/2">
             <div className="flex items-center gap-6">
               {view !== 'store' && (
                 <button onClick={() => setView('store')} className="p-3 hover:bg-white/10 rounded-2xl text-gray-400 transition-all active:scale-90"><ArrowLeft /></button>
               )}
               <h2 className="text-2xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
                 <ShieldCheck className="w-6 h-6 text-cyan-400" />
                 {view === 'store' ? 'Armor Command Store' : 'Checkout Protection'}
               </h2>
             </div>
             <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl text-gray-500 transition-all hover:text-white"><X className="w-6 h-6" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
            {view === 'store' && (
              <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Plans Grid */}
                <div>
                  <div className="flex items-center gap-4 mb-10">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.4em]">License Tiers</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {PLANS.map(plan => (
                      <div key={plan.id} className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] hover:border-cyan-500/40 transition-all group relative overflow-hidden flex flex-col shadow-lg hover:shadow-cyan-900/10">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">{plan.category}</div>
                            <h4 className="text-2xl font-black text-white uppercase leading-tight group-hover:text-cyan-300 transition-colors">{plan.name}</h4>
                          </div>
                          {plan.badge && <span className="bg-cyan-600 text-[9px] font-black px-3 py-1.5 rounded-xl shadow-lg border border-cyan-400/30">{plan.badge}</span>}
                        </div>
                        <p className="text-xs text-gray-500 font-bold mb-10 flex-1 leading-relaxed">{plan.description}</p>
                        <div className="flex items-end justify-between">
                          <div>
                            <span className="text-3xl font-black text-white">${plan.price}</span>
                            <span className="text-[10px] text-gray-600 font-black uppercase ml-1 tracking-widest">USD</span>
                          </div>
                          <button 
                            onClick={() => addToCart(plan)}
                            className="p-4 bg-white/5 hover:bg-cyan-600 hover:text-white text-gray-400 rounded-2xl transition-all active:scale-90 border border-white/5 group-hover:border-cyan-500/30"
                          >
                            <Plus className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Addons Grid */}
                <div>
                  <div className="flex items-center gap-4 mb-10">
                    <ShoppingBag className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.4em]">Heuristic Add-ons</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {ADDONS.map(addon => (
                      <div key={addon.id} className="bg-white/5 border border-white/5 p-6 rounded-3xl flex items-center justify-between group hover:border-emerald-500/40 transition-all">
                        <div className="flex items-center gap-5">
                          <div className="p-4 bg-white/5 rounded-2xl text-gray-500 group-hover:text-emerald-400 transition-colors border border-white/5">
                            <Plus className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">{addon.category}</div>
                            <div className="text-base font-black text-white uppercase">{addon.name}</div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">${addon.price.toFixed(2)}</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => addToCart(addon)}
                          className="px-6 py-3 bg-white/5 hover:bg-emerald-600 text-white text-[10px] font-black uppercase rounded-xl transition-all border border-white/5"
                        >
                          Add Module
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Promo Activation */}
                <div className="bg-gradient-to-br from-blue-900/10 to-black/40 border border-blue-500/20 rounded-[3rem] p-10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-12 transition-transform">
                    <Gift className="w-32 h-32 text-blue-400" />
                  </div>
                  <div className="flex items-center gap-6 mb-8 relative z-10">
                    <div className="p-4 bg-blue-500/20 rounded-2xl text-blue-400 border border-blue-500/30">
                      <Gift className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-white uppercase tracking-tight">Deployment Authorization</h4>
                      <p className="text-xs text-gray-500 font-medium">Bypass transaction layer with an encrypted access key</p>
                    </div>
                  </div>
                  <div className="flex gap-4 relative z-10 max-w-2xl">
                    <input 
                      type="text" 
                      placeholder="ENTER 6-DIGIT KEY" 
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      maxLength={6}
                      className={`flex-1 bg-black/60 border rounded-2xl px-8 py-5 text-white font-mono font-black focus:outline-none transition-all uppercase tracking-widest text-lg ${
                        promoStatus === 'invalid' ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : promoStatus === 'valid' ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'border-white/10'
                      }`}
                    />
                    <button 
                      onClick={handleApplyPromo}
                      disabled={promoCode.length < 6 || isProcessing}
                      className="px-12 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl text-[11px] uppercase tracking-[0.2em] transition-all disabled:opacity-30 border border-white/10"
                    >
                      {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Authorize'}
                    </button>
                  </div>
                  {promoStatus === 'invalid' && <p className="text-red-500 text-[10px] font-black uppercase mt-4 tracking-widest animate-pulse">Unauthorized Cryptographic Key</p>}
                  {promoStatus === 'valid' && <p className="text-emerald-500 text-[10px] font-black uppercase mt-4 tracking-widest animate-pulse">Key Validated. Unlocking Global License...</p>}
                </div>
              </div>
            )}

            {view === 'fraud' && (
              <div className="h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-500 py-10">
                 <FraudPrevention onValidated={handleFraudValidated} />
                 {isProcessing && (
                   <div className="mt-12 flex flex-col items-center gap-4 text-cyan-400 animate-pulse">
                     <Loader2 className="w-10 h-10 animate-spin" />
                     <span className="text-[11px] font-black uppercase tracking-[0.4em]">Finalizing Security Token...</span>
                   </div>
                 )}
              </div>
            )}
          </div>
        </div>

        {/* Persistent Sidebar Shopping Cart */}
        <div className="w-full md:w-[450px] border-l border-white/5 bg-black/40 p-10 shrink-0 relative flex flex-col h-full">
           <ShoppingCart 
              items={cart} 
              onUpdateQuantity={updateCartQuantity} 
              onRemove={removeFromCart} 
              onCheckout={handleCheckout} 
           />
           <div className="mt-8 flex items-center justify-center gap-6 opacity-30">
              <CreditCard className="w-6 h-6 text-gray-500" />
              <div className="h-px w-8 bg-gray-500"></div>
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
           </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;