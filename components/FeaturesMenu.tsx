
import React from 'react';
import { ViewType } from '../types.ts';

interface FeaturesMenuProps {
  onNavigate: (view: ViewType) => void;
  onClose: () => void;
  activeView: ViewType;
  t: (key: string) => string;
}

const FeaturesMenu: React.FC<FeaturesMenuProps> = ({ onNavigate, onClose, activeView, t }) => {
  const features: { id: ViewType; label: string; icon: React.ReactNode; color: string; desc: string }[] = [
    { 
      id: 'dashboard', 
      label: t('dashboard'), 
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>,
      color: 'bg-indigo-600',
      desc: 'Central command center'
    },
    { 
      id: 'students', 
      label: t('students'), 
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>,
      color: 'bg-blue-600',
      desc: 'Admissions & records'
    },
    { 
      id: 'teachers', 
      label: t('teachers'), 
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>,
      color: 'bg-emerald-600',
      desc: 'Faculty management'
    },
    { 
      id: 'fees', 
      label: t('fees'), 
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
      color: 'bg-amber-500',
      desc: 'Accounting & ledgers'
    },
    { 
      id: 'exams', 
      label: t('exams'), 
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
      color: 'bg-rose-600',
      desc: 'Results & report cards'
    },
    { 
      id: 'comms', 
      label: t('comms'), 
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>,
      color: 'bg-purple-600',
      desc: 'AI notifications'
    },
    {
      id: 'settings',
      label: t('settings'),
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
      color: 'bg-slate-700',
      desc: 'System config'
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-white/90 rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        <div className="p-8 md:p-12 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter">Quick Access</h2>
            <p className="text-slate-400 font-medium text-sm mt-1 uppercase tracking-widest">Global Navigation Hub</p>
          </div>
          <button 
            onClick={onClose}
            className="p-4 bg-slate-100 hover:bg-slate-200 rounded-3xl text-slate-400 transition-all hover:rotate-90 active:scale-90"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => onNavigate(feature.id)}
                className={`group relative flex flex-col items-start p-8 rounded-[2.5rem] border-2 transition-all hover:scale-[1.02] active:scale-95 text-left ${
                  activeView === feature.id 
                    ? 'bg-white border-indigo-600 shadow-xl shadow-indigo-100' 
                    : 'bg-white border-slate-50 hover:border-slate-200 shadow-sm'
                }`}
              >
                <div className={`p-4 rounded-2xl text-white mb-6 shadow-lg ${feature.color} group-hover:rotate-6 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-black mb-1 ${activeView === feature.id ? 'text-indigo-600' : 'text-slate-800'}`}>
                  {feature.label}
                </h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-none">
                  {feature.desc}
                </p>
                {activeView === feature.id && (
                  <div className="absolute top-4 right-4 h-3 w-3 bg-indigo-600 rounded-full animate-ping"></div>
                )}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-8 bg-slate-50/50 border-t border-slate-100 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
            Institutional Control Panel • EduCloud Pro V2.5
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeaturesMenu;
