import {
  SchoolData,
  TeacherProfile,
  AcademicSetting,
  AdministrationWorkspace,
  CPData,
  TPData,
  ATPData,
  AppDocumentRecord,
} from '../../types';

export type DocumentType = 'ATP' | 'PROTA' | 'PROMES' | 'MODUL_AJAR' | 'ASESMEN' | 'JURNAL';

export interface DocumentGenerationContext {
  school: SchoolData;
  profile: TeacherProfile;
  academicSetting: AcademicSetting;
  workspace?: AdministrationWorkspace;
  cp?: CPData;
  tp?: TPData;
  atp: ATPData;
  effectiveWeeksCount?: number; // for PROMES (default 18 weeks/semester)
}

export interface DocumentValidationResult {
  isValid: boolean;
  missingFields: string[];
  message?: string;
  targetStep?: 'profile' | 'academic' | 'cp' | 'tp' | 'atp';
}

export interface GeneratedDocumentResult {
  success: boolean;
  type: DocumentType;
  title: string;
  fileName: string;
  record: AppDocumentRecord;
}

export interface DocumentCatalogItem {
  id: string;
  type: DocumentType;
  category: 'Perencanaan Utama' | 'Perangkat Pembelajaran' | 'Asesmen' | 'Pelaksanaan';
  title: string;
  description: string;
  requiredSources: string[];
}
