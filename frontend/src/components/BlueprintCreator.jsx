import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { 
  Plus, Trash2, Save, Type, Calendar, 
  CheckSquare, PenTool, LayoutGrid 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function BlueprintCreator({ onCreated }) {
  const { token } = useSelector(state => state.auth);
  const [name, setName] = useState('');
  const [fields, setFields] = useState([]);

  const addField = () => {
    const newField = { 
      id: Date.now().toString(), 
      type: 'text', 
      label: '',
      position: { x: 0, y: fields.length }
    };
    setFields([...fields, newField]);
  };

  const updateField = (id, key, value) => {
    setFields(fields.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const removeField = (id) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const saveBlueprint = async () => {
    if (!name.trim()) return toast.error("Please enter a blueprint name");
    if (fields.length === 0) return toast.error("Add at least one field to your template");
    if (fields.some(f => !f.label.trim())) return toast.error("All fields must have a label");

    const sanitizedFields = fields.map(f => ({
      ...f,
      value: f.type === 'date' ? new Date().toISOString().split('T')[0] : ""
    }));

    try {
      const promise = axios.post(`${API_URL}/blueprints`, 
        { name, fields: sanitizedFields },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.promise(promise, {
        loading: 'Architecting blueprint...',
        success: 'Template published successfully!',
        error: (err) => err.response?.data?.error || 'Failed to save blueprint'
      });

      await promise;
      setName('');
      setFields([]);
      if (onCreated) onCreated();
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 max-w-4xl mx-auto transition-colors duration-300"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 dark:bg-indigo-600 p-3 rounded-2xl text-white">
            <LayoutGrid size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Template Architect</h2>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">Structural Design Mode</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={saveBlueprint} 
            className="flex-1 md:flex-none bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none active:scale-95"
          >
            <Save size={18} /> Publish Blueprint
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <div className="relative group">
          <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest ml-1 mb-2 block">
            Blueprint Identity
          </label>
          <input 
            type="text" 
            placeholder="e.g., NDA Agreement v1.0" 
            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">
              Schema Definitions ({fields.length})
            </label>
          </div>

          <AnimatePresence>
            {fields.map((field) => (
              <motion.div 
                key={field.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col md:flex-row gap-4 p-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl group relative transition-colors duration-300"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5 ml-1">
                    <Type size={12} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Field Label</span>
                  </div>
                  <input 
                    type="text" 
                    placeholder="e.g. Client Full Name" 
                    className="w-full bg-transparent border-b border-slate-200 dark:border-slate-600 focus:border-indigo-500 outline-none py-1 font-bold text-slate-700 dark:text-slate-200 transition-colors"
                    value={field.label}
                    onChange={(e) => updateField(field.id, 'label', e.target.value)}
                  />
                </div>

                <div className="flex flex-row md:flex-col gap-4">
                  <div className="flex flex-1 gap-2">
                    <select 
                      className="flex-1 md:w-48 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                      value={field.type}
                      onChange={(e) => updateField(field.id, 'type', e.target.value)}
                    >
                      <option value="text">Text Input</option>
                      <option value="date">Date Picker</option>
                      <option value="checkbox">Boolean Checkbox</option>
                      <option value="signature">Legal Signature</option>
                    </select>
                    <button 
                      onClick={() => removeField(field.id)} 
                      className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                      title="Remove Field"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={addField} 
            className="w-full py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl text-slate-400 font-bold flex items-center justify-center gap-3 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all group"
          >
            <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 transition-colors">
              <Plus size={20} />
            </div>
            <span>Append Schema Field</span>
          </motion.button>
        </div>
      </div>
      
      {fields.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-center gap-8">
            <div className="flex items-center gap-2 opacity-30 dark:opacity-50 dark:text-white">
                <Calendar size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Date Ready</span>
            </div>
            <div className="flex items-center gap-2 opacity-30 dark:opacity-50 dark:text-white">
                <CheckSquare size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Logic Ready</span>
            </div>
            <div className="flex items-center gap-2 opacity-30 dark:opacity-50 dark:text-white">
                <PenTool size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Legal Ready</span>
            </div>
        </div>
      )}
    </motion.div>
  );
}