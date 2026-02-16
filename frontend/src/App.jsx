import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, Send, Lock, XCircle, FilePlus, 
  List, Activity, Edit3, LogOut, Shield, Zap, ChevronRight, Search, Filter, Trash2, RotateCcw
} from 'lucide-react';

import { logout } from './store'; 
import BlueprintCreator from './components/BlueprintCreator';
import ContractEditor from './components/ContractEditor';
import Login from './components/Login';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function App() {
  const dispatch = useDispatch();
  const { token, user } = useSelector(state => state.auth);
  
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

  const createContract = async (blueprintId, bpName) => {
    const name = `${bpName} - ${new Date().toLocaleDateString('en-GB')}`;
    const promise = axios.post(`${API_URL}/contracts`, { blueprintId, name });
    toast.promise(promise, { loading: 'Deploying...', success: 'Deployed!', error: 'Failed' });
    await promise;
    fetchAll();
  };

  const changeStatus = async (id, nextStatus) => {
    const promise = axios.patch(`${API_URL}/contracts/${id}/status`, { nextStatus });
    toast.promise(promise, {
      loading: `Updating...`,
      success: `Status updated`,
      error: (err) => err.response?.data?.error || "Transition blocked"
    });
    try { await promise; fetchAll(); } catch (e) {}
  };

  const toggleArchive = async (id, isArchived) => {
    const nextStatus = isArchived ? 'CREATED' : 'REVOKED';
    await changeStatus(id, nextStatus);
  };

  const filteredContracts = contracts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    if (showArchived) return matchesSearch && c.status === 'REVOKED';
    return matchesSearch && matchesStatus && c.status !== 'REVOKED';
  });

  if (!token) return <Login />;

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900 font-sans selection:bg-indigo-100">
      <Toaster position="top-center" reverseOrder={false} />
      
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-2 rounded-xl text-white shadow-lg"><Zap size={20} fill="currentColor"/></div>
            <h1 className="text-lg md:text-xl font-black tracking-tighter">CONTRACT<span className="text-indigo-600">FLOW</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-800">{user?.name}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest tracking-tighter">Administrator</span>
            </div>
            <button onClick={() => dispatch(logout())} className="p-2 md:p-2.5 bg-slate-50 text-slate-400 hover:text-red-500 rounded-full transition-all"><LogOut size={20}/></button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{showArchived ? "Archive Vault" : "Management Console"}</h2>
            <div className="flex items-center gap-2 mt-1 text-slate-500">
              <Shield size={16} className={showArchived ? "text-red-500" : "text-emerald-500"} />
              <span className="text-xs md:text-sm font-medium tracking-tight">
                {showArchived ? "Reviewing Revoked Documents" : "LFM Protocol Version 3.0 Active"}
              </span>
            </div>
          </motion.div>

          <div className="flex gap-3 w-full md:w-auto">
            <button onClick={() => setShowArchived(!showArchived)} className={`flex-1 md:flex-none px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border ${showArchived ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                {showArchived ? <RotateCcw size={18}/> : <Trash2 size={18}/>}
                {showArchived ? "Back to Active" : "View Trash"}
            </button>
            <button onClick={() => setShowCreator(!showCreator)} className="flex-1 md:flex-none bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl transition-all flex items-center justify-center gap-2">
              {showCreator ? <List size={20}/> : <FilePlus size={20}/>}
              {showCreator ? "Dashboard" : "New Blueprint"}
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
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Quick Deploy Templates</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {blueprints.map(bp => (
                    <button key={bp._id} onClick={() => createContract(bp._id, bp.name)} className="flex-shrink-0 bg-white border border-slate-200 p-5 rounded-[2rem] hover:border-indigo-500 hover:shadow-xl group text-left w-64 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Activity size={20}/></div>
                        <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-md uppercase">{bp.fields?.length || 0} Fields</span>
                      </div>
                      <div className="font-bold text-slate-800 text-lg mb-1">{bp.name}</div>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {Array.from(new Set(bp.fields?.map(f => f.type))).map(type => (
                            <span key={type} className="text-[8px] font-bold border border-slate-100 text-slate-400 px-1.5 py-0.5 rounded uppercase">{type}</span>
                        ))}
                      </div>
                      <div className="text-[10px] font-bold text-indigo-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">Deploy Instance <ChevronRight size={12}/></div>
                    </button>
                  ))}
                </div>
              </section>
              )}

              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 bg-white p-3 md:p-4 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="Search documents..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                  </div>
                  {!showArchived && (
                  <div className="flex items-center gap-3 px-4 bg-slate-50 rounded-2xl border border-transparent focus-within:border-indigo-500 transition-all">
                    <Filter size={18} className="text-slate-400" />
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-transparent py-3 text-sm font-bold text-slate-600 outline-none cursor-pointer">
                      <option value="ALL">All States</option>
                      <option value="CREATED">Created</option>
                      <option value="APPROVED">Approved</option>
                      <option value="SENT">Sent</option>
                      <option value="SIGNED">Signed</option>
                      <option value="LOCKED">Locked</option>
                    </select>
                  </div>
                  )}
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
                  <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                      <tr>
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Document Identifier</th>
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Lifecycle State</th>
                        <th className="p-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredContracts.map(c => (
                        <motion.tr layout key={c._id} className="group hover:bg-slate-50/40 transition-all">
                          <td className="p-6 cursor-pointer" onClick={() => setSelectedContract(c)}>
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                <Edit3 size={20}/>
                              </div>
                              <div>
                                <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors text-lg tracking-tight">{c.name}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">History: {c.statusHistory.length} logs</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-6">
                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${
                              c.status === 'LOCKED' ? 'bg-slate-900 text-white shadow-lg' :
                              c.status === 'REVOKED' ? 'bg-red-500 text-white shadow-lg' :
                              c.status === 'SIGNED' ? 'bg-emerald-500 text-white shadow-lg' : 
                              'bg-indigo-600 text-white shadow-lg'
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="p-6 text-right">
                            <div className="flex justify-end gap-1.5">
                              {showArchived ? (
                                <button onClick={() => toggleArchive(c._id, true)} className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all" title="Restore"><RotateCcw size={18}/></button>
                              ) : (
                                <>
                                  {c.status === 'CREATED' && <button onClick={() => changeStatus(c._id, 'APPROVED')} className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all" title="Approve"><CheckCircle size={18}/></button>}
                                  {c.status === 'APPROVED' && <button onClick={() => changeStatus(c._id, 'SENT')} className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 text-orange-500 rounded-xl hover:bg-orange-500 hover:text-white transition-all" title="Send"><Send size={18}/></button>}
                                  {c.status === 'SENT' && <button onClick={() => changeStatus(c._id, 'SIGNED')} className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all" title="Sign"><CheckCircle size={18}/></button>}
                                  {c.status === 'SIGNED' && <button onClick={() => changeStatus(c._id, 'LOCKED')} className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all" title="Lock"><Lock size={18}/></button>}
                                  {['CREATED', 'SENT'].includes(c.status) && <button onClick={() => changeStatus(c._id, 'REVOKED')} className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all" title="Delete"><Trash2 size={18}/></button>}
                                </>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredContracts.length === 0 && (
                      <div className="py-20 text-center text-slate-400 font-medium">No documents found here.</div>
                  )}
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