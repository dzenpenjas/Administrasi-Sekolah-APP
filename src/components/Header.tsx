import React from 'react';
import { BookOpen, Sparkles, Database, UserCheck, Wifi, WifiOff } from 'lucide-react';
import { TeacherProfile, SchoolData } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { useOnlineStatus } from '../hooks/usePWAInstall';

interface HeaderProps {
  activeProfile: TeacherProfile;
  school: SchoolData;
  profiles: TeacherProfile[];
  onSelectProfile: (id: string) => void;
  onOpenBackupModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeProfile,
  school,
  profiles,
  onSelectProfile,
  onOpenBackupModal,
}) => {
  const isOnline = useOnlineStatus();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-900 to-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-900/10">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
                  Administrasi Guru <span className="text-blue-600">AI</span>
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                  MVP Tahap 1
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Penyusun Administrasi Pembelajaran Bertahap Berbasis AI
              </p>
            </div>
          </div>

          {/* Actions & Profile Selector */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Online/Offline status */}
            <div
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
              title={isOnline ? 'Terhubung dengan internet' : 'Mode Offline'}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px]">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-rose-600" />
                  <span className="text-[11px]">Offline</span>
                </>
              )}
            </div>

            {/* Profile Quick Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <UserCheck className="w-4 h-4 text-blue-700 ml-1.5 hidden sm:block" />
              <select
                id="select-header-profile"
                value={activeProfile.id}
                onChange={(e) => onSelectProfile(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-800 focus:outline-hidden py-1 px-1.5 cursor-pointer max-w-[140px] sm:max-w-[180px] truncate"
                title="Ganti Profil Guru yang Sedang Aktif"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.status || 'Guru'})
                  </option>
                ))}
              </select>
            </div>

            {/* Backup / Restore */}
            <button
              id="btn-header-backup"
              onClick={onOpenBackupModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-medium shadow-xs transition-colors cursor-pointer"
              title="Cadangkan (Backup) atau Pulihkan (Restore) Data JSON"
            >
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Backup / Restore</span>
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton />
          </div>
        </div>
      </div>
    </header>
  );
};
