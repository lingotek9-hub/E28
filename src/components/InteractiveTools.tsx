import React, { useState } from 'react';
import { Calculator, Radio, Cpu, Network, Activity, Sliders, RefreshCw, Copy, Check } from 'lucide-react';

interface InteractiveToolsProps {
  accentColor: string;
}

export const InteractiveTools: React.FC<InteractiveToolsProps> = ({ accentColor }) => {
  const [activeTool, setActiveTool] = useState<'resistor' | 'rf' | 'shannon' | 'subnet' | 'rc'>('resistor');
  const [copied, setCopied] = useState(false);

  // 1. Resistor Calculator State
  const [bandsMode, setBandsMode] = useState<4 | 5>(4);
  const [b1, setB1] = useState(1); // Brown (1)
  const [b2, setB2] = useState(0); // Black (0)
  const [b3, setB3] = useState(0); // For 5-band: Black (0)
  const [mult, setMult] = useState(2); // Red (x100)
  const [tol, setTol] = useState(5); // Gold (5%)

  const COLOR_MAP: Record<number, { name: string; bg: string; text: string }> = {
    0: { name: 'Black / أسود', bg: '#000000', text: '#ffffff' },
    1: { name: 'Brown / بني', bg: '#8B4513', text: '#ffffff' },
    2: { name: 'Red / أحمر', bg: '#DC2626', text: '#ffffff' },
    3: { name: 'Orange / برتقالي', bg: '#EA580C', text: '#ffffff' },
    4: { name: 'Yellow / أصفر', bg: '#EAB308', text: '#000000' },
    5: { name: 'Green / أخضر', bg: '#16A34A', text: '#ffffff' },
    6: { name: 'Blue / أزرق', bg: '#2563EB', text: '#ffffff' },
    7: { name: 'Violet / بنفسجي', bg: '#7C3AED', text: '#ffffff' },
    8: { name: 'Gray / رمادي', bg: '#6B7280', text: '#ffffff' },
    9: { name: 'White / أبيض', bg: '#FFFFFF', text: '#000000' },
  };

  const MULTIPLIER_MAP: Record<number, { label: string; factor: number; color: string }> = {
    0: { label: '1 Ω (Black)', factor: 1, color: '#000000' },
    1: { label: '10 Ω (Brown)', factor: 10, color: '#8B4513' },
    2: { label: '100 Ω (Red)', factor: 100, color: '#DC2626' },
    3: { label: '1 kΩ (Orange)', factor: 1000, color: '#EA580C' },
    4: { label: '10 kΩ (Yellow)', factor: 10000, color: '#EAB308' },
    5: { label: '100 kΩ (Green)', factor: 100000, color: '#16A34A' },
    6: { label: '1 MΩ (Blue)', factor: 1000000, color: '#2563EB' },
  };

  const calculateResistance = () => {
    let base = bandsMode === 4 ? b1 * 10 + b2 : b1 * 100 + b2 * 10 + b3;
    const factor = MULTIPLIER_MAP[mult]?.factor || 1;
    const ohms = base * factor;
    if (ohms >= 1000000) return `${(ohms / 1000000).toFixed(2)} MΩ`;
    if (ohms >= 1000) return `${(ohms / 1000).toFixed(2)} kΩ`;
    return `${ohms} Ω`;
  };

  // 2. RF & Frequency State
  const [rfFreq, setRfFreq] = useState<number>(2.4); // GHz
  const [rfUnit, setRfUnit] = useState<'MHz' | 'GHz'>('GHz');
  const [powerDbm, setPowerDbm] = useState<number>(20); // 20 dBm = 100 mW

  const calculateWavelength = () => {
    const fHz = rfUnit === 'GHz' ? rfFreq * 1e9 : rfFreq * 1e6;
    if (fHz <= 0) return '0 mm';
    const c = 3e8; // speed of light m/s
    const lambdaM = c / fHz;
    if (lambdaM < 0.01) return `${(lambdaM * 1000).toFixed(2)} mm`;
    if (lambdaM < 1) return `${(lambdaM * 100).toFixed(2)} cm`;
    return `${lambdaM.toFixed(3)} m`;
  };

  const dbmToMw = (dbm: number) => {
    const mw = Math.pow(10, dbm / 10);
    if (mw >= 1000) return `${(mw / 1000).toFixed(2)} W`;
    return `${mw.toFixed(2)} mW`;
  };

  // 3. Shannon Capacity State
  const [bandwidthMhz, setBandwidthMhz] = useState<number>(20); // 20 MHz
  const [snrDb, setSnrDb] = useState<number>(25); // 25 dB

  const calculateShannonCapacity = () => {
    const snrLinear = Math.pow(10, snrDb / 10);
    const capacityBps = bandwidthMhz * 1e6 * Math.log2(1 + snrLinear);
    if (capacityBps >= 1e9) return `${(capacityBps / 1e9).toFixed(2)} Gbps`;
    return `${(capacityBps / 1e6).toFixed(2)} Mbps`;
  };

  // 4. Subnet Calculator State
  const [ipInput, setIpInput] = useState('192.168.10.15');
  const [cidr, setCidr] = useState<number>(24);

  const calculateSubnetInfo = () => {
    const hostBits = 32 - cidr;
    const totalHosts = Math.pow(2, hostBits);
    const usableHosts = hostBits > 1 ? totalHosts - 2 : 1;

    // Simple IP parsing
    const parts = ipInput.split('.').map((p) => parseInt(p, 10));
    if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
      return { mask: '255.255.255.0', netId: 'Invalid IP', bcast: 'Invalid IP', hosts: 0 };
    }

    const ipNum = (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
    const maskNum = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
    const netNum = (ipNum & maskNum) >>> 0;
    const bcastNum = (netNum | (~maskNum >>> 0)) >>> 0;

    const numToIp = (n: number) =>
      [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');

    return {
      mask: numToIp(maskNum),
      netId: numToIp(netNum),
      bcast: numToIp(bcastNum),
      hosts: usableHosts,
    };
  };

  // 5. RC Cutoff State
  const [resistorVal, setResistorVal] = useState<number>(10); // 10 kOhm
  const [resUnit, setResUnit] = useState<'kOhm' | 'Ohm'>('kOhm');
  const [capVal, setCapVal] = useState<number>(100); // 100 nF
  const [capUnit, setCapUnit] = useState<'nF' | 'pF' | 'uF'>('nF');

  const calculateRcCutoff = () => {
    const r = resUnit === 'kOhm' ? resistorVal * 1000 : resistorVal;
    const cMult = capUnit === 'pF' ? 1e-12 : capUnit === 'nF' ? 1e-9 : 1e-6;
    const c = capVal * cMult;
    if (r <= 0 || c <= 0) return '0 Hz';
    const fc = 1 / (2 * Math.PI * r * c);
    if (fc >= 1e6) return `${(fc / 1e6).toFixed(2)} MHz`;
    if (fc >= 1e3) return `${(fc / 1e3).toFixed(2)} kHz`;
    return `${fc.toFixed(1)} Hz`;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0C0C0E]/90 border border-white/[0.08] rounded p-5 sm:p-7 backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs tracking-[0.25em] font-medium" style={{ color: accentColor }}>
            <Calculator className="w-4 h-4" />
            <span>ELECTRONICS LAB UTILITIES</span>
          </div>
          <h3 className="font-arabic text-xl sm:text-2xl font-bold text-white mt-1">
            أدوات وحاسبات الهندسة الإلكترونية ELEX
          </h3>
          <p className="font-arabic text-xs sm:text-sm text-[#9A9EA6] mt-1">
            حاسبات فورية ودقيقة مخصصة لطلاب الهندسة في معامل الاتصالات والشبكات والأنظمة الصناعية.
          </p>
        </div>

        {/* Tool selector buttons */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-white/[0.03] border border-white/[0.06] rounded">
          <button
            onClick={() => setActiveTool('resistor')}
            className={`px-3 py-1.5 text-xs rounded transition-colors ${
              activeTool === 'resistor' ? 'bg-white/10 text-white font-medium' : 'text-white/60 hover:text-white'
            }`}
          >
            المقاومات (Color Code)
          </button>
          <button
            onClick={() => setActiveTool('rf')}
            className={`px-3 py-1.5 text-xs rounded transition-colors ${
              activeTool === 'rf' ? 'bg-white/10 text-white font-medium' : 'text-white/60 hover:text-white'
            }`}
          >
            RF & dBm
          </button>
          <button
            onClick={() => setActiveTool('shannon')}
            className={`px-3 py-1.5 text-xs rounded transition-colors ${
              activeTool === 'shannon' ? 'bg-white/10 text-white font-medium' : 'text-white/60 hover:text-white'
            }`}
          >
            Shannon Capacity
          </button>
          <button
            onClick={() => setActiveTool('subnet')}
            className={`px-3 py-1.5 text-xs rounded transition-colors ${
              activeTool === 'subnet' ? 'bg-white/10 text-white font-medium' : 'text-white/60 hover:text-white'
            }`}
          >
            IP Subnetting
          </button>
          <button
            onClick={() => setActiveTool('rc')}
            className={`px-3 py-1.5 text-xs rounded transition-colors ${
              activeTool === 'rc' ? 'bg-white/10 text-white font-medium' : 'text-white/60 hover:text-white'
            }`}
          >
            RC Filter (Cutoff)
          </button>
        </div>
      </div>

      {/* Tool Content Area */}
      <div className="mt-6">
        {/* 1. RESISTOR COLOR CODE */}
        {activeTool === 'resistor' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-white/70">
                Resistor Band Selector
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setBandsMode(4)}
                  className={`px-3 py-1 text-xs rounded border ${
                    bandsMode === 4 ? 'border-white/40 bg-white/10 text-white' : 'border-white/10 text-white/50'
                  }`}
                >
                  4 Bands (شائع)
                </button>
                <button
                  onClick={() => setBandsMode(5)}
                  className={`px-3 py-1 text-xs rounded border ${
                    bandsMode === 5 ? 'border-white/40 bg-white/10 text-white' : 'border-white/10 text-white/50'
                  }`}
                >
                  5 Bands (دقيق)
                </button>
              </div>
            </div>

            {/* Visual Resistor Graphic */}
            <div className="relative py-8 px-6 bg-black/40 border border-white/[0.08] rounded flex items-center justify-center">
              {/* Resistor wire lead left */}
              <div className="w-16 h-1.5 bg-neutral-400" />

              {/* Resistor body */}
              <div className="relative w-64 sm:w-80 h-16 bg-[#d2b48c] rounded-lg shadow-inner flex items-center justify-around px-4 border border-black/30">
                {/* Band 1 */}
                <div
                  className="w-4 h-full shadow"
                  style={{ backgroundColor: COLOR_MAP[b1].bg }}
                  title={`Band 1: ${COLOR_MAP[b1].name}`}
                />
                {/* Band 2 */}
                <div
                  className="w-4 h-full shadow"
                  style={{ backgroundColor: COLOR_MAP[b2].bg }}
                  title={`Band 2: ${COLOR_MAP[b2].name}`}
                />
                {/* Band 3 (if 5-band) */}
                {bandsMode === 5 && (
                  <div
                    className="w-4 h-full shadow"
                    style={{ backgroundColor: COLOR_MAP[b3].bg }}
                    title={`Band 3: ${COLOR_MAP[b3].name}`}
                  />
                )}
                {/* Multiplier Band */}
                <div
                  className="w-4 h-full shadow"
                  style={{ backgroundColor: MULTIPLIER_MAP[mult].color }}
                  title={`Multiplier: ${MULTIPLIER_MAP[mult].label}`}
                />
                {/* Spacer */}
                <div className="w-6" />
                {/* Tolerance Band */}
                <div
                  className="w-4 h-full shadow bg-amber-400"
                  title="Tolerance: ±5% (Gold)"
                />
              </div>

              {/* Resistor wire lead right */}
              <div className="w-16 h-1.5 bg-neutral-400" />
            </div>

            {/* Calculated Result Display */}
            <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-right">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#9A9EA6]">قيمة المقاومة المحسوبة:</span>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-white mt-0.5">
                  {calculateResistance()} <span className="text-sm font-normal text-[#E08A52]">±{tol}%</span>
                </div>
              </div>
              <button
                onClick={() => handleCopy(`${calculateResistance()} ±${tol}%`)}
                className="px-4 py-2 text-xs bg-white/[0.06] hover:bg-white/[0.1] rounded text-white flex items-center justify-center gap-2 self-center sm:self-auto"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ' : 'نسخ القيمة'}</span>
              </button>
            </div>

            {/* Band Pickers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-white/60 mb-1.5">اللون 1 (خانة العشرات):</label>
                <select
                  value={b1}
                  onChange={(e) => setB1(Number(e.target.value))}
                  className="w-full bg-[#151518] border border-white/10 rounded px-2.5 py-2 text-white"
                >
                  {Object.entries(COLOR_MAP).filter(([k]) => Number(k) > 0).map(([val, info]) => (
                    <option key={val} value={val}>{val} - {info.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/60 mb-1.5">اللون 2 (خانة الآحاد):</label>
                <select
                  value={b2}
                  onChange={(e) => setB2(Number(e.target.value))}
                  className="w-full bg-[#151518] border border-white/10 rounded px-2.5 py-2 text-white"
                >
                  {Object.entries(COLOR_MAP).map(([val, info]) => (
                    <option key={val} value={val}>{val} - {info.name}</option>
                  ))}
                </select>
              </div>

              {bandsMode === 5 && (
                <div>
                  <label className="block text-white/60 mb-1.5">اللون 3 (الخانة الثالثة):</label>
                  <select
                    value={b3}
                    onChange={(e) => setB3(Number(e.target.value))}
                    className="w-full bg-[#151518] border border-white/10 rounded px-2.5 py-2 text-white"
                  >
                    {Object.entries(COLOR_MAP).map(([val, info]) => (
                      <option key={val} value={val}>{val} - {info.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-white/60 mb-1.5">معامل الضرب (Multiplier):</label>
                <select
                  value={mult}
                  onChange={(e) => setMult(Number(e.target.value))}
                  className="w-full bg-[#151518] border border-white/10 rounded px-2.5 py-2 text-white"
                >
                  {Object.entries(MULTIPLIER_MAP).map(([val, info]) => (
                    <option key={val} value={val}>{info.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 2. RF & WAVELENGTH CALCULATOR */}
        {activeTool === 'rf' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Frequency to Wavelength */}
              <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded space-y-4">
                <span className="text-xs uppercase tracking-wider text-[#32D6FF] font-medium flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5" />
                  <span>طول الموجة الكهرومغناطيسية (λ = c / f)</span>
                </span>

                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={rfFreq}
                    onChange={(e) => setRfFreq(Number(e.target.value))}
                    className="flex-1 bg-[#151518] border border-white/10 rounded px-3 py-2 text-white text-sm font-mono"
                    placeholder="التردد"
                  />
                  <select
                    value={rfUnit}
                    onChange={(e) => setRfUnit(e.target.value as any)}
                    className="bg-[#151518] border border-white/10 rounded px-3 py-2 text-white text-xs"
                  >
                    <option value="GHz">GHz</option>
                    <option value="MHz">MHz</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-white/[0.08]">
                  <span className="text-[11px] text-[#9A9EA6]">الطول الموجي في الفراغ:</span>
                  <div className="text-2xl font-bold font-mono text-white mt-0.5">
                    λ = {calculateWavelength()}
                  </div>
                  <span className="text-[10px] text-white/40 block mt-1">
                    طول هوائي ربع الموجة (λ/4) = {(parseFloat(calculateWavelength()) / 4).toFixed(2)} {calculateWavelength().split(' ')[1]}
                  </span>
                </div>
              </div>

              {/* dBm to Watts Converter */}
              <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded space-y-4">
                <span className="text-xs uppercase tracking-wider text-[#F7A468] font-medium flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>تحويل القدرة (Power dBm ↔ Watts)</span>
                </span>

                <div>
                  <label className="text-xs text-white/60 mb-1 block">القدرة بالـ dBm:</label>
                  <input
                    type="number"
                    value={powerDbm}
                    onChange={(e) => setPowerDbm(Number(e.target.value))}
                    className="w-full bg-[#151518] border border-white/10 rounded px-3 py-2 text-white text-sm font-mono"
                    placeholder="e.g. 20"
                  />
                </div>

                <div className="pt-3 border-t border-white/[0.08]">
                  <span className="text-[11px] text-[#9A9EA6]">القدرة المعادلة بالوات (Watts / mW):</span>
                  <div className="text-2xl font-bold font-mono text-white mt-0.5">
                    {dbmToMw(powerDbm)}
                  </div>
                  <span className="text-[10px] text-white/40 block mt-1">
                    0 dBm = 1 mW | 30 dBm = 1 Watt | 43 dBm = 20 Watts (محطة 5G)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. SHANNON CAPACITY */}
        {activeTool === 'shannon' && (
          <div className="space-y-5 p-5 bg-white/[0.02] border border-white/[0.08] rounded">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#32D6FF] font-medium">
                قانون شانون لسعة القناة (Shannon-Hartley Theorem)
              </span>
              <p className="text-xs text-white/60 font-mono mt-1">
                C = B × log₂(1 + SNR)
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/70 block mb-1">عرض النطاق الترددي B (Bandwidth in MHz):</label>
                <input
                  type="number"
                  min="1"
                  value={bandwidthMhz}
                  onChange={(e) => setBandwidthMhz(Number(e.target.value))}
                  className="w-full bg-[#151518] border border-white/10 rounded px-3 py-2 text-white text-sm font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">نسبة الإشارة للضجيج SNR (dB):</label>
                <input
                  type="number"
                  value={snrDb}
                  onChange={(e) => setSnrDb(Number(e.target.value))}
                  className="w-full bg-[#151518] border border-white/10 rounded px-3 py-2 text-white text-sm font-mono"
                />
              </div>
            </div>

            <div className="p-4 bg-black/40 border border-white/[0.08] rounded text-center sm:text-right">
              <span className="text-xs text-[#9A9EA6]">الحد الأقصى النظري لنقل البيانات (Channel Capacity):</span>
              <div className="text-3xl font-bold font-mono text-white mt-1" style={{ color: accentColor }}>
                {calculateShannonCapacity()}
              </div>
            </div>
          </div>
        )}

        {/* 4. IP SUBNET CALCULATOR */}
        {activeTool === 'subnet' && (
          <div className="space-y-5 p-5 bg-white/[0.02] border border-white/[0.08] rounded">
            <span className="text-xs uppercase tracking-wider text-[#3C86E8] font-medium flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5" />
              <span>حاسبة تقسيم الشبكات للمهندسين (IPv4 Subnetting)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs text-white/70 block mb-1">عنوان الـ IP:</label>
                <input
                  type="text"
                  value={ipInput}
                  onChange={(e) => setIpInput(e.target.value)}
                  className="w-full bg-[#151518] border border-white/10 rounded px-3 py-2 text-white text-sm font-mono"
                  placeholder="192.168.1.1"
                />
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">الـ CIDR Prefix (/):</label>
                <select
                  value={cidr}
                  onChange={(e) => setCidr(Number(e.target.value))}
                  className="w-full bg-[#151518] border border-white/10 rounded px-3 py-2 text-white text-sm font-mono"
                >
                  {[8, 16, 20, 24, 25, 26, 27, 28, 29, 30].map((c) => (
                    <option key={c} value={c}>/{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subnet Output Grid */}
            {(() => {
              const res = calculateSubnetInfo();
              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center p-3 bg-black/40 border border-white/[0.08] rounded">
                  <div>
                    <span className="text-[10px] text-white/50 block">قناع الشبكة (Subnet Mask)</span>
                    <span className="font-mono text-xs font-semibold text-white mt-1 block">{res.mask}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/50 block">عنوان الشبكة (Network ID)</span>
                    <span className="font-mono text-xs font-semibold text-[#32D6FF] mt-1 block">{res.netId}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/50 block">عنوان البث (Broadcast IP)</span>
                    <span className="font-mono text-xs font-semibold text-[#F7A468] mt-1 block">{res.bcast}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/50 block">الأجهزة المتاحة (Usable Hosts)</span>
                    <span className="font-mono text-xs font-semibold text-emerald-400 mt-1 block">{res.hosts}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* 5. RC FILTER CUTOFF */}
        {activeTool === 'rc' && (
          <div className="space-y-5 p-5 bg-white/[0.02] border border-white/[0.08] rounded">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#FF8A00] font-medium">
                حساب تردد قطع مرشح RC البسيط (RC Low-Pass / High-Pass Cutoff)
              </span>
              <p className="text-xs text-white/60 font-mono mt-1">
                fc = 1 / (2 × π × R × C)
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/70 block mb-1">قيمة المقاومة R:</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={resistorVal}
                    onChange={(e) => setResistorVal(Number(e.target.value))}
                    className="flex-1 bg-[#151518] border border-white/10 rounded px-3 py-2 text-white text-sm font-mono"
                  />
                  <select
                    value={resUnit}
                    onChange={(e) => setResUnit(e.target.value as any)}
                    className="bg-[#151518] border border-white/10 rounded px-3 py-2 text-white text-xs"
                  >
                    <option value="kOhm">kΩ</option>
                    <option value="Ohm">Ω</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">قيمة المكثف C:</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={capVal}
                    onChange={(e) => setCapVal(Number(e.target.value))}
                    className="flex-1 bg-[#151518] border border-white/10 rounded px-3 py-2 text-white text-sm font-mono"
                  />
                  <select
                    value={capUnit}
                    onChange={(e) => setCapUnit(e.target.value as any)}
                    className="bg-[#151518] border border-white/10 rounded px-3 py-2 text-white text-xs"
                  >
                    <option value="nF">nF</option>
                    <option value="pF">pF</option>
                    <option value="uF">μF</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 bg-black/40 border border-white/[0.08] rounded text-center sm:text-right">
              <span className="text-xs text-[#9A9EA6]">تردد القطع (-3dB Cutoff Frequency):</span>
              <div className="text-3xl font-bold font-mono text-white mt-1" style={{ color: accentColor }}>
                fc = {calculateRcCutoff()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
