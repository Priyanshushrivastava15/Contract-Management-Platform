import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, Send, Lock, FilePlus, List, Activity, 
  Edit3, LogOut, Shield, Zap, ChevronRight, Search, 
  Trash2, RotateCcw, Moon, Sun, Type, Calendar, CheckSquare, PenTool 
} from 'lucide-react';

import { logout } from './store'; 
import BlueprintCreator from './components/BlueprintCreator';
import ContractEditor from './components/ContractEditor';
import Login from './components/Login';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function App() {
  const dispatch = useDispatch();
  const { token, user } = useSelector(state => state.auth);
  
  const [darkMode, setDarkMode] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [blueprints, setBlueprints] = useState([]);
  const [showCreator, setShowCreator] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchAll();
    }
  }, [token]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const fetchAll = async () => {
    try {
      const [contRes, bpRes] = await Promise.all([
        axios.get(`${API_URL}/contracts`),
        axios.get(`${API_URL}/blueprints`)
      ]);
      setContracts(contRes.data);
      setBlueprints(bpRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        dispatch(logout());
        toast.error("Session expired");
      }
    }
  };

  const deleteBlueprint = async (id) => {
    if (!window.confirm("Delete this template?")) return;
    try {
      await axios.delete(`${API_URL}/blueprints/${id}`);
      toast.success("Template removed");
      fetchAll();
    } catch (err) {
      toast.error("Could not delete template");
    }
  };

  const createContract = async (blueprintId, bpName) => {
    const name = `${bpName} - ${new Date().toLocaleDateString('en-GB')}`;
    try {
      const promise = axios.post(`${API_URL}/contracts`, { blueprintId, name });
      toast.promise(promise, { loading: 'Deploying...', success: 'Deployed!', error: 'Failed' });
      await promise; 
      await fetchAll(); 
    } catch (err) { console.error(err); }
  };

  const changeStatus = async (id, nextStatus) => {
    try {
      const promise = axios.patch(`${API_URL}/contracts/${id}/status`, { nextStatus });
      toast.promise(promise, {
        loading: `Updating...`,
        success: `Status updated`,
        error: (err) => err.response?.data?.error || "Transition blocked"
      });
      await promise;
      await fetchAll();
    } catch (e) {}
  };

  const filteredContracts = contracts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    if (showArchived) return matchesSearch && c.status === 'REVOKED';
    return matchesSearch && matchesStatus && c.status !== 'REVOKED';
  });

  if (!token) return <Login />;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-slate-950 text-[#ff4c4c]' : 'bg-[#F8FAFC] text-[#ff4c4c]'} font-sans`}>
      <Toaster position="top-center" />
      
      <nav className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg"><Zap size={20} fill="currentColor"/></div>
            <h1 className="text-lg md:text-xl font-black tracking-tighter">
              <span className="text-[#ff4c4c]">CONTRACT</span>
              <span className="text-indigo-600">FLOW</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 rounded-full transition-all">
              {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
            </button>
            <div className="hidden md:flex flex-col items-end px-2 border-r border-slate-200 dark:border-slate-700 mr-2">
              <span className="text-sm font-bold text-[#ff4c4c]">{user?.name}</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Admin</span>
            </div>
            <button onClick={() => dispatch(logout())} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-full transition-all"><LogOut size={20}/></button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-10">
        {!showCreator && !showArchived && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            {[
              { label: 'Total active', count: contracts.filter(c => c.status !== 'REVOKED').length, icon: <List size={18}/>, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Pending Sign', count: contracts.filter(c => c.status === 'SENT').length, icon: <Edit3 size={18}/>, color: 'text-amber-500', bg: 'bg-amber-50' },
              { label: 'Completed', count: contracts.filter(c => c.status === 'LOCKED').length, icon: <Lock size={18}/>, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Revoked', count: contracts.filter(c => c.status === 'REVOKED').length, icon: <Trash2 size={18}/>, color: 'text-rose-500', bg: 'bg-rose-50' }
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all flex items-center gap-5">
                <div className={`p-3 rounded-2xl ${darkMode ? 'bg-slate-800' : stat.bg} ${stat.color}`}>{stat.icon}</div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{stat.label}</p>
                  <p className="text-2xl font-black text-[#ff4c4c]">{stat.count}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#ff4c4c]">
              {showArchived ? "Archive Vault" : "Management Console"}
            </h2>
            <div className="flex items-center gap-2 mt-2 text-slate-400">
              <Shield size={16} className={showArchived ? "text-rose-500" : "text-indigo-500"} />
              <span className="text-xs font-bold uppercase tracking-widest">Protocol v3.1 • Active Security</span>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button onClick={() => setShowArchived(!showArchived)} 
              className={`flex-1 md:flex-none px-6 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border 
              ${showArchived ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'}`}>
                {showArchived ? <RotateCcw size={18}/> : <Trash2 size={18}/>}
                <span className="text-sm">{showArchived ? "Back to Active" : "Trash"}</span>
            </button>
            <button onClick={() => setShowCreator(!showCreator)} 
              className={`flex-1 md:flex-none px-8 py-3.5 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2 transition-all 
              ${darkMode ? 'bg-indigo-600 text-white shadow-none' : 'bg-slate-900 text-white shadow-slate-200'}`}>
              {showCreator ? <List size={20}/> : <FilePlus size={20}/>}
              <span className="text-sm">{showCreator ? "Dashboard" : "New Blueprint"}</span>
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {showCreator ? (
            <motion.div key="creator" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <BlueprintCreator onCreated={() => { setShowCreator(false); fetchAll(); }} />
            </motion.div>
          ) : (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {!showArchived && (
              <section>
                <div className="flex items-center gap-2 mb-5 ml-1">
                   <div className="w-1 h-4 bg-indigo-600 rounded-full"></div>
                   <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Quick Deploy Templates</h3>
                </div>
                <div className="flex gap-5 overflow-x-auto pb-6 no-scrollbar">
                  {blueprints.map(bp => (
                    <div key={bp._id} className="relative group flex-shrink-0">
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2.5rem] hover:border-indigo-500 hover:shadow-xl group transition-all w-72">
                        <div className="flex justify-between items-start mb-6">
                          <button onClick={() => createContract(bp._id, bp.name)} className="w-12 h-12 bg-indigo-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                            <Activity size={24}/>
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); deleteBlueprint(bp._id); }} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <Trash2 size={16}/>
                          </button>
                        </div>
                        <div className="font-bold text-xl mb-2 leading-tight text-[#ff4c4c]">{bp.name}</div>
                        
                        <div className="flex gap-2 mb-6">
                          {Array.from(new Set(bp.fields.map(f => f.type))).map(type => (
                            <div key={type} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400" title={type}>
                              {type === 'text' && <Type size={14} />}
                              {type === 'date' && <Calendar size={14} />}
                              {type === 'checkbox' && <CheckSquare size={14} />}
                              {type === 'signature' && <PenTool size={14} />}
                            </div>
                          ))}
                        </div>
                        <button onClick={() => createContract(bp._id, bp.name)} className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase flex items-center gap-1.5 hover:translate-x-1 transition-all tracking-widest">
                          Deploy Instance <ChevronRight size={14}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              )}

              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input type="text" placeholder="Search document identifiers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-[#ff4c4c] placeholder:text-slate-400 text-sm font-medium" />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden overflow-x-auto transition-all">
                  <table className="w-full text-left min-w-[700px]">
                    <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Document</th>
                        <th className="p-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">State</th>
                        <th className="p-6 text-right text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredContracts.map(c => (
                        <motion.tr layout key={c._id} className="group hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition-all">
                          <td className="p-6 cursor-pointer" onClick={() => setSelectedContract(c)}>
                            <div className="flex items-center gap-5">
                              <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                <Edit3 size={24}/>
                              </div>
                              <div>
                                <div className="font-bold text-[#ff4c4c] group-hover:text-indigo-600 transition-colors text-lg tracking-tight mb-1">{c.name}</div>
                                <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Ref: {c.blueprintId?.name || "Original Blueprint"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-6">
                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border transition-all ${
                              c.status === 'LOCKED' ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900' :
                              c.status === 'REVOKED' ? 'bg-rose-500 text-white border-rose-500' :
                              c.status === 'SIGNED' ? 'bg-emerald-500 text-white border-emerald-500' : 
                              'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100 dark:shadow-none'
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="p-6 text-right">
                            <div className="flex justify-end gap-2">
                              {showArchived ? (
                                <button onClick={() => changeStatus(c._id, 'CREATED')} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><RotateCcw size={18}/></button>
                              ) : (
                                <>
                                  {c.status === 'CREATED' && <button onClick={() => changeStatus(c._id, 'APPROVED')} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><CheckCircle size={18}/></button>}
                                  {c.status === 'APPROVED' && <button onClick={() => changeStatus(c._id, 'SENT')} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-amber-500 rounded-xl hover:bg-amber-500 hover:text-white transition-all shadow-sm"><Send size={18}/></button>}
                                  {['CREATED', 'SENT'].includes(c.status) && <button onClick={() => changeStatus(c._id, 'REVOKED')} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"><Trash2 size={18}/></button>}
                                </>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {selectedContract && (
        <ContractEditor 
          contract={selectedContract} 
          onClose={() => setSelectedContract(null)} 
          onSave={() => { setSelectedContract(null); fetchAll(); }} 
        />
      )}
    </div>
  );
}