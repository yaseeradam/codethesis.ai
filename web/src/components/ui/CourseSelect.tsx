'use client';

import React, { useState, useEffect } from 'react';

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
  label = 'Course / Department',
  placeholder = 'Enter your course or department...',
  required = false,
  className = '',
}: CourseSelectProps) {
  const isPreset = STANDARD_COURSES.slice(0, -1).includes(value);

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
        <label className="block text-xs font-medium text-slate-700">
          <span>{label}</span>
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Preset Dropdown */}
      <div className="relative">
        <select
          value={selectedOption}
          onChange={handleSelectChange}
          className="w-full h-11 bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl px-3.5 text-xs sm:text-sm text-slate-900 outline-none transition-all shadow-xs cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_12px_center] bg-no-repeat pr-9"
        >
          {STANDARD_COURSES.map(course => (
            <option key={course} value={course}>
              {course === 'Other' ? 'Other (Enter custom department...)' : course}
            </option>
          ))}
        </select>
      </div>

      {/* Dynamic Custom Course Text Input */}
      {selectedOption === 'Other' && (
        <div className="pt-1 animate-fadeIn">
          <input
            type="text"
            required={required}
            value={customCourse}
            onChange={handleCustomInputChange}
            placeholder={placeholder}
            className="w-full h-11 bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl px-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-xs"
            autoFocus
          />
        </div>
      )}
    </div>
  );
}
