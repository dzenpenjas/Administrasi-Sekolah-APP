import { DocumentType, DocumentGenerationContext, DocumentValidationResult, GeneratedDocumentResult, DocumentCatalogItem } from './types';
import { generateAnalisisCpTp } from './generators/analisisCpTpGenerator';
import { generateATP } from './generators/atpGenerator';
import { generatePROTA } from './generators/protaGenerator';
import { generatePROMES } from './generators/promesGenerator';
import { generateModulAjar } from './generators/modulAjarGenerator';
import { generateAssessment } from './generators/assessmentGenerator';
import { generateJurnal } from './generators/jurnalGenerator';

export * from './types';
export * from './docxStyles';
export {
  generateAnalisisCpTp,
  generateATP,
  generatePROTA,
  generatePROMES,
  generateModulAjar,
  generateAssessment,
  generateJurnal,
};

export const DOCUMENT_CATALOG: DocumentCatalogItem[] = [
  {
    id: 'ANALISIS_CP_TP',
    type: 'ANALISIS_CP_TP',
    category: 'Perencanaan Utama',
    title: 'Analisis Capaian Pembelajaran → Tujuan Pembelajaran',
    description: 'Dokumen telaah penurunan Capaian Pembelajaran (CP) menjadi rumusan Tujuan Pembelajaran (TP) berdasarkan analisis kompetensi dan lingkup materi esensial.',
    requiredSources: ['Data Profil & Sekolah', 'Data Akademik (Fase/Kelas/Mapel)', 'Capaian Pembelajaran (CP)'],
  },
  {
    id: 'ATP',
    type: 'ATP',
    category: 'Perencanaan Utama',
    title: 'Alur Tujuan Pembelajaran (ATP)',
    description: 'Dokumen turunan CP & TP yang memuat alur langkah pembelajaran bertahap, alokasi JP, Profil Pelajar Pancasila, rencana asesmen, dan glosarium.',
    requiredSources: ['Data Profil & Sekolah', 'Data Akademik', 'Tujuan Pembelajaran (TP)', 'Matriks ATP'],
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
    requiredSources: ['Data Profil & Sekolah', 'Data Akademik', 'Tujuan Pembelajaran (TP) / ATP'],
  },
];

/**
 * Validates whether all prerequisites for generating the document are met.
 * Per-document validation logic so each document only requires its true prerequisites.
 */
export function validateDocumentRequirements(
  type: DocumentType,
  context: Partial<DocumentGenerationContext>
): DocumentValidationResult {
  const missingFields: string[] = [];

  // Common: School & Teacher Profile
  if (!context.school?.name?.trim()) {
    missingFields.push('Nama Satuan Pendidikan belum diisi');
  }
  if (!context.profile?.name?.trim()) {
    missingFields.push('Nama Guru Penyusun belum diisi');
  }

  // Common: Academic Setting
  if (!context.academicSetting?.subject?.trim()) {
    missingFields.push('Mata Pelajaran belum dipilih');
  }
  if (!context.academicSetting?.grade?.trim()) {
    missingFields.push('Kelas / Fase belum ditentukan');
  }

  const cpHasContent = !!(
    context.cp?.generalDescription?.trim() ||
    (context.cp?.elements && context.cp.elements.length > 0)
  );
  const tpCount = context.tp?.items?.length || 0;
  const atpCount = context.atp?.items?.length || 0;

  // Granular document-specific validation
  switch (type) {
    case 'ANALISIS_CP_TP':
      if (!cpHasContent) {
        missingFields.push('Capaian Pembelajaran (CP) belum tersedia');
      }
      break;

    case 'ATP':
      if (tpCount === 0) {
        missingFields.push('Tujuan Pembelajaran (TP) belum disusun');
      }
      if (atpCount === 0) {
        missingFields.push('Matriks Alur Tujuan Pembelajaran (ATP) masih kosong');
      }
      break;

    case 'PROTA':
    case 'PROMES':
      if (atpCount === 0) {
        missingFields.push('Alur Tujuan Pembelajaran (ATP) belum disusun');
      }
      break;

    case 'MODUL_AJAR':
    case 'ASESMEN':
      if (tpCount === 0) {
        missingFields.push('Tujuan Pembelajaran (TP) belum dirumuskan');
      }
      if (atpCount === 0) {
        missingFields.push('Alur Tujuan Pembelajaran (ATP) belum disusun');
      }
      break;

    case 'JURNAL':
      if (tpCount === 0 && atpCount === 0 && !cpHasContent) {
        missingFields.push('Data rancangan pembelajaran (CP/TP/ATP) belum tersedia');
      }
      break;
  }

  if (missingFields.length > 0) {
    let targetStep: DocumentValidationResult['targetStep'] = 'profile';
    if (!context.school?.name || !context.profile?.name) {
      targetStep = 'profile';
    } else if (!context.academicSetting?.subject || !context.academicSetting?.grade) {
      targetStep = 'academic';
    } else if (!cpHasContent) {
      targetStep = 'cp';
    } else if (tpCount === 0 && (type === 'ATP' || type === 'MODUL_AJAR' || type === 'ASESMEN')) {
      targetStep = 'tp';
    } else if (atpCount === 0 && (type === 'PROTA' || type === 'PROMES' || type === 'ATP' || type === 'MODUL_AJAR' || type === 'ASESMEN')) {
      targetStep = 'atp';
    }

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
    case 'ANALISIS_CP_TP':
      return await generateAnalisisCpTp(context);
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
