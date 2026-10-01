import React, { useState, useMemo } from 'react';
import { SPECIALIZATIONS } from '../data/specializations';
import { SpecializationId, PortalSection, CourseMaterial, ExamRecord } from '../types';
import { InteractiveTools } from './InteractiveTools';
import { 
  ArrowRight, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  Info, 
  Calculator, 
  Search, 
  Download, 
  ExternalLink, 
  Bookmark, 
  BookmarkCheck, 
  Clock, 
  CheckCircle, 
  Share2, 
  Filter, 
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Sparkles,
  Eye,
  Check,
  Building,
  GraduationCap
} from 'lucide-react';

interface SpecializationPortalProps {
  specializationId: SpecializationId;
  activeSection: PortalSection;
  onNavigateSection: (sec: PortalSection) => void;
  onBackToSelector: () => void;
}

export const SpecializationPortal: React.FC<SpecializationPortalProps> = ({
  specializationId,
  activeSection,
  onNavigateSection,
  onBackToSelector,
}) => {
  const spec = SPECIALIZATIONS[specializationId];

  // Search & Filter States for Materials
  const [materialSearch, setMaterialSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  // Search & Filter States for Exams
  const [examSearch, setExamSearch] = useState('');
  const [examTerm, setExamTerm] = useState<'all' | 'midterm' | 'final' | 'quiz'>('all');
  const [examCourse, setExamCourse] = useState<string>('all');

  // Bookmarks saved in local state
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`elex28_bookmarks_${specializationId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal States
  const [activeMaterialModal, setActiveMaterialModal] = useState<CourseMaterial | null>(null);
  const [activeExamModal, setActiveExamModal] = useState<ExamRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarks((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem(`elex28_bookmarks_${specializationId}`, JSON.stringify(next));
      } catch {}
      showToast(next.includes(id) ? 'تمت إضافة المادة إلى المفضلة' : 'تمت الإزالة من المفضلة');
      return next;
    });
  };

  // Filtered Materials
  const filteredMaterials = useMemo(() => {
    return spec.materials.filter((m) => {
      const matchSearch =
        m.titleAr.toLowerCase().includes(materialSearch.toLowerCase()) ||
        m.courseNameAr.toLowerCase().includes(materialSearch.toLowerCase()) ||
        m.courseCode.toLowerCase().includes(materialSearch.toLowerCase()) ||
        m.titleEn.toLowerCase().includes(materialSearch.toLowerCase());
      const matchCategory = selectedCategory === 'all' || m.category === selectedCategory;
      const matchCourse = selectedCourse === 'all' || m.courseCode === selectedCourse;
      return matchSearch && matchCategory && matchCourse;
    });
  }, [spec.materials, materialSearch, selectedCategory, selectedCourse]);

  // Filtered Exams
  const filteredExams = useMemo(() => {
    return spec.exams.filter((ex) => {
      const matchSearch =
        ex.courseNameAr.toLowerCase().includes(examSearch.toLowerCase()) ||
        ex.courseCode.toLowerCase().includes(examSearch.toLowerCase()) ||
        ex.year.includes(examSearch);
      const matchTerm = examTerm === 'all' || ex.term === examTerm;
      const matchCourse = examCourse === 'all' || ex.courseCode === examCourse;
      return matchSearch && matchTerm && matchCourse;
    });
  }, [spec.exams, examSearch, examTerm, examCourse]);

  const categoryLabels: Record<string, string> = {
    all: 'جميع المصادر',
    slides: 'سلايدات المحاضرات',
    summary: 'ملخصات شاملة',
    lab: 'تجارب المعمل والمحاكاة',
    cheatsheet: 'أوراق القوانين',
    reference: 'كتب ومراجع',
  };

  return (
    <div className="relative min-h-screen z-10 flex flex-col text-[#F6F2EB]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded bg-black/90 border border-white/20 text-xs text-white shadow-2xl flex items-center gap-2 font-arabic animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-[#0C0C0E]/85 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToSelector}
            className="flex items-center gap-1.5 text-xs text-[#9A9EA6] hover:text-white transition-colors py-1 px-2 rounded hover:bg-white/[0.04]"
          >
            <ArrowRight className="w-4 h-4" style={{ color: spec.colors.primary }} />
            <span className="hidden sm:inline">تغيير التخصص</span>
          </button>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          <a 
            href="#/" 
            onClick={(e) => { e.preventDefault(); onBackToSelector(); }}
            className="text-xs uppercase tracking-[0.25em] font-bold text-white hover:text-[#E08A52] transition-colors"
          >
            ELEX 28
          </a>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => onNavigateSection('overview')}
            className={`px-3 py-1.5 text-xs rounded transition-colors whitespace-nowrap ${
              activeSection === 'overview'
                ? 'bg-white/10 text-white font-medium'
                : 'text-[#9A9EA6] hover:text-white'
            }`}
          >
            نظرة عامة
          </button>

          <button
            onClick={() => onNavigateSection('materials')}
            className={`px-3 py-1.5 text-xs rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'materials'
                ? 'bg-white/10 text-white font-medium'
                : 'text-[#9A9EA6] hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>المواد والمحاضرات</span>
          </button>

          <button
            onClick={() => onNavigateSection('exams')}
            className={`px-3 py-1.5 text-xs rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'exams'
                ? 'bg-white/10 text-white font-medium'
                : 'text-[#9A9EA6] hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>بنك الامتحانات</span>
          </button>

          <button
            onClick={() => onNavigateSection('channels')}
            className={`px-3 py-1.5 text-xs rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'channels'
                ? 'bg-white/10 text-white font-medium'
                : 'text-[#9A9EA6] hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>القنوات الرسمية</span>
          </button>

          <button
            onClick={() => onNavigateSection('tools')}
            className={`px-3 py-1.5 text-xs rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'tools'
                ? 'bg-white/10 text-white font-medium'
                : 'text-[#9A9EA6] hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>الأدوات الهندسية</span>
          </button>

          <button
            onClick={() => onNavigateSection('info')}
            className={`px-3 py-1.5 text-xs rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'info'
                ? 'bg-white/10 text-white font-medium'
                : 'text-[#9A9EA6] hover:text-white'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>الخطة والمعلومات</span>
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">
        {/* Hero Header for Specialization */}
        <section className="mb-10 pb-8 border-b border-white/[0.08]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5 text-xs tracking-[0.3em] uppercase text-[#9A9EA6] mb-2 font-mono">
                <span className="font-bold text-white">ELEX 28</span>
                <span>/</span>
                <span style={{ color: spec.colors.primary }}>{spec.tag}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-2">
                {spec.titleEn}
              </h1>

              <h2 className="font-arabic text-xl sm:text-2xl font-bold text-white/90">
                {spec.titleAr}
              </h2>

              <p className="font-arabic text-sm text-[#9A9EA6] max-w-2xl mt-3 font-light leading-relaxed">
                {spec.taglineAr}
              </p>
            </div>

            {/* Semester badge and stats summary */}
            <div className="flex flex-wrap md:flex-col items-start md:items-end gap-3 text-left">
              <div 
                className="px-3.5 py-1.5 rounded text-xs font-mono tracking-wider font-semibold border flex items-center gap-2"
                style={{ 
                  color: spec.colors.primary, 
                  borderColor: `${spec.colors.primary}40`,
                  backgroundColor: `${spec.colors.primary}10` 
                }}
              >
                <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: spec.colors.primary }} />
                <span>SEMESTER 07 · المستوى السابع</span>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-[#9A9EA6] pt-1">
                <span>{spec.stats.courses} COURSES</span>
                <span>·</span>
                <span>{spec.stats.hours} CREDIT HOURS</span>
                <span>·</span>
                <span>{spec.stats.exams} PAST EXAMS</span>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================== */}
        {/* SECTION 1: OVERVIEW TAB */}
        {/* ==================================================== */}
        {activeSection === 'overview' && (
          <div className="space-y-10">
            {/* Quick 4 Services Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                onClick={() => onNavigateSection('materials')}
                className="p-6 rounded border border-white/[0.08] bg-[#0C0C0E]/70 hover:border-white/20 transition-all cursor-pointer group hover:-translate-y-1"
              >
                <BookOpen className="w-7 h-7 mb-4 transition-transform group-hover:scale-110" style={{ color: spec.colors.primary }} />
                <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">01 / RESOURCES</span>
                <h3 className="font-arabic text-lg font-bold text-white mt-1">المواد والمحاضرات</h3>
                <p className="font-arabic text-xs text-[#9A9EA6] mt-2 font-light leading-relaxed">
                  تصفح سلايدات الأساتذة، ملخصات الطلاب المتفوقين، وتجارب المعامل.
                </p>
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs" style={{ color: spec.colors.primary }}>
                  <span>استعراض ({spec.materials.length} ملف)</span>
                  <span>←</span>
                </div>
              </div>

              <div
                onClick={() => onNavigateSection('exams')}
                className="p-6 rounded border border-white/[0.08] bg-[#0C0C0E]/70 hover:border-white/20 transition-all cursor-pointer group hover:-translate-y-1"
              >
                <FileText className="w-7 h-7 mb-4 transition-transform group-hover:scale-110" style={{ color: spec.colors.primary }} />
                <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">02 / ARCHIVE</span>
                <h3 className="font-arabic text-lg font-bold text-white mt-1">بنك الامتحانات السابقة</h3>
                <p className="font-arabic text-xs text-[#9A9EA6] mt-2 font-light leading-relaxed">
                  امتحانات الميدتيرم والفاينل للسنوات السابقة مع نماذج الحل المعتمدة.
                </p>
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs" style={{ color: spec.colors.primary }}>
                  <span>استعراض ({spec.exams.length} امتحان)</span>
                  <span>←</span>
                </div>
              </div>

              <div
                onClick={() => onNavigateSection('channels')}
                className="p-6 rounded border border-white/[0.08] bg-[#0C0C0E]/70 hover:border-white/20 transition-all cursor-pointer group hover:-translate-y-1"
              >
                <MessageSquare className="w-7 h-7 mb-4 transition-transform group-hover:scale-110" style={{ color: spec.colors.primary }} />
                <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">03 / NETWORK</span>
                <h3 className="font-arabic text-lg font-bold text-white mt-1">القنوات الرسمية والمجموعات</h3>
                <p className="font-arabic text-xs text-[#9A9EA6] mt-2 font-light leading-relaxed">
                  روابط قنوات تيليجرام للتنبيهات الأكاديمية ومجتمع واتساب ومجلدات درايف.
                </p>
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs" style={{ color: spec.colors.primary }}>
                  <span>فتح القنوات ({spec.channels.length})</span>
                  <span>←</span>
                </div>
              </div>

              <div
                onClick={() => onNavigateSection('tools')}
                className="p-6 rounded border border-white/[0.08] bg-[#0C0C0E]/70 hover:border-white/20 transition-all cursor-pointer group hover:-translate-y-1"
              >
                <Calculator className="w-7 h-7 mb-4 transition-transform group-hover:scale-110" style={{ color: spec.colors.primary }} />
                <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">04 / WORKBENCH</span>
                <h3 className="font-arabic text-lg font-bold text-white mt-1">أدوات وحاسبات الهندسة</h3>
                <p className="font-arabic text-xs text-[#9A9EA6] mt-2 font-light leading-relaxed">
                  حاسبة ألوان المقاومات، طول الموجة، سعة شانون، وتقسيم الشبكات.
                </p>
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs" style={{ color: spec.colors.primary }}>
                  <span>تشغيل الأدوات</span>
                  <span>←</span>
                </div>
              </div>
            </div>

            {/* Overview Detail Paragraphs & Vision */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 sm:p-8 bg-white/[0.02] border border-white/[0.08] rounded">
              <div className="md:col-span-2 space-y-4">
                <span className="text-xs uppercase tracking-widest font-mono" style={{ color: spec.colors.primary }}>
                  ACADEMIC SCOPE & VISION
                </span>
                <h3 className="font-arabic text-xl font-bold text-white">
                  عن تخصص {spec.titleAr} في دفعة ELEX 28
                </h3>
                <p className="font-arabic text-sm text-[#9A9EA6] leading-relaxed font-light">
                  {spec.overviewAr}
                </p>
                <p className="font-arabic text-sm text-white/80 leading-relaxed font-normal pt-2 border-t border-white/[0.06]">
                  {spec.visionAr}
                </p>
              </div>

              <div className="space-y-3 p-4 bg-black/40 border border-white/[0.06] rounded flex flex-col justify-center">
                <span className="text-xs text-white/60 font-mono">SEMESTER SNAPSHOT</span>
                <div className="space-y-2 text-xs font-arabic">
                  <div className="flex justify-between py-1 border-b border-white/[0.06]">
                    <span className="text-[#9A9EA6]">المستوى الأكاديمي:</span>
                    <span className="text-white font-medium">السنة الرابعة - الفصل 7</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/[0.06]">
                    <span className="text-[#9A9EA6]">عدد الساعات المعتمدة:</span>
                    <span className="text-white font-medium">{spec.stats.hours} ساعة</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/[0.06]">
                    <span className="text-[#9A9EA6]">المعامل المخصصة:</span>
                    <span className="text-white font-medium">{spec.stats.labs} معامل أسبوعية</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#9A9EA6]">مشروع التخرج:</span>
                    <span className="text-emerald-400 font-medium">مرحلة المقترحات والفرق</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Materials of the Week */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-arabic text-lg font-bold text-white">المصادر الأكاديمية المميزة هذا الأسبوع</h3>
                  <p className="font-arabic text-xs text-[#9A9EA6]">تمت مراجعتها وتدقيقها من قِبل لجنة الدفعة الأكاديمية</p>
                </div>
                <button
                  onClick={() => onNavigateSection('materials')}
                  className="text-xs text-[#E08A52] hover:underline flex items-center gap-1 font-arabic"
                >
                  <span>عرض الكل</span>
                  <span>←</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {spec.materials.filter((m) => m.featured).map((mat) => (
                  <div
                    key={mat.id}
                    onClick={() => setActiveMaterialModal(mat)}
                    className="p-5 rounded border border-white/[0.08] bg-[#0C0C0E]/60 hover:border-white/20 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-2 font-mono">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold" style={{ color: spec.colors.primary, backgroundColor: `${spec.colors.primary}15` }}>
                          {mat.courseCode}
                        </span>
                        <span className="text-white/40">{mat.fileFormat} · {mat.fileSize}</span>
                      </div>

                      <h4 className="font-arabic text-sm font-semibold text-white group-hover:text-[#F7A468] transition-colors line-clamp-2">
                        {mat.titleAr}
                      </h4>

                      <p className="font-arabic text-xs text-[#9A9EA6] mt-2 line-clamp-2 font-light">
                        {mat.descriptionAr}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-white/60">
                      <span className="font-arabic text-[11px]">{mat.author}</span>
                      <Download className="w-4 h-4 text-[#E08A52] group-hover:translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* SECTION 2: MATERIALS TAB */}
        {/* ==================================================== */}
        {activeSection === 'materials' && (
          <div className="space-y-6">
            {/* Filters Bar */}
            <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-white/40 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
                  <input
                    type="text"
                    value={materialSearch}
                    onChange={(e) => setMaterialSearch(e.target.value)}
                    placeholder="ابحث باسم المادة، كود المادة، أو عنوان المحاضرة..."
                    className="w-full bg-[#151518] border border-white/10 rounded pr-9 pl-3 py-2 text-xs text-white placeholder:text-white/30 font-arabic focus:outline-none focus:border-white/30"
                  />
                </div>

                {/* Course Select */}
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="bg-[#151518] border border-white/10 rounded px-3 py-2 text-xs text-white font-arabic focus:outline-none"
                >
                  <option value="all">جميع المقررات ({spec.courses.length})</option>
                  {spec.courses.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} - {c.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      selectedCategory === key
                        ? 'bg-white/15 text-white font-medium border border-white/20'
                        : 'bg-white/[0.03] text-white/60 hover:text-white border border-transparent'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Counter */}
            <div className="flex items-center justify-between text-xs text-[#9A9EA6]">
              <span>تم العثور على {filteredMaterials.length} ملف دراسي</span>
              {bookmarks.length > 0 && (
                <span className="text-[#F7A468] flex items-center gap-1 font-arabic">
                  <Bookmark className="w-3.5 h-3.5 fill-[#F7A468]" />
                  <span>لديك {bookmarks.length} ملف في المفضلة</span>
                </span>
              )}
            </div>

            {/* Materials Grid */}
            {filteredMaterials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMaterials.map((mat) => {
                  const isBookmarked = bookmarks.includes(mat.id);

                  return (
                    <div
                      key={mat.id}
                      onClick={() => setActiveMaterialModal(mat)}
                      className="p-5 rounded border border-white/[0.08] bg-[#0C0C0E]/70 hover:border-white/25 transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs mb-3">
                          <span 
                            className="font-mono text-[10px] font-bold px-2 py-0.5 rounded"
                            style={{ color: spec.colors.primary, backgroundColor: `${spec.colors.primary}15` }}
                          >
                            {mat.courseCode}
                          </span>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-white/40">
                              {mat.fileFormat} · {mat.fileSize}
                            </span>
                            <button
                              onClick={(e) => toggleBookmark(mat.id, e)}
                              className="text-white/40 hover:text-[#F7A468] transition-colors p-1"
                              title={isBookmarked ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
                            >
                              {isBookmarked ? (
                                <BookmarkCheck className="w-4 h-4 text-[#F7A468]" />
                              ) : (
                                <Bookmark className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <span className="text-[11px] font-arabic text-[#9A9EA6] block mb-1">
                          {mat.courseNameAr}
                        </span>

                        <h4 className="font-arabic text-sm sm:text-base font-semibold text-white group-hover:text-[#F7A468] transition-colors">
                          {mat.titleAr}
                        </h4>

                        <p className="font-arabic text-xs text-[#9A9EA6] mt-2 font-light line-clamp-2 leading-relaxed">
                          {mat.descriptionAr}
                        </p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                        <span className="text-[11px] font-arabic text-white/50 truncate max-w-[180px]">
                          {mat.author || 'لجنة الدفعة'}
                        </span>

                        <div className="flex items-center gap-2 text-[#E08A52]">
                          <span className="text-[11px] font-arabic">معاينة وتحميل</span>
                          <Download className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center border border-dashed border-white/10 rounded">
                <p className="font-arabic text-sm text-[#9A9EA6]">
                  لم يتم العثور على مصادر تطابق معايير البحث الحالية.
                </p>
                <button
                  onClick={() => {
                    setMaterialSearch('');
                    setSelectedCategory('all');
                    setSelectedCourse('all');
                  }}
                  className="mt-3 text-xs text-[#32D6FF] hover:underline font-arabic"
                >
                  إعادة ضبط خيارات البحث
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* SECTION 3: PAST EXAMS TAB */}
        {/* ==================================================== */}
        {activeSection === 'exams' && (
          <div className="space-y-6">
            {/* Filter controls */}
            <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-white/40 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
                  <input
                    type="text"
                    value={examSearch}
                    onChange={(e) => setExamSearch(e.target.value)}
                    placeholder="ابحث باسم المادة أو السنة الدراسية..."
                    className="w-full bg-[#151518] border border-white/10 rounded pr-9 pl-3 py-2 text-xs text-white placeholder:text-white/30 font-arabic focus:outline-none"
                  />
                </div>

                <select
                  value={examCourse}
                  onChange={(e) => setExamCourse(e.target.value)}
                  className="bg-[#151518] border border-white/10 rounded px-3 py-2 text-xs text-white font-arabic focus:outline-none"
                >
                  <option value="all">جميع المقررات</option>
                  {spec.courses.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} - {c.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Term filters */}
              <div className="flex gap-2">
                <button
                  onClick={() => setExamTerm('all')}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    examTerm === 'all'
                      ? 'bg-white/15 text-white font-medium border border-white/20'
                      : 'bg-white/[0.03] text-white/60 hover:text-white'
                  }`}
                >
                  جميع الامتحانات
                </button>
                <button
                  onClick={() => setExamTerm('final')}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    examTerm === 'final'
                      ? 'bg-white/15 text-white font-medium border border-white/20'
                      : 'bg-white/[0.03] text-white/60 hover:text-white'
                  }`}
                >
                  الامتحانات النهائية (Finals)
                </button>
                <button
                  onClick={() => setExamTerm('midterm')}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    examTerm === 'midterm'
                      ? 'bg-white/15 text-white font-medium border border-white/20'
                      : 'bg-white/[0.03] text-white/60 hover:text-white'
                  }`}
                >
                  نصف الفصل (Midterms)
                </button>
              </div>
            </div>

            {/* Exams Table / Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredExams.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => setActiveExamModal(ex)}
                  className="p-5 rounded border border-white/[0.08] bg-[#0C0C0E]/70 hover:border-white/20 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-mono text-xs font-bold text-white">
                        {ex.courseCode} · {ex.year}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        ex.term === 'final'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}>
                        {ex.term === 'final' ? 'نهائي (Final)' : 'نصفي (Midterm)'}
                      </span>
                    </div>

                    <h4 className="font-arabic text-base font-semibold text-white group-hover:text-[#F7A468] transition-colors">
                      {ex.courseNameAr}
                    </h4>

                    <p className="font-arabic text-xs text-[#9A9EA6] mt-2 font-light line-clamp-2">
                      {ex.notesAr}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-white/50 text-[11px] font-arabic">
                      <span>{ex.durationMinutes} دقيقة</span>
                      <span>·</span>
                      <span>{ex.questionsCount} أسئلة</span>
                      {ex.hasSolution && (
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>الحل متاح</span>
                        </span>
                      )}
                    </div>

                    <span className="text-[#32D6FF] group-hover:translate-x-[-4px] transition-transform text-xs font-arabic">
                      عرض الامتحان والحل ←
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* SECTION 4: OFFICIAL CHANNELS TAB */}
        {/* ==================================================== */}
        {activeSection === 'channels' && (
          <div className="space-y-6">
            <div className="p-6 bg-white/[0.02] border border-white/[0.08] rounded">
              <h3 className="font-arabic text-lg font-bold text-white mb-1">
                قنوات ومنصات التواصل الرسمية - {spec.titleAr}
              </h3>
              <p className="font-arabic text-xs text-[#9A9EA6]">
                جميع الإعلانات الصادرة عبر هذه القنوات معتمدة رسمياً من قِبل ممثلي الدفعة ومقرري المواد.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {spec.channels.map((ch) => (
                <div
                  key={ch.id}
                  className="p-5 rounded border border-white/[0.08] bg-[#0C0C0E]/70 hover:border-white/20 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-white font-arabic">
                        {ch.badgeAr || 'رسمي'}
                      </span>
                      {ch.membersCount && (
                        <span className="text-[11px] text-white/50 font-arabic">
                          {ch.membersCount}
                        </span>
                      )}
                    </div>

                    <h4 className="font-arabic text-base font-semibold text-white">
                      {ch.titleAr}
                    </h4>

                    <p className="font-arabic text-xs text-[#9A9EA6] mt-2 font-light leading-relaxed">
                      {ch.descriptionAr}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(ch.url);
                        showToast('تم نسخ رابط القناة بنجاح');
                      }}
                      className="text-xs text-white/60 hover:text-white font-arabic"
                    >
                      نسخ الرابط
                    </button>

                    <a
                      href={ch.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-1.5 rounded text-xs font-arabic font-medium flex items-center gap-1.5 transition-colors"
                      style={{ 
                        backgroundColor: `${spec.colors.primary}20`,
                        color: spec.colors.primary,
                        border: `1px solid ${spec.colors.primary}40`
                      }}
                    >
                      <span>الانضمام للقناة</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* SECTION 5: INTERACTIVE TOOLS TAB */}
        {/* ==================================================== */}
        {activeSection === 'tools' && (
          <InteractiveTools accentColor={spec.colors.primary} />
        )}

        {/* ==================================================== */}
        {/* SECTION 6: INFO & CURRICULUM TAB */}
        {/* ==================================================== */}
        {activeSection === 'info' && (
          <div className="space-y-8">
            {/* Courses Syllabus Accordion */}
            <div className="space-y-4">
              <h3 className="font-arabic text-xl font-bold text-white">
                المقررات الدراسية والخطة المعتمدة (المستوى السابع)
              </h3>
              <div className="space-y-3">
                {spec.courses.map((course) => (
                  <div
                    key={course.code}
                    className="p-5 rounded border border-white/[0.08] bg-[#0C0C0E]/70 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                      <div>
                        <span className="font-mono text-xs font-bold" style={{ color: spec.colors.primary }}>
                          {course.code}
                        </span>
                        <h4 className="font-arabic text-base font-bold text-white mt-0.5">
                          {course.nameAr} <span className="font-normal text-xs text-[#9A9EA6]">({course.nameEn})</span>
                        </h4>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono text-white/70">
                        <span>{course.creditHours} ساعات معتمدة</span>
                        <span>·</span>
                        <span>{course.lectureHours} نظري + {course.labHours} عملي</span>
                      </div>
                    </div>

                    <p className="font-arabic text-xs sm:text-sm text-[#9A9EA6] font-light leading-relaxed">
                      {course.descriptionAr}
                    </p>

                    <div>
                      <span className="font-arabic text-[11px] text-white/50 block mb-1">أبرز موضوعات المنهج:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {course.topicsAr.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] bg-white/[0.04] text-white/80 border border-white/[0.06]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {course.instructor && (
                      <div className="text-[11px] font-arabic text-[#E08A52] pt-2">
                        أستاذ المادة: {course.instructor}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Career Outcomes & Laboraties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/[0.08]">
              {/* Career Paths */}
              <div className="p-6 bg-white/[0.02] border border-white/[0.08] rounded space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-white">
                  <GraduationCap className="w-4 h-4" style={{ color: spec.colors.primary }} />
                  <span>المسارات المهنية ومجالات التوظيف</span>
                </div>
                <ul className="space-y-2.5 text-xs sm:text-sm font-arabic text-[#9A9EA6]">
                  {spec.careerPathsAr.map((career, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#32D6FF] font-mono mt-0.5">•</span>
                      <span>{career}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Lab Facilities */}
              <div className="p-6 bg-white/[0.02] border border-white/[0.08] rounded space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-white">
                  <Building className="w-4 h-4" style={{ color: spec.colors.primary }} />
                  <span>المعامل والتجهيزات الأكاديمية</span>
                </div>
                <ul className="space-y-2.5 text-xs sm:text-sm font-arabic text-[#9A9EA6]">
                  {spec.laboratoriesAr.map((lab, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#F7A468] font-mono mt-0.5">•</span>
                      <span>{lab}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ==================================================== */}
      {/* MODAL 1: MATERIAL DETAILS & DOWNLOAD */}
      {/* ==================================================== */}
      {activeMaterialModal && (
        <div 
          onClick={() => setActiveMaterialModal(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#121216] border border-white/20 rounded-lg p-6 max-w-lg w-full space-y-5 animate-scale-in"
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/10" style={{ color: spec.colors.primary }}>
                  {activeMaterialModal.courseCode} · {activeMaterialModal.category.toUpperCase()}
                </span>
                <h3 className="font-arabic text-lg font-bold text-white mt-1.5">
                  {activeMaterialModal.titleAr}
                </h3>
                <span className="text-xs text-[#9A9EA6] font-arabic">
                  {activeMaterialModal.courseNameAr}
                </span>
              </div>
              <button
                onClick={() => setActiveMaterialModal(null)}
                className="text-white/40 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <p className="font-arabic text-xs sm:text-sm text-[#9A9EA6] leading-relaxed">
              {activeMaterialModal.descriptionAr}
            </p>

            <div className="grid grid-cols-2 gap-3 p-3 bg-black/40 rounded text-xs font-arabic">
              <div>
                <span className="text-white/40 block text-[10px]">المؤلف / المُعد:</span>
                <span className="text-white font-medium">{activeMaterialModal.author || 'لجنة الأكاديمية'}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[10px]">صيغة وحجم الملف:</span>
                <span className="text-white font-medium">{activeMaterialModal.fileFormat} ({activeMaterialModal.fileSize})</span>
              </div>
              <div>
                <span className="text-white/40 block text-[10px]">عدد الصفحات:</span>
                <span className="text-white font-medium">{activeMaterialModal.pages ? `${activeMaterialModal.pages} صفحة` : 'غير محدد'}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[10px]">تاريخ الإضافة:</span>
                <span className="text-white font-medium">{activeMaterialModal.dateAdded}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  showToast(`جاري بدء تنزيل: ${activeMaterialModal.titleAr}`);
                  setActiveMaterialModal(null);
                }}
                className="flex-1 py-2.5 rounded bg-[#E08A52] hover:bg-[#F7A468] text-white font-arabic font-medium text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>تنزيل الملف المعتمد ({activeMaterialModal.fileSize})</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showToast('تم نسخ رابط المشاركة');
                }}
                className="p-2.5 rounded bg-white/10 hover:bg-white/15 text-white"
                title="مشاركة الرابط"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: EXAM DETAILS & SOLUTIONS */}
      {/* ==================================================== */}
      {activeExamModal && (
        <div 
          onClick={() => setActiveExamModal(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#121216] border border-white/20 rounded-lg p-6 max-w-lg w-full space-y-5"
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-[#32D6FF]">
                  {activeExamModal.courseCode} · {activeExamModal.year}
                </span>
                <h3 className="font-arabic text-lg font-bold text-white mt-1.5">
                  امتحان {activeExamModal.courseNameAr} ({activeExamModal.term === 'final' ? 'النهائي' : 'نصف الفصل'})
                </h3>
              </div>
              <button
                onClick={() => setActiveExamModal(null)}
                className="text-white/40 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-arabic text-xs sm:text-sm text-[#9A9EA6]">
              <p className="leading-relaxed">
                {activeExamModal.notesAr}
              </p>

              <div className="p-3 bg-black/40 rounded space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/50">مدة الامتحان:</span>
                  <span className="text-white font-medium">{activeExamModal.durationMinutes} دقيقة</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">عدد الأسئلة الرئيسية:</span>
                  <span className="text-white font-medium">{activeExamModal.questionsCount} أسئلة</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">نموذج الإجابة:</span>
                  <span className="text-emerald-400 font-medium">مرفق خطوة بخطوة بالرسم والتفصيل</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  showToast('جاري فتح نموذج الإجابة والأسئلة');
                  setActiveExamModal(null);
                }}
                className="flex-1 py-2.5 rounded bg-[#32D6FF] hover:bg-[#5AA9D6] text-black font-arabic font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>عرض ورقة الأسئلة والحل الكامل</span>
              </button>

              <button
                onClick={() => {
                  showToast('جاري تنزيل ملف الامتحان PDF');
                  setActiveExamModal(null);
                }}
                className="px-4 py-2.5 rounded bg-white/10 hover:bg-white/15 text-white font-arabic text-xs flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>تنزيل PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-white/[0.08] text-center text-[10px] tracking-[0.25em] text-[#9A9EA6]/60 uppercase font-mono">
        ELEX 28 · {spec.titleEn} · ACADEMIC PORTAL
      </footer>
    </div>
  );
};
