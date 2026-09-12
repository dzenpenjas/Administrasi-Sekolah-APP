import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  WorkflowStepId,
  AppDataStore,
  TeacherProfile,
  SchoolData,
  AcademicSetting,
  CPData,
  TPData,
  ATPData,
} from './types';
import {
  getAppData,
  getProfileWorkspace,
  saveProfile,
  deleteProfile,
  saveSchool,
  saveAcademicSetting,
  saveCP,
  saveTP,
  saveATP,
  setActiveProfileId,
} from './services/storage';
import { Header } from './components/Header';
import { WorkflowStepper } from './components/WorkflowStepper';
import { ProfileManager } from './components/ProfileManager';
import { AcademicSettings } from './components/AcademicSettings';
import { CPManager } from './components/CPManager';
import { TPManager } from './components/TPManager';
import { ATPManager } from './components/ATPManager';
import { AdminDocsExport } from './components/AdminDocsExport';
import { BackupModal } from './components/BackupModal';

export function App() {
  const [dataStore, setDataStore] = useState<AppDataStore>(getAppData());
  const [currentStep, setCurrentStep] = useState<WorkflowStepId>('profile');
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Reload data from storage
  const refreshData = useCallback(() => {
    setDataStore(getAppData());
  }, []);

  // Compute the full workspace and active context using getProfileWorkspace
  const workspace = useMemo(() => {
    return getProfileWorkspace(dataStore.activeProfileId);
  }, [dataStore]);

  const {
    activeProfile,
    activeSchool,
    activeAcademicSetting,
    activeCP,
    activeTP,
    activeATP,
    activeContext,
  } = workspace;

  // Handlers
  const handleSelectProfile = (id: string) => {
    setActiveProfileId(id);
    refreshData();
  };

  const handleSaveProfile = (profile: TeacherProfile) => {
    saveProfile(profile);
    refreshData();
  };

  const handleDeleteProfile = (id: string) => {
    deleteProfile(id);
    refreshData();
  };

  const handleSaveSchool = (school: SchoolData) => {
    saveSchool(school);
    refreshData();
  };

  const handleSaveAcademicSetting = (setting: AcademicSetting) => {
    saveAcademicSetting(setting);
    refreshData();
  };

  const handleSaveCP = (cp: CPData) => {
    saveCP(cp);
    refreshData();
  };

  const handleSaveTP = (tp: TPData) => {
    saveTP(tp);
    refreshData();
  };

  const handleSaveATP = (atp: ATPData) => {
    saveATP(atp);
    refreshData();
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Application Header */}
      <Header
        activeProfile={activeProfile}
        school={activeSchool}
        profiles={dataStore.profiles}
        onSelectProfile={handleSelectProfile}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Workflow Stepper & Context Banner */}
        <WorkflowStepper
          currentStep={currentStep}
          onSelectStep={(step) => setCurrentStep(step)}
          profile={activeProfile}
          school={activeSchool}
          academicSetting={activeAcademicSetting}
          cp={activeCP}
          tp={activeTP}
          atp={activeATP}
        />

        {/* Step Views */}
        <section className="transition-all duration-150">
          {currentStep === 'profile' && (
            <ProfileManager
              profiles={dataStore.profiles}
              activeProfileId={activeProfile.id}
              schools={dataStore.schools}
              onSelectProfile={handleSelectProfile}
              onSaveProfile={handleSaveProfile}
              onDeleteProfile={handleDeleteProfile}
              onSaveSchool={handleSaveSchool}
              onNextStep={() => setCurrentStep('academic')}
            />
          )}

          {currentStep === 'academic' && (
            <AcademicSettings
              setting={activeAcademicSetting}
              profile={activeProfile}
              onSaveSetting={handleSaveAcademicSetting}
              onNextStep={() => setCurrentStep('cp')}
            />
          )}

          {currentStep === 'cp' && (
            <CPManager
              cp={activeCP}
              context={activeContext}
              academicSetting={activeAcademicSetting}
              profile={activeProfile}
              onSaveCP={handleSaveCP}
              onNextStep={() => setCurrentStep('tp')}
            />
          )}

          {currentStep === 'tp' && (
            <TPManager
              tp={activeTP}
              cp={activeCP}
              context={activeContext}
              academicSetting={activeAcademicSetting}
              profile={activeProfile}
              onSaveTP={handleSaveTP}
              onNextStep={() => setCurrentStep('atp')}
              onBackToCP={() => setCurrentStep('cp')}
            />
          )}

          {currentStep === 'atp' && (
            <ATPManager
              atp={activeATP}
              tp={activeTP}
              cp={activeCP}
              context={activeContext}
              academicSetting={activeAcademicSetting}
              profile={activeProfile}
              onSaveATP={handleSaveATP}
              onNextStep={() => setCurrentStep('admin')}
              onBackToTP={() => setCurrentStep('tp')}
            />
          )}

          {currentStep === 'admin' && (
            <AdminDocsExport
              profile={activeProfile}
              school={activeSchool}
              academicSetting={activeAcademicSetting}
              cp={activeCP}
              tp={activeTP}
              atp={activeATP}
              onBackToStep={(step) => setCurrentStep(step)}
            />
          )}
        </section>
      </main>

      {/* Footer info */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>Administrasi Guru AI</strong> — MVP Fondasi Tahap 1 (Alur Berkesinambungan: Profil → CP → TP → ATP → Dokumen)
          </div>
          <div className="text-[11px] text-slate-400">
            Konteks Terpusat (ActiveContext) • Fase Otomatis • Sumber CP Terverifikasi • Ekspor Word (.docx)
          </div>
        </div>
      </footer>

      {/* Backup / Restore JSON Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataRestored={refreshData}
      />
    </div>
  );
}
export default App;
