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
  AdministrationWorkspace,
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

const STORAGE_KEY = 'administrasi_guru_ai_storage_v2';
const LEGACY_STORAGE_KEY = 'administrasi_guru_ai_storage_v1';

export function generateWorkspaceName(setting: {
  subject: string;
  grade: string;
  semester?: string;
  academicYear?: string;
}): string {
  const mapel = setting.subject || 'Mata Pelajaran';
  const kelas = setting.grade || 'Kelas';
  const sem = setting.semester?.startsWith('1') ? 'Sem 1' : setting.semester?.startsWith('2') ? 'Sem 2' : 'Sem 1';
  const thn = setting.academicYear || '2026/2027';
  return `${mapel} — ${kelas} — ${sem} — ${thn}`;
}

export function getInitialState(): AppStorageState {
  const initialWorkspaces: AdministrationWorkspace[] = [
    {
      id: 'ws-prof-1-1',
      profileId: 'prof-1',
      schoolId: 'sch-default-1',
      academicSettingId: 'acad-prof-1',
      name: 'PJOK — Kelas 1 — Sem 1 — 2026/2027',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ws-prof-2-1',
      profileId: 'prof-2',
      schoolId: 'sch-default-1',
      academicSettingId: 'acad-prof-2',
      name: 'Bahasa Indonesia — Kelas 4 — Sem 1 — 2025/2026',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ws-prof-3-1',
      profileId: 'prof-3',
      schoolId: 'sch-default-1',
      academicSettingId: 'acad-prof-3',
      name: 'Matematika — Kelas 4 — Sem 1 — 2025/2026',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return {
    version: 2,
    activeProfileId: INITIAL_PROFILES[0].id,
    activeWorkspaceId: initialWorkspaces[0].id,
    profiles: [...INITIAL_PROFILES],
    schools: [{ ...INITIAL_SCHOOL }],
    workspaces: initialWorkspaces,
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
        academicSettingId: 'acad-prof-1',
        workspaceId: 'ws-prof-1-1',
      },
      {
        id: 'doc-prota-1',
        type: 'PROTA',
        title: 'Program Tahunan (PROTA)',
        status: 'future_sprint',
        academicSettingId: 'acad-prof-1',
        workspaceId: 'ws-prof-1-1',
      },
      {
        id: 'doc-promes-1',
        type: 'PROMES',
        title: 'Program Semester (PROMES)',
        status: 'future_sprint',
        academicSettingId: 'acad-prof-1',
        workspaceId: 'ws-prof-1-1',
      },
      {
        id: 'doc-modul-1',
        type: 'MODUL_AJAR',
        title: 'Modul Ajar / RPP Berdiferensiasi',
        status: 'future_sprint',
        academicSettingId: 'acad-prof-1',
        workspaceId: 'ws-prof-1-1',
      },
      {
        id: 'doc-asesmen-1',
        type: 'ASESMEN',
        title: 'Instrumen Asesmen & Rubrik',
        status: 'future_sprint',
        academicSettingId: 'acad-prof-1',
        workspaceId: 'ws-prof-1-1',
      },
      {
        id: 'doc-jurnal-1',
        type: 'JURNAL',
        title: 'Jurnal Harian Mengajar & Refleksi',
        status: 'future_sprint',
        academicSettingId: 'acad-prof-1',
        workspaceId: 'ws-prof-1-1',
      },
    ],
  };
}

export function loadAppStorage(): AppStorageState {
  if (typeof window === 'undefined') {
    return getInitialState();
  }

  try {
    let raw = localStorage.getItem(STORAGE_KEY);

    // Migration from v1 if v2 does not exist yet
    if (!raw) {
      const v1Raw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (v1Raw) {
        try {
          const v1Data = JSON.parse(v1Raw);
          const migratedState = migrateV1ToV2(v1Data);
          saveAppStorage(migratedState);
          return migratedState;
        } catch (e) {
          console.warn('Could not migrate v1 storage:', e);
        }
      }
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

    // Ensure version 2 structure integrity
    let needsResave = false;

    if (!parsed.workspaces || !Array.isArray(parsed.workspaces) || parsed.workspaces.length === 0) {
      parsed.workspaces = [];
      // Generate workspaces for each existing academicSetting
      parsed.academicSettings.forEach((setting) => {
        const ws: AdministrationWorkspace = {
          id: `ws-${setting.id}`,
          profileId: setting.profileId,
          schoolId: parsed.profiles.find((p) => p.id === setting.profileId)?.schoolId || parsed.schools[0]?.id || 'sch-default-1',
          academicSettingId: setting.id,
          name: generateWorkspaceName(setting),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        parsed.workspaces.push(ws);
      });
      needsResave = true;
    }

    // Auto-migrate: ensure all academicSettings have derived phases
    parsed.academicSettings = parsed.academicSettings.map((setting) => {
      const derived = getPhaseFromGrade(setting.level || 'SD', setting.grade || 'Kelas 1');
      if (setting.phase !== derived) {
        needsResave = true;
        return { ...setting, phase: derived };
      }
      return setting;
    });

    // Ensure activeWorkspaceId is valid
    if (!parsed.activeWorkspaceId || !parsed.workspaces.some((w) => w.id === parsed.activeWorkspaceId)) {
      const currentProfileWs = parsed.workspaces.find((w) => w.profileId === parsed.activeProfileId);
      parsed.activeWorkspaceId = currentProfileWs ? currentProfileWs.id : parsed.workspaces[0]?.id;
      needsResave = true;
    }

    if (needsResave) {
      saveAppStorage(parsed);
    }

    return parsed;
  } catch (err) {
    console.error('Failed to load localStorage data:', err);
    return getInitialState();
  }
}

function migrateV1ToV2(v1Data: any): AppStorageState {
  const initial = getInitialState();
  const profiles: TeacherProfile[] = Array.isArray(v1Data.profiles) && v1Data.profiles.length > 0 ? v1Data.profiles : initial.profiles;
  const schools: SchoolData[] = Array.isArray(v1Data.schools) && v1Data.schools.length > 0 ? v1Data.schools : initial.schools;
  const academicSettings: AcademicSetting[] = Array.isArray(v1Data.academicSettings) && v1Data.academicSettings.length > 0 ? v1Data.academicSettings : initial.academicSettings;
  const cps: CPData[] = Array.isArray(v1Data.cps) ? v1Data.cps : initial.cps;
  const tps: TPData[] = Array.isArray(v1Data.tps) ? v1Data.tps : initial.tps;
  const atps: ATPData[] = Array.isArray(v1Data.atps) ? v1Data.atps : initial.atps;
  const documents: AppDocumentRecord[] = Array.isArray(v1Data.documents) ? v1Data.documents : initial.documents;

  const workspaces: AdministrationWorkspace[] = [];
  academicSettings.forEach((setting, idx) => {
    const ws: AdministrationWorkspace = {
      id: `ws-${setting.id || idx}`,
      profileId: setting.profileId,
      schoolId: profiles.find((p) => p.id === setting.profileId)?.schoolId || schools[0]?.id || 'sch-default-1',
      academicSettingId: setting.id,
      name: generateWorkspaceName(setting),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    workspaces.push(ws);
  });

  const activeProfileId = v1Data.activeProfileId || profiles[0].id;
  const activeWs = workspaces.find((w) => w.profileId === activeProfileId) || workspaces[0];

  return {
    version: 2,
    activeProfileId,
    activeWorkspaceId: activeWs?.id,
    profiles,
    schools,
    workspaces,
    academicSettings,
    cps,
    tps,
    atps,
    documents,
  };
}

export function saveAppStorage(state: AppStorageState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

// Aliases
export const getAppData = loadAppStorage;
export const saveAppData = saveAppStorage;

export function setActiveProfileId(profileId: string): void {
  const current = loadAppStorage();
  current.activeProfileId = profileId;
  // Automatically switch active workspace to the first workspace of this profile
  const profileWs = current.workspaces.filter((w) => w.profileId === profileId);
  if (profileWs.length > 0) {
    current.activeWorkspaceId = profileWs[0].id;
  }
  saveAppStorage(current);
}

export function setActiveWorkspaceId(workspaceId: string): void {
  const current = loadAppStorage();
  const targetWs = current.workspaces.find((w) => w.id === workspaceId);
  if (targetWs) {
    current.activeWorkspaceId = workspaceId;
    current.activeProfileId = targetWs.profileId;
    saveAppStorage(current);
  }
}

/**
 * Retrieves the full isolated data tree for a given profile and active workspace.
 * Guarantee: Data from Workspace A (Kelas 1 PJOK) will NEVER bleed into Workspace B (Kelas 2 PJOK).
 */
export function getProfileWorkspace(profileId: string, workspaceId?: string): ProfileWorkspaceData {
  const state = loadAppStorage();
  const profile = state.profiles.find((p) => p.id === profileId) || state.profiles[0] || INITIAL_PROFILES[0];
  const school = state.schools.find((s) => s.id === profile.schoolId) || state.schools[0] || INITIAL_SCHOOL;

  // Find all workspaces for this teacher profile
  let profileWorkspaces = state.workspaces.filter((w) => w.profileId === profile.id);

  // If no workspaces exist for this profile, bootstrap one automatically
  if (profileWorkspaces.length === 0) {
    const newSettingId = `acad-${profile.id}-${Date.now()}`;
    const derivedPhase = getPhaseFromGrade(profile.defaultLevel || 'SD', 'Kelas 1');
    const newSetting: AcademicSetting = {
      id: newSettingId,
      profileId: profile.id,
      curriculum: 'Kurikulum Merdeka',
      academicYear: '2026/2027',
      semester: '1 (Ganjil)',
      level: profile.defaultLevel || 'SD',
      grade: 'Kelas 1',
      phase: derivedPhase,
      subject: profile.defaultSubject || 'Bahasa Indonesia',
      totalHoursPerWeek: 4,
      updatedAt: new Date().toISOString(),
    };

    const newWs: AdministrationWorkspace = {
      id: `ws-${newSettingId}`,
      profileId: profile.id,
      schoolId: school.id,
      academicSettingId: newSettingId,
      name: generateWorkspaceName(newSetting),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    state.academicSettings.push(newSetting);
    state.workspaces.push(newWs);
    state.activeWorkspaceId = newWs.id;
    profileWorkspaces = [newWs];
    saveAppStorage(state);
  }

  // Determine which workspace is active
  let targetWs = profileWorkspaces.find((w) => w.id === workspaceId);
  if (!targetWs) {
    targetWs = profileWorkspaces.find((w) => w.id === state.activeWorkspaceId) || profileWorkspaces[0];
  }

  // Retrieve Academic Setting for this workspace
  let academicSetting = state.academicSettings.find((a) => a.id === targetWs!.academicSettingId);
  if (!academicSetting) {
    const derivedPhase = getPhaseFromGrade(profile.defaultLevel || 'SD', 'Kelas 1');
    academicSetting = {
      id: targetWs.academicSettingId,
      profileId: profile.id,
      curriculum: 'Kurikulum Merdeka',
      academicYear: '2026/2027',
      semester: '1 (Ganjil)',
      level: profile.defaultLevel || 'SD',
      grade: 'Kelas 1',
      phase: derivedPhase,
      subject: profile.defaultSubject || 'Bahasa Indonesia',
      totalHoursPerWeek: 4,
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

  // Build the unified single source of truth activeContext
  const context = buildActiveContext(profile, school, academicSetting);

  // Retrieve CP strictly for this workspace's academic setting
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

  // Retrieve TP strictly for this workspace's academic setting
  let tp = state.tps.find((t) => t.academicSettingId === academicSetting!.id);
  if (!tp) {
    tp = {
      id: `tp-${academicSetting.id}`,
      academicSettingId: academicSetting.id,
      items: [],
      updatedAt: new Date().toISOString(),
    };
  }

  // Retrieve ATP strictly for this workspace's academic setting
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

  // Retrieve workspace documents
  const workspaceDocs = (state.documents || []).filter(
    (d) => d.academicSettingId === academicSetting!.id || d.workspaceId === targetWs!.id
  );

  return {
    profile,
    school,
    workspace: targetWs,
    academicSetting,
    context,
    cp,
    tp,
    atp,
    documents: workspaceDocs.length > 0 ? workspaceDocs : (state.documents || []),
    allWorkspaces: profileWorkspaces,
    allWorkspacesForProfile: profileWorkspaces,
    activeProfile: profile,
    activeSchool: school,
    activeWorkspace: targetWs,
    activeAcademicSetting: academicSetting,
    activeContext: context,
    activeCP: cp,
    activeTP: tp,
    activeATP: atp,
  };
}

/**
 * Creates a brand new Administration Workspace for a teacher profile.
 */
export function createWorkspace(params: {
  profileId: string;
  schoolId?: string;
  name?: string;
  setting: {
    curriculum?: string;
    academicYear?: string;
    semester?: '1 (Ganjil)' | '2 (Genap)';
    level?: 'SD' | 'SMP' | 'SMA' | 'SMK';
    grade: string;
    subject: string;
    totalHoursPerWeek?: number;
  };
}): AdministrationWorkspace {
  const state = loadAppStorage();
  const profile = state.profiles.find((p) => p.id === params.profileId) || state.profiles[0];
  const schoolId = params.schoolId || profile.schoolId || state.schools[0]?.id || 'sch-default-1';

  const newSettingId = `acad-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const level = params.setting.level || profile.defaultLevel || 'SD';
  const derivedPhase = getPhaseFromGrade(level, params.setting.grade);

  const newSetting: AcademicSetting = {
    id: newSettingId,
    profileId: profile.id,
    curriculum: params.setting.curriculum || 'Kurikulum Merdeka',
    academicYear: params.setting.academicYear || '2026/2027',
    semester: params.setting.semester || '1 (Ganjil)',
    level,
    grade: params.setting.grade || 'Kelas 1',
    phase: derivedPhase,
    subject: params.setting.subject || 'Mata Pelajaran',
    totalHoursPerWeek: params.setting.totalHoursPerWeek || 4,
    updatedAt: new Date().toISOString(),
  };

  const wsName = params.name && params.name.trim().length > 0
    ? params.name.trim()
    : generateWorkspaceName(newSetting);

  const newWorkspace: AdministrationWorkspace = {
    id: `ws-${Date.now()}`,
    profileId: profile.id,
    schoolId,
    academicSettingId: newSettingId,
    name: wsName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Create empty CP, TP, ATP instances for this workspace
  const newCP: CPData = {
    id: `cp-${newSettingId}`,
    academicSettingId: newSettingId,
    generalDescription: '',
    elements: [],
    updatedAt: new Date().toISOString(),
  };

  const newTP: TPData = {
    id: `tp-${newSettingId}`,
    academicSettingId: newSettingId,
    items: [],
    updatedAt: new Date().toISOString(),
  };

  const newATP: ATPData = {
    id: `atp-${newSettingId}`,
    academicSettingId: newSettingId,
    rationale: '',
    items: [],
    totalJP: 0,
    updatedAt: new Date().toISOString(),
  };

  state.academicSettings.push(newSetting);
  state.workspaces.push(newWorkspace);
  state.cps.push(newCP);
  state.tps.push(newTP);
  state.atps.push(newATP);

  state.activeProfileId = profile.id;
  state.activeWorkspaceId = newWorkspace.id;

  saveAppStorage(state);
  return newWorkspace;
}

/**
 * Duplicates an existing workspace (e.g. PJOK Kelas 1 -> PJOK Kelas 2)
 */
export function duplicateWorkspace(sourceWorkspaceId: string, newGrade?: string, newSubject?: string): AdministrationWorkspace | null {
  const state = loadAppStorage();
  const sourceWs = state.workspaces.find((w) => w.id === sourceWorkspaceId);
  if (!sourceWs) return null;

  const sourceSetting = state.academicSettings.find((a) => a.id === sourceWs.academicSettingId);
  if (!sourceSetting) return null;

  const targetGrade = newGrade || sourceSetting.grade;
  const targetSubject = newSubject || sourceSetting.subject;
  const derivedPhase = getPhaseFromGrade(sourceSetting.level, targetGrade);

  const newSettingId = `acad-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const clonedSetting: AcademicSetting = {
    ...sourceSetting,
    id: newSettingId,
    grade: targetGrade,
    phase: derivedPhase,
    subject: targetSubject,
    updatedAt: new Date().toISOString(),
  };

  const clonedName = generateWorkspaceName(clonedSetting);

  const clonedWs: AdministrationWorkspace = {
    id: `ws-${Date.now()}`,
    profileId: sourceWs.profileId,
    schoolId: sourceWs.schoolId,
    academicSettingId: newSettingId,
    name: clonedName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Find source CP/TP/ATP and duplicate as draft if available
  const sourceCP = state.cps.find((c) => c.academicSettingId === sourceSetting.id);
  const clonedCP: CPData = sourceCP
    ? {
        ...sourceCP,
        id: `cp-${newSettingId}`,
        academicSettingId: newSettingId,
        updatedAt: new Date().toISOString(),
      }
    : {
        id: `cp-${newSettingId}`,
        academicSettingId: newSettingId,
        generalDescription: '',
        elements: [],
        updatedAt: new Date().toISOString(),
      };

  const sourceTP = state.tps.find((t) => t.academicSettingId === sourceSetting.id);
  const clonedTP: TPData = sourceTP
    ? {
        ...sourceTP,
        id: `tp-${newSettingId}`,
        academicSettingId: newSettingId,
        items: sourceTP.items.map((it, idx) => ({ ...it, id: `tp-${Date.now()}-${idx}` })),
        updatedAt: new Date().toISOString(),
      }
    : {
        id: `tp-${newSettingId}`,
        academicSettingId: newSettingId,
        items: [],
        updatedAt: new Date().toISOString(),
      };

  const sourceATP = state.atps.find((a) => a.academicSettingId === sourceSetting.id);
  const clonedATP: ATPData = sourceATP
    ? {
        ...sourceATP,
        id: `atp-${newSettingId}`,
        academicSettingId: newSettingId,
        items: sourceATP.items.map((it, idx) => ({ ...it, id: `atp-item-${Date.now()}-${idx}` })),
        updatedAt: new Date().toISOString(),
      }
    : {
        id: `atp-${newSettingId}`,
        academicSettingId: newSettingId,
        rationale: '',
        items: [],
        totalJP: 0,
        updatedAt: new Date().toISOString(),
      };

  state.academicSettings.push(clonedSetting);
  state.workspaces.push(clonedWs);
  state.cps.push(clonedCP);
  state.tps.push(clonedTP);
  state.atps.push(clonedATP);

  state.activeWorkspaceId = clonedWs.id;
  saveAppStorage(state);
  return clonedWs;
}

export function renameWorkspace(workspaceId: string, newName: string): void {
  const current = loadAppStorage();
  const ws = current.workspaces.find((w) => w.id === workspaceId);
  if (ws && newName.trim()) {
    ws.name = newName.trim();
    ws.updatedAt = new Date().toISOString();
    saveAppStorage(current);
  }
}

export function deleteWorkspace(workspaceId: string): boolean {
  const current = loadAppStorage();
  const targetWs = current.workspaces.find((w) => w.id === workspaceId);
  if (!targetWs) return false;

  // Do not delete if it's the only workspace for this profile
  const profileWs = current.workspaces.filter((w) => w.profileId === targetWs.profileId);
  if (profileWs.length <= 1) {
    return false;
  }

  current.workspaces = current.workspaces.filter((w) => w.id !== workspaceId);
  current.academicSettings = current.academicSettings.filter((a) => a.id !== targetWs.academicSettingId);
  current.cps = current.cps.filter((c) => c.academicSettingId !== targetWs.academicSettingId);
  current.tps = current.tps.filter((t) => t.academicSettingId !== targetWs.academicSettingId);
  current.atps = current.atps.filter((a) => a.academicSettingId !== targetWs.academicSettingId);

  if (current.activeWorkspaceId === workspaceId) {
    const remaining = current.workspaces.filter((w) => w.profileId === targetWs.profileId);
    current.activeWorkspaceId = remaining[0]?.id || current.workspaces[0]?.id;
  }

  saveAppStorage(current);
  return true;
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
  if (current.profiles.length <= 1) return;
  current.profiles = current.profiles.filter((p) => p.id !== profileId);
  current.workspaces = current.workspaces.filter((w) => w.profileId !== profileId);

  if (current.activeProfileId === profileId) {
    current.activeProfileId = current.profiles[0].id;
    const firstWs = current.workspaces.find((w) => w.profileId === current.activeProfileId);
    current.activeWorkspaceId = firstWs?.id;
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

export function saveAcademicSetting(setting: AcademicSetting, customWorkspaceName?: string): void {
  const current = loadAppStorage();
  const derived = getPhaseFromGrade(setting.level || 'SD', setting.grade || 'Kelas 1');
  const normalized = { ...setting, phase: derived, updatedAt: new Date().toISOString() };

  const idx = current.academicSettings.findIndex((a) => a.id === setting.id);
  if (idx >= 0) {
    current.academicSettings[idx] = normalized;
  } else {
    current.academicSettings.push(normalized);
  }

  // Sync workspace name
  const ws = current.workspaces.find((w) => w.academicSettingId === setting.id);
  if (ws) {
    ws.name = customWorkspaceName && customWorkspaceName.trim().length > 0
      ? customWorkspaceName.trim()
      : generateWorkspaceName(normalized);
    ws.updatedAt = new Date().toISOString();
  }

  saveAppStorage(current);
}

export function saveCP(cp: CPData): void {
  const current = loadAppStorage();
  const updatedCP = {
    ...cp,
    updatedAt: new Date().toISOString(),
  };
  const idx = current.cps.findIndex((c) => c.academicSettingId === cp.academicSettingId);
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
  const idx = current.tps.findIndex((t) => t.academicSettingId === tp.academicSettingId);
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

  const idx = current.atps.findIndex((a) => a.academicSettingId === atp.academicSettingId);
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
      version: 2,
      activeProfileId: data.activeProfileId || data.profiles[0].id,
      activeWorkspaceId: data.activeWorkspaceId,
      profiles: data.profiles,
      schools: data.schools || [{ ...INITIAL_SCHOOL }],
      workspaces: data.workspaces || [],
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
