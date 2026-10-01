import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, Zap, Cpu, Radio, Factory } from 'lucide-react';

interface EntryStageProps {
  onEnter: () => void;
}

const LOGO_PATHS = [
  "M389 91L389 173 408 154 409 100 490 21 601 21 682 102 681 198 480 390 481 439 691 440 777 528 908 528 996 441 998 315 951 262 998 212 998 93 907 1 778 0 694 81 609 1 482 1Z",
  "M1 81L0 445 80 527 297 528 388 435 391 437 393 528 712 527 694 508 414 508 411 505 412 365 614 171 614 120 585 90 508 89 478 117 476 151 296 323 295 389 269 418 115 420 110 415 110 321 113 318 204 317 308 210 113 209 110 206 110 112 113 109 301 109 408 2 84 1Z",
  "M785 21L898 21 978 101 978 204 922 262 978 323 978 429 899 508 786 508 705 424 705 323 762 262 704 203 704 102Z",
  "M93 21L356 21 358 24 292 89 89 91 91 229 259 231 193 298 89 300 91 439 278 438 316 396 315 334 496 160 497 128 515 110 573 109 593 128 592 164 392 355 390 403 288 508 91 508 21 437 21 92Z",
  "M733 263L684 316 684 415 681 419 504 419 501 415 502 398 688 220Z",
  "M802 299L773 329 774 409 804 439 882 439 910 408 909 328 876 297Z",
  "M801 90L772 121 773 199 804 229 881 228 909 198 908 117 879 89Z",
  "M811 319L870 318 888 336 889 400 873 418 813 419 795 401 794 338Z",
  "M810 110L869 109 888 126 889 189 872 208 813 209 795 192 794 127Z"
];

export const EntryStage: React.FC<EntryStageProps> = ({ onEnter }) => {
  const [revealed, setRevealed] = useState(false);
  const [fillOpacity, setFillOpacity] = useState(0);
  const [pulseActive, setPulseActive] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setRevealed(true);
      setFillOpacity(1);
      return;
    }

    const t1 = setTimeout(() => {
      setFillOpacity(1);
    }, 1200);

    const t2 = setTimeout(() => {
      setRevealed(true);
    }, 1600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    setPulseActive(true);
    setTimeout(() => {
      onEnter();
    }, 450);
  };

  const combinedPath = LOGO_PATHS.join(' ');

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center z-10 select-none">
      {/* Background vignette */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 46%, transparent 35%, rgba(6, 6, 8, 0.85) 100%)',
        }}
      />

      {/* Main Logo Container */}
      <div className="w-full max-w-[560px] md:max-w-[640px] px-4 transition-transform duration-700">
        <svg
          viewBox="0 0 1000 529"
          className="w-full h-auto overflow-visible drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)]"
          role="img"
          aria-label="ELEX 28 logo"
        >
          <defs>
            <linearGradient id="copperGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#C46E3E" />
              <stop offset="55%" stopColor="#E88F57" />
              <stop offset="100%" stopColor="#F8A566" />
            </linearGradient>

            <filter id="circuitGlow" x="-20%" y="-30%" width="140%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Copper Glow Halo */}
          <path
            d={combinedPath}
            fill="#E8884E"
            fillRule="evenodd"
            filter="url(#circuitGlow)"
            className="transition-opacity duration-1000"
            style={{ opacity: fillOpacity * 0.4 }}
          />

          {/* Solid Gradient Fill */}
          <path
            d={combinedPath}
            fill="url(#copperGrad)"
            fillRule="evenodd"
            className="transition-opacity duration-1000"
            style={{ opacity: fillOpacity }}
          />

          {/* Circuit Traces Outlines */}
          {LOGO_PATHS.map((d, idx) => (
            <path
              key={idx}
              d={d}
              fill="none"
              stroke="#F4A66E"
              strokeWidth="2"
              strokeLinejoin="round"
              className="transition-all duration-1000"
              style={{
                opacity: fillOpacity > 0 ? 0.35 : 0.85,
              }}
            />
          ))}
        </svg>
      </div>

      {/* Headings */}
      <div 
        className={`mt-6 md:mt-8 transition-all duration-1000 ${
          revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-[0.18em] text-[#F6F2EB] uppercase">
          ELEX 28
        </h1>

        <p className="mt-2 text-xs sm:text-sm md:text-base font-light tracking-[0.45em] text-[#9A9EA6] uppercase">
          ELECTRONICS ENGINEERING
        </p>

        <p className="mt-3 font-arabic text-sm md:text-base text-[#F7A468]/90 font-normal">
          البوابة الأكاديمية والمنصة التفاعلية الرسمية لمهندسي الدفعة 28
        </p>
      </div>

      {/* CTA Button */}
      <div 
        className={`mt-8 md:mt-10 transition-all duration-1000 delay-200 ${
          revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <button
          ref={buttonRef}
          onClick={handleClick}
          type="button"
          className={`group relative overflow-hidden px-8 py-3.5 sm:px-10 sm:py-4 rounded-sm border border-[#E08A52]/80 bg-white/[0.03] backdrop-blur-md text-[#F6F2EB] font-medium tracking-[0.3em] text-xs sm:text-sm uppercase transition-all duration-300 hover:border-[#F7A468] hover:bg-white/[0.08] hover:shadow-[0_0_35px_rgba(224,138,82,0.3)] active:scale-95 ${
            pulseActive ? 'scale-95 border-[#F7A468] bg-[#E08A52]/20' : ''
          }`}
        >
          {/* Shimmer line */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-[#F7A468]/30 to-transparent" />
          
          <span className="relative z-10 flex items-center justify-center gap-3">
            <span>ENTER ELEX 28</span>
            <ChevronLeft className="w-4 h-4 text-[#F7A468] group-hover:-translate-x-1 transition-transform" />
          </span>
        </button>
      </div>

      {/* Specializations Quick Badges */}
      <div 
        className={`mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-[#9A9EA6] transition-all duration-1000 delay-300 ${
          revealed ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-[#32D6FF]" />
          <span>هندسة الاتصالات</span>
        </div>
        <span className="text-white/20">·</span>
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-[#3C86E8]" />
          <span>هندسة الحاسوب والشبكات</span>
        </div>
        <span className="text-white/20">·</span>
        <div className="flex items-center gap-2">
          <Factory className="w-3.5 h-3.5 text-[#FF8A00]" />
          <span>الهندسة الصناعية والأتمتة</span>
        </div>
      </div>
    </div>
  );
};
