'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, Building2, PenLine, ListFilter } from 'lucide-react';

export const NIGERIAN_INSTITUTIONS = [
  // Federal Universities
  'Federal University of Technology, Akure (FUTA)',
  'University of Lagos (UNILAG)',
  'Ahmadu Bello University, Zaria (ABU)',
  'University of Ibadan (UI)',
  'University of Nigeria, Nsukka (UNN)',
  'Obafemi Awolowo University, Ile-Ife (OAU)',
  'University of Benin (UNIBEN)',
  'University of Ilorin (UNILORIN)',
  'University of Jos (UNIJOS)',
  'University of Port Harcourt (UNIPORT)',
  'Federal University of Technology, Minna (FUTMINNA)',
  'Federal University of Technology, Owerri (FUTO)',
  'Bayero University, Kano (BUK)',
  'University of Abuja (UNIABUJA)',
  'University of Calabar (UNICAL)',
  'University of Uyo (UNIUYO)',
  'Nnamdi Azikiwe University, Awka (UNIZIK)',
  'Abubakar Tafawa Balewa University, Bauchi (ATBU)',
  'Federal University of Agriculture, Abeokuta (FUNAAB)',
  'Michael Okpara University of Agriculture, Umudike (MOUAU)',
  'Federal University, Oye-Ekiti (FUOYE)',
  'Federal University, Dutse (FUD)',
  'Federal University, Lokoja (FULOKOJA)',
  'Federal University, Lafia (FULAFIA)',
  'Federal University, Wukari',
  'Federal University, Kashere',
  'Federal University, Birnin Kebbi (FUBK)',
  'Federal University, Gusau',
  'Federal University of Petroleum Resources, Effurun (FUPRE)',
  'Nigeria Police Academy, Wudil',
  'Nigerian Defence Academy, Kaduna (NDA)',

  // State Universities
  'Lagos State University (LASU)',
  'Rivers State University (RSU)',
  'Adekunle Ajasin University, Akungba-Akoko (AAUA)',
  'Olabisi Onabanjo University, Ago-Iwoye (OOU)',
  'Ekiti State University, Ado-Ekiti (EKSU)',
  'Delta State University, Abraka (DELSU)',
  'Kaduna State University (KASU)',
  'Osun State University (UNIOSUN)',
  'Kwara State University, Malete (KWASU)',
  'Ladoke Akintola University of Technology, Ogbomoso (LAUTECH)',
  'Ambrose Alli University, Ekpoma (AAU)',
  'Enugu State University of Science and Technology (ESUT)',
  'Ebonyi State University, Abakaliki (EBSU)',
  'Abia State University, Uturu (ABSU)',
  'Imo State University, Owerri (IMSU)',
  'Benue State University, Makurdi (BSU)',
  'Plateau State University, Bokkos (PLASU)',
  'Taraba State University, Jalingo',
  'Nasarawa State University, Keffi (NSUK)',
  'Kogi State University, Anyigba (Prince Abubakar Audu Univ.)',
  'Chukwuemeka Odumegwu Ojukwu University, Uli (COOU)',
  'Ignatius Ajuru University of Education, Port Harcourt',
  'Tai Solarin University of Education, Ijebu-Ode (TASUED)',
  'Yusuf Maitama Sule University, Kano (NWU)',
  'Kano University of Science and Technology, Wudil (KUST)',
  'Sule Lamido University, Kafin Hausa',
  'Kebbi State University of Science and Technology, Aliero',
  'Sokoto State University',
  'Bauchi State University, Gadau',
  'Gombe State University',
  'Borno State University, Maiduguri',
  'Yobe State University, Damaturu',
  'Adamawa State University, Mubi',
  'Ondo State University of Science and Technology, Okitipupa (OAUSTECH)',
  'University of Medical Sciences, Ondo (UNIMED)',
  'Lagos State University of Science and Technology (LASUSTECH)',
  'Lagos State University of Education (LASUED)',
  'Confluence University of Science and Technology, Osara (CUSTECH)',

  // Notable Private Universities
  'Covenant University, Ota',
  'Babcock University, Ilishan-Remo',
  'Afe Babalola University, Ado-Ekiti (ABUAD)',
  'Bowen University, Iwo',
  'Landmark University, Omu-Aran',
  'Pan-Atlantic University, Lagos',
  'Nile University of Nigeria, Abuja',
  'Baze University, Abuja',
  'Redeemer\'s University, Ede',
  'American University of Nigeria, Yola (AUN)',
  'Bells University of Technology, Ota',
  'Ajayi Crowther University, Oyo',
  'Lead City University, Ibadan',
  'Caleb University, Imota',
  'Veritas University, Abuja',
  'Al-Hikmah University, Ilorin',
  'Bingham University, Karu',
  'Adeleke University, Ede',
  'Achievers University, Owo',
  'Elizade University, Ilara-Mokin',

  // Prominent Polytechnics & Colleges
  'Yaba College of Technology (YABATECH)',
  'Federal Polytechnic, Ilaro',
  'Federal Polytechnic, Nekede',
  'Federal Polytechnic, Ado-Ekiti',
  'Federal Polytechnic, Ede',
  'Federal Polytechnic, Bauchi',
  'Federal Polytechnic, Bida',
  'Federal Polytechnic, Oko',
  'Kaduna Polytechnic (KADPOLY)',
  'The Polytechnic, Ibadan',
  'Lagos State Polytechnic (now LASUSTECH)',
  'Kwara State Polytechnic, Ilorin',
  'Auchi Polytechnic, Auchi',
  'Moshood Abiola Polytechnic, Abeokuta (MAPOLY)',
  'Rufus Giwa Polytechnic, Owo',
  'Institute of Management and Technology, Enugu (IMT)',
];

interface InstitutionSelectProps {
  value: string;
  onChange: (institution: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  error?: string;
}

export default function InstitutionSelect({
  value,
  onChange,
  label = 'Tertiary Institution',
  placeholder = 'Select or type your institution...',
  required = false,
  className = '',
  error,
}: InstitutionSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [isManualMode, setIsManualMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal searchTerm with parent value when value changes externally
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Handle clicking outside to close the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredInstitutions = NIGERIAN_INSTITUTIONS.filter(inst =>
    inst.toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSearchTerm(val);
    onChange(val);
    setIsOpen(true);
  }

  function handleSelect(inst: string) {
    setSearchTerm(inst);
    onChange(inst);
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

      {/* Main Input Field - Always typeable! */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => {
            if (!isManualMode) setIsOpen(true);
          }}
          placeholder={isManualMode ? 'Enter custom university/polytechnic name...' : placeholder}
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

      {/* Filtered Dropdown List */}
      {isOpen && !isManualMode && (
        <div className="absolute left-0 right-0 top-full mt-1.5 max-h-56 bg-white border border-slate-200 rounded-xl shadow-xl overflow-y-auto z-50 divide-y divide-slate-100 animate-fadeIn">
          {filteredInstitutions.length > 0 ? (
            filteredInstitutions.slice(0, 30).map((inst) => {
              const isSelected = value.toLowerCase() === inst.toLowerCase();
              return (
                <button
                  type="button"
                  key={inst}
                  onClick={() => handleSelect(inst)}
                  className={`w-full text-left px-3.5 py-2.5 text-xs sm:text-sm flex items-center justify-between gap-2 hover:bg-sky-50/70 transition-colors cursor-pointer ${
                    isSelected ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-800'
                  }`}
                >
                  <span className="truncate">{inst}</span>
                  {isSelected && <Check className="w-4 h-4 text-sky-600 flex-shrink-0" />}
                </button>
              );
            })
          ) : (
            <div className="p-3 text-center text-xs text-slate-500 space-y-1">
              <p>No exact match found.</p>
              <p className="text-[11px] text-sky-600 font-medium">
                You can keep what you typed, or click &ldquo;Type manually&rdquo; above.
              </p>
            </div>
          )}

          {/* Option at the bottom to enter custom if not listed */}
          <button
            type="button"
            onClick={() => {
              setIsManualMode(true);
              setIsOpen(false);
            }}
            className="w-full text-left px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-sky-700 flex items-center gap-2 cursor-pointer transition-colors border-t border-slate-200"
          >
            <PenLine className="w-3.5 h-3.5 text-sky-600" />
            <span>Institution not in list? Type it manually &rarr;</span>
          </button>
        </div>
      )}

      {error && <p className="text-[11px] text-red-600 font-medium mt-1">{error}</p>}
    </div>
  );
}
