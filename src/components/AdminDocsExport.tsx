import React, { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  FolderTree,
  Sparkles,
  School,
  Check,
  Clock,
  BookOpen,
  Calendar,
  Lock,
} from 'lucide-react';
import {
  TeacherProfile,
  SchoolData,
  AcademicSetting,
  CPData,
  TPData,
  ATPData,
  AdministrationWorkspace,
  AppDocumentRecord,
} from '../types';
import { generateAndDownloadATPWord } from '../services/docxGenerator';

interface AdminDocsExportProps {
  profile: TeacherProfile;
  school: SchoolData;
  workspace?: AdministrationWorkspace;
  academicSetting: AcademicSetting;
  cp: CPData;
  tp: TPData;
  atp: ATPData;
  documents?: AppDocumentRecord[];
  onBackToStep: (stepId: 'profile' | 'academic' | 'cp' | 'tp' | 'atp') => void;
}

export const AdminDocsExport: React.FC<AdminDocsExportProps> = ({
  profile,
  school,
  workspace,
  academicSetting,
  cp,
  tp,
  atp,
  documents = [],
  onBackToStep,
}) => {
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Validation Checkers
  const isProfileValid = !!(profile.name && profile.name.trim().length > 0);
  const isSchoolValid = !!(school.name && school.principalName);
  const isAcademicValid = !!(academicSetting.subject && academicSetting.grade);
  const isCPValid = !!(
    (cp.generalDescription && cp.generalDescription.trim().length > 0) ||
    (cp.elements && cp.elements.length > 0)
  );
  const isTPValid = !!(tp.items && tp.items.length > 0);
  const isATPValid = !!(atp.items && atp.items.length > 0);

  const isReadyForExport = isProfileValid && isSchoolValid && isAcademicValid && isATPValid;

  const totalJP = atp.items.reduce((acc, curr) => acc + (Number(curr.jp) || 0), 0);

  const handleExportWord = async () => {
    setIsExportingWord(true);
    setExportError(null);
    setExportSuccess(false);

    try {
      await generateAndDownloadATPWord({
        school,
        profile,
        academicSetting,
        atp,
        cp,
      });
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghasilkan dokumen Word';
      setExportError(msg);
    } finally {
      setIsExportingWord(false);
    }
  };

  const today = new Date();
  const indonesianMonths = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  const dateFormatted = `${school.district || school.regency || 'Tempat'}, ${today.getDate()} ${
    indonesianMonths[today.getMonth()]
  } ${today.getFullYear()}`;

  // Document catalog records with honest statuses
  const docCatalog: {
    id: string;
    type: string;
    title: string;
    description: string;
    status: 'ready' | 'future';
    availableForDownload: boolean;
  }[] = [
    {
      id: 'doc-atp',
      type: 'ATP',
      title: 'Alur Tujuan Pembelajaran (ATP)',
      description: 'Matriks alur lengkap dengan alokasi JP, rujukan TP, asesmen, dan lembar pengesahan.',
      status: isATPValid ? 'ready' : 'ready',
      availableForDownload: true,
    },
    {
      id: 'doc-prota',
      type: 'PROTA',
      title: 'Program Tahunan (PROTA)',
      description: 'Pemetaan distribusi alokasi waktu per semester dalam satu tahun ajaran.',
      status: 'future',
      availableForDownload: false,
    },
    {
      id: 'doc-promes',
      type: 'PROMES',
      title: 'Program Semester (PROMES)',
      description: 'Rincian jadwal alokasi waktu pembelajaran per minggu efektif.',
      status: 'future',
      availableForDownload: false,
    },
    {
      id: 'doc-modul',
      type: 'MODUL_AJAR',
      title: 'Modul Ajar / RPP Berdiferensiasi',
      description: 'Perangkat ajar langkah pembelajaran harian terstruktur.',
      status: 'future',
      availableForDownload: false,
    },
    {
      id: 'doc-asesmen',
      type: 'ASESMEN',
      title: 'Instrumen Asesmen & Rubrik',
      description: 'Kisi-kisi soal, rubrik observasi performa, dan lembar penilaian.',
      status: 'future',
      availableForDownload: false,
    },
    {
      id: 'doc-jurnal',
      type: 'JURNAL',
      title: 'Jurnal Harian Mengajar',
      description: 'Catatan pelaksanaan pembelajaran dan refleksi guru di kelas.',
      status: 'future',
      availableForDownload: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center">
                06
              </span>
              <h3 className="text-lg font-bold text-slate-900">Pusat Dokumen Administrasi Pembelajaran</h3>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Dokumen resmi siap diekspor dalam format <strong>Microsoft Word (.docx)</strong> terintegrasi dengan kop sekolah, matriks alur pembelajaran, dan tanda tangan pengesahan.
            </p>
            {workspace && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                <FolderTree className="w-3.5 h-3.5 text-blue-600" />
                <span>Administrasi: <strong>{workspace.name}</strong></span>
              </div>
            )}
          </div>

          {/* Main Download Button */}
          <button
            id="btn-export-atp-word"
            onClick={handleExportWord}
            disabled={isExportingWord || !isReadyForExport}
            className="inline-flex items-center justify-center gap-2.5 bg-blue-900 hover:bg-blue-950 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md shadow-blue-900/15 transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
          >
            <Download className="w-4 h-4 text-blue-300" />
            <span>{isExportingWord ? 'Menyiapkan File Word...' : 'Download ATP (.docx)'}</span>
          </button>
        </div>

        {exportSuccess && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Dokumen Word (.docx) berhasil diunduh ke perangkat Anda!</span>
          </div>
        )}

        {exportError && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            ⚠️ {exportError}
          </div>
        )}
      </div>

      {/* Grid: Validation Checklist, Document Catalog & Paper Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Data Linkage Status & Document Catalog (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Data Linkage Status */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Status Integritas Alur Administrasi
            </h4>

            <div className="space-y-2.5 text-xs">
              <div
                onClick={() => onBackToStep('profile')}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition"
              >
                <span className="font-semibold text-slate-700">1. Profil & Sekolah</span>
                {isProfileValid && isSchoolValid ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Lengkap
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Perlu Cek
                  </span>
                )}
              </div>

              <div
                onClick={() => onBackToStep('academic')}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition"
              >
                <span className="font-semibold text-slate-700">2. Data Pembelajaran</span>
                {isAcademicValid ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Lengkap
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Perlu Cek
                  </span>
                )}
              </div>

              <div
                onClick={() => onBackToStep('cp')}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition"
              >
                <span className="font-semibold text-slate-700">3. Capaian Pembelajaran (CP)</span>
                {isCPValid ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {cp.elements?.length || 1} Elemen
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-rose-700 font-bold">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Kosong
                  </span>
                )}
              </div>

              <div
                onClick={() => onBackToStep('tp')}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition"
              >
                <span className="font-semibold text-slate-700">4. Tujuan Pembelajaran (TP)</span>
                {isTPValid ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {tp.items.length} Butir
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-rose-700 font-bold">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Kosong
                  </span>
                )}
              </div>

              <div
                onClick={() => onBackToStep('atp')}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition"
              >
                <span className="font-semibold text-slate-700">5. Alur Pembelajaran (ATP)</span>
                {isATPValid ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {atp.items.length} Langkah ({totalJP} JP)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-rose-700 font-bold">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Kosong
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Document Catalog Center */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Katalog Dokumen Administrasi
            </h4>
            <div className="space-y-2">
              {docCatalog.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">{doc.title}</span>
                    {doc.availableForDownload ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Tersedia (.docx)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-200 text-slate-600 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        Belum Tersedia
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">{doc.description}</p>
                  {doc.availableForDownload && (
                    <div className="pt-1 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={handleExportWord}
                        disabled={isExportingWord || !isReadyForExport}
                        className="text-xs font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh Dokumen Ini</span>
                      </button>
                    </div>
                  )}
                  {!doc.availableForDownload && (
                    <div className="text-[10px] text-slate-400 italic">
                      Generator dokumen ini direncanakan untuk tahap pengembangan berikutnya.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Printable Document Paper Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Pratinjau Format Cetak Dokumen ATP</span>
            </h4>
            <span className="text-xs text-slate-400">Standar Word A4</span>
          </div>

          {/* Document Sheet Container */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-300 shadow-md space-y-6 text-slate-900 font-sans text-xs">
            {/* Header / KOP */}
            <div className="text-center space-y-1 border-b-2 border-slate-900 pb-3">
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight uppercase text-blue-950">
                ALUR TUJUAN PEMBELAJARAN (ATP)
              </h2>
              <h3 className="text-xs sm:text-sm font-bold uppercase text-slate-700">
                {academicSetting.curriculum}
              </h3>
            </div>

            {/* Identity Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-800 border-b border-slate-200 pb-3">
              <div>
                <span className="font-semibold text-slate-600">Satuan Pendidikan:</span>{' '}
                <span className="font-bold">{school.name || '-'}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-600">Mata Pelajaran:</span>{' '}
                <span className="font-bold">{academicSetting.subject || '-'}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-600">Fase / Kelas:</span>{' '}
                <span className="font-bold">
                  {academicSetting.phase} / {academicSetting.grade}
                </span>
              </div>
              <div>
                <span className="font-semibold text-slate-600">Tahun Ajaran / Sem:</span>{' '}
                <span className="font-bold">
                  {academicSetting.academicYear} / {academicSetting.semester}
                </span>
              </div>
              <div>
                <span className="font-semibold text-slate-600">Guru Pengampu:</span>{' '}
                <span className="font-bold">{profile.name || '-'}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-600">NIP Guru:</span>{' '}
                <span>{profile.nip || '-'}</span>
              </div>
            </div>

            {/* Rasionalisasi */}
            {atp.rationale && (
              <div className="space-y-1 text-xs">
                <h5 className="font-bold text-slate-900 uppercase">A. Rasionalisasi Alur Pembelajaran</h5>
                <p className="text-slate-700 leading-relaxed text-justify bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {atp.rationale}
                </p>
              </div>
            )}

            {/* Matriks Tabel ATP */}
            <div className="space-y-2 text-xs">
              <h5 className="font-bold text-slate-900 uppercase">
                B. Matriks Alur Tujuan Pembelajaran
              </h5>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border border-slate-300 border-collapse">
                  <thead>
                    <tr className="bg-blue-900 text-white font-semibold">
                      <th className="p-1.5 border border-blue-800 text-center w-7">No</th>
                      <th className="p-1.5 border border-blue-800 w-14">Kode</th>
                      <th className="p-1.5 border border-blue-800 min-w-[160px]">Tujuan Pembelajaran (TP)</th>
                      <th className="p-1.5 border border-blue-800 min-w-[100px]">Lingkup Materi</th>
                      <th className="p-1.5 border border-blue-800 min-w-[90px]">Profil Pancasila</th>
                      <th className="p-1.5 border border-blue-800 min-w-[100px]">Asesmen</th>
                      <th className="p-1.5 border border-blue-800 text-center w-10">JP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {atp.items.map((item, idx) => (
                      <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="p-1.5 border border-slate-300 text-center font-bold">
                          {item.stepNumber || idx + 1}
                        </td>
                        <td className="p-1.5 border border-slate-300 font-mono font-bold text-blue-900">
                          {item.tpCode}
                        </td>
                        <td className="p-1.5 border border-slate-300 leading-relaxed">
                          {item.tpStatement}
                        </td>
                        <td className="p-1.5 border border-slate-300">{item.materialScope}</td>
                        <td className="p-1.5 border border-slate-300">
                          {item.p3Dimensions?.join(', ') || '-'}
                        </td>
                        <td className="p-1.5 border border-slate-300">{item.assessmentPlan}</td>
                        <td className="p-1.5 border border-slate-300 text-center font-bold">
                          {item.jp} JP
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-200 font-bold">
                      <td colSpan={6} className="p-1.5 border border-slate-300 text-right">
                        Total Alokasi Waktu:
                      </td>
                      <td className="p-1.5 border border-slate-300 text-center text-blue-950 font-extrabold">
                        {totalJP} JP
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Glosarium if any */}
            {atp.items.some((i) => i.glossary) && (
              <div className="space-y-1 text-xs">
                <h5 className="font-bold text-slate-900 uppercase">C. Glosarium / Kata Kunci</h5>
                <ul className="list-disc list-inside space-y-1 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {atp.items
                    .filter((i) => i.glossary)
                    .map((i, idx) => (
                      <li key={idx}>
                        <strong>{i.tpCode}:</strong> {i.glossary}
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* Lembar Tanda Tangan Pengesahan */}
            <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-6 text-xs text-slate-900">
              <div className="space-y-1 text-left">
                <div>Mengetahui,</div>
                <div>Kepala Sekolah {school.name || ''}</div>
                <div className="h-12" />
                <div className="font-bold underline uppercase">
                  {school.principalName || '( ............................................ )'}
                </div>
                <div>NIP. {school.principalNip || '............................................'}</div>
              </div>

              <div className="space-y-1 text-left">
                <div>{dateFormatted}</div>
                <div>Guru Mata Pelajaran / Kelas</div>
                <div className="h-12" />
                <div className="font-bold underline uppercase">
                  {profile.name || '( ............................................ )'}
                </div>
                <div>NIP. {profile.nip || '............................................'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
