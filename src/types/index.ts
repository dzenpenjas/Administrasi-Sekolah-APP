export interface TeacherProfile {
  id: string;
  name: string;
  nip: string;
  nuptk?: string;
  status: 'PNS' | 'PPPK' | 'Guru Tetap Yayasan (GTY)' | 'Guru Tidak Tetap (GTT) / Honorer' | 'Lainnya';
  defaultSubject: string;
  defaultLevel: 'SD' | 'SMP' | 'SMA' | 'SMK';
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolData {
  id: string;
  name: string;
  npsn: string;
  address: string;
  village: string; // Desa/Kelurahan
  district: string; // Kecamatan
  regency: string; // Kabupaten/Kota
  province: string;
  principalName: string;
  principalNip: string;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicSetting {
  id: string;
  profileId: string;
  curriculum: string; // e.g. "Kurikulum Merdeka"
  academicYear: string; // e.g. "2025/2026"
  semester: '1 (Ganjil)' | '2 (Genap)';
  level: 'SD' | 'SMP' | 'SMA' | 'SMK';
  grade: string; // e.g. "Kelas 4"
  phase: string; // e.g. "Fase B"
  subject: string; // e.g. "Bahasa Indonesia"
  totalHoursPerWeek?: number; // e.g. 4 JP / minggu
  updatedAt: string;
}

export interface CPElem {
  id: string;
  name: string; // e.g. "Menyimak", "Membaca dan Memirsa", "Berbicara dan Mempresentasikan", "Menulis"
  content: string;
}

export interface CPData {
  id: string;
  academicSettingId: string;
  generalDescription: string;
  elements: CPElem[];
  aiNotes?: string;
  updatedAt: string;
}

export interface TPItem {
  id: string;
  code: string; // e.g. "TP 1.1", "TP 4.1"
  elementName?: string;
  statement: string; // Pernyataan Tujuan Pembelajaran
  competence: string; // Kompetensi / KKO yang dituju (misal: "Menganalisis", "Menjelaskan")
  contentScope: string; // Lingkup Materi / Konsep Inti
  p3Dimensions: string[]; // Dimensi Profil Pelajar Pancasila
  order: number;
}

export interface TPData {
  id: string;
  academicSettingId: string;
  items: TPItem[];
  updatedAt: string;
}

export interface ATPItem {
  id: string;
  stepNumber: number; // Urutan Alur Pembelajaran (1, 2, 3...)
  tpId?: string;
  tpCode: string;
  tpStatement: string;
  materialScope: string; // Lingkup Materi
  jp: number; // Alokasi Jam Pelajaran (misal 6 JP)
  p3Dimensions: string[]; // Profil Pelajar Pancasila
  assessmentPlan: string; // Asesmen Awal, Formatif, Sumatif
  glossary: string; // Kata Kunci / Glosarium
  resources?: string; // Sumber Belajar / Media
}

export interface ATPData {
  id: string;
  academicSettingId: string;
  rationale?: string; // Rasionalisasi Alur Pembelajaran
  items: ATPItem[];
  totalJP: number;
  updatedAt: string;
}

export interface AppDocumentRecord {
  id: string;
  type: 'ATP' | 'PROTA' | 'PROMES' | 'MODUL_AJAR' | 'ASESMEN' | 'JURNAL';
  title: string;
  status: 'completed' | 'draft' | 'future_sprint';
  lastGenerated?: string;
  fileName?: string;
}

export interface ProfileWorkspaceData {
  profile: TeacherProfile;
  school: SchoolData;
  academicSetting: AcademicSetting;
  cp: CPData;
  tp: TPData;
  atp: ATPData;
  documents: AppDocumentRecord[];
}

export interface AppStorageState {
  version: number;
  activeProfileId: string;
  profiles: TeacherProfile[];
  schools: SchoolData[];
  academicSettings: AcademicSetting[];
  cps: CPData[];
  tps: TPData[];
  atps: ATPData[];
  documents: AppDocumentRecord[];
}

export type AppDataStore = AppStorageState;
export type WorkflowStepId = 'profile' | 'academic' | 'cp' | 'tp' | 'atp' | 'admin';

export interface WorkflowStepInfo {
  id: WorkflowStepId;
  number: string;
  title: string;
  shortLabel: string;
  description: string;
}
