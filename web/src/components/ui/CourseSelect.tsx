'use client';

import React, { useState, useEffect } from 'react';
import { GraduationCap, Edit3 } from 'lucide-react';

export const STANDARD_COURSES = [
  'Computer Science',
  'Software Engineering',
  'Information Technology',
  'Cybersecurity',
  'Computer Engineering',
  'Electrical & Electronic Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Mechatronics Engineering',
  'Chemical Engineering',
  'Petroleum & Gas Engineering',
  'Agricultural Engineering',
  'Microbiology',
  'Biochemistry',
  'Biotechnology',
  'Architecture',
  'Estate Management',
  'Quantity Surveying',
  'Medicine & Surgery',
  'Nursing Science',
  'Medical Laboratory Science',
  'Pharmacy',
  'Accounting',
  'Banking & Finance',
  'Business Administration',
  'Economics',
  'Mass Communication',
  'Political Science',
  'Public Administration',
  'Law',
  'Other'
];

interface CourseSelectProps {
  value: string;
  onChange: (course: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export default function CourseSelect({
  value,
  onChange,
  label = 'Course of Study',
  placeholder = 'Type your exact course / department (e.g. Cyber Forensics)...',
  required = false,
  className = '',
}: CourseSelectProps) {
  // Check if current value matches one of the standard presets (excluding 'Other')
  const isPreset = STANDARD_COURSES.slice(0, -1).includes(value);

  // If not in presets, mode is 'Other'
  const [selectedOption, setSelectedOption] = useState<string>(
    isPreset ? value : 'Other'
  );
  const [customCourse, setCustomCourse] = useState<string>(
    isPreset ? '' : value
  );

  useEffect(() => {
    if (STANDARD_COURSES.slice(0, -1).includes(value)) {
      setSelectedOption(value);
      setCustomCourse('');
    } else if (value) {
      setSelectedOption('Other');
      setCustomCourse(value);
    }
  }, [value]);

  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    setSelectedOption(val);
    if (val === 'Other') {
      onChange(customCourse || '');
    } else {
      onChange(val);
    }
  }

  function handleCustomInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setCustomCourse(val);
    onChange(val);
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
            <span>{label}</span>
            {required && <span className="text-rose-500">*</span>}
          </span>
          {selectedOption === 'Other' && (
            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Custom Course
            </span>
          )}
        </label>
      )}

      {/* Preset Dropdown */}
      <div className="relative">
        <select
          value={selectedOption}
          onChange={handleSelectChange}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
        >
          {STANDARD_COURSES.map(course => (
            <option key={course} value={course}>
              {course === 'Other' ? '✨ Other (Enter custom course...)' : course}
            </option>
          ))}
        </select>
      </div>

      {/* Dynamic Custom Course Text Input (Shows when "Other" is selected) */}
      {selectedOption === 'Other' && (
        <div className="relative animate-in fade-in slide-in-from-top-1 duration-200 pt-0.5">
          <Edit3 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-500 pointer-events-none" />
          <input
            type="text"
            required={required}
            value={customCourse}
            onChange={handleCustomInputChange}
            placeholder={placeholder}
            className="w-full bg-white border border-blue-300 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs transition-all"
            autoFocus
          />
        </div>
      )}
    </div>
  );
}
