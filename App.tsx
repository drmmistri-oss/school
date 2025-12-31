
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

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
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
  const [selectedItem, setSelectedItem] = useState<Student | Teacher | null>(null);
  const [viewStack, setViewStack] = useState<ViewType[]>(['dashboard']);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const t = (key: string) => translations[language][key] || key;

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
    }
  };

  const navigateTo = (view: ViewType) => {
    if (view === activeView) return;
    setActiveView(view);
    setViewStack(prev => [...prev, view]);
    setSidePanelOpen(false);
  };

  const handleAddStudent = async (newStudent: Student) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { id, name, photo, className, fatherName, guardianName, aadhaar, phone, address, admissionFees, monthlyFees, examResults, admissionDate } = (newStudent as any);
    const studentToSave = { id, name, photo, className, fatherName, guardianName, aadhaar, phone, address, admissionFees, monthlyFees, examResults, admissionDate, user_id: user.id };
    setStudents(prev => [newStudent, ...prev]);
    const { error } = await supabase.from('students').insert([studentToSave]);
    if (error) {
      console.error('Error adding student to cloud:', error.message);
      fetchData(user.id);
    }
  };

  const handleUpdateStudent = async (updatedStudent: Student) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { id, user_id, created_at, subjects, ...updateData } = (updatedStudent as any);
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    if (selectedItem?.id === updatedStudent.id) setSelectedItem(updatedStudent);
    const { error } = await supabase.from('students').update(updateData).eq('id', updatedStudent.id).eq('user_id', user.id);
    if (error) console.error('Cloud Sync Error (Student):', error.message);
  };

  const handleAddTeacher = async (newTeacher: Teacher) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { id, name, photo, phone, subject, salary, payments } = (newTeacher as any);
    const teacherToSave = { id, name, photo, phone, subject, salary, payments, user_id: user.id };
    setTeachers(prev => [newTeacher, ...prev]);
    const { error } = await supabase.from('teachers').insert([teacherToSave]);
    if (error) {
      console.error('Error adding teacher to cloud:', error.message);
      fetchData(user.id);
    }
  };

  const handleUpdateTeacher = async (updatedTeacher: Teacher) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { id, user_id, created_at, ...updateData } = (updatedTeacher as any);
    setTeachers(prev => prev.map(t => t.id === updatedTeacher.id ? updatedTeacher : t));
    if (selectedItem?.id === updatedTeacher.id) setSelectedItem(updatedTeacher);
    const { error } = await supabase.from('teachers').update(updateData).eq('id', updatedTeacher.id).eq('user_id', user.id);
    if (error) console.error('Cloud Sync Error (Teacher):', error.message);
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
          <p className="text-white font-black text-[10px] uppercase tracking-[0.3em] opacity-80">Loading Database...</p>
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

      <aside className="hidden md:block w-72 h-full bg-white border-r border-slate-200 shadow-xl flex-shrink-0 z-30">
        <Sidebar activeView={activeView} onNavigate={navigateTo} schoolName={schoolName} t={t} onLogout={handleLogout} />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={goBack} className="p-2.5 hover:bg-slate-100 rounded-2xl text-slate-600 transition-all active:scale-90"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg></button>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 capitalize tracking-tight">{t(activeView)}</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => setIsSearchOpen(true)} className="flex items-center gap-2 p-2.5 md:px-5 md:py-3 bg-slate-50 text-slate-500 hover:bg-slate-100 rounded-[1.25rem] transition-all border border-slate-100 group shadow-sm">
              <svg className="w-5 h-5 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <span className="text-sm font-black hidden lg:inline tracking-tight">{t('searchRecords')}</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1">Cloud Sync</p>
                <p className="text-xs font-black text-slate-800 leading-none">{currentUser.name}</p>
              </div>
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-[1.25rem] bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg border-2 border-white">
                {currentUser.name.substring(0, 1).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex">
          <section className={`flex-1 overflow-y-auto p-4 md:p-8 transition-all duration-500 ${sidePanelOpen ? 'hidden lg:block lg:w-1/2 opacity-50 pointer-events-none' : 'w-full'}`}>
            {activeView === 'dashboard' && <DashboardView students={students} teachers={teachers} examAlertTitle={examAlertTitle} examAlertContent={examAlertContent} t={t} />}
            {activeView === 'students' && <StudentView schoolName={schoolName} schoolSlogan={schoolSlogan} academicSession={academicSession} students={students} onAddStudent={handleAddStudent} onSelect={(s) => { setSelectedItem(s); setSidePanelOpen(true); }} t={t} />}
            {activeView === 'teachers' && <TeacherView teachers={teachers} onAddTeacher={handleAddTeacher} onPayTeacher={handlePayTeacher} onSelect={(t) => { setSelectedItem(t); setSidePanelOpen(true); }} t={t} />}
            {activeView === 'fees' && <FeeView schoolName={schoolName} students={students} onCollectFee={handleCollectFee} t={t} />}
            {activeView === 'exams' && <ExamView schoolName={schoolName} students={students} onUpdateMarks={handleUpdateMarks} t={t} />}
            {activeView === 'comms' && <CommsView schoolName={schoolName} students={students} t={t} />}
            {activeView === 'settings' && <SettingsView schoolName={schoolName} schoolSlogan={schoolSlogan} academicSession={academicSession} sessionStart={sessionStart} sessionEnd={sessionEnd} examAlertTitle={examAlertTitle} examAlertContent={examAlertContent} language={language} onUpdateBranding={handleUpdateBranding} onLogout={handleLogout} t={t} />}
          </section>

          {sidePanelOpen && selectedItem && (
            <div className="w-full lg:w-1/2 h-full bg-white border-l border-slate-200 overflow-y-auto shadow-2xl relative z-40 animate-in slide-in-from-right duration-500">
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-30 flex justify-between items-center px-6 md:px-10 py-5 border-b border-slate-100">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Record Details</span>
                  <h3 className="text-lg font-black text-slate-800">{selectedItem.name}</h3>
                </div>
                <button onClick={() => setSidePanelOpen(false)} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all text-slate-400 active:scale-90"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg></button>
              </div>
              <div className="p-6 md:p-10">
                {('className' in selectedItem) ? (
                  <StudentDetailView schoolName={schoolName} student={selectedItem as Student} onUpdateMarks={handleUpdateMarks} onUpdateProfile={handleUpdateStudent} />
                ) : (
                  <TeacherDetailView schoolName={schoolName} teacher={selectedItem as Teacher} onUpdateProfile={handleUpdateTeacher} />
                )}
              </div>
            </div>
          )}
        </div>

        <nav className="md:hidden h-20 bg-white border-t border-slate-200 flex items-center justify-around px-2 sticky bottom-0 z-50">
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
  <button onClick={onClick} className={`flex-1 flex flex-col items-center gap-1 transition-all ${active ? 'text-indigo-600' : 'text-slate-400'}`}>
    <div className={`p-2.5 rounded-2xl transition-all ${active ? 'bg-indigo-50 scale-110 shadow-sm' : ''}`}>
      {icon === 'home' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>}
      {icon === 'users' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>}
      {icon === 'briefcase' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
      {icon === 'credit-card' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>}
      {icon === 'settings' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
    </div>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const QuickConnect: React.FC<{ phone: string, name: string, schoolName: string }> = ({ phone, name, schoolName }) => {
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(`Greetings from ${schoolName}! This is regarding ${name}.`)}`;
  return (
    <div className="flex gap-4 mb-8">
      <a href={`tel:${phone}`} className="flex-1 flex items-center justify-center gap-3 py-4 bg-blue-50 text-blue-700 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-100 shadow-sm">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
        Call
      </a>
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-3 py-4 bg-emerald-50 text-emerald-700 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100 shadow-sm">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        WhatsApp
      </a>
    </div>
  );
};

const StudentDetailView: React.FC<{ 
  student: Student; 
  schoolName: string;
  onUpdateMarks: (id: string, term: string, scores: ExamScore[]) => void;
  onUpdateProfile: (s: Student) => void;
}> = ({ student, schoolName, onUpdateMarks, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'marks'>('info');
  const [activeTermIndex, setActiveTermIndex] = useState(0);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState<Student>(student);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleSaveProfile = () => { onUpdateProfile(profileData); setIsEditingProfile(false); };
  const handleMarkChange = (subjectIndex: number, field: 'marks' | 'oralMarks', val: string) => {
    const numVal = parseInt(val) || 0;
    const newResults = [...student.examResults];
    newResults[activeTermIndex].scores[subjectIndex][field] = numVal;
    onUpdateMarks(student.id, newResults[activeTermIndex].termName, newResults[activeTermIndex].scores);
  };
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group/photo">
           <img src={isEditingProfile ? profileData.photo : student.photo} alt={student.name} className="w-28 h-28 rounded-[2.5rem] object-cover border-4 border-indigo-50 shadow-xl" />
           {isEditingProfile && (
             <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 rounded-[2.5rem] flex items-center justify-center text-white opacity-0 group-hover/photo:opacity-100 transition-opacity">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
             </button>
           )}
           <input type="file" hidden ref={fileInputRef} onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const r = new FileReader();
                r.onloadend = () => setProfileData(prev => ({ ...prev, photo: r.result as string }));
                r.readAsDataURL(file);
              }
           }} accept="image/*" />
        </div>
        <div className="text-center sm:text-left flex-1">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-2">{student.name}</h2>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-black uppercase">Class {student.className}</span>
            <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase">ID: {student.id}</span>
          </div>
        </div>
        {!isEditingProfile && (
          <button onClick={() => { setProfileData(student); setIsEditingProfile(true); }} className="p-4 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-[1.5rem] transition-all border border-slate-100 shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
          </button>
        )}
      </div>
      {!isEditingProfile && <QuickConnect phone={student.phone} name={student.guardianName || student.name} schoolName={schoolName} />}
      <div className="flex gap-2 border-b border-slate-100 mb-6">
        <button onClick={() => setActiveTab('info')} className={`pb-3 px-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'info' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>General Info</button>
        <button onClick={() => setActiveTab('marks')} className={`pb-3 px-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'marks' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>Academic Records</button>
      </div>
      {activeTab === 'info' ? (
        isEditingProfile ? (
          <div className="bg-slate-50 p-8 rounded-[3rem] border border-indigo-100 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <EditField label="Student Name" value={profileData.name} onChange={v => setProfileData({...profileData, name: v})} />
              <EditField label="Class" value={profileData.className} onChange={v => setProfileData({...profileData, className: v})} />
              <EditField label="Father's Name" value={profileData.fatherName} onChange={v => setProfileData({...profileData, fatherName: v})} />
              <EditField label="Guardian Name" value={profileData.guardianName} onChange={v => setProfileData({...profileData, guardianName: v})} />
              <EditField label="Phone Number" value={profileData.phone} onChange={v => setProfileData({...profileData, phone: v})} />
              <EditField label="Aadhaar ID" value={profileData.aadhaar} onChange={v => setProfileData({...profileData, aadhaar: v})} />
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={() => setIsEditingProfile(false)} className="flex-1 py-4 bg-white text-slate-500 rounded-2xl font-black uppercase tracking-widest border border-slate-200">Cancel</button>
              <button onClick={handleSaveProfile} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100">Save Profile</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InfoItem label="Parent Details" value={student.fatherName} />
            <InfoItem label="Guardian Name" value={student.guardianName} />
            <InfoItem label="Contact Primary" value={student.phone} />
            <InfoItem label="Aadhaar Number" value={student.aadhaar} />
            <div className="col-span-full bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-sm">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Residential Address</h3>
               <p className="font-bold text-slate-700">{student.address}</p>
            </div>
          </div>
        )
      ) : (
        <div className="space-y-6">
           <div className="flex p-1.5 bg-slate-100 rounded-2xl gap-1 shadow-inner">
             {student.examResults.map((term, idx) => (
               <button key={term.termName} onClick={() => setActiveTermIndex(idx)} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTermIndex === idx ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:bg-white/50'}`}>{term.termName}</button>
             ))}
           </div>
           <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
             <table className="w-full text-left">
               <thead className="bg-slate-50/50">
                 <tr>
                   <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                   <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Written</th>
                   <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Oral</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {student.examResults[activeTermIndex].scores.map((score, sIdx) => (
                   <tr key={score.subject} className="group">
                     <td className="px-6 py-4 font-black text-slate-800 text-sm leading-none">{score.subject}</td>
                     <td className="px-4 py-2"><input type="number" className="w-12 p-1 bg-slate-50 border border-slate-200 rounded font-black text-indigo-600 outline-none" value={score.marks} onChange={(e) => handleMarkChange(sIdx, 'marks', e.target.value)} /></td>
                     <td className="px-4 py-2"><input type="number" className="w-12 p-1 bg-slate-50 border border-slate-200 rounded font-black text-emerald-600 outline-none" value={score.oralMarks} onChange={(e) => handleMarkChange(sIdx, 'oralMarks', e.target.value)} /></td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}
    </div>
  );
};

const TeacherDetailView: React.FC<{ 
  teacher: Teacher;
  schoolName: string;
  onUpdateProfile: (t: Teacher) => void;
}> = ({ teacher, schoolName, onUpdateProfile }) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState<Teacher>(teacher);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleSaveProfile = () => { onUpdateProfile(profileData); setIsEditingProfile(false); };
  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group/photo">
           <img src={isEditingProfile ? profileData.photo : teacher.photo} alt={teacher.name} className="w-28 h-28 rounded-[2.5rem] object-cover border-4 border-emerald-50 shadow-xl" />
           {isEditingProfile && (
             <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 rounded-[2.5rem] flex items-center justify-center text-white opacity-0 group-hover/photo:opacity-100 transition-opacity"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg></button>
           )}
           <input type="file" hidden ref={fileInputRef} onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const r = new FileReader();
                r.onloadend = () => setProfileData(prev => ({ ...prev, photo: r.result as string }));
                r.readAsDataURL(file);
              }
           }} accept="image/*" />
        </div>
        <div className="text-center sm:text-left flex-1">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-2">{teacher.name}</h2>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase">{teacher.subject} Specialist</span>
            <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase">ID: {teacher.id}</span>
          </div>
        </div>
        {!isEditingProfile && (
          <button onClick={() => { setProfileData(teacher); setIsEditingProfile(true); }} className="p-4 bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-[1.5rem] transition-all border border-slate-100 shadow-sm"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>
        )}
      </div>
      {!isEditingProfile && <QuickConnect phone={teacher.phone} name={teacher.name} schoolName={schoolName} />}
      {isEditingProfile ? (
        <div className="bg-slate-50 p-8 rounded-[3rem] border border-emerald-100 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <EditField label="Full Name" value={profileData.name} onChange={v => setProfileData({...profileData, name: v})} />
            <EditField label="Contact Phone" value={profileData.phone} onChange={v => setProfileData({...profileData, phone: v})} />
            <EditField label="Subject" value={profileData.subject} onChange={v => setProfileData({...profileData, subject: v})} />
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly Salary (₹)</label>
              <input type="number" className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-emerald-50 font-black" value={profileData.salary} onChange={e => setProfileData({...profileData, salary: parseInt(e.target.value) || 0})} />
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button onClick={() => setIsEditingProfile(false)} className="flex-1 py-4 bg-white text-slate-500 rounded-2xl font-black uppercase tracking-widest border border-slate-200">Cancel</button>
            <button onClick={handleSaveProfile} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl">Save Changes</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <InfoItem label="Department" value={teacher.subject} />
          <InfoItem label="Contact Mobile" value={teacher.phone} />
          <InfoItem label="Base Pay" value={`₹${teacher.salary.toLocaleString()}`} />
        </div>
      )}
    </div>
  );
};

const EditField: React.FC<{ label: string, value: string, onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input type="text" className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 ring-indigo-50 font-black text-slate-800 transition-all" value={value} onChange={e => onChange(e.target.value)} />
  </div>
);

const InfoItem: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</span>
    <span className="text-slate-800 font-black text-lg">{value}</span>
  </div>
);

export default App;