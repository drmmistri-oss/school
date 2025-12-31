
import React, { useState } from 'react';

interface SettingsViewProps {
  schoolName: string;
  schoolSlogan: string;
  academicSession: string;
  sessionStart: string;
  sessionEnd: string;
  examAlertTitle: string;
  examAlertContent: string;
  language: string;
  onUpdateBranding: (name: string, slogan: string, session: string, start: string, end: string, eTitle: string, eContent: string, lang: string) => void;
  onLogout: () => void;
  t: (key: string) => string;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
  schoolName, 
  schoolSlogan, 
  academicSession, 
  sessionStart, 
  sessionEnd,
  examAlertTitle,
  examAlertContent,
  language,
  onUpdateBranding,
  onLogout,
  t
}) => {
  const [name, setName] = useState(schoolName);
  const [slogan, setSlogan] = useState(schoolSlogan);
  const [session, setSession] = useState(academicSession);
  const [start, setStart] = useState(sessionStart);
  const [end, setEnd] = useState(sessionEnd);
  const [eTitle, setETitle] = useState(examAlertTitle);
  const [eContent, setEContent] = useState(examAlertContent);
  const [lang, setLang] = useState(language);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBranding(name, slogan, session, start, end, eTitle, eContent, lang);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-12 px-4 md:px-0">
      <div className="bg-white p-6 md:p-12 rounded-[3rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-5 mb-12">
          <div className="p-4 bg-indigo-50 rounded-3xl text-indigo-600 shadow-inner">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter">{t('settings')}</h2>
            <p className="text-slate-400 font-medium">Institutional branding and academic period management</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-12">
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] pl-1">Institutional Identity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('schoolName')}</label>
                <input 
                  required
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 ring-indigo-50 font-black text-slate-800 text-lg transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('slogan')}</label>
                <input 
                  required
                  type="text" 
                  value={slogan} 
                  onChange={(e) => setSlogan(e.target.value)}
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 ring-indigo-50 font-black text-slate-600 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] pl-1">System Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('language')}</label>
                <select 
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 ring-indigo-50 font-black text-slate-800 transition-all"
                >
                  <option value="en">English (US)</option>
                  <option value="hi">हिंदी (Hindi)</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('academicSession')}</label>
                <input 
                  required
                  type="text" 
                  value={session} 
                  onChange={(e) => setSession(e.target.value)}
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 ring-indigo-50 font-black text-slate-800 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] pl-1">Session & Calendar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('startDate')}</label>
                <input 
                  required
                  type="date" 
                  value={start} 
                  onChange={(e) => setStart(e.target.value)}
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 ring-indigo-50 font-black text-slate-800 transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('endDate')}</label>
                <input 
                  required
                  type="date" 
                  value={end} 
                  onChange={(e) => setEnd(e.target.value)}
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 ring-indigo-50 font-black text-slate-800 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] pl-1">Dashboard Announcements</h3>
            <div className="space-y-4 bg-indigo-50/30 p-6 rounded-[2rem] border border-indigo-100">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('examAlertTitle')}</label>
                <input 
                  required
                  type="text" 
                  value={eTitle} 
                  onChange={(e) => setETitle(e.target.value)}
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 ring-indigo-50 font-bold text-slate-800 transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('examAlertDetails')}</label>
                <textarea 
                  required
                  rows={2}
                  value={eContent} 
                  onChange={(e) => setEContent(e.target.value)}
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 ring-indigo-50 font-medium text-slate-600 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-8">
            <button 
              type="submit" 
              className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 shadow-xl text-sm ${
                isSaved 
                  ? 'bg-emerald-500 text-white shadow-emerald-100 scale-[0.98]' 
                  : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700 active:scale-95'
              }`}
            >
              {isSaved ? (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                  Sync Completed Successfully
                </>
              ) : (
                t('saveConfig')
              )}
            </button>
          </div>
        </form>

        <div className="space-y-6 pt-12 mt-12 border-t border-slate-100">
          <h3 className="text-[10px] font-black text-rose-600 uppercase tracking-[0.3em] pl-1">Danger Zone</h3>
          <button 
            type="button"
            onClick={onLogout}
            className="w-full py-5 bg-rose-50 text-rose-600 rounded-[2rem] font-black uppercase tracking-[0.2em] hover:bg-rose-100 transition-all flex items-center justify-center gap-4 border border-rose-100 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            {t('logout')}
          </button>
        </div>
      </div>

      <div className="p-8 bg-indigo-50/50 rounded-[3rem] border-2 border-dashed border-indigo-100 text-center animate-pulse">
        <p className="text-sm font-bold text-indigo-700 mb-2">Cloud Infrastructure Active</p>
        <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em]">Institutional changes are instantly propagated to all user terminals and dashboard displays.</p>
      </div>
    </div>
  );
};

export default SettingsView;
