
import React, { useState, useRef } from 'react';
import { Student, TermResult } from '../types.ts';
import IDCard from './IDCard.tsx';
import Certificate from './Certificate.tsx';

interface StudentViewProps {
  students: Student[];
  onSelect: (s: Student) => void;
  onAddStudent: (s: Student) => void;
  schoolName: string;
  schoolSlogan: string;
  academicSession: string;
  t: (key: string) => string;
}

const StudentView: React.FC<StudentViewProps> = ({ students, onSelect, onAddStudent, schoolName, schoolSlogan, academicSession, t }) => {
  const [selectedForID, setSelectedForID] = useState<Student | null>(null);
  const [selectedForCert, setSelectedForCert] = useState<{ student: Student, type: 'TC' | 'Character' } | null>(null);
  const [lastRegistered, setLastRegistered] = useState<Student | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    className: '',
    fatherName: '',
    guardianName: '',
    aadhaar: '',
    phone: '',
    address: '',
    admissionFees: 5000,
    monthlyFees: 2000,
    admissionDate: new Date().toISOString().split('T')[0],
    photo: '' as string,
    subjects: 'Mathematics, Science, English, Hindi, Social Science'
  });

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
    
    const subjectArray = formData.subjects.split(',').map(s => s.trim()).filter(s => s !== '');
    const generateTermScores = () => subjectArray.map(sub => ({
      subject: sub,
      marks: 0,
      oralMarks: 0,
      maxMarks: 100
    }));

    const examResults: TermResult[] = [
      { termName: 'Term 1', scores: generateTermScores() },
      { termName: 'Term 2', scores: generateTermScores() },
      { termName: 'Final Term', scores: generateTermScores() }
    ];

    const newStudent: Student = {
      ...formData,
      id: `STU${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      photo: formData.photo || `https://picsum.photos/seed/${formData.name}/200/200`,
      payments: [],
      examResults: examResults
    };
    onAddStudent(newStudent);
    setShowAddModal(false);
    setLastRegistered(newStudent);
    setFormData({
      name: '',
      className: '',
      fatherName: '',
      guardianName: '',
      aadhaar: '',
      phone: '',
      address: '',
      admissionFees: 5000,
      monthlyFees: 2000,
      admissionDate: new Date().toISOString().split('T')[0],
      photo: '',
      subjects: 'Mathematics, Science, English, Hindi, Social Science'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">{t('studentDirectory')}</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
          {t('addStudent')}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{t('students')}</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">ID No.</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Class</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Connect</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map(s => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelect(s)}>
                    <img src={s.photo} className="w-10 h-10 rounded-full object-cover border border-slate-200" alt="" />
                    <span className="font-semibold text-slate-700">{s.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-mono">{s.id}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{s.className}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <a href={`tel:${s.phone}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Call">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                    </a>
                    <a href={`https://wa.me/${s.phone}`} target="_blank" className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="WhatsApp">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </a>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedForID(s)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg" title={t('idCard')}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg></button>
                    <button onClick={() => setSelectedForCert({ student: s, type: 'Character' })} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg" title={t('certificate')}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-2xl font-black mb-6 tracking-tight text-slate-800">New Registration</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center mb-6">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-3xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                    {formData.photo ? (
                      <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input required className="p-3 bg-slate-50 rounded-xl border outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Class</label>
                  <input required className="p-3 bg-slate-50 rounded-xl border outline-none" value={formData.className} onChange={e => setFormData({...formData, className: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admission Date</label>
                  <input required type="date" className="p-3 bg-slate-50 rounded-xl border outline-none" value={formData.admissionDate} onChange={e => setFormData({...formData, admissionDate: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                  <input required className="p-3 bg-slate-50 rounded-xl border outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Father's Name</label>
                  <input required className="p-3 bg-slate-50 rounded-xl border outline-none" value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Aadhaar ID</label>
                  <input required className="p-3 bg-slate-50 rounded-xl border outline-none" value={formData.aadhaar} onChange={e => setFormData({...formData, aadhaar: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admission Fees (₹)</label>
                  <input required type="number" className="p-3 bg-slate-50 rounded-xl border outline-none font-bold" value={formData.admissionFees} onChange={e => setFormData({...formData, admissionFees: parseInt(e.target.value) || 0})} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly Fees (₹)</label>
                  <input required type="number" className="p-3 bg-slate-50 rounded-xl border outline-none font-bold" value={formData.monthlyFees} onChange={e => setFormData({...formData, monthlyFees: parseInt(e.target.value) || 0})} />
                </div>
                <div className="flex flex-col gap-1 col-span-full">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address</label>
                  <input required className="p-3 bg-slate-50 rounded-xl border outline-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1 col-span-full">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subjects (comma separated)</label>
                  <input required className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 outline-none" value={formData.subjects} onChange={e => setFormData({...formData, subjects: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {(selectedForID || selectedForCert || lastRegistered) && (
        <div className="fixed inset-0 z-[150] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto no-print">
          <div className="bg-white rounded-[2rem] p-8 max-w-4xl w-full relative my-8">
            <div className="document-preview-container">
              {selectedForID && <IDCard schoolName={schoolName} schoolSlogan={schoolSlogan} academicSession={academicSession} student={selectedForID} />}
              {selectedForCert && <Certificate schoolName={schoolName} student={selectedForCert.student} type={selectedForCert.type} />}
              {lastRegistered && <RegistrationForm schoolName={schoolName} academicSession={academicSession} student={lastRegistered} />}
            </div>
            <div className="mt-8 flex gap-4 no-print">
              <button onClick={() => { setSelectedForID(null); setSelectedForCert(null); setLastRegistered(null); }} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black">Close</button>
              <button onClick={() => window.print()} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black">Print</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RegistrationForm: React.FC<{ student: Student, schoolName: string, academicSession: string }> = ({ student, schoolName, academicSession }) => (
  <div className="p-10 border-[10px] border-slate-100 rounded-[2rem] bg-white text-slate-800">
    <div className="text-center border-b pb-8 mb-8">
      <h1 className="text-3xl font-black">{schoolName}</h1>
      <h2 className="text-lg uppercase text-indigo-600">Student Admission Record</h2>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Academic Session {academicSession}</p>
    </div>
    <div className="flex justify-between gap-8">
      <div className="flex-1 grid grid-cols-2 gap-8">
        <div><p className="text-[10px] font-bold text-slate-400 uppercase">Student Name</p><p className="font-bold">{student.name}</p></div>
        <div><p className="text-[10px] font-bold text-slate-400 uppercase">Class</p><p className="font-bold">{student.className}</p></div>
        <div><p className="text-[10px] font-bold text-slate-400 uppercase">Admission Date</p><p className="font-bold">{student.admissionDate}</p></div>
        <div><p className="text-[10px] font-bold text-slate-400 uppercase">Admission Fee</p><p className="font-bold">₹{student.admissionFees.toLocaleString()}</p></div>
        <div><p className="text-[10px] font-bold text-slate-400 uppercase">Monthly Fee</p><p className="font-bold">₹{student.monthlyFees.toLocaleString()}</p></div>
        <div><p className="text-[10px] font-bold text-slate-400 uppercase">Subjects</p><p className="font-bold text-xs">{student.examResults[0].scores.map(s => s.subject).join(', ')}</p></div>
      </div>
      <img src={student.photo} className="w-32 h-32 rounded-2xl object-cover border" alt="" />
    </div>
  </div>
);

export default StudentView;
