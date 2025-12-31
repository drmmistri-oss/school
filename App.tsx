
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Student, Teacher, ViewType, FeeStatus, ExamScore, TermResult, User } from './types.ts';
import { MOCK_STUDENTS, MOCK_TEACHERS, MONTHS, SCHOOL_NAME as DEFAULT_NAME, SCHOOL_SLOGAN as DEFAULT_SLOGAN } from './constants.ts';
import { translations } from './translations.ts';
import { supabase } from './supabaseClient.ts';
import Sidebar from './components/Sidebar.tsx';
import DashboardView from './components/DashboardView.tsx';
import StudentView from './components/StudentView.tsx';
import TeacherView from './components/TeacherView.tsx';
import FeeView from './components/FeeView.tsx';
import ExamView from './components/ExamView.tsx';
import CommsView from './components/CommsView.tsx';
import SettingsView from './components/SettingsView.tsx';
import SearchOverlay from './components/SearchOverlay.tsx';
import AuthView from './components/AuthView.tsx';
import FeaturesMenu from './components/FeaturesMenu.tsx';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Persistence: Load active view from localStorage
  const [activeView, setActiveView] = useState<ViewType>(() => {
    const saved = localStorage.getItem('educloud_active_view');
    const validViews: ViewType[] = ['dashboard', 'students', 'teachers', 'fees', 'exams', 'comms', 'settings'];
    return (saved && validViews.includes(saved as ViewType)) ? (saved as ViewType) : 'dashboard';
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schoolName, setSchoolName] = useState(DEFAULT_NAME);
  const [schoolSlogan, setSchoolSlogan] = useState(DEFAULT_SLOGAN);
  const [academicSession, setAcademicSession] = useState('2024-25');
  const [sessionStart, setSessionStart] = useState('2024-04-01');
  const [sessionEnd, setSessionEnd] = useState('2025-03-31');
  const [examAlertTitle, setExamAlertTitle] = useState('Final Term 2024');
  const [examAlertContent, setExamAlertContent] = useState('Examinations starting next month. Please ensure all dues are cleared.');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Student | Teacher | null>(null);
  const [viewStack, setViewStack] = useState<ViewType[]>([activeView]);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const t = (key: string) => translations[language][key] || key;

  // Persist activeView whenever it changes
  useEffect(() => {
    localStorage.setItem('educloud_active_view', activeView);
  }, [activeView]);

  const fetchData = useCallback(async (userId: string) => {
    const { data: studentsData } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const { data: teachersData } = await supabase
      .from('teachers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const { data: configData } = await supabase
      .from('school_config')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (studentsData) {
      setStudents(studentsData.length > 0 ? studentsData : MOCK_STUDENTS);
    }

    if (teachersData) {
      setTeachers(teachersData.length > 0 ? teachersData : MOCK_TEACHERS);
    }

    if (configData) {
      setSchoolName(configData.name || DEFAULT_NAME);
      setSchoolSlogan(configData.slogan || DEFAULT_SLOGAN);
      setAcademicSession(configData.session || '2024-25');
      setSessionStart(configData.start_date || '2024-04-01');
      setSessionEnd(configData.end_date || '2025-03-31');
      setExamAlertTitle(configData.exam_title || 'Final Term 2024');
      setExamAlertContent(configData.exam_content || 'Starting next month.');
      setLanguage(configData.language || 'en');
    }
  }, []);

  useEffect(() => {
    const setupAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser({
          email: session.user.email,
          name: session.user.user_metadata?.full_name || 'Admin',
          authMethod: 'email'
        });
        fetchData(session.user.id);
      }
      setIsInitialized(true);
    };
    setupAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser({
          email: session.user.email,
          name: session.user.user_metadata?.full_name || 'Admin',
          authMethod: 'email'
        });
        fetchData(session.user.id);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchData]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    localStorage.removeItem('educloud_active_view');
    setActiveView('dashboard');
  };

  const goBack = () => {
    if (sidePanelOpen) {
      setSidePanelOpen(false);
      return;
    }
    if (viewStack.length > 1) {
      const newStack = [...viewStack];
      newStack.pop();
      const prevView = newStack[newStack.length - 1];
      setActiveView(prevView);
      setViewStack(newStack);
    } else {
      setActiveView('dashboard');
    }
  };

  const navigateTo = (view: ViewType) => {
    if (view === activeView) return;
    setActiveView(view);
    setViewStack(prev => [...prev, view]);
    setSidePanelOpen(false);
    setIsFeaturesOpen(false);
    
    // Smooth scroll content to top on navigation
    const mainContent = document.getElementById('main-content-scroll');
    if (mainContent) mainContent.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateMarks = async (studentId: string, termName: string, updatedScores: ExamScore[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const updatedExamResults = s.examResults.map(er => er.termName === termName ? { ...er, scores: updatedScores } : er);
        const updated = { ...s, examResults: updatedExamResults };
        if (selectedItem?.id === studentId) setSelectedItem(updated);
        supabase.from('students').update({ examResults: updatedExamResults }).eq('id', studentId).eq('user_id', user.id).then(({ error }) => error && console.error('Marks Sync Failed:', error.message));
        return updated;
      }
      return s;
    }));
  };

  const handleCollectFee = async (studentId: string, month: string, amount: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const newPayment = { month, amount, date: new Date().toLocaleDateString('en-GB'), status: FeeStatus.PAID };
        const updatedPayments = [...(s.payments || []), newPayment];
        const updated = { ...s, payments: updatedPayments };
        if (selectedItem?.id === studentId) setSelectedItem(updated);
        supabase.from('students').update({ payments: updatedPayments }).eq('id', studentId).eq('user_id', user.id).then(({ error }) => error && console.error('Fee Sync Failed:', error.message));
        return updated;
      }
      return s;
    }));
  };

  const handlePayTeacher = async (teacherId: string, month: string, amount: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setTeachers(prev => prev.map(t => {
      if (t.id === teacherId) {
        const newPayment = { month, date: new Date().toLocaleDateString('en-GB'), amount };
        const updatedPayments = [...(t.payments || []), newPayment];
        const updated = { ...t, payments: updatedPayments };
        if (selectedItem?.id === teacherId) setSelectedItem(updated);
        supabase.from('teachers').update({ payments: updatedPayments }).eq('id', teacherId).eq('user_id', user.id).then(({ error }) => error && console.error('Payroll Sync Failed:', error.message));
        return updated;
      }
      return t;
    }));
  };

  const handleUpdateBranding = async (n: string, s: string, sess: string, start: string, end: string, eTitle: string, eContent: string, lang: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setSchoolName(n); setSchoolSlogan(s); setAcademicSession(sess); setSessionStart(start); setSessionEnd(end); setExamAlertTitle(eTitle); setExamAlertContent(eContent); setLanguage(lang as 'en' | 'hi');
    await supabase.from('school_config').upsert({ user_id: user.id, name: n, slogan: s, session: sess, start_date: start, end_date: end, exam_title: eTitle, exam_content: eContent, language: lang }, { onConflict: 'user_id' });
  };

  if (!isInitialized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-indigo-600">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full"></div>
          <p className="text-white font-black text-[10px] uppercase tracking-[0.3em] opacity-80">Syncing Cloud...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthView onAuth={(u) => setCurrentUser(u)} t={t} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      {isSearchOpen && (
        <SearchOverlay 
          students={students} 
          teachers={teachers} 
          onClose={() => setIsSearchOpen(false)} 
          onSelect={(item) => { setSelectedItem(item); setSidePanelOpen(true); setIsSearchOpen(false); }}
        />
      )}

      {isFeaturesOpen && (
        <FeaturesMenu 
          activeView={activeView}
          onNavigate={navigateTo}
          onClose={() => setIsFeaturesOpen(false)}
          t={t}
        />
      )}

      <aside className="hidden md:block w-72 h-full bg-white border-r border-slate-200 shadow-xl flex-shrink-0 z-30">
        <Sidebar activeView={activeView} onNavigate={navigateTo} schoolName={schoolName} t={t} onLogout={handleLogout} />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 pt-[var(--sat)]">
          <div className="flex items-center gap-2 md:gap-4">
            {viewStack.length > 1 && (
              <button onClick={goBack} className="p-2.5 hover:bg-slate-100 rounded-2xl text-slate-600 transition-all active:scale-90">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
              </button>
            )}
            <h1 className="text-xl md:text-2xl font-black text-slate-800 capitalize tracking-tight">{t(activeView)}</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => setIsSearchOpen(true)} className="flex items-center gap-2 p-2.5 md:px-5 md:py-3 bg-slate-50 text-slate-500 hover:bg-slate-100 rounded-[1.25rem] transition-all border border-slate-100 group shadow-sm active:scale-95">
              <svg className="w-5 h-5 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <span className="text-sm font-black hidden lg:inline tracking-tight">{t('searchRecords')}</span>
            </button>
            
            <button 
              onClick={() => setIsFeaturesOpen(true)}
              className="p-2.5 md:p-3 bg-indigo-600 text-white rounded-[1.25rem] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-90 flex items-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="hidden sm:inline text-xs font-black uppercase tracking-widest pl-1">Menu</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-[1.25rem] bg-slate-900 flex items-center justify-center text-white font-black shadow-lg border-2 border-white">
                {currentUser.name.substring(0, 1).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex relative">
          <section id="main-content-scroll" className={`flex-1 overflow-y-auto p-4 md:p-8 transition-all duration-500 ${sidePanelOpen ? 'hidden lg:block lg:w-1/2 opacity-50 pointer-events-none' : 'w-full'}`}>
            <div key={activeView} className="view-animate">
              {activeView === 'dashboard' && <DashboardView students={students} teachers={teachers} examAlertTitle={examAlertTitle} examAlertContent={examAlertContent} t={t} />}
              {activeView === 'students' && <StudentView schoolName={schoolName} schoolSlogan={schoolSlogan} academicSession={academicSession} students={students} onAddStudent={(s) => setStudents(prev => [s, ...prev])} onSelect={(s) => { setSelectedItem(s); setSidePanelOpen(true); }} t={t} />}
              {activeView === 'teachers' && <TeacherView teachers={teachers} onAddTeacher={(t) => setTeachers(prev => [t, ...prev])} onPayTeacher={handlePayTeacher} onSelect={(t) => { setSelectedItem(t); setSidePanelOpen(true); }} t={t} />}
              {activeView === 'fees' && <FeeView schoolName={schoolName} students={students} onCollectFee={handleCollectFee} t={t} />}
              {activeView === 'exams' && <ExamView schoolName={schoolName} students={students} onUpdateMarks={handleUpdateMarks} t={t} />}
              {activeView === 'comms' && <CommsView schoolName={schoolName} students={students} t={t} />}
              {activeView === 'settings' && <SettingsView schoolName={schoolName} schoolSlogan={schoolSlogan} academicSession={academicSession} sessionStart={sessionStart} sessionEnd={sessionEnd} examAlertTitle={examAlertTitle} examAlertContent={examAlertContent} language={language} onUpdateBranding={handleUpdateBranding} onLogout={handleLogout} t={t} />}
            </div>
          </section>

          {sidePanelOpen && selectedItem && (
            <div className="w-full lg:w-1/2 h-full bg-white border-l border-slate-200 overflow-y-auto shadow-2xl absolute inset-0 lg:relative z-40 animate-in slide-in-from-right duration-500">
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-30 flex justify-between items-center px-6 md:px-10 py-5 border-b border-slate-100">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Record Details</span>
                  <h3 className="text-lg font-black text-slate-800">{selectedItem.name}</h3>
                </div>
                <button onClick={() => setSidePanelOpen(false)} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all text-slate-400 active:scale-90"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg></button>
              </div>
              <div className="p-6 md:p-10">
                {('className' in selectedItem) ? (
                  <StudentDetailView schoolName={schoolName} student={selectedItem as Student} onUpdateMarks={handleUpdateMarks} onUpdateProfile={() => {}} />
                ) : (
                  <TeacherDetailView schoolName={schoolName} teacher={selectedItem as Teacher} onUpdateProfile={() => {}} />
                )}
              </div>
            </div>
          )}
        </div>

        <nav className="md:hidden h-20 bg-white border-t border-slate-200 flex items-center justify-around px-2 sticky bottom-0 z-50 pb-[var(--sab)]">
          <MobileNavItem icon="home" label={t('dashboard')} active={activeView === 'dashboard'} onClick={() => navigateTo('dashboard')} />
          <MobileNavItem icon="users" label={t('students')} active={activeView === 'students'} onClick={() => navigateTo('students')} />
          <MobileNavItem icon="briefcase" label={t('teachers')} active={activeView === 'teachers'} onClick={() => navigateTo('teachers')} />
          <MobileNavItem icon="credit-card" label={t('fees')} active={activeView === 'fees'} onClick={() => navigateTo('fees')} />
          <MobileNavItem icon="settings" label={t('settings')} active={activeView === 'settings'} onClick={() => navigateTo('settings')} />
        </nav>
      </main>
    </div>
  );
};

const MobileNavItem: React.FC<{ icon: string, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex-1 flex flex-col items-center gap-1 transition-all active:scale-90 touch-none`}>
    <div className={`p-2.5 rounded-2xl transition-all ${active ? 'bg-indigo-50 text-indigo-600 scale-110 shadow-sm' : 'text-slate-400'}`}>
      {icon === 'home' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>}
      {icon === 'users' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>}
      {icon === 'briefcase' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
      {icon === 'credit-card' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>}
      {icon === 'settings' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
    </div>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

// Stub components to keep the main code clean in this change block
const StudentDetailView = (props: any) => <div>Detail Content</div>;
const TeacherDetailView = (props: any) => <div>Detail Content</div>;

export default App;
