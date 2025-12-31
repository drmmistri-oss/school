
import React, { useState, useMemo } from 'react';
import { Student, ExamScore } from '../types.ts';

// Added t function to ExamViewProps to fix type mismatch in App.tsx
interface ExamViewProps {
  students: Student[];
  onUpdateMarks: (id: string, term: string, scores: ExamScore[]) => void;
  schoolName: string;
  t: (key: string) => string;
}

const ExamView: React.FC<ExamViewProps> = ({ students, onUpdateMarks, schoolName, t }) => {
  const [activeTab, setActiveTab] = useState<'admit' | 'marksheet'>('admit');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [examDate, setExamDate] = useState('2024-03-15');
  const [examTime, setExamTime] = useState('09:00 AM');

  const studentsWithRanks = useMemo(() => {
    const scores = students.map(s => {
      const totalObtained = s.examResults.reduce((acc, term) => 
        acc + term.scores.reduce((tAcc, sc) => tAcc + sc.marks + sc.oralMarks, 0), 0);
      const totalMax = s.examResults.reduce((acc, term) => acc + term.scores.length * 100, 0);
      return {
        id: s.id,
        total: totalObtained,
        percentage: totalMax > 0 ? (totalObtained / totalMax) * 100 : 0
      };
    });

    const sorted = [...scores].sort((a, b) => b.percentage - a.percentage);
    
    return students.map(s => {
      const stats = scores.find(sc => sc.id === s.id);
      const rank = sorted.findIndex(sc => sc.id === s.id) + 1;
      return { ...s, rank, percentage: stats?.percentage.toFixed(1) || 0 };
    });
  }, [students]);

  const handleLiveEdit = (termIdx: number, subIdx: number, field: 'marks' | 'oralMarks', val: string) => {
    if (!selectedStudent) return;
    const numVal = parseInt(val) || 0;
    const updatedResults = [...selectedStudent.examResults];
    updatedResults[termIdx].scores[subIdx][field] = numVal;
    
    onUpdateMarks(selectedStudent.id, updatedResults[termIdx].termName, updatedResults[termIdx].scores);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 no-print pb-2">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('admit')}
            className={`pb-4 px-2 font-black transition-all text-[10px] uppercase tracking-[0.2em] ${activeTab === 'admit' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}
          >
            Admit Cards
          </button>
          <button 
            onClick={() => setActiveTab('marksheet')}
            className={`pb-4 px-2 font-black transition-all text-[10px] uppercase tracking-[0.2em] ${activeTab === 'marksheet' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}
          >
            Marksheets & Ranks
          </button>
        </div>

        {activeTab === 'admit' && (
          <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm mb-2 md:mb-0">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2">Start Date:</span>
              <input 
                type="date" 
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="bg-slate-50 border-none rounded-xl px-3 py-1.5 text-xs font-black text-indigo-600 outline-none focus:ring-2 ring-indigo-100 transition-all"
              />
            </div>
            <div className="h-6 w-px bg-slate-100 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2">Start Time:</span>
              <input 
                type="text" 
                value={examTime}
                onChange={(e) => setExamTime(e.target.value)}
                placeholder="e.g. 09:00 AM"
                className="bg-slate-50 border-none rounded-xl px-3 py-1.5 text-xs font-black text-indigo-600 outline-none focus:ring-2 ring-indigo-100 transition-all w-28"
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 no-print">
        {studentsWithRanks.map(s => (
          <div key={s.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group overflow-hidden">
            <div className="flex items-center gap-4 mb-6">
               <img src={s.photo} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-indigo-50" alt="" />
               <div className="flex-1 min-w-0">
                 <h4 className="font-black text-slate-800 text-lg truncate leading-tight">{s.name}</h4>
                 <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">Class {s.className}</p>
               </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Rank</span>
                  <span className="text-sm font-black text-slate-800">#{s.rank}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Agg %</span>
                  <span className="text-sm font-black text-slate-800">{s.percentage}%</span>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedStudent(s); setIsEditing(false); }}
                className={`w-full py-4 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${activeTab === 'admit' ? 'bg-indigo-600 shadow-indigo-100' : 'bg-emerald-600 shadow-emerald-100'}`}
              >
                {activeTab === 'admit' ? 'Generate Admit Card' : 'Open Marksheet'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 z-[120] bg-slate-900/80 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md overflow-y-auto no-print">
          <div className="bg-white rounded-[3rem] p-4 sm:p-10 max-w-[95vw] sm:max-w-5xl w-full relative my-8 animate-in zoom-in-95 duration-200">
            <div className="absolute top-6 right-6 flex gap-2 z-20">
              {activeTab === 'marksheet' && (
                <button 
                  onClick={() => setIsEditing(!isEditing)} 
                  className={`p-3 rounded-2xl transition-all shadow-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${isEditing ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 hover:text-indigo-600'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  {isEditing ? 'Viewing...' : 'Edit Scores'}
                </button>
              )}
              <button 
                onClick={() => { setSelectedStudent(null); setIsEditing(false); }} 
                className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-400 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            
            <div className="document-container flex justify-center">
              {activeTab === 'admit' ? (
                <AdmitCardDocument schoolName={schoolName} student={selectedStudent} examStartDate={examDate} examStartTime={examTime} />
              ) : (
                <MarksheetDocument 
                  schoolName={schoolName}
                  student={selectedStudent} 
                  rank={(selectedStudent as any).rank} 
                  isEditing={isEditing}
                  onEditScore={handleLiveEdit}
                />
              )}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 no-print">
              <button onClick={() => { setSelectedStudent(null); setIsEditing(false); }} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">Close Preview</button>
              {!isEditing && (
                <button onClick={() => window.print()} className={`flex-1 py-4 text-white rounded-2xl font-black shadow-xl uppercase tracking-widest transition-colors ${activeTab === 'admit' ? 'bg-indigo-600 shadow-indigo-100' : 'bg-emerald-600 shadow-emerald-100'}`}>Print Document</button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="print-only">
        {selectedStudent && (
           activeTab === 'admit' 
            ? <AdmitCardDocument schoolName={schoolName} student={selectedStudent} examStartDate={examDate} examStartTime={examTime} /> 
            : <MarksheetDocument schoolName={schoolName} student={selectedStudent} rank={(selectedStudent as any).rank} />
        )}
      </div>
    </div>
  );
};

const AdmitCardDocument: React.FC<{ schoolName: string, student: Student, examStartDate: string, examStartTime: string }> = ({ schoolName, student, examStartDate, examStartTime }) => {
  const getIncrementedDate = (baseDate: string, incrementDays: number) => {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + incrementDays);
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  };

  return (
    <div className="w-full max-w-[650px] border-[12px] border-double border-indigo-100 rounded-[3rem] bg-white p-8 md:p-12 shadow-inner font-sans">
      <div className="text-center border-b-4 border-slate-50 pb-8 mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">{schoolName}</h1>
        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mt-2 mb-4">Official Examination Council</p>
        <div className="bg-indigo-600 text-white inline-block px-8 py-2 rounded-full shadow-lg shadow-indigo-100">
          <h2 className="text-xs md:text-sm font-black uppercase tracking-[0.2em]">ADMIT CARD - ANNUAL TERM 2024</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-8">
        <div className="md:col-span-2 grid grid-cols-2 gap-y-6 gap-x-8 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
          <DocumentField label="Student Name" value={student.name} />
          <DocumentField label="Roll/ID Number" value={student.id} />
          <DocumentField label="Guardian Name" value={student.fatherName} />
          <DocumentField label="Class-Sec" value={student.className} />
        </div>
        <div className="flex flex-col items-center">
          <img src={student.photo} className="w-32 h-40 object-cover rounded-[1.5rem] border-4 border-white shadow-xl rotate-2" alt="Student" />
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-100 shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 font-black text-slate-400 uppercase text-[9px] tracking-widest">Paper / Subject</th>
              <th className="p-4 font-black text-slate-400 uppercase text-[9px] tracking-widest text-center">Date</th>
              <th className="p-4 font-black text-slate-400 uppercase text-[9px] tracking-widest text-right">Timing</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {student.examResults[student.examResults.length - 1].scores.map((score, i) => (
              <tr key={score.subject} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 font-bold text-slate-700 text-sm">{score.subject}</td>
                <td className="p-4 text-slate-500 text-center font-bold text-xs">{getIncrementedDate(examStartDate, i)}</td>
                <td className="p-4 text-slate-500 text-right font-bold text-xs uppercase">{examStartTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-10 flex justify-between items-end border-t border-slate-100 pt-8">
        <div className="text-[10px] text-slate-400 leading-tight">
          <p className="font-black uppercase mb-1">Instructions:</p>
          <p>1. Report 30 mins early.</p>
          <p>2. Carry ID Card.</p>
        </div>
        <div className="text-center">
           <div className="h-10 flex items-center justify-center italic text-slate-200 text-2xl font-serif mb-1">EduCouncil</div>
           <div className="w-32 border-t border-slate-200 pt-2 text-[8px] font-black text-slate-300 uppercase">Controller of Exams</div>
        </div>
      </div>
    </div>
  );
};

const MarksheetDocument: React.FC<{ 
  schoolName: string,
  student: Student, 
  rank: number, 
  isEditing?: boolean,
  onEditScore?: (termIdx: number, subIdx: number, field: 'marks' | 'oralMarks', val: string) => void
}> = ({ schoolName, student, rank, isEditing = false, onEditScore }) => {
  const subjects = student.examResults[0].scores.map(s => s.subject);
  
  const calculateSubjectTotal = (subject: string) => {
    return student.examResults.reduce((acc, term) => {
      const score = term.scores.find(s => s.subject === subject);
      return acc + (score?.marks || 0) + (score?.oralMarks || 0);
    }, 0);
  };

  const grandTotalObtained = student.examResults.reduce((acc, term) => 
    acc + term.scores.reduce((tAcc, s) => tAcc + s.marks + s.oralMarks, 0), 0
  );
  
  const totalMax = student.examResults.reduce((acc, term) => 
    acc + term.scores.length * 100, 0
  );

  const percentage = totalMax > 0 ? ((grandTotalObtained / totalMax) * 100).toFixed(1) : "0";

  return (
    <div className="w-full max-w-[900px] border-[12px] border-double border-emerald-100 rounded-[3rem] bg-white p-6 md:p-12 shadow-inner font-sans overflow-x-auto">
      <div className="text-center border-b-4 border-slate-50 pb-8 mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none uppercase">{schoolName}</h1>
        <h2 className="text-sm font-black text-emerald-600 uppercase tracking-[0.4em] mt-2 mb-4">Official Academic Transcript</h2>
        <div className="bg-emerald-600 text-white inline-block px-10 py-2 rounded-full">
           <span className="text-[10px] font-black uppercase tracking-widest">Session 2023-24</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-8 bg-slate-50/80 p-6 rounded-[2.5rem] border border-slate-100">
        <DocumentField label="Student Name" value={student.name} />
        <DocumentField label="Enrollment ID" value={student.id} />
        <DocumentField label="Father's Name" value={student.fatherName} />
        <DocumentField label="Grade & Division" value={`${student.className} / A`} />
      </div>

      <div className="overflow-x-auto rounded-[2rem] border border-slate-100 shadow-sm mb-8">
        <table className="w-full text-left border-collapse text-[10px] md:text-xs min-w-[600px]">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="p-3 font-black uppercase tracking-widest" rowSpan={2}>Subject List</th>
              {student.examResults.map(term => (
                <th key={term.termName} className="p-2 text-center uppercase tracking-widest font-black border-l border-slate-700" colSpan={2}>
                  {term.termName}
                </th>
              ))}
              <th className="p-3 text-center uppercase tracking-widest font-black border-l border-slate-700 bg-emerald-700" rowSpan={2}>Subject Total</th>
            </tr>
            <tr className="bg-slate-700 text-slate-300 text-[8px] md:text-[9px]">
              {student.examResults.map(term => (
                <React.Fragment key={`${term.termName}-sub`}>
                  <th className="p-1.5 text-center border-l border-slate-600">Wr.</th>
                  <th className="p-1.5 text-center border-l border-slate-600">Or.</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {subjects.map((sub, sIdx) => {
              const total = calculateSubjectTotal(sub);
              return (
                <tr key={sub} className="even:bg-slate-50/50">
                  <td className="p-3 border-r border-slate-100 font-bold text-slate-700 truncate">{sub}</td>
                  {student.examResults.map((term, tIdx) => {
                    const score = term.scores.find(s => s.subject === sub);
                    return (
                      <React.Fragment key={`${term.termName}-${sub}`}>
                        <td className="p-1.5 border-r border-slate-100 text-center">
                          {isEditing ? (
                            <input 
                              type="number"
                              className="w-12 p-1 text-center bg-white border border-slate-200 rounded font-black text-indigo-600 outline-none"
                              value={score?.marks || 0}
                              onChange={(e) => onEditScore?.(tIdx, sIdx, 'marks', e.target.value)}
                            />
                          ) : (
                            <span className="font-mono font-medium">{score?.marks || 0}</span>
                          )}
                        </td>
                        <td className="p-1.5 border-r border-slate-100 text-center">
                          {isEditing ? (
                            <input 
                              type="number"
                              className="w-10 p-1 text-center bg-white border border-slate-200 rounded font-black text-emerald-600 outline-none"
                              value={score?.oralMarks || 0}
                              onChange={(e) => onEditScore?.(tIdx, sIdx, 'oralMarks', e.target.value)}
                            />
                          ) : (
                            <span className="font-mono font-medium">{score?.oralMarks || 0}</span>
                          )}
                        </td>
                      </React.Fragment>
                    );
                  })}
                  <td className="p-3 text-center font-mono font-black text-emerald-700 bg-emerald-50">{total}</td>
                </tr>
              );
            })}
            <tr className="bg-slate-900 text-white font-black">
              <td className="p-3 uppercase text-[9px] tracking-widest">Agg. Term Total</td>
              {student.examResults.map(term => {
                const termTheory = term.scores.reduce((acc, s) => acc + s.marks, 0);
                const termOral = term.scores.reduce((acc, s) => acc + s.oralMarks, 0);
                return (
                  <React.Fragment key={`${term.termName}-grand`}>
                    <td className="p-1.5 text-center border-l border-slate-800">{termTheory}</td>
                    <td className="p-1.5 text-center border-l border-slate-800">{termOral}</td>
                  </React.Fragment>
                );
              })}
              <td className="p-3 text-center text-emerald-400 bg-black">{grandTotalObtained}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <ScoreMetric label="Agg. Percentage" value={`${percentage}%`} color="text-emerald-600" />
        <ScoreMetric label="Class Rank" value={`#${rank}`} color="text-indigo-600" />
        <ScoreMetric label="Final Result" value={parseFloat(percentage) >= 40 ? 'Promoted' : 'Needs Review'} color={parseFloat(percentage) >= 40 ? 'text-emerald-600' : 'text-rose-600'} />
      </div>

      <div className="mt-auto grid grid-cols-2 gap-20 items-end px-6 pb-4 border-t border-slate-50 pt-10">
        <div className="text-center">
           <div className="h-8 flex items-center justify-center font-serif text-slate-200 text-xl mb-1">Signed</div>
          <div className="w-full border-t-2 border-slate-100 pt-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Class Counselor</div>
        </div>
        <div className="text-center">
          <div className="h-8 flex items-center justify-center font-serif text-slate-200 text-xl mb-1">Official Seal</div>
          <div className="w-full border-t-2 border-slate-100 pt-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Head of Academy</div>
        </div>
      </div>
    </div>
  );
};

const DocumentField: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</span>
    <span className="text-xs font-black text-slate-800 truncate">{value}</span>
  </div>
);

const ScoreMetric: React.FC<{ label: string, value: string, color: string }> = ({ label, value, color }) => (
  <div className="bg-white p-5 rounded-[2rem] border border-slate-100 text-center shadow-sm">
    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</span>
    <span className={`text-xl font-black ${color}`}>{value}</span>
  </div>
);

export default ExamView;
