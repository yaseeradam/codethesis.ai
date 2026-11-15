'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, PenLine, ListFilter } from 'lucide-react';

export const POPULAR_DEPARTMENTS = [
  'Computer Science',
  'Software Engineering',
  'Cybersecurity',
  'Information Technology',
  'Computer Engineering',
  'Electrical & Electronic Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Mechatronics Engineering',
  'Chemical Engineering',
  'Petroleum & Gas Engineering',
  'Agricultural Engineering',
  'Biomedical Engineering',
  'Data Science & Analytics',
  'Artificial Intelligence & Robotics',
  'Information Systems',
  'Microbiology',
  'Biochemistry',
  'Biotechnology',
  'Pure & Applied Physics',
  'Industrial Chemistry',
  'Architecture',
  'Estate Management',
  'Quantity Surveying',
  'Urban & Regional Planning',
  'Building Technology',
  'Medicine & Surgery',
  'Nursing Science',
  'Medical Laboratory Science',
  'Pharmacy',
  'Physiotherapy',
  'Public Health',
  'Accounting',
  'Banking & Finance',
  'Business Administration',
  'Economics',
  'Marketing',
  'Mass Communication',
  'Political Science',
  'Public Administration',
  'Sociology',
  'Law',
  'English & Literary Studies',
  'History & International Studies'
];

interface CourseSelectProps {
  value: string;
  onChange: (course: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  error?: string;
}

export default function CourseSelect({
  value,
  onChange,
  label = 'Department / Course of Study',
  placeholder = 'Type or choose your department...',
  required = false,
  className = '',
  error,
}: CourseSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [isManualMode, setIsManualMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredDepartments = POPULAR_DEPARTMENTS.filter(dept =>
    dept.toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSearchTerm(val);
    onChange(val);
    setIsOpen(true);
  }

  function handleSelect(dept: string) {
    setSearchTerm(dept);
    onChange(dept);
    setIsOpen(false);
  }

  function toggleManualMode() {
    setIsManualMode(!isManualMode);
    setIsOpen(false);
  }

  return (
    <div className={`space-y-1.5 relative ${className}`} ref={containerRef}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-slate-700">
          <span>{label}</span>
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
        <button
          type="button"
          onClick={toggleManualMode}
          className="text-[11px] font-medium text-sky-600 hover:text-sky-700 inline-flex items-center gap-1 cursor-pointer transition-colors"
        >
          {isManualMode ? (
            <>
              <ListFilter className="w-3 h-3" />
              <span>Choose from list</span>
            </>
          ) : (
            <>
              <PenLine className="w-3 h-3" />
              <span>Type manually</span>
            </>
          )}
        </button>
      </div>

      {/* Main Input Field - ALWAYS TYPEABLE! User can type anything directly! */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => {
            if (!isManualMode) setIsOpen(true);
          }}
          placeholder={isManualMode ? 'Type custom department or course...' : placeholder}
          className={`w-full h-11 bg-white border ${
            error ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10'
          } rounded-xl px-3.5 pr-9 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-xs`}
        />

        {!isManualMode && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Dropdown Suggestions */}
      {isOpen && !isManualMode && (
        <div className="absolute left-0 right-0 top-full mt-1.5 max-h-56 bg-white border border-slate-200 rounded-xl shadow-xl overflow-y-auto z-50 divide-y divide-slate-100 animate-fadeIn">
          {filteredDepartments.length > 0 ? (
            filteredDepartments.map((dept) => {
              const isSelected = value.toLowerCase() === dept.toLowerCase();
              return (
                <button
                  type="button"
                  key={dept}
                  onClick={() => handleSelect(dept)}
                  className={`w-full text-left px-3.5 py-2.5 text-xs sm:text-sm flex items-center justify-between gap-2 hover:bg-sky-50/70 transition-colors cursor-pointer ${
                    isSelected ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-800'
                  }`}
                >
                  <span className="truncate">{dept}</span>
                  {isSelected && <Check className="w-4 h-4 text-sky-600 flex-shrink-0" />}
                </button>
              );
            })
          ) : (
            <div className="p-3 text-center text-xs text-slate-500 space-y-1">
              <p>No exact department match.</p>
              <p className="text-[11px] text-sky-600 font-medium">
                You can keep what you typed, or click &ldquo;Type manually&rdquo; above.
              </p>
            </div>
          )}

          {/* Option at the bottom */}
          <button
            type="button"
            onClick={() => {
              setIsManualMode(true);
              setIsOpen(false);
            }}
            className="w-full text-left px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-sky-700 flex items-center gap-2 cursor-pointer transition-colors border-t border-slate-200"
          >
            <PenLine className="w-3.5 h-3.5 text-sky-600" />
            <span>Department not in list? Type it freely &rarr;</span>
          </button>
        </div>
      )}

      {error && <p className="text-[11px] text-red-600 font-medium mt-1">{error}</p>}
    </div>
  );
}
