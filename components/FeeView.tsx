
import React, { useState } from 'react';
import { Student, FeeStatus } from '../types.ts';
import { MONTHS } from '../constants.ts';

// Added t function to FeeViewProps to fix type mismatch in App.tsx
interface FeeViewProps {
  students: Student[];
  onCollectFee: (id: string, month: string, amount: number) => void;
  schoolName: string;
  t: (key: string) => string;
}

const FeeView: React.FC<FeeViewProps> = ({ students, onCollectFee, schoolName, t }) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [lastPayment, setLastPayment] = useState<{ student: Student, month: string, id: string } | null>(null);
  const [payMonth, setPayMonth] = useState(MONTHS[new Date().getMonth()]);
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateStudentFees = (s: Student) => {
    const totalPaid = s.payments.reduce((acc, p) => acc + p.amount, 0);
    const admissionFees = s.admissionFees || 0;
    const currentMonthIdx = new Date().getMonth();
    
    // Monthly fees expected from start of session to current month
    const expectedMonthlyTillNow = s.monthlyFees * (currentMonthIdx + 1);
    const totalExpected = admissionFees + expectedMonthlyTillNow;
    
    const totalDue = Math.max(0, totalExpected - totalPaid);
    return { totalPaid, totalDue, totalExpected };
  };

  const handleProcessPayment = async () => {
    if (!selectedStudent) return;
    setIsProcessing(true);
    // Simulate cloud sync delay
    await new Promise(resolve => setTimeout(resolve, 800)); 
    onCollectFee(selectedStudent.id, payMonth, selectedStudent.monthlyFees);
    setLastPayment({ 
      student: selectedStudent, 
      month: payMonth, 
      id: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}` 
    });
    setIsProcessing(false);
    setSelectedStudent(null);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Finance & Fees</h2>
          <p className="text-sm text-slate-500 font-medium">Monthly Ledger View</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm self-start">
           <div className="px-4 py-2 bg-indigo-50 rounded-xl text-indigo-600 text-[10px] font-black uppercase tracking-widest">Jan - Dec Cycle</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {students.map(s => {
          const { totalDue } = calculateStudentFees(s);
          return (
            <div key={s.id} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5">
              <div className="flex items-center gap-4">
                <img src={s.photo} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-50" alt="" />
                <div className="flex-1">
                  <h4 className="font-black text-slate-800 leading-tight">{s.name}</h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Class {s.className}</p>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-black block ${totalDue > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    ₹{totalDue.toLocaleString()}
                  </span>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Due</p>
                </div>
              </div>
              
              <div className="grid grid-cols-6 gap-2">
                {MONTHS.map(m => {
                  const isPaid = s.payments.some(p => p.month === m);
                  return (
                    <div key={m} className={`h-8 rounded-xl flex items-center justify-center text-[9px] font-black uppercase transition-all border ${
                        isPaid ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-50 border-slate-100 text-slate-300'
                      }`}>
                      {m.substring(0, 1)}
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={() => { 
                  setSelectedStudent(s); 
                  const firstUnpaid = MONTHS.find(m => !s.payments.some(p => p.month === m)) || MONTHS[new Date().getMonth()];
                  setPayMonth(firstUnpaid);
                }}
                className="w-full py-4 bg-indigo-600 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-100"
              >
                Collect Fee
              </button>
            </div>
          );
        })}
      </div>

      <div className="hidden lg:block bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Month Breakdown (Jan - Dec)</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Outstanding</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {students.map(s => {
              const { totalDue } = calculateStudentFees(s);
              return (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <img src={s.photo} className="w-12 h-12 rounded-2xl object-cover ring-4 ring-white" alt="" />
                      <div>
                        <p className="font-bold text-slate-800">{s.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">ID: {s.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex gap-1.5">
                      {MONTHS.map(m => {
                        const isPaid = s.payments.some(p => p.month === m);
                        return (
                          <button 
                            key={m}
                            onClick={() => { if (!isPaid) { setSelectedStudent(s); setPayMonth(m); } }}
                            className={`w-9 h-9 rounded-2xl flex items-center justify-center text-[10px] font-black border transition-all ${
                              isPaid ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-100 text-slate-300 hover:border-indigo-300'
                            }`}
                          >
                            {m.substring(0, 1)}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className={`text-xl font-black block leading-none mb-1 ${totalDue > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      ₹{totalDue.toLocaleString()}
                    </span>
                    <button onClick={() => { setSelectedStudent(s); setPayMonth(MONTHS[new Date().getMonth()]); }} className="text-[10px] font-black uppercase text-indigo-600 hover:underline">Receive Pay</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 relative shadow-2xl animate-in zoom-in-95 duration-200">
             {isProcessing && (
              <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 border-[6px] border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">Processing...</h3>
              </div>
            )}
            <h3 className="text-3xl font-black text-slate-800 mb-8 tracking-tighter">Collect Monthly Fee</h3>
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center gap-4">
                <img src={selectedStudent.photo} className="w-16 h-16 rounded-2xl object-cover" alt="" />
                <div>
                  <p className="font-black text-slate-800 text-lg leading-tight">{selectedStudent.name}</p>
                  <p className="text-xs text-indigo-600 font-black uppercase tracking-widest">Class {selectedStudent.className}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Selected Month</label>
                  <select 
                    value={payMonth}
                    onChange={(e) => setPayMonth(e.target.value)}
                    className="p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 outline-none font-black text-slate-700 appearance-none"
                  >
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Amount</label>
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl font-black text-emerald-700 text-xl">
                    ₹{selectedStudent.monthlyFees.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setSelectedStudent(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest">Cancel</button>
                <button onClick={handleProcessPayment} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100">Receive</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {lastPayment && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm no-print">
          <div className="bg-white rounded-[3rem] p-8 max-w-2xl w-full animate-in slide-in-from-bottom duration-500">
            <h3 className="text-2xl font-black text-emerald-600 uppercase mb-8">Success</h3>
            <FeeReceipt payment={lastPayment} schoolName={schoolName} />
            <div className="mt-8 flex gap-4">
              <button onClick={() => setLastPayment(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest">Close</button>
              <button onClick={() => window.print()} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest">Print</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FeeReceipt: React.FC<{ payment: { student: Student, month: string, id: string }, schoolName: string }> = ({ payment, schoolName }) => (
  <div className="p-8 border-[10px] border-slate-50 rounded-[3rem] bg-white text-slate-800">
    <div className="text-center border-b pb-6 mb-6">
      <h1 className="text-3xl font-black tracking-tighter">{schoolName}</h1>
      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Official Receipt</p>
    </div>
    <div className="grid grid-cols-2 gap-y-6 mb-8">
      <div><label className="block text-[8px] font-black text-slate-400 uppercase">Student</label><span className="font-black">{payment.student.name}</span></div>
      <div><label className="block text-[8px] font-black text-slate-400 uppercase">Class</label><span className="font-black">{payment.student.className}</span></div>
      <div><label className="block text-[8px] font-black text-slate-400 uppercase">Month Paid</label><span className="font-black text-indigo-600">{payment.month}</span></div>
      <div><label className="block text-[8px] font-black text-slate-400 uppercase">Txn ID</label><span className="font-black text-xs">{payment.id}</span></div>
      <div className="col-span-full bg-emerald-50 p-4 rounded-2xl flex justify-between items-center">
         <span className="text-[10px] font-black text-slate-400 uppercase">Amount Received</span>
         <span className="text-2xl font-black text-emerald-600">₹{payment.student.monthlyFees.toLocaleString()}</span>
      </div>
    </div>
  </div>
);

export default FeeView;
