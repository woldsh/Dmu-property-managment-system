'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import RegisterUser from '@/components/RegisterUser';
import {
  FiLogOut,
  FiUser,
  FiGrid,
  FiUsers,
  FiActivity,
  FiSettings,
  FiPlusCircle,
  FiDatabase,
  FiShield
} from 'react-icons/fi';

export default function AdminPage() {
  const { user, loading, logout, isAdmin } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('registration');

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-6 text-slate-500 font-bold tracking-widest text-xs uppercase animate-pulse">Initializing Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Enhanced Admin Sidebar */}
      <aside className="w-full md:w-72 bg-slate-950 text-slate-300 flex flex-col border-r border-slate-900 shadow-2xl z-20 transition-all duration-300">
        {/* Sidebar Header */}
        <div className="p-8 border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20 ring-2 ring-white/10 group-hover:scale-110 transition-transform">
              <FiShield className="text-2xl" />
            </div>
            <div>
              <h2 className="text-white font-black tracking-tighter text-xl">ADMIN</h2>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] opacity-80">Root Control</p>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Area */}
        <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2 custom-admin-scrollbar">
          <div className="px-4 mb-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main Modules</p>
          </div>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${activeTab === 'dashboard' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30' : 'hover:bg-slate-900 hover:text-white hover:translate-x-1'}`}
          >
            <div className={`p-2 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-white/20' : 'bg-slate-900 group-hover:text-blue-400'}`}>
              <FiGrid className="text-lg" />
            </div>
            <span className="font-bold text-sm tracking-tight">System Intelligence</span>
          </button>

          <button
            onClick={() => setActiveTab('registration')}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${activeTab === 'registration' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30' : 'hover:bg-slate-900 hover:text-white hover:translate-x-1'}`}
          >
            <div className={`p-2 rounded-lg transition-colors ${activeTab === 'registration' ? 'bg-white/20' : 'bg-slate-900 group-hover:text-blue-400'}`}>
              <FiPlusCircle className="text-lg" />
            </div>
            <span className="font-bold text-sm tracking-tight">Identity Enrollment</span>
          </button>

          <div className="px-4 mt-10 mb-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Advanced Tools</p>
          </div>

          {[
            { label: 'User Directory', icon: FiUsers },
            { label: 'Activity Logs', icon: FiActivity },
            { label: 'Infrastructure', icon: FiDatabase },
            { label: 'Global Settings', icon: FiSettings }
          ].map((item, idx) => (
            <button key={idx} className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group hover:bg-slate-900 hover:text-white hover:translate-x-1 opacity-60 cursor-not-allowed">
              <div className="p-2 bg-slate-900 rounded-lg group-hover:text-amber-400">
                <item.icon className="text-lg" />
              </div>
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
            </button>
          ))}

          {/* Extra items for scrolling demonstration */}
          <div className="h-40"></div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
          <div className="bg-slate-900/50 rounded-2xl p-4 mb-6 border border-slate-800/50 flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-700 text-white font-black shadow-lg">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950"></div>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black text-white truncate tracking-tight">{user.email?.split('@')[0]}</p>
              <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest opacity-80">Admin Space</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white font-black py-4 px-4 rounded-xl transition-all duration-500 border border-rose-500/20 group overflow-hidden relative shadow-lg hover:shadow-rose-500/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer_fast"></div>
            <FiLogOut className="text-lg group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-sm uppercase tracking-widest">Kill Session</span>
          </button>
        </div>
      </aside>


      {/* Main Viewport */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Modern Top Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between z-10">
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              {activeTab === 'registration' ? 'Administrative Enrollment' : 'System Intelligence'}
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Secure Environment • Active
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex flex-col items-end border-r border-slate-200 pr-6 mr-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Current Session ID</p>
              <p className="text-xs font-mono font-bold text-slate-700 tracking-wider">ADM-X-772-B</p>
            </div>
            <div className="flex items-center gap-3 pointer-events-none">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              <span className="text-xs font-black text-slate-600 uppercase tracking-tighter">Live Connection</span>
            </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === 'dashboard' ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
              {/* Quick Intelligence Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Base Users', value: '142', icon: FiUsers, color: 'blue' },
                  { label: 'System Uptime', value: '99.9%', icon: FiActivity, color: 'emerald' },
                  { label: 'Pending Requests', value: '12', icon: FiDatabase, color: 'amber' },
                  { label: 'Active Sessions', value: '24', icon: FiShield, color: 'indigo' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 bg-${stat.color}-50 text-${stat.color}-600 rounded-xl group-hover:bg-${stat.color}-600 group-hover:text-white transition-colors`}>
                        <stat.icon className="text-xl" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</h4>
                      <p className="text-3xl font-black text-slate-800 mt-1 tracking-tight">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Maintenance Notice */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white flex flex-col lg:flex-row items-center justify-between gap-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-black tracking-tight mb-2">System Maintenance Window</h3>
                  <p className="text-blue-100 font-medium max-w-xl opacity-90">Scheduled security patches and database optimization will commence on Saturday at 23:00 UTC. System availability may be intermittent during this 120-minute window.</p>
                </div>
                <button className="relative z-10 bg-white text-blue-600 font-black px-8 py-3 rounded-xl shadow-xl hover:bg-blue-50 transition-all hover:-translate-y-1 active:translate-y-0 whitespace-nowrap">
                  View Detailed Specs
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom duration-500">
              {/* Registration Component Container */}
              <div className="max-w-4xl mx-auto">
                <div className="mb-10 text-center md:text-left">
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">Identity Provisioning</h2>
                  <p className="text-slate-500 font-medium mt-2">Initialize new user credentials and map them to appropriate system permissions.</p>
                </div>
                <RegisterUser />
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        .custom-admin-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-admin-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-admin-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-admin-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
        @keyframes shimmer_fast {
          100% { transform: translateX(100%); }
        }
        .group-hover\:animate-shimmer_fast {
          animation: shimmer_fast 1s infinite;
        }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .slide-in-from-bottom { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}
