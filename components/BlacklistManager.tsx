
import React, { useState } from 'react';
import { BlacklistedDomain } from '../types';
import { Trash2, Plus, ShieldAlert } from 'lucide-react';

interface BlacklistManagerProps {
  blacklist: BlacklistedDomain[];
  onAdd: (domain: string, reason: string) => void;
  onRemove: (id: string) => void;
}

const BlacklistManager: React.FC<BlacklistManagerProps> = ({ blacklist, onAdd, onRemove }) => {
  const [newDomain, setNewDomain] = useState('');
  const [newReason, setNewReason] = useState('');

  const handleAdd = () => {
    if (newDomain) {
      onAdd(newDomain, newReason || 'User defined risk');
      setNewDomain('');
      setNewReason('');
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <ShieldAlert className="text-red-500 w-5 h-5" />
        <h2 className="text-xl font-bold">Domain Blacklist Enforcement</h2>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="example-malicious.com" 
            className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
          />
          <button 
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <input 
          type="text" 
          placeholder="Reason (Optional)" 
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          value={newReason}
          onChange={(e) => setNewReason(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {blacklist.map((item) => (
          <div key={item.id} className="bg-gray-800/50 p-3 rounded flex justify-between items-center group hover:border-gray-600 border border-transparent transition-all">
            <div className="overflow-hidden">
              <div className="text-sm font-semibold truncate text-gray-200">{item.domain}</div>
              <div className="text-xs text-gray-500 truncate">{item.reason}</div>
            </div>
            <button 
              onClick={() => onRemove(item.id)}
              className="text-gray-600 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlacklistManager;
