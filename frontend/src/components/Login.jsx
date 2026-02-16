import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setAuth } from '../store';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, User, ArrowRight, Zap } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Login() {
  const dispatch = useDispatch();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = isLogin ? '/auth/login' : '/auth/register';

    try {
      const res = await axios.post(`${API_URL}${endpoint}`, formData);
      
      if (isLogin) {
        dispatch(setAuth({ user: res.data.user, token: res.data.token }));
        toast.success(`Welcome back, ${res.data.user.name}!`);
      } else {
        toast.success("Account created! Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-xl shadow-indigo-200 mb-4">
            <Zap size={32} fill="currentColor"/>
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-slate-900">
            CONTRACT<span className="text-indigo-600">FLOW</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Enterprise Document Lifecycle</p>
        </div>

        {/* Card */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {isLogin ? "Enter your credentials to access the console" : "Join the professional contract management network"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative"
                >
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                  <input 
                    type="text" 
                    placeholder="Full Name"
                    required={!isLogin}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
              <input 
                type="email" 
                placeholder="Email Address"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
              <input 
                type="password" 
                placeholder="Password"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button 
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl active:scale-95 disabled:opacity-50"
            >
              {loading ? "Processing..." : isLogin ? "Login to Console" : "Register Now"}
              <ArrowRight size={18}/>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already a member? Sign in"}
            </button>
          </div>
        </div>
        
        {/* Decorative footer */}
        <p className="text-center text-slate-400 text-[10px] mt-8 uppercase tracking-[0.2em] font-black">
          Powered by ContractFlow LFM Protocol
        </p>
      </motion.div>
    </div>
  );
}