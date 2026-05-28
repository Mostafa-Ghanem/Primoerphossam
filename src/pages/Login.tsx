import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Car, Mail, Lock, UserCircle } from 'lucide-react';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface LoginProps {
  onLogin: (user: CurrentUser) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        onLogin(data);
      } else {
        setError(data.error || 'الايميل أو كلمة المرور غير صحيحة');
      }
    } catch (err) {
      setError('فشل الاتصال بالخادم. تأكد من أن النظام يعمل.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 font-sans rtl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-20 h-20 bg-primary/10 text-primary flex items-center justify-center rounded-[2rem] mb-4 shadow-xl shadow-primary/20">
            <Car size={40} className="stroke-[2.5]" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">PRIMO ERP</h1>
          <p className="text-slate-500 mt-2 font-medium">سجل الدخول لإدارة المغسلة وحساباتك</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 space-y-6 relative overflow-hidden">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 text-red-500 p-4 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <div className="space-y-2 text-right">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 px-1">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl pr-12 pl-4 py-4 focus:ring-2 focus:ring-primary/20 outline-none font-bold text-left"
                placeholder="admin@primo.com"
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-2 text-right">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 px-1">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl pr-12 pl-4 py-4 focus:ring-2 focus:ring-primary/20 outline-none font-bold text-left tracking-widest"
                placeholder="••••••"
                dir="ltr"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full py-5 bg-primary text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-primary/30 hover:bg-primary-dark hover:-translate-y-1 transition-all active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative flex items-center gap-2">
              {isLoading && <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />}
              تسجيل الدخول
              <UserCircle size={24} />
            </span>
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-8 font-medium">
          نظام بريمو لإدارة المغاسل والكافيهات © 2026
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
