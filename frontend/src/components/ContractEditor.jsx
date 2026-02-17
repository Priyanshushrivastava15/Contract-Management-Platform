import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, X, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ContractEditor({ contract, onSave, onClose }) {
  const [fields, setFields] = useState(contract?.fields || []);

  // Fixed synchronization for switching between contracts
  useEffect(() => {
    if (contract) {
      setFields(contract.fields || []);
    }
  }, [contract]);

  const handleChange = (id, value) => {
    setFields(fields.map(f => f.id === id ? { ...f, value } : f));
  };

  const handleSave = async () => {
    try {
      await axios.put(`${API_URL}/contracts/${contract._id}`, { fields });
      toast.success("Document updated successfully!");
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.error || "Save failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col md:flex-row overflow-hidden border border-slate-200">
        
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          <div className="p-6 border-b flex justify-between items-center bg-slate-50">
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">{contract.name}</h2>
              <p className="text-[10px] text-indigo-600 uppercase tracking-widest font-bold">Secure Data Entry Mode</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 md:hidden transition-colors">
              <X />
            </button>
          </div>

          <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
            {fields.map((field) => (
              <div key={field.id} className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-tight ml-1">{field.label}</label>
                
                {field.type === 'text' && (
                  <input 
                    type="text" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300"
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                    value={field.value || ""}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                  />
                )}

                {field.type === 'date' && (
                  <input 
                    type="date" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={field.value || ""}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                  />
                )}

                {field.type === 'checkbox' && (
                  <label className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                      checked={field.value === true}
                      onChange={(e) => handleChange(field.id, e.target.checked)}
                    />
                    <span className="text-sm font-semibold text-slate-700">Acknowledge & Verify Information</span>
                  </label>
                )}

                {field.type === 'signature' && (
                  <div className="space-y-2">
                    <div className="h-20 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center bg-slate-50 italic text-slate-400 transition-all">
                       {field.value ? (
                         <span className="font-serif text-slate-800 text-2xl tracking-tighter">/ {field.value} /</span>
                       ) : "Digital Signature Pending"}
                    </div>
                    <input 
                      type="text" 
                      placeholder="Type your full name to sign"
                      className="w-full p-2 text-sm border-b border-slate-200 outline-none focus:border-indigo-500 text-center bg-transparent transition-all"
                      onChange={(e) => handleChange(field.id, e.target.value)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-6 border-t bg-slate-50 flex gap-3 mt-auto">
            <button 
              onClick={handleSave}
              disabled={['LOCKED', 'REVOKED'].includes(contract.status)}
              className="w-full bg-slate-900 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg active:scale-[0.98]"
            >
              <Save size={18} /> Update Document
            </button>
          </div>
        </div>

        <div className="w-full md:w-64 bg-slate-900 p-6 text-white overflow-y-auto border-l border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold flex items-center gap-2 text-sm tracking-tight">
              <Clock size={16} className="text-indigo-400" /> Audit Timeline
            </h3>
            <button onClick={onClose} className="hidden md:block text-slate-500 hover:text-white transition-colors">
              <X size={20}/>
            </button>
          </div>

          <div className="relative space-y-8">
            <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-slate-800"></div>

            {contract.statusHistory?.map((log, i) => (
              <div key={i} className="relative pl-8">
                <div className="absolute left-0 top-1.5 w-5 h-5 bg-indigo-500 rounded-full border-4 border-slate-900 flex items-center justify-center shadow-lg">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
                <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">{log.to}</p>
                <p className="text-[9px] text-slate-500 font-bold">{new Date(log.at).toLocaleString()}</p>
              </div>
            ))}
            
            <div className="relative pl-8">
               <div className="absolute left-0 top-1.5 w-5 h-5 bg-emerald-500 rounded-full border-4 border-slate-900 flex items-center justify-center animate-pulse shadow-lg">
                  <CheckCircle2 size={10} className="text-white" />
                </div>
                <p className="text-xs font-black text-white uppercase tracking-tighter">Current: {contract.status}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}