import {
  AppStorageState,
  TeacherProfile,
  SchoolData,
  AcademicSetting,
  CPData,
  TPData,
  ATPData,
  AppDocumentRecord,
  ProfileWorkspaceData,
} from '../types';
import {
  INITIAL_PROFILES,
  INITIAL_SCHOOL,
  INITIAL_ACADEMIC_SETTINGS,
  INITIAL_CP_DATA,
  INITIAL_TP_DATA,
  INITIAL_ATP_DATA,
} from '../data/curriculumDefaults';
import saveAs from 'file-saver';

const STORAGE_KEY = 'administrasi_guru_ai_storage_v1';

export function getInitialState(): AppStorageState {
  return {
    version: 1,
    activeProfileId: INITIAL_PROFILES[0].id,
    profiles: [...INITIAL_PROFILES],
    schools: [{ ...INITIAL_SCHOOL }],
    academicSettings: [...INITIAL_ACADEMIC_SETTINGS],
    cps: [...INITIAL_CP_DATA],
    tps: [...INITIAL_TP_DATA],
    atps: [...INITIAL_ATP_DATA],
    documents: [
      {
        id: 'doc-atp-1',
        type: 'ATP',
        title: 'Alur Tujuan Pembelajaran (ATP) - Bahasa Indonesia Kelas 4 Fase B',
        status: 'completed',
        lastGenerated: new Date().toISOString(),
        fileName: 'ATP_Bahasa_Indonesia_Kelas_4_Fase_B.docx',
      },
      {
        id: 'doc-prota-1',
        type: 'PROTA',
        title: 'Program Tahunan (PROTA)',
        status: 'future_sprint',
      },
      {
        id: 'doc-promes-1',
        type: 'PROMES',
        title: 'Program Semester (PROMES)',
        status: 'future_sprint',
      },
      {
        id: 'doc-modul-1',
        type: 'MODUL_AJAR',
        title: 'Modul Ajar / RPP Berdiferensiasi',
        status: 'future_sprint',
      },
      {
        id: 'doc-asesmen-1',
        type: 'ASESMEN',
        title: 'Instrumen Asesmen & Rubrik',
        status: 'future_sprint',
      },
      {
        id: 'doc-jurnal-1',
        type: 'JURNAL',
        title: 'Jurnal Harian Mengajar & Refleksi',
        status: 'future_sprint',
      },
    ],
  };
}

export function loadAppStorage(): AppStorageState {
  if (typeof window === 'undefined') {
    return getInitialState();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialState();
      saveAppStorage(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as AppStorageState;
    if (!parsed || !parsed.profiles || parsed.profiles.length === 0) {
      const initial = getInitialState();
      saveAppStorage(initial);
      return initial;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load localStorage data:', err);
    return getInitialState();
  }
}

export function saveAppStorage(state: AppStorageState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

// Aliases and CRUD Helpers for App
export const getAppData = loadAppStorage;
export const saveAppData = saveAppStorage;

export function setActiveProfileId(profileId: string): void {
  const current = loadAppStorage();
  current.activeProfileId = profileId;
  saveAppStorage(current);
}

export function saveProfile(profile: TeacherProfile): void {
  const current = loadAppStorage();
  const idx = current.profiles.findIndex((p) => p.id === profile.id);
  if (idx >= 0) {
    current.profiles[idx] = profile;
  } else {
    current.profiles.push(profile);
    current.activeProfileId = profile.id;
  }
  saveAppStorage(current);
}

export function deleteProfile(profileId: string): void {
  const current = loadAppStorage();
  if (current.profiles.length <= 1) return; // Keep at least 1 profile
  current.profiles = current.profiles.filter((p) => p.id !== profileId);
  if (current.activeProfileId === profileId) {
    current.activeProfileId = current.profiles[0].id;
  }
  saveAppStorage(current);
}

export function saveSchool(school: SchoolData): void {
  const current = loadAppStorage();
  const idx = current.schools.findIndex((s) => s.id === school.id);
  if (idx >= 0) {
    current.schools[idx] = school;
  } else {
    current.schools.push(school);
  }
  saveAppStorage(current);
}

export function saveAcademicSetting(setting: AcademicSetting): void {
  const current = loadAppStorage();
  const idx = current.academicSettings.findIndex((a) => a.id === setting.id);
  if (idx >= 0) {
    current.academicSettings[idx] = setting;
  } else {
    current.academicSettings.push(setting);
  }
  saveAppStorage(current);
}

export function saveCP(cp: CPData): void {
  const current = loadAppStorage();
  const idx = current.cps.findIndex((c) => c.id === cp.id || c.academicSettingId === cp.academicSettingId);
  if (idx >= 0) {
    current.cps[idx] = cp;
  } else {
    current.cps.push(cp);
  }
  saveAppStorage(current);
}

export function saveTP(tp: TPData): void {
  const current = loadAppStorage();
  const idx = current.tps.findIndex((t) => t.id === tp.id || t.academicSettingId === tp.academicSettingId);
  if (idx >= 0) {
    current.tps[idx] = tp;
  } else {
    current.tps.push(tp);
  }
  saveAppStorage(current);
}

export function saveATP(atp: ATPData): void {
  const current = loadAppStorage();
  const totalJP = atp.items.reduce((acc, curr) => acc + (Number(curr.jp) || 0), 0);
  const updatedATP = { ...atp, totalJP };

  const idx = current.atps.findIndex((a) => a.id === atp.id || a.academicSettingId === atp.academicSettingId);
  if (idx >= 0) {
    current.atps[idx] = updatedATP;
  } else {
    current.atps.push(updatedATP);
  }
  saveAppStorage(current);
}

export function exportAppDataAsJSON(): void {
  const state = loadAppStorage();
  const jsonStr = JSON.stringify(
    {
      app: 'Administrasi Guru AI',
      exportDate: new Date().toISOString(),
      data: state,
    },
    null,
    2
  );
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const dateTag = new Date().toISOString().slice(0, 10);
  saveAs(blob, `Backup_Administrasi_Guru_AI_${dateTag}.json`);
}

export function importAppDataFromJSON(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    const data = parsed.data || parsed;
    if (!data.profiles || !Array.isArray(data.profiles) || data.profiles.length === 0) {
      return false;
    }
    const state: AppStorageState = {
      version: data.version || 1,
      activeProfileId: data.activeProfileId || data.profiles[0].id,
      profiles: data.profiles,
      schools: data.schools || [{ ...INITIAL_SCHOOL }],
      academicSettings: data.academicSettings || [],
      cps: data.cps || [],
      tps: data.tps || [],
      atps: data.atps || [],
      documents: data.documents || [],
    };
    saveAppStorage(state);
    return true;
  } catch (err) {
    console.error('Failed to parse import JSON:', err);
    return false;
  }
}

export function resetToDefaultData(): void {
  const initial = getInitialState();
  saveAppStorage(initial);
}
