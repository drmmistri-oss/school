
import React from 'react';
import { Student } from '../types';

interface IDCardProps {
  student: Student;
  schoolName: string;
  schoolSlogan: string;
  academicSession: string;
}

const IDCard: React.FC<IDCardProps> = ({ student, schoolName, schoolSlogan, academicSession }) => {
  return (
    <div className="w-full max-w-sm aspect-[1.6/1] bg-white rounded-3xl overflow-hidden shadow-2xl flex relative border border-slate-100 group">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white opacity-40 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-bl-[100px] pointer-events-none"></div>
      <div className="w-3 bg-indigo-600 h-full"></div>

      <div className="flex-1 flex flex-col p-6 relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2">
             <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
             </div>
             <div className="min-w-0">
               <h3 className="text-[11px] font-black tracking-tighter uppercase text-indigo-900 leading-none truncate pr-1">{schoolName}</h3>
               <p className="text-[7px] font-black uppercase text-slate-400 tracking-[0.2em] mt-0.5 truncate">{schoolSlogan}</p>
             </div>
          </div>
          <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 flex-shrink-0">
            Student Pass
          </div>
        </div>

        <div className="flex gap-6 items-center">
          <div className="relative">
            <div className="absolute -inset-1 bg-indigo-600/20 rounded-2xl blur-sm group-hover:blur-md transition-all"></div>
            <img src={student.photo} alt="" className="w-24 h-24 rounded-2xl border-4 border-white object-cover relative shadow-sm" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">{student.name}</h2>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Class: {student.className}</p>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Student ID</span>
                <span className="text-[10px] font-bold text-slate-700 font-mono">{student.id}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Phone No</span>
                <span className="text-[10px] font-bold text-slate-700">{student.phone}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4 flex justify-between items-end">
          <div className="bg-slate-100 px-3 py-2 rounded-xl flex items-center justify-center border border-slate-200">
             <span className="text-slate-400 font-mono tracking-widest text-[10px] select-none">{student.id.split('').join(' ')}</span>
          </div>
          <div className="text-right">
             <div className="h-6 flex items-center justify-center font-serif italic text-slate-400 text-sm mb-1 opacity-50 select-none">Registrar Seal</div>
             <p className="text-[7px] font-black text-slate-300 uppercase tracking-[0.3em]">Valid Session {academicSession}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IDCard;
