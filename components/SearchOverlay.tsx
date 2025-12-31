
import React, { useState, useMemo } from 'react';
import { Student, Teacher } from '../types';

interface SearchOverlayProps {
  students: Student[];
  teachers: Teacher[];
  onClose: () => void;
  onSelect: (item: Student | Teacher) => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ students, teachers, onClose, onSelect }) => {
  const [query, setQuery] = useState('');

  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    
    const matchedStudents = students.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.className.toLowerCase().includes(q) || 
      s.guardianName.toLowerCase().includes(q)
    );

    const matchedTeachers = teachers.filter(t => 
      t.name.toLowerCase().includes(q) || 
      t.subject.toLowerCase().includes(q)
    );

    return [...matchedStudents, ...matchedTeachers];
  }, [query, students, teachers]);

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-md flex items-start justify-center p-4 md:pt-24">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input 
            autoFocus
            type="text" 
            placeholder="Search student, teacher, class, or guardian..." 
            className="flex-1 text-lg outline-none text-slate-700 bg-transparent"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredResults.length > 0 ? (
            filteredResults.map((item, idx) => (
              <button 
                key={idx}
                onClick={() => onSelect(item)}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-indigo-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <img src={item.photo} className="w-12 h-12 rounded-xl object-cover" alt="" />
                  <div className="text-left">
                    <p className="font-bold text-slate-800">{item.name}</p>
                    <p className="text-xs text-slate-500">
                      {('className' in item) ? `Student | Class ${item.className}` : `Teacher | ${item.subject}`}
                    </p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
              </button>
            ))
          ) : query.trim() ? (
            <div className="py-20 text-center text-slate-400">
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400">
              <p>Start typing to search records...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
