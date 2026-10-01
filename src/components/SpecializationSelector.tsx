import React, { useState } from 'react';
import { SPECIALIZATIONS } from '../data/specializations';
import { SpecializationId } from '../types';
import { Radio, Cpu, Factory, ArrowLeft, ArrowRight, Layers, FileText, CheckCircle2 } from 'lucide-react';

interface SpecializationSelectorProps {
  onSelect: (id: SpecializationId) => void;
  onBackToHome: () => void;
  onHoverCard: (id: SpecializationId | null) => void;
}

export const SpecializationSelector: React.FC<SpecializationSelectorProps> = ({
  onSelect,
  onBackToHome,
  onHoverCard,
}) => {
  const [activeCard, setActiveCard] = useState<SpecializationId | null>(null);
  const specs = Object.values(SPECIALIZATIONS);

  const getIcon = (id: SpecializationId, color: string) => {
    switch (id) {
      case 'communications':
        return <Radio className="w-10 h-10 mb-4 transition-transform duration-500 group-hover:scale-110" style={{ color }} />;
      case 'computer-networks':
        return <Cpu className="w-10 h-10 mb-4 transition-transform duration-500 group-hover:scale-110" style={{ color }} />;
      case 'industrial':
        return <Factory className="w-10 h-10 mb-4 transition-transform duration-500 group-hover:scale-110" style={{ color }} />;
    }
  };

  const getSvgPattern = (id: SpecializationId) => {
    switch (id) {
      case 'communications':
        return (
          <svg className="absolute top-1/4 left-1/2 -translate-x-1/2 w-48 h-48 opacity-15 pointer-events-none" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="30" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
            <path d="M100 100 L100 180" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'computer-networks':
        return (
          <svg className="absolute top-1/4 left-1/2 -translate-x-1/2 w-48 h-48 opacity-15 pointer-events-none" viewBox="0 0 200 200">
            <rect x="75" y="75" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M75 100 H25 M125 100 H175 M100 75 V25 M100 125 V175" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="25" cy="100" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="175" cy="100" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="100" cy="25" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="100" cy="175" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'industrial':
        return (
          <svg className="absolute top-1/4 left-1/2 -translate-x-1/2 w-48 h-48 opacity-15 pointer-events-none" viewBox="0 0 200 200">
            <circle cx="80" cy="90" r="45" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="8 6" />
            <circle cx="140" cy="120" r="30" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="6 4" />
            <circle cx="80" cy="90" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="140" cy="120" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between px-4 sm:px-8 py-8 sm:py-12 z-10 max-w-7xl mx-auto">
      {/* Top Header */}
      <header className="text-center pt-2 sm:pt-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBackToHome}
            type="button"
            className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#9A9EA6] hover:text-[#F6F2EB] transition-colors py-2 px-3 rounded hover:bg-white/[0.04]"
          >
            <ArrowRight className="w-4 h-4 text-[#E08A52]" />
            <span>العودة للواجهة الرئيسية</span>
          </button>

          <span className="text-xs uppercase tracking-[0.4em] text-[#E08A52] font-semibold">
            ELEX 28 PORTAL
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl md:text-3xl font-light tracking-[0.4em] uppercase text-[#F6F2EB]">
          SPECIALIZATION
        </h2>

        <p className="font-arabic text-sm sm:text-base text-[#9A9EA6] mt-2 font-normal">
          اختر مسارك الأكاديمي… واستكشف المحاضرات، بنك الامتحانات، والقنوات الرسمية.
        </p>
      </header>

      {/* 3 Worlds Grid */}
      <div className="my-8 grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-7 items-stretch">
        {specs.map((s) => {
          const isHovered = activeCard === s.id;

          return (
            <div
              key={s.id}
              onMouseEnter={() => {
                setActiveCard(s.id);
                onHoverCard(s.id);
              }}
              onMouseLeave={() => {
                setActiveCard(null);
                onHoverCard(null);
              }}
              onClick={() => onSelect(s.id)}
              className="group relative flex flex-col justify-between p-6 sm:p-8 rounded-sm border cursor-pointer transition-all duration-500 overflow-hidden bg-[#0C0C0E]/70 backdrop-blur-md hover:-translate-y-1.5"
              style={{
                borderColor: isHovered ? s.colors.primary : 'rgba(255, 255, 255, 0.1)',
                boxShadow: isHovered
                  ? `0 20px 40px -15px ${s.colors.glow}, inset 0 0 25px -15px ${s.colors.glow}`
                  : 'none',
              }}
            >
              {/* Corner accent bracket */}
              <div 
                className="absolute top-3 left-3 w-3 h-3 border-t border-l transition-opacity duration-300"
                style={{ borderColor: s.colors.primary, opacity: isHovered ? 1 : 0.4 }}
              />
              <div 
                className="absolute bottom-3 right-3 w-3 h-3 border-b border-r transition-opacity duration-300"
                style={{ borderColor: s.colors.primary, opacity: isHovered ? 1 : 0.4 }}
              />

              {/* Background blueprint graphic */}
              <div style={{ color: s.colors.primary }}>
                {getSvgPattern(s.id)}
              </div>

              {/* Top metadata */}
              <div className="relative z-10 flex items-center justify-between text-[11px] tracking-[0.25em] mb-8">
                <span className="font-mono text-white/50">{s.badgeIndex}</span>
                <span 
                  className="font-medium px-2 py-0.5 rounded text-[10px] uppercase tracking-wider"
                  style={{ color: s.colors.primary, backgroundColor: `${s.colors.primary}15` }}
                >
                  {s.tag}
                </span>
              </div>

              {/* Main Content */}
              <div className="relative z-10 text-center my-auto">
                <div className="flex justify-center">
                  {getIcon(s.id, s.colors.primary)}
                </div>

                <span className="block text-[11px] tracking-[0.28em] text-[#9A9EA6] uppercase">
                  {s.titleEn}
                </span>

                <h3 className="font-arabic text-xl sm:text-2xl font-bold text-[#F6F2EB] mt-2 mb-3">
                  {s.titleAr}
                </h3>

                <p className="font-arabic text-xs sm:text-sm text-[#9A9EA6] font-light leading-relaxed max-w-xs mx-auto">
                  {s.taglineAr}
                </p>

                {/* Key stats row */}
                <div className="mt-6 pt-5 border-t border-white/[0.08] grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="block font-mono text-base font-medium text-white">
                      {s.stats.courses}
                    </span>
                    <span className="text-[10px] text-white/50 font-arabic">مواد أساسية</span>
                  </div>
                  <div className="border-r border-l border-white/[0.08]">
                    <span className="block font-mono text-base font-medium text-white">
                      {s.stats.hours}
                    </span>
                    <span className="text-[10px] text-white/50 font-arabic">ساعة معتمدة</span>
                  </div>
                  <div>
                    <span className="block font-mono text-base font-medium text-white">
                      {s.stats.exams}
                    </span>
                    <span className="text-[10px] text-white/50 font-arabic">امتحان سابق</span>
                  </div>
                </div>
              </div>

              {/* Action Prompt */}
              <div className="relative z-10 mt-8 pt-4 flex items-center justify-between text-xs tracking-[0.25em] font-medium" style={{ color: s.colors.primary }}>
                <span className="group-hover:translate-x-1 transition-transform">
                  استكشف التخصص
                </span>
                <span className="text-base group-hover:-translate-x-1.5 transition-transform">
                  ←
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer slogan */}
      <footer className="text-center text-[10px] tracking-[0.35em] text-[#9A9EA6]/60 uppercase pt-4 border-t border-white/[0.06]">
        ONE IDENTITY · THREE ENGINEERING WORLDS · ONE JOURNEY · ELEX 28
      </footer>
    </div>
  );
};
