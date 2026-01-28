'use client';
import Header from '@/components/Header';
import ManagingDirectorLayout from '@/components/ManagingDirectorLayout';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ManagingDirectorPage() {
    const { t } = useLanguage();
    return (
        <ManagingDirectorLayout>
            <Header title={t('managing_director')} subtitle={t('dashboard')} />

            <div className="px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Dashboard Cards with Premium White Theme */}
                    <div className="bg-white p-6 rounded-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border border-slate-100 group hover:border-blue-100 hover:shadow-lg transition-all duration-300">
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{t('staff_requests')}</h3>
                        <p className="text-4xl font-black text-slate-900 mt-3 group-hover:scale-105 transition-transform origin-left">12</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">{t('pending_review')}</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border border-slate-100 group hover:border-indigo-100 hover:shadow-lg transition-all duration-300">
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{t('ac_decisions')}</h3>
                        <p className="text-4xl font-black text-slate-900 mt-3 group-hover:scale-105 transition-transform origin-left">5</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">{t('ready_for_action')}</p>
                    </div>
                </div>

                <div className="mt-8 bg-white rounded-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border border-slate-100 p-8">
                    <h2 className="text-xl font-black text-slate-900 mb-4 tracking-tight">{t('strategic_overview')}</h2>
                    <p className="text-slate-500 font-medium">{t('no_critical_alerts')}</p>
                </div>
            </div>
        </ManagingDirectorLayout>
    );
}
