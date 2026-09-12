import {
  AppStorageState,
  TeacherProfile,
  SchoolData,
  AcademicSetting,
  ActiveContext,
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
  buildActiveContext,
  getPhaseFromGrade,
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
        title: 'Alur Tujuan Pembelajaran (ATP) - PJOK Kelas 1 Fase A',
        status: 'completed',
        lastGenerated: new Date().toISOString(),
        fileName: 'ATP_PJOK_Kelas_1_Fase_A.docx',
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

    // Auto-migrate: ensure all academicSettings have derived phases
    let needsResave = false;
    parsed.academicSettings = parsed.academicSettings.map((setting) => {
      const derived = getPhaseFromGrade(setting.level || 'SD', setting.grade || 'Kelas 1');
      if (setting.phase !== derived) {
        needsResave = true;
        return { ...setting, phase: derived };
      }
      return setting;
    });

    if (needsResave) {
      saveAppStorage(parsed);
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

export function getProfileWorkspace(profileId: string): ProfileWorkspaceData {
  const state = loadAppStorage();
  const profile = state.profiles.find((p) => p.id === profileId) || state.profiles[0] || INITIAL_PROFILES[0];
  const school = state.schools.find((s) => s.id === profile.schoolId) || state.schools[0] || INITIAL_SCHOOL;
  
  let academicSetting = state.academicSettings.find((a) => a.profileId === profile.id);
  if (!academicSetting) {
    academicSetting = {
      id: `acad-${profile.id}`,
      profileId: profile.id,
      curriculum: 'Kurikulum Merdeka',
      academicYear: '2025/2026',
      semester: '1 (Ganjil)',
      level: profile.defaultLevel || 'SD',
      grade: 'Kelas 4',
      phase: getPhaseFromGrade(profile.defaultLevel || 'SD', 'Kelas 4'),
      subject: profile.defaultSubject || 'Bahasa Indonesia',
      totalHoursPerWeek: 5,
      updatedAt: new Date().toISOString(),
    };
    state.academicSettings.push(academicSetting);
    saveAppStorage(state);
  }

  // Ensure derived phase is always up to date
  const derivedPhase = getPhaseFromGrade(academicSetting.level, academicSetting.grade);
  if (academicSetting.phase !== derivedPhase) {
    academicSetting.phase = derivedPhase;
  }

  const context = buildActiveContext(profile, school, academicSetting);

  let cp = state.cps.find((c) => c.academicSettingId === academicSetting!.id);
  if (!cp) {
    cp = {
      id: `cp-${academicSetting.id}`,
      academicSettingId: academicSetting.id,
      generalDescription: '',
      elements: [],
      updatedAt: new Date().toISOString(),
    };
  }

  let tp = state.tps.find((t) => t.academicSettingId === academicSetting!.id);
  if (!tp) {
    tp = {
      id: `tp-${academicSetting.id}`,
      academicSettingId: academicSetting.id,
      items: [],
      updatedAt: new Date().toISOString(),
    };
  }

  let atp = state.atps.find((a) => a.academicSettingId === academicSetting!.id);
  if (!atp) {
    atp = {
      id: `atp-${academicSetting.id}`,
      academicSettingId: academicSetting.id,
      rationale: '',
      items: [],
      totalJP: 0,
      updatedAt: new Date().toISOString(),
    };
  }

  return {
    profile,
    school,
    academicSetting,
    context,
    cp,
    tp,
    atp,
    documents: state.documents || [],
  };
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
  // Ensure phase is always derived
  const derived = getPhaseFromGrade(setting.level || 'SD', setting.grade || 'Kelas 1');
  const normalized = { ...setting, phase: derived, updatedAt: new Date().toISOString() };

  const idx = current.academicSettings.findIndex((a) => a.id === setting.id);
  if (idx >= 0) {
    current.academicSettings[idx] = normalized;
  } else {
    current.academicSettings.push(normalized);
  }
  saveAppStorage(current);
}

export function saveCP(cp: CPData): void {
  const current = loadAppStorage();
  const updatedCP = {
    ...cp,
    updatedAt: new Date().toISOString(),
  };
  const idx = current.cps.findIndex((c) => c.id === cp.id || c.academicSettingId === cp.academicSettingId);
  if (idx >= 0) {
    current.cps[idx] = updatedCP;
  } else {
    current.cps.push(updatedCP);
  }
  saveAppStorage(current);
}

export function saveTP(tp: TPData): void {
  const current = loadAppStorage();
  const updatedTP = {
    ...tp,
    updatedAt: new Date().toISOString(),
  };
  const idx = current.tps.findIndex((t) => t.id === tp.id || t.academicSettingId === tp.academicSettingId);
  if (idx >= 0) {
    current.tps[idx] = updatedTP;
  } else {
    current.tps.push(updatedTP);
  }
  saveAppStorage(current);
}

export function saveATP(atp: ATPData): void {
  const current = loadAppStorage();
  const totalJP = atp.items.reduce((acc, curr) => acc + (Number(curr.jp) || 0), 0);
  const updatedATP: ATPData = {
    ...atp,
    totalJP,
    updatedAt: new Date().toISOString(),
  };

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
