import React, { useState, useEffect } from 'react';
import { SpecializationId, PortalSection } from './types';
import { ThreeBackground } from './components/ThreeBackground';
import { EntryStage } from './components/EntryStage';
import { SpecializationSelector } from './components/SpecializationSelector';
import { SpecializationPortal } from './components/SpecializationPortal';

export default function App() {
  const [routeMode, setRouteMode] = useState<'entry' | 'specializations' | 'portal'>('entry');
  const [currentSpecialization, setCurrentSpecialization] = useState<SpecializationId>('communications');
  const [activeSection, setActiveSection] = useState<PortalSection>('overview');
  const [hoveredSpec, setHoveredSpec] = useState<SpecializationId | null>(null);

  // Parse URL hash on mount and hashchange
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/';

      if (hash.startsWith('#/specializations/')) {
        const parts = hash.replace('#/specializations/', '').split('/');
        const specId = parts[0] as SpecializationId;
        const section = (parts[1] as PortalSection) || 'overview';

        if (['communications', 'computer-networks', 'industrial'].includes(specId)) {
          setCurrentSpecialization(specId);
          setActiveSection(section);
          setRouteMode('portal');
          return;
        }
      }

      if (hash === '#/specializations') {
        setRouteMode('specializations');
        return;
      }

      // Default
      setRouteMode('entry');
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (newHash: string) => {
    window.location.hash = newHash;
  };

  const handleEnterStage = () => {
    navigateTo('#/specializations');
  };

  const handleSelectSpecialization = (id: SpecializationId) => {
    setCurrentSpecialization(id);
    setActiveSection('overview');
    navigateTo(`#/specializations/${id}`);
  };

  const handleNavigateSection = (sec: PortalSection) => {
    setActiveSection(sec);
    navigateTo(`#/specializations/${currentSpecialization}/${sec}`);
  };

  const handleBackToSelector = () => {
    navigateTo('#/specializations');
  };

  const handleBackToHome = () => {
    navigateTo('#/');
  };

  return (
    <div className="relative min-h-screen bg-[#0C0C0E] text-[#F6F2EB] overflow-x-hidden selection:bg-[#E08A52]/30">
      {/* 3D WebGL Three.js Visualizer Canvas */}
      <ThreeBackground
        mode={routeMode === 'portal' ? 'detail' : routeMode === 'specializations' ? 'specializations' : 'entry'}
        specializationId={currentSpecialization}
        hoveredSpecialization={hoveredSpec}
      />

      {/* Screen Views */}
      {routeMode === 'entry' && (
        <EntryStage onEnter={handleEnterStage} />
      )}

      {routeMode === 'specializations' && (
        <SpecializationSelector
          onSelect={handleSelectSpecialization}
          onBackToHome={handleBackToHome}
          onHoverCard={(id) => setHoveredSpec(id)}
        />
      )}

      {routeMode === 'portal' && (
        <SpecializationPortal
          specializationId={currentSpecialization}
          activeSection={activeSection}
          onNavigateSection={handleNavigateSection}
          onBackToSelector={handleBackToSelector}
        />
      )}
    </div>
  );
}
