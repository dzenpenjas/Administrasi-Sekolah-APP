import { DocumentType, DocumentGenerationContext, DocumentValidationResult, GeneratedDocumentResult, DocumentCatalogItem } from './types';
import { generateATP } from './generators/atpGenerator';
import { generatePROTA } from './generators/protaGenerator';
import { generatePROMES } from './generators/promesGenerator';
import { generateModulAjar } from './generators/modulAjarGenerator';
import { generateAssessment } from './generators/assessmentGenerator';
import { generateJurnal } from './generators/jurnalGenerator';

export * from './types';
export * from './docxStyles';
export { generateATP, generatePROTA, generatePROMES, generateModulAjar, generateAssessment, generateJurnal };

export const DOCUMENT_CATALOG: DocumentCatalogItem[] = [
  {
    id: 'ATP',
    type: 'ATP',
    category: 'Perencanaan Utama',
    title: 'Alur Tujuan Pembelajaran (ATP)',
    description: 'Dokumen turunan CP & TP yang memuat alur langkah pembelajaran bertahap, alokasi JP, Profil Pelajar Pancasila, rencana asesmen, dan glosarium.',
    requiredSources: ['Data Profil & Sekolah', 'Data Akademik (Fase/Kelas/Mapel)', 'Tujuan Pembelajaran (TP)', 'Matriks ATP'],
  },
  {
    id: 'PROTA',
    type: 'PROTA',
    category: 'Perencanaan Utama',
    title: 'Program Tahunan (PROTA)',
    description: 'Pemetaan distribusi alokasi waktu dan lingkup materi pembelajaran per tujuan pembelajaran selama 1 tahun ajaran (Semester Ganjil & Genap).',
    requiredSources: ['Data Profil & Sekolah', 'Data Akademik', 'Alur Tujuan Pembelajaran (ATP)'],
  },
  {
    id: 'PROMES',
    type: 'PROMES',
    category: 'Perencanaan Utama',
    title: 'Program Semester (PROMES)',
    description: 'Penjabaran distribusi jam pembelajaran efektif mingguan per bulan dalam satu semester aktif sesuai alur materi.',
    requiredSources: ['Data Profil & Sekolah', 'Data Akademik', 'Alur Tujuan Pembelajaran (ATP)'],
  },
  {
    id: 'MODUL_AJAR',
    type: 'MODUL_AJAR',
    category: 'Perangkat Pembelajaran',
    title: 'Modul Ajar / RPP Berdiferensiasi',
    description: 'Perangkat ajar lengkap memuat Informasi Umum, Pemahaman Bermakna, Pertanyaan Pemantik, Kegiatan Berdiferensiasi, LKPD, dan Glosarium.',
    requiredSources: ['Data Profil & Sekolah', 'Data Akademik', 'Tujuan Pembelajaran (TP)', 'Alur Tujuan Pembelajaran (ATP)'],
  },
  {
    id: 'ASESMEN',
    type: 'ASESMEN',
    category: 'Asesmen',
    title: 'Instrumen Asesmen & Rubrik KKTP',
    description: 'Panduan asesmen formatif, kisi-kisi penilaian sumatif, lembar observasi sikap profil pelajar pancasila, dan rubrik interval KKTP.',
    requiredSources: ['Data Profil & Sekolah', 'Data Akademik', 'Tujuan Pembelajaran (TP)', 'Alur Tujuan Pembelajaran (ATP)'],
  },
  {
    id: 'JURNAL',
    type: 'JURNAL',
    category: 'Pelaksanaan',
    title: 'Jurnal Harian Pelaksanaan Pembelajaran',
    description: 'Format jurnal operasional mengajar harian, pencatatan aktivitas tatap muka, kehadiran siswa, refleksi pembelajaran, dan tindak lanjut.',
    requiredSources: ['Data Profil & Sekolah', 'Data Akademik', 'Alur Tujuan Pembelajaran (ATP)'],
  },
];

/**
 * Validates whether all prerequisites for generating the document are met.
 */
export function validateDocumentRequirements(
  type: DocumentType,
  context: Partial<DocumentGenerationContext>
): DocumentValidationResult {
  const missingFields: string[] = [];

  // Check School Profile
  if (!context.school?.name?.trim()) {
    missingFields.push('Nama Satuan Pendidikan belum diisi');
  }

  // Check Teacher Profile
  if (!context.profile?.name?.trim()) {
    missingFields.push('Nama Guru Penyusun belum diisi');
  }

  // Check Academic Setting
  if (!context.academicSetting?.subject?.trim()) {
    missingFields.push('Mata Pelajaran belum dipilih');
  }
  if (!context.academicSetting?.grade?.trim()) {
    missingFields.push('Kelas / Fase belum ditentukan');
  }

  // Check ATP Items
  const atpCount = context.atp?.items?.length || 0;
  if (atpCount === 0) {
    missingFields.push('Data Alur Tujuan Pembelajaran (ATP) masih kosong');
  }

  // Specific validations
  if (type === 'MODUL_AJAR' || type === 'ASESMEN') {
    const tpCount = context.tp?.items?.length || 0;
    if (tpCount === 0 && atpCount === 0) {
      missingFields.push('Tujuan Pembelajaran (TP) belum disusun');
    }
  }

  if (missingFields.length > 0) {
    let targetStep: DocumentValidationResult['targetStep'] = 'profile';
    if (!context.school?.name || !context.profile?.name) targetStep = 'profile';
    else if (!context.academicSetting?.subject) targetStep = 'academic';
    else if (!context.tp?.items?.length && (type === 'MODUL_AJAR' || type === 'ASESMEN')) targetStep = 'tp';
    else if (atpCount === 0) targetStep = 'atp';

    return {
      isValid: false,
      missingFields,
      message: `Dokumen belum dapat dibuat karena:\n• ${missingFields.join('\n• ')}`,
      targetStep,
    };
  }

  return {
    isValid: true,
    missingFields: [],
  };
}

/**
 * Unified Document Generator dispatcher.
 */
export async function generateDocument(
  type: DocumentType,
  context: DocumentGenerationContext
): Promise<GeneratedDocumentResult> {
  const validation = validateDocumentRequirements(type, context);
  if (!validation.isValid) {
    throw new Error(validation.message || 'Prasyarat dokumen belum terpenuhi.');
  }

  switch (type) {
    case 'ATP':
      return await generateATP(context);
    case 'PROTA':
      return await generatePROTA(context);
    case 'PROMES':
      return await generatePROMES(context);
    case 'MODUL_AJAR':
      return await generateModulAjar(context);
    case 'ASESMEN':
      return await generateAssessment(context);
    case 'JURNAL':
      return await generateJurnal(context);
    default:
      throw new Error(`Tipe dokumen ${type} belum didukung.`);
  }
}
