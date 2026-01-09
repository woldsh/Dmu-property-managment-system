'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import RegisterUser from '@/components/RegisterUser';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiLogOut,
  FiUser,
  FiGrid,
  FiUsers,
  FiActivity,
  FiSettings,
  FiPlusCircle,
  FiDatabase,
  FiShield,
  FiMoon,
  FiSun,
  FiZap,
  FiLock,
  FiTrendingUp,
  FiLayers,
  FiBriefcase,
  FiDollarSign,
  FiHome,
  FiCoffee
} from 'react-icons/fi';

export default function AdminPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('registration');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020205] flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative w-24 h-24">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-t-4 border-r-4 border-blue-500 rounded-full"
            />
            <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <FiShield className="text-3xl text-blue-500 animate-pulse" />
            </div>
          </div>
          <p className="mt-8 text-white font-black tracking-[0.5em] text-[10px] uppercase animate-pulse">Establishing Secure Link</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#020205] text-white flex flex-col md:flex-row h-screen overflow-hidden selection:bg-blue-500/30">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-indigo-600/10 blur-[150px] rounded-full" />
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-purple-600/5 blur-[120px] rounded-full" />
      </div>

      <aside className="w-full md:w-80 bg-black/40 backdrop-blur-3xl border-r border-white/5 flex flex-col z-30 relative shadow-[20px_0_40px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-50" />

        <div className="p-10 relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-colors duration-700" />
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 ring-1 ring-white/20 transition-all duration-500">
              <FiShield className="text-3xl" />
            </div>
            <div>
              <h2 className="text-2xl font-black italic tracking-tighter leading-none">CORE <span className="text-blue-500 font-normal not-italic">HUB</span></h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em]">Institutional Admin</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-6 space-y-3 custom-admin-scrollbar">
          <div className="px-4 mb-6">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Main Modules</p>
          </div>

          {[
            { id: 'dashboard', label: 'System Intel', icon: FiGrid, color: 'blue' },
            { id: 'registration', label: 'Identity Provision', icon: FiPlusCircle, color: 'blue' },
            { id: 'departmental', label: 'Dept Administration', icon: FiLayers, color: 'purple' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full relative flex items-center gap-4 px-5 py-4 rounded-3xl transition-all duration-500 group overflow-hidden ${activeTab === item.id
                ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/10 text-white border border-white/10 shadow-xl'
                : 'hover:bg-white/5 text-slate-400 hover:text-white'
                }`}
            >
              <div className={`p-2.5 rounded-xl transition-all duration-500 ${activeTab === item.id
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white/5 group-hover:bg-blue-500/20 group-hover:text-blue-400'
                }`}>
                <item.icon className="text-xl" />
              </div>
              <span className="font-black text-sm tracking-tight">{item.label}</span>
              {activeTab === item.id && (
                <div className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,1)]" />
              )}
            </button>
          ))}

          <div className="px-4 mt-12 mb-6">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Restricted Tools</p>
          </div>

          {[
            { label: 'Asset Ledger', icon: FiDatabase },
            { label: 'Personnel Registry', icon: FiUsers },
            { label: 'Network Relay', icon: FiActivity },
            { label: 'Root Config', icon: FiSettings }
          ].map((item, idx) => (
            <div key={idx} className="w-full flex items-center gap-4 px-5 py-4 opacity-30 cursor-not-allowed group grayscale">
              <div className="p-2.5 bg-white/5 rounded-xl">
                <item.icon className="text-xl" />
              </div>
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
              <FiLock className="ml-auto text-xs" />
            </div>
          ))}
        </nav>

        <div className="p-8 mt-auto relative">
          <div className="relative z-10">
            <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-5 border border-white/10 flex items-center gap-5 hover:bg-white/10 transition-all duration-500 group/profile mb-8">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 flex items-center justify-center border border-white/10 text-white font-black shadow-2xl">
                  <span className="relative z-10 text-xl">{user.email?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-black box-content shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-black text-white truncate tracking-tight mb-0.5">{user.email?.split('@')[0]}</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em]">Authorized Root</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full group relative h-16 rounded-[1.75rem] bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white transition-all duration-700 active:scale-95 shadow-lg border border-rose-500/20 hover:border-rose-500 overflow-hidden"
            >
              <div className="relative flex items-center justify-center gap-4 text-[11px] font-black uppercase tracking-[0.3em]">
                <FiLogOut className="text-lg" />
                <span>Terminal Exit</span>
              </div>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative z-10 bg-gradient-to-br from-white/[0.02] to-transparent">
        <header className="px-12 py-8 flex items-center justify-between border-b border-white/5 relative bg-black/10">
          <div className="flex items-center gap-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest leading-none">Status: Encrypted</span>
                </div>
                <div className="h-px w-8 bg-white/10" />
                <p className="text-[11px] font-mono font-bold text-slate-500">{currentTime.toLocaleTimeString()}</p>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                {activeTab === 'registration' ? 'Identity Enrollment' :
                  activeTab === 'departmental' ? 'Functional Domains' :
                    'System Intelligence'}
              </h1>
            </div>

            <div className="hidden lg:flex flex-col items-start border-l border-white/5 pl-10 gap-1">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Workspace</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-1 bg-blue-600 rounded-full" />
                <p className="text-xs font-mono font-bold text-blue-500 tracking-tighter">DC-DMU-BUR-01</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="bg-white/5 p-4 rounded-3xl border border-white/10 flex items-center gap-5 shadow-2xl">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <FiZap className="text-xl text-white" />
              </div>
              <div className="pr-4">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Global Load</p>
                <p className="text-xl font-black text-white leading-none tracking-tight">0.82ms</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="h-full"
            >
              {activeTab === 'dashboard' ? (
                <div className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                      { label: 'Total Base Users', value: '1,422', icon: FiUsers, color: 'blue', trend: '+12%', sub: 'Active registry' },
                      { label: 'Cloud Uptime', value: '99.98%', icon: FiActivity, color: 'emerald', trend: 'Stable', sub: 'Regional cluster' },
                      { label: 'Pending Auth', value: '12', icon: FiDatabase, color: 'amber', trend: '-4', sub: 'Needs attention' },
                      { label: 'Secure Sessions', value: '84', icon: FiLock, color: 'indigo', trend: '+5%', sub: 'Current uplink' }
                    ].map((stat, i) => (
                      <div key={i} className="group relative bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/5 hover:border-white/20 transition-all duration-700 overflow-hidden shadow-2xl">
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-black border border-white/5 flex items-center justify-center transition-all duration-500">
                              <stat.icon className={`text-2xl ${stat.color === 'blue' ? 'text-blue-500' : stat.color === 'emerald' ? 'text-emerald-500' : stat.color === 'amber' ? 'text-amber-500' : 'text-indigo-500'}`} />
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${stat.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/40'}`}>
                              {stat.trend}
                            </div>
                          </div>
                          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">{stat.label}</h4>
                          <p className="text-4xl font-black text-white tracking-tighter mb-2">{stat.value}</p>
                          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{stat.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-black/80 backdrop-blur-2xl rounded-[3rem] p-12 border border-blue-500/10 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-2xl">
                    <div className="relative z-10 space-y-6">
                      <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                        <FiActivity /> System Relay Operational
                      </div>
                      <h3 className="text-5xl font-black text-white tracking-[-0.03em] leading-none uppercase italic">Global Network <br /><span className="text-blue-600 not-italic">Diagnostic Center</span></h3>
                      <p className="text-lg text-slate-400 font-medium max-w-2xl leading-relaxed">Identity protocols are currently operating at peak efficiency. All administrative nodes report green across regional clusters.</p>

                      <div className="flex flex-wrap gap-8 pt-6 border-t border-white/5">
                        {[{ label: 'Node Latitude', val: '9.03' }, { label: 'Relay Sync', val: '00:04s' }, { label: 'Threat Index', val: 'Low' }].map((item, idx) => (
                          <div key={idx}>
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.25em] mb-1">{item.label}</p>
                            <p className="text-2xl font-black text-white tracking-tighter italic">{item.val}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button className="relative w-full lg:w-72 h-72 flex flex-col items-center justify-center rounded-[3rem] bg-white text-black font-black transition-all hover:scale-105 active:scale-95 shadow-2xl group">
                      <FiTrendingUp className="text-5xl mb-4 group-hover:scale-110 transition-transform" />
                      <span className="text-sm uppercase tracking-widest">Run Audit</span>
                    </button>
                  </div>
                </div>
              ) : activeTab === 'registration' ? (
                <div className="max-w-5xl mx-auto pb-20">
                  <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-16 text-center">
                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6">
                      <FiLock /> Secure Enrollment Terminal
                    </div>
                    <h2 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-none mb-4">Identity <span className="text-blue-600 not-italic">Provisioning</span></h2>
                    <p className="text-slate-500 font-medium text-xl max-w-2xl mx-auto italic mt-6">Initialize new institutional accounts with automated role assignment.</p>
                  </motion.div>
                  <div className="relative bg-white/[0.02] border border-white/5 p-12 rounded-[3.5rem] shadow-3xl">
                    <RegisterUser />
                  </div>
                </div>
              ) : (
                <div className="space-y-12 pb-20">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12 text-center">
                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest mb-6">
                      <FiLayers /> Functional Domains
                    </div>
                    <h2 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-none mb-4">Departmental <span className="text-purple-600 not-italic">Control</span></h2>
                    <p className="text-slate-500 font-medium text-xl max-w-2xl mx-auto">Oversee and allocate resources across the institutional hierarchical services.</p>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { id: 'hrm', label: 'Human Resources', icon: FiBriefcase, color: 'purple', subs: ['Payroll', 'Staff Registry'] },
                      { id: 'finance', label: 'Fiscal Hub', icon: FiDollarSign, color: 'blue', subs: ['Budget', 'Audit Log'] },
                      { id: 'student_service', label: 'Student Services', icon: FiActivity, color: 'emerald', subs: ['Overall Leadership', 'Dormitory', 'Cafeteria', 'Sport'] }
                    ].map((dept, i) => (
                      <div key={i} className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] hover:border-purple-500/30 transition-all flex flex-col group relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                          <div className={`w-14 h-14 rounded-2xl bg-black border border-white/5 flex items-center justify-center text-${dept.color}-500`}>
                            <dept.icon className="text-3xl" />
                          </div>
                          <button onClick={() => setActiveTab('registration')} className="px-4 py-2 bg-white/5 text-[9px] font-black uppercase rounded-xl hover:bg-white hover:text-black transition-all">Enroll</button>
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase italic mb-4">{dept.label}</h3>
                        <div className="flex flex-wrap gap-2 mt-auto">
                          {dept.subs.map((s, idx) => (
                            <span key={idx} className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black uppercase text-slate-500 border border-white/5">{s}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-br from-emerald-600/10 to-transparent border border-emerald-500/10 rounded-[3.5rem] p-12 flex flex-col lg:flex-row items-center justify-between gap-12">
                    <div className="space-y-6 flex-1">
                      <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                        <FiActivity /> Life Support Cluster
                      </div>
                      <h3 className="text-4xl font-black text-white uppercase italic">Enhanced <span className="text-emerald-500 not-italic">Student Services</span></h3>
                      <p className="text-lg text-slate-400 leading-relaxed max-w-xl">Centralized oversight via the **Student Service Leader**. Manage reporting lines for Dormitory, Cafeteria, and Sport hierarchies with institutional precision.</p>

                      <div className="flex gap-8 pt-4">
                        {[{ l: 'Dormitory', i: FiHome }, { l: 'Cafeteria', i: FiCoffee }, { l: 'Sport', i: FiActivity }].map((s, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <s.i className="text-emerald-500 text-xl" />
                            <span className="text-xs font-black text-white uppercase">{s.l}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/60 p-8 rounded-3xl border border-white/5 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Leaders</p>
                        <p className="text-4xl font-black text-white italic">24</p>
                      </div>
                      <div className="bg-black/60 p-8 rounded-3xl border border-white/5 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Staff</p>
                        <p className="text-4xl font-black text-white italic">156</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <style jsx global>{`
        .custom-admin-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-admin-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-admin-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
}
