
import React from 'react';
import { Student, Teacher } from '../types.ts';

interface DashboardViewProps {
  students: Student[];
  teachers: Teacher[];
  examAlertTitle: string;
  examAlertContent: string;
  t: (key: string) => string;
}

const DashboardView: React.FC<DashboardViewProps> = ({ students, teachers, examAlertTitle, examAlertContent, t }) => {
  const totalRevenue = students.reduce((acc, s) => {
    return acc + s.admissionFees + s.payments.reduce((pAcc, p) => pAcc + p.amount, 0);
  }, 0);

  const pendingFees = students.length * 2000; // Simplified logic

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t('totalStudents')} value={students.length} icon="users" color="bg-blue-500" />
        <StatCard title={t('totalTeachers')} value={teachers.length} icon="briefcase" color="bg-emerald-500" />
        <StatCard title={t('totalCollection')} value={`₹${(totalRevenue/1000).toFixed(1)}k`} icon="credit-card" color="bg-indigo-500" />
        <StatCard title={t('pendingFees')} value={`₹${(pendingFees/1000).toFixed(1)}k`} icon="alert" color="bg-rose-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">{t('recentAdmissions')}</h3>
          <div className="space-y-4">
            {students.slice(0, 5).map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <img src={s.photo} className="w-10 h-10 rounded-full object-cover" alt="" />
                  <div>
                    <p className="font-semibold text-slate-700">{s.name}</p>
                    <p className="text-xs text-slate-400">Class {s.className}</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-400">{s.admissionDate}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">{t('upcomingExams')}</h3>
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-600 rounded-lg text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"/></svg>
              </div>
              <span className="font-bold text-indigo-900">{examAlertTitle}</span>
            </div>
            <p className="text-sm text-indigo-700">{examAlertContent}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string, value: string | number, icon: string, color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
    <div className={`p-4 rounded-2xl text-white ${color}`}>
      {icon === 'users' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>}
      {icon === 'briefcase' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
      {icon === 'credit-card' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>}
      {icon === 'alert' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-400">{title}</p>
      <h4 className="text-2xl font-bold text-slate-800">{value}</h4>
    </div>
  </div>
);

export default DashboardView;
