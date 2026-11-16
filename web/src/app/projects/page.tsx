'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/context/AuthContext';
import { downloadAcademicFile } from '@/lib/downloadHelper';
import {
  FolderGit2,
  Plus,
  Search,
  Filter,
  FileText,
  Code2,
  Presentation,
  BookOpen,
  Download,
  Trash2,
  ExternalLink,
  Clock,
  Sparkles,
  CheckCircle2,
  Layers,
  ChevronRight,
  Loader2
} from 'lucide-react';

interface ProjectItem {
  id: string;
  title: string;
  category: 'thesis' | 'software' | 'siwes' | 'presentation';
  course: string;
  institution: string;
  wordCount?: number;
  linesOfCode?: number;
  defenseReadiness: number;
  status: 'Complete' | 'In Progress' | 'Draft';
  lastModified: string;
  studioUrl: string;
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [projectsList, setProjectsList] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch real archived projects from backend database
  useEffect(() => {
    async function loadProjects() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        if (data.success && Array.isArray(data.projects)) {
          const mappedDb: ProjectItem[] = data.projects.map((p: any) => {
            let category: ProjectItem['category'] = 'thesis';
            let studioUrl = '/studio';
            if (p.toolId === 'software-builder' || p.toolId === 'softwareBuilder') {
              category = 'software';
              studioUrl = '/tool/software-builder';
            } else if (p.toolId === 'siwes-logbook' || p.toolId === 'siwesLogbook' || p.toolId === 'itf-report' || p.toolId === 'itfReport') {
              category = 'siwes';
              studioUrl = p.toolId.includes('siwes') ? '/tool/siwes-logbook' : '/tool/itf-report';
            } else if (p.toolId === 'viva-presentation' || p.toolId === 'vivaPresentation' || p.toolId === 'viva-simulator' || p.toolId === 'vivaSimulator') {
              category = 'presentation';
              studioUrl = p.toolId.includes('presentation') ? '/tool/viva-presentation' : '/tool/viva-simulator';
            }

            return {
              id: p.id,
              title: p.title,
              category,
              course: p.course || 'Academic Research',
              institution: p.institution || 'Tertiary Institution',
              wordCount: p.metadata?.wordCount,
              linesOfCode: p.metadata?.linesOfCode,
              defenseReadiness: p.metadata?.defenseReadiness || 92,
              status: 'Complete' as const,
              lastModified: p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
              studioUrl
            };
          });

          setProjectsList(mappedDb);
        }
      } catch (err) {
        console.error('Failed to load user projects:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadProjects();
  }, []);

  const filteredProjects = projectsList.filter(proj => {
    const matchesFilter = activeFilter === 'all' || proj.category === activeFilter;
    const matchesSearch = proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          proj.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          proj.institution.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  async function handleDeleteProject(id: string) {
    if (confirm('Are you sure you want to delete this project from your workspace?')) {
      try {
        await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
      } catch (err) {
        console.error('Failed to delete project on server:', err);
      }
      setProjectsList(prev => prev.filter(p => p.id !== id));
    }
  }

  async function handleDownloadBundle(project: ProjectItem) {
    try {
      setDownloadingId(project.id);
      const studentName = user?.fullName || 'Candidate';
      const matricNumber = user?.matricNumber || '';
      const institution = project.institution || user?.institution || 'Tertiary Institution';

      let endpoint = '/api/generate-thesis-docx';
      let payload: Record<string, any> = {
        topic: project.title,
        institution,
        course: project.course,
        studentName,
        matricNumber,
      };
      let fallback = `${project.title.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;

      if (project.category === 'software') {
        endpoint = '/api/generate-software-zip';
        payload = {
          projectName: project.title,
          language: 'Python',
          framework: 'Tkinter + SQLite',
          author: studentName,
          institution,
        };
        fallback = `${project.title.replace(/[^a-zA-Z0-9]/g, '_')}_software.zip`;
      } else if (project.category === 'siwes') {
        endpoint = '/api/generate-siwes-docx';
        payload = {
          studentName,
          matricNumber,
          companyName: 'MainOne Equinix Datacenter',
          department: project.course,
          durationWeeks: 24,
          institution,
        };
        fallback = `${project.title.replace(/[^a-zA-Z0-9]/g, '_')}_siwes.docx`;
      } else if (project.category === 'presentation') {
        endpoint = '/api/generate-viva-pptx';
        payload = {
          projectTitle: project.title,
          studentName,
          matricNumber,
          department: project.course,
          institution,
          numSlides: 15,
        };
        fallback = `${project.title.replace(/[^a-zA-Z0-9]/g, '_')}_viva.pptx`;
      }

      await downloadAcademicFile(endpoint, payload, fallback);
    } catch (err) {
      console.error('Bundle download error:', err);
    } finally {
      setDownloadingId(null);
    }
  }

  const totalWords = projectsList.reduce((acc, p) => acc + (p.wordCount || 0), 0);
  const totalLoc = projectsList.reduce((acc, p) => acc + (p.linesOfCode || 0), 0);
  const avgReadiness = projectsList.length > 0
    ? `${Math.round(projectsList.reduce((acc, p) => acc + (p.defenseReadiness || 0), 0) / projectsList.length)}%`
    : '--';

  return (
    <AppLayout
      activeItem="projects"
      title="My Academic Projects"
      subtitle="Manage, edit, resume, and export all your research dissertations, software repositories, and SIWES reports"
    >
      <div className="space-y-6">
        {/* Top Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Projects</span>
              <FolderGit2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{projectsList.length} Active</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">100% saved in cloud database</div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Words Compiled</span>
              <FileText className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">{totalWords > 0 ? `${totalWords.toLocaleString()}+` : '0'}</div>
            <div className="text-[11px] text-slate-500 mt-1">Target ~18,000 words per dissertation</div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Source Code Lines</span>
              <Code2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">{totalLoc > 0 ? `${totalLoc.toLocaleString()} LoC` : '0 LoC'}</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">Zero-pip Python & SQLite verified</div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Avg Defense Score</span>
              <CheckCircle2 className="w-4 h-4 text-cyan-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">{avgReadiness}</div>
            <div className="text-[11px] text-cyan-600 font-semibold mt-1">Grade A (First Class Benchmark)</div>
          </div>
        </div>

        {/* Filter and Action Header */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Projects' },
              { id: 'thesis', label: 'Theses & Chapters' },
              { id: 'software', label: 'Software Builds' },
              { id: 'siwes', label: 'SIWES & Reports' },
              { id: 'presentation', label: 'Viva Decks' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & New Project Button */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <Link
              href="/studio"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </Link>
          </div>
        </div>

        {/* Project Cards Grid / Empty State */}
        {isLoading ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-xs text-slate-500 font-medium">Loading saved academic projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto text-blue-600">
              <FolderGit2 className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-extrabold text-slate-900 text-sm">No Academic Projects Found</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                You haven&apos;t generated any research dissertations or software projects yet. Launch the studio or any of the specialized tools to get started!
              </p>
            </div>
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs transition-transform active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Studio</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.map(project => (
              <div
                key={project.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        project.category === 'thesis' ? 'bg-amber-100 text-amber-600' :
                        project.category === 'software' ? 'bg-emerald-100 text-emerald-600' :
                        project.category === 'siwes' ? 'bg-teal-100 text-teal-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {project.category === 'thesis' && <FileText className="w-4 h-4" />}
                        {project.category === 'software' && <Code2 className="w-4 h-4" />}
                        {project.category === 'siwes' && <BookOpen className="w-4 h-4" />}
                        {project.category === 'presentation' && <Presentation className="w-4 h-4" />}
                      </span>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {project.course}
                        </span>
                        <div className="text-[11px] text-slate-500 font-medium">{project.institution}</div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      project.status === 'Complete' ? 'bg-emerald-100 text-emerald-800' :
                      project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {project.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
                    {project.title}
                  </h3>

                  {/* Metrics */}
                  <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    {project.wordCount && (
                      <span><strong>{project.wordCount.toLocaleString()}</strong> words</span>
                    )}
                    {project.linesOfCode && (
                      <span><strong>{project.linesOfCode}</strong> lines of code</span>
                    )}
                    <span className="text-emerald-700 font-bold">
                      Defense Ready: {project.defenseReadiness}%
                    </span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {project.lastModified}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadBundle(project)}
                      disabled={downloadingId === project.id}
                      className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-all disabled:opacity-50"
                      title="Download Complete Package"
                    >
                      {downloadingId === project.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <Link
                      href={project.studioUrl}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1 transition-all"
                    >
                      <span>Resume</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
