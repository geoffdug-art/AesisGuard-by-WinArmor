
import React, { useState } from 'react';
import { X, Check, ShieldCheck, Zap, CreditCard, Loader2, ChevronDown, Wallet, Smartphone, Landmark } from 'lucide-react';
import { SubscriptionTier } from '../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (tier: SubscriptionTier) => void;
}

const PLANS = [
  { id: '1DAY', name: '1 Day Pass', price: 1.99, description: 'Emergency quick fix' },
  { id: '1MONTH', name: '1 Month', price: 4.99, description: 'Standard protection' },
  { id: '6MONTHS', name: '6 Months', price: 7.99, description: 'Most popular choice', badge: 'BEST VALUE' },
  { id: '1YEAR', name: '1 Year', price: 12.99, description: 'Long-term security' },
  { id: 'LIFETIME', name: 'Lifetime', price: 18.99, description: 'Forever protected', badge: 'ELITE' },
];

const PAYMENT_METHODS = [
  { id: 'paypal', name: 'PayPal', icon: Wallet, color: 'text-blue-500' },
  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, color: 'text-gray-400' },
  { id: 'google', name: 'Google Pay', icon: Smartphone, color: 'text-green-500' },
  { id: 'apple', name: 'Apple Pay', icon: Smartphone, color: 'text-white' },
  { id: 'bank', name: 'Bank Transfer', icon: Landmark, color: 'text-amber-500' },
];

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onPurchase }) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>('6MONTHS');
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!isOpen) return null;

  const handleCheckout = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      onPurchase(selectedPlan as SubscriptionTier);
      setIsProcessing(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-[#0f1115] border border-gray-800 rounded-2xl w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col md:flex-row shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300">
        
        {/* Left Side: Features */}
        <div className="w-full md:w-1/3 bg-gradient-to-br from-blue-700 to-blue-900 p-10 text-white flex flex-col justify-between">
          <div>
            <div className="bg-white/20 p-4 rounded-2xl w-fit mb-8 shadow-xl">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h2 className="text-4xl font-black mb-6 tracking-tight">Enterprise Protection</h2>
            <p className="text-blue-100 mb-10 text-sm leading-relaxed opacity-90">
              WinArmor Pro gives you the full suite of forensic Windows security tools used by professionals to purge persistent malware.
            </p>
            <ul className="space-y-5">
              {[
                'Rootkit Offline Detection', 
                'Registry Integrity Monitor', 
                'Deep Network Packet Purge', 
                'Real-time Threat Intelligence Feed',
                'One-Click "FIX-ALL" Automation'
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm font-bold">
                  <div className="bg-blue-400/40 rounded-full p-1 mt-0.5"><Check className="w-3 h-3" /></div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8 pt-8 border-t border-blue-400/30 text-[10px] text-blue-200 uppercase tracking-[0.2em] font-bold">
            Authorized Security License
          </div>
        </div>

        {/* Right Side: Plans & Checkout */}
        <div className="w-full md:w-2/3 p-10 flex flex-col bg-[#0a0b0d]">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-2xl font-black text-white">License Selection</h3>
              <p className="text-gray-500 text-sm">Choose your coverage duration</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-xl transition-all">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 mb-8">
            {PLANS.map((plan) => (
              <label 
                key={plan.id}
                className={`group relative flex items-center justify-between p-5 border-2 rounded-2xl cursor-pointer transition-all ${
                  selectedPlan === plan.id 
                    ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
                    : 'border-gray-800 hover:border-gray-700 bg-gray-900/40'
                }`}
              >
                <input 
                  type="radio" 
                  name="plan" 
                  className="hidden" 
                  checked={selectedPlan === plan.id}
                  onChange={() => setSelectedPlan(plan.id)}
                />
                <div className="flex items-center gap-5">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPlan === plan.id ? 'border-blue-500' : 'border-gray-600'}`}>
                    {selectedPlan === plan.id && <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-lg text-white group-hover:text-blue-300 transition-colors">{plan.name}</span>
                      {plan.badge && (
                        <span className="text-[10px] px-2 py-1 rounded-lg font-black bg-blue-500 text-white shadow-lg">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 font-medium">{plan.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-white">${plan.price}</div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">USD / One-time</div>
                </div>
              </label>
            ))}
          </div>

          <div className="space-y-4">
            <div className="relative">
              <label className="text-[10px] uppercase font-black text-gray-500 mb-2 block tracking-widest">Payment Method</label>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-gray-900 border-2 border-gray-800 rounded-xl px-5 py-4 flex items-center justify-between hover:border-gray-700 transition-all text-white font-bold"
              >
                <div className="flex items-center gap-3">
                  <selectedMethod.icon className={`w-5 h-5 ${selectedMethod.color}`} />
                  {selectedMethod.name}
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute bottom-full left-0 w-full mb-2 bg-[#161b22] border-2 border-gray-800 rounded-2xl overflow-hidden z-20 shadow-2xl animate-in slide-in-from-bottom-2 duration-200">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => {
                        setSelectedMethod(method);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-5 py-4 text-left hover:bg-gray-800 flex items-center gap-4 text-sm font-bold border-b border-gray-800 last:border-0"
                    >
                      <method.icon className={`w-5 h-5 ${method.color}`} />
                      <span className="text-gray-200">{method.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              disabled={isProcessing}
              onClick={handleCheckout}
              className={`w-full py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 shadow-2xl ${
                selectedMethod.id === 'paypal' ? 'bg-[#ffc439] hover:bg-[#f2ba36] text-[#003087]' : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {isProcessing ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  {selectedMethod.id === 'paypal' ? (
                    <div className="flex items-center font-serif text-2xl italic font-black">
                      <span>Pay</span><span className="text-blue-600">Pal</span>
                    </div>
                  ) : (
                    <span className="text-lg">Finalize Transaction</span>
                  )}
                </>
              )}
            </button>
          </div>
          
          <div className="mt-6 flex items-center justify-between text-[10px] text-gray-600 font-bold uppercase tracking-widest px-2">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> PCI DSS COMPLIANT</span>
            <span>Ref: {Math.random().toString(36).substring(7).toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
