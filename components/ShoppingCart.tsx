import React from 'react';
import { ShoppingCart as CartIcon, Trash2, Plus, Minus, Package, ArrowRight } from 'lucide-react';
import { CartItem } from '../types';

interface ShoppingCartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({ items, onUpdateQuantity, onRemove, onCheckout }) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="bg-black/60 border border-white/10 rounded-3xl flex flex-col h-full overflow-hidden shadow-2xl backdrop-blur-xl">
      <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-600/20 rounded-xl text-cyan-400">
            <CartIcon className="w-5 h-5" />
          </div>
          <h3 className="font-black text-white uppercase tracking-tighter text-lg">Order Manifest</h3>
        </div>
        <span className="text-[10px] font-black text-gray-400 uppercase bg-white/5 px-3 py-1 rounded-full border border-white/10">
          {items.reduce((acc, curr) => acc + curr.quantity, 0)} Units
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30 py-20">
            <Package className="w-12 h-12 text-gray-400" />
            <p className="text-xs font-black uppercase tracking-[0.2em]">Manifest Empty</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex gap-4 group hover:border-cyan-500/30 transition-all">
              <div className="flex-1">
                <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">{item.category}</div>
                <div className="font-black text-white text-sm uppercase mb-1 truncate max-w-[180px]">{item.name}</div>
                <div className="text-lg font-mono font-black text-white">${(item.price * item.quantity).toFixed(2)}</div>
              </div>
              
              <div className="flex flex-col justify-between items-end">
                <button 
                  onClick={() => onRemove(item.id)}
                  className="text-gray-500 hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-3 bg-black/40 rounded-lg p-1 border border-white/10">
                  <button onClick={() => onUpdateQuantity(item.id, -1)} className="p-1 hover:text-white transition-colors"><Minus className="w-3 h-3" /></button>
                  <span className="text-xs font-black w-4 text-center text-white">{item.quantity}</span>
                  <button onClick={() => onUpdateQuantity(item.id, 1)} className="p-1 hover:text-white transition-colors"><Plus className="w-3 h-3" /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="p-8 border-t border-white/10 bg-white/5 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Settlement</div>
              <div className="text-3xl font-black text-white tracking-tighter">${subtotal.toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Status: Valid</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Secure Link</div>
            </div>
          </div>
          
          <button 
            onClick={onCheckout}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-cyan-900/30 flex items-center justify-center gap-3 group"
          >
            Authorize Purchase
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;