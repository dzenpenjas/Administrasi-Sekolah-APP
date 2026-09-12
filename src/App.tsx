import React, { useState, useEffect, useCallback } from 'react';
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
  saveAppData,
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

  // Active profile
  const activeProfile =
    dataStore.profiles.find((p) => p.id === dataStore.activeProfileId) ||
    dataStore.profiles[0] || {
      id: 'prof-default',
      name: 'Guru',
      status: 'PNS',
      defaultSubject: 'Bahasa Indonesia',
      defaultLevel: 'SD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

  // Active School for this profile
  const activeSchool =
    dataStore.schools.find((s) => s.id === activeProfile.schoolId) ||
    dataStore.schools[0] || {
      id: 'sch-1',
      name: 'SD Negeri 01 Nusantara',
      npsn: '20234567',
      address: 'Jl. Merdeka Pendidikan No. 45',
      village: 'Sukamaju',
      district: 'Cerdas',
      regency: 'Kabupaten Gemilang',
      province: 'Jawa Barat',
      principalName: 'Dra. Hj. Siti Rahmawati, M.Pd.',
      principalNip: '19680512 199303 2 004',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

  // Active Academic Setting for this profile
  const activeAcademicSetting =
    dataStore.academicSettings.find((a) => a.profileId === activeProfile.id) || {
      id: `acad-${activeProfile.id}`,
      profileId: activeProfile.id,
      curriculum: 'Kurikulum Merdeka',
      academicYear: '2025/2026',
      semester: '1 (Ganjil)',
      level: activeProfile.defaultLevel || 'SD',
      grade: 'Kelas 4',
      phase: 'Fase B',
      subject: activeProfile.defaultSubject || 'Bahasa Indonesia',
      totalHoursPerWeek: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

  // Active CP for this academic setting
  const activeCP =
    dataStore.cps.find((c) => c.academicSettingId === activeAcademicSetting.id) || {
      id: `cp-${activeAcademicSetting.id}`,
      academicSettingId: activeAcademicSetting.id,
      generalDescription: '',
      elements: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

  // Active TP for this academic setting
  const activeTP =
    dataStore.tps.find((t) => t.academicSettingId === activeAcademicSetting.id) || {
      id: `tp-${activeAcademicSetting.id}`,
      academicSettingId: activeAcademicSetting.id,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

  // Active ATP for this academic setting
  const activeATP =
    dataStore.atps.find((a) => a.academicSettingId === activeAcademicSetting.id) || {
      id: `atp-${activeAcademicSetting.id}`,
      academicSettingId: activeAcademicSetting.id,
      rationale: '',
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

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
            <strong>Administrasi Guru AI</strong> — MVP Tahap 1 (Alur: Profil → CP → TP → ATP → Administrasi)
          </div>
          <div className="text-[11px] text-slate-400">
            Penyimpanan lokal di peramban (localStorage) • Dilengkapi fitur PWA & Ekspor Word (.docx)
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
