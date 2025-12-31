
import React from 'react';
import { Student } from '../types';

interface CertificateProps {
  student: Student;
  type: 'TC' | 'Character';
  schoolName: string;
}

const Certificate: React.FC<CertificateProps> = ({ student, type, schoolName }) => {
  const isTC = type === 'TC';

  return (
    <div className="w-full max-w-[800px] mx-auto aspect-[1/1.414] bg-white border-[12px] md:border-[20px] border-double border-slate-200 p-6 md:p-12 flex flex-col items-center relative font-serif shadow-2xl">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <svg className="w-2/3 h-2/3 text-indigo-900" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
        </svg>
      </div>

      <div className="text-center mb-8 md:mb-12 relative z-10">
        <h1 className="text-2xl md:text-4xl font-black text-slate-800 uppercase mb-2 tracking-tighter">{schoolName}</h1>
        <p className="text-[10px] md:text-sm text-slate-500 italic">Affiliated to National Board of Education | Reg No. EC-2023-999</p>
        <div className="w-16 md:w-24 h-1 bg-indigo-600 mx-auto mt-4"></div>
      </div>

      <div className="text-center mb-10 md:mb-16 relative z-10">
        <h2 className="text-3xl md:text-5xl text-indigo-900 font-bold mb-6 md:mb-10 underline decoration-double underline-offset-8 uppercase">
          {isTC ? 'Transfer Certificate' : 'Character Certificate'}
        </h2>
        <div className="text-base md:text-xl text-slate-700 leading-loose max-w-2xl mx-auto px-4">
          <p className="mb-4">This is to certify that</p>
          <p className="text-2xl md:text-3xl font-black text-slate-900 mb-4 border-b-2 border-dotted border-slate-300 inline-block px-4">
            {student.name}
          </p>
          <p className="mb-4">
            son/daughter of <b>Mr. {student.fatherName}</b>,<br/>
            bearing Student ID <b>{student.id}</b>, has been a bonafide student 
            of this institution in Class <b>{student.className}</b>.
          </p>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 px-6 md:px-12 mb-10 md:mb-20 text-sm md:text-lg relative z-10">
        <div className="space-y-4">
          <p><span className="text-slate-400 font-bold uppercase text-[10px]">Date of Admission:</span> <br/><b>{student.admissionDate}</b></p>
          <p><span className="text-slate-400 font-bold uppercase text-[10px]">Aadhaar Verification:</span> <br/><b>{student.aadhaar}</b></p>
          <p><span className="text-slate-400 font-bold uppercase text-[10px]">Permanent Address:</span> <br/><b className="text-xs md:text-base">{student.address}</b></p>
        </div>
        <div className="space-y-4">
          <p><span className="text-slate-400 font-bold uppercase text-[10px]">Academic Standing:</span> <br/><b>Meritorious</b></p>
          <p><span className="text-slate-400 font-bold uppercase text-[10px]">Conduct & Character:</span> <br/><b>Excellent</b></p>
          {isTC && <p><span className="text-slate-400 font-bold uppercase text-[10px]">Reason for leaving:</span> <br/><b>Completion of Course</b></p>}
        </div>
      </div>

      <div className="mt-auto w-full flex justify-between items-end px-6 md:px-12 pb-8 relative z-10">
        <div className="text-center">
          <div className="text-slate-700 font-bold mb-1">{new Date().toLocaleDateString()}</div>
          <div className="w-32 md:w-40 border-t-2 border-slate-300 pt-2 text-slate-400 font-black text-[10px] uppercase">Dated</div>
        </div>
        <div className="text-center">
          <div className="h-12 md:h-16 flex items-center justify-center italic text-indigo-600/30 text-2xl mb-1 select-none">Head Office</div>
          <div className="w-32 md:w-40 border-t-2 border-slate-300 pt-2 text-slate-400 font-black text-[10px] uppercase">Principal</div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
