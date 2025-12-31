
import React, { useState, useRef, useMemo } from 'react';
import { Teacher, TeacherPayment } from '../types.ts';
import { MONTHS } from '../constants.ts';

interface TeacherViewProps {
  teachers: Teacher[];
  onAddTeacher: (t: Teacher) => void;
  onPayTeacher: (id: string, month: string, amount: number) => void;
  onSelect: (t: Teacher) => void;
  t: (key: string) => string;
}

const TeacherView: React.FC<TeacherViewProps> = ({ teachers, onAddTeacher, onPayTeacher, onSelect, t }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [lastEnrolled, setLastEnrolled] = useState<Teacher | null>(null);
  const [selectedForPayment, setSelectedForPayment] = useState<Teacher | null>(null);
  const [payMonth, setPayMonth] = useState(MONTHS[new Date().getMonth()]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    subject: '',
    salary: 30000,
    photo: '',
  });

  const calendarMonthsElapsed = useMemo(() => new Date().getMonth(), []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTeacher: Teacher = {
      ...formData,
      id: `TCH${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      photo: formData.photo || `https://picsum.photos/seed/${formData.name}/200/200`,
      payments: []
    };
    onAddTeacher(newTeacher);
    setShowAddModal(false);
    setLastEnrolled(newTeacher);
    setFormData({ name: '', phone: '', subject: '', salary: 30000, photo: '' });
  };

  const handleConfirmPayment = async () => {
    if (!selectedForPayment) return;
    setIsProcessing(true);
    // Simulate cloud delay
    await new Promise(resolve => setTimeout(resolve, 800));
    onPayTeacher(selectedForPayment.id, payMonth, selectedForPayment.salary);
    setIsProcessing(false);
    setSelectedForPayment(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight text-center md:text-left">{t('facultyPayroll')}</h2>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Managing {teachers.length} faculty members • Jan - Dec Cycle</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
          {t('addTeacher')}
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Teacher Identity</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Paid Months (Jan-Dec)</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Connect</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Salary</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {teachers.map(teacher => (
                <tr key={teacher.id} className="group hover:bg-slate-50/80 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => onSelect(teacher)}>
                      <img src={teacher.photo} className="w-12 h-12 rounded-2xl object-cover ring-4 ring-white shadow-sm" alt="" />
                      <div>
                        <p className="font-bold text-slate-800 text-base">{teacher.name}</p>
                        <p className="text-[10px] text-indigo-600 font-black tracking-widest uppercase">{teacher.subject}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex gap-1 justify-center">
                      {MONTHS.map(m => {
                        const isPaid = teacher.payments?.some(p => p.month === m);
                        return (
                          <div 
                            key={m} 
                            title={m}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-[8px] font-black transition-all border ${
                              isPaid 
                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' 
                                : 'bg-white border-slate-100 text-slate-300'
                            }`}
                          >
                            {m.substring(0, 1)}
                          </div>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex gap-2">
                      <a href={`tel:${teacher.phone}`} className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all" title="Call">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                      </a>
                      <a href={`https://wa.me/${teacher.phone}`} target="_blank" className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all" title="WhatsApp">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      </a>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-mono font-bold text-slate-700 text-base">₹{teacher.salary.toLocaleString()}</td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => {
                        setSelectedForPayment(teacher);
                        const firstUnpaid = MONTHS.find(m => !teacher.payments?.some(p => p.month === m)) || MONTHS[calendarMonthsElapsed];
                        setPayMonth(firstUnpaid);
                      }}
                      className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-md active:scale-95"
                    >
                      {t('paySalary')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedForPayment && (
        <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full relative shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {isProcessing && (
              <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 border-[6px] border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">Disbursing...</h3>
              </div>
            )}
            <h3 className="text-3xl font-black text-slate-800 mb-2 tracking-tighter">Salary Payout</h3>
            <p className="text-slate-400 text-sm mb-8 font-medium">Monthly salary release for {selectedForPayment.name}.</p>
            
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center gap-4">
                <img src={selectedForPayment.photo} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white" alt="" />
                <div>
                  <p className="font-black text-slate-800 text-lg leading-tight">{selectedForPayment.name}</p>
                  <p className="text-xs text-indigo-600 font-black uppercase tracking-widest mt-1">{selectedForPayment.subject} Specialist</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Selected Month</label>
                  <select 
                    value={payMonth}
                    onChange={(e) => setPayMonth(e.target.value)}
                    className="p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-indigo-600 font-black text-slate-700 appearance-none transition-all"
                  >
                    {MONTHS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Monthly Salary</label>
                  <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 font-black text-indigo-700 text-lg">
                    ₹{selectedForPayment.salary.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setSelectedForPayment(null)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmPayment}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full relative shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-3xl font-black text-slate-800 mb-8 tracking-tighter">Register Faculty</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center mb-6">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                    {formData.photo ? (
                      <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-12 h-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
                    )}
                  </div>
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity"
                  >
                    Upload Photo
                  </button>
                  <input type="file" hidden ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input required placeholder="Enter name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 ring-indigo-50 font-black text-slate-800" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Specialization</label>
                  <input required placeholder="e.g. Mathematics" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 ring-indigo-50 font-black text-slate-800" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                  <input required placeholder="Enter mobile number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 ring-indigo-50 font-black text-slate-800" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly Salary (INR)</label>
                  <input required type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-slate-800" value={formData.salary} onChange={e => setFormData({...formData, salary: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 uppercase tracking-widest hover:bg-indigo-700 transition-all">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherView;
