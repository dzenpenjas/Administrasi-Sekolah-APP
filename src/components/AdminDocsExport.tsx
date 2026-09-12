import React, { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  FolderTree,
  Check,
  Calendar,
  Layers,
  BookOpen,
  ClipboardList,
  Sparkles,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Files,
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
  DocumentType,
} from '../types';
import {
  DOCUMENT_CATALOG,
  generateDocument,
  validateDocumentRequirements,
  DocumentGenerationContext,
  INDONESIAN_MONTHS,
} from '../services/documentEngine';

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
  onUpdateDocuments?: (updatedDocs: AppDocumentRecord[]) => void;
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
  onUpdateDocuments,
}) => {
  const [activePreviewType, setActivePreviewType] = useState<DocumentType>('ANALISIS_CP_TP');
  const [generatingDocType, setGeneratingDocType] = useState<string | null>(null);
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);
  const [exportErrorMessage, setExportErrorMessage] = useState<string | null>(null);
  const [localDocs, setLocalDocs] = useState<AppDocumentRecord[]>(documents);

  // Validation status
  const isProfileValid = !!(profile.name && profile.name.trim().length > 0);
  const isSchoolValid = !!(school.name && school.name.trim().length > 0);
  const isAcademicValid = !!(academicSetting.subject && academicSetting.grade);
  const isCPValid = !!((cp.generalDescription && cp.generalDescription.trim().length > 0) || (cp.elements && cp.elements.length > 0));
  const isTPValid = !!(tp.items && tp.items.length > 0);
  const isATPValid = !!(atp.items && atp.items.length > 0);

  const totalJP = atp.items.reduce((acc, curr) => acc + (Number(curr.jp) || 0), 0);

  const context: DocumentGenerationContext = {
    school,
    profile,
    academicSetting,
    workspace,
    cp,
    tp,
    atp,
  };

  const getDocRecord = (type: DocumentType): AppDocumentRecord | undefined => {
    return localDocs.find((d) => d.type === type && (!d.workspaceId || d.workspaceId === workspace?.id));
  };

  /**
   * Precise Document Dependency Tracking:
   * Checks if source data (CP, TP, ATP) has been updated since this document was generated.
   */
  const isDocOutdated = (type: DocumentType, doc?: AppDocumentRecord): boolean => {
    if (!doc) return false;
    const docTime = new Date(doc.lastGenerated || doc.generatedAt || 0).getTime();
    if (docTime === 0) return false;

    const cpTime = cp.updatedAt ? new Date(cp.updatedAt).getTime() : 0;
    const tpTime = tp.updatedAt ? new Date(tp.updatedAt).getTime() : 0;
    const atpTime = atp.updatedAt ? new Date(atp.updatedAt).getTime() : 0;

    switch (type) {
      case 'ANALISIS_CP_TP':
        return cpTime > docTime;
      case 'ATP':
        return cpTime > docTime || tpTime > docTime || atpTime > docTime;
      case 'PROTA':
      case 'PROMES':
      case 'MODUL_AJAR':
      case 'ASESMEN':
      case 'JURNAL':
        return atpTime > docTime || tpTime > docTime || cpTime > docTime;
      default:
        return false;
    }
  };

  const handleGenerateSingleDoc = async (type: DocumentType) => {
    const validation = validateDocumentRequirements(type, context);
    if (!validation.isValid) {
      setExportErrorMessage(validation.message || 'Prasyarat dokumen belum lengkap.');
      return;
    }

    setGeneratingDocType(type);
    setExportErrorMessage(null);
    setExportSuccessMessage(null);

    try {
      const result = await generateDocument(type, context);
      const updatedList = [
        ...localDocs.filter((d) => !(d.type === type && (!d.workspaceId || d.workspaceId === workspace?.id))),
        result.record,
      ];
      setLocalDocs(updatedList);
      if (onUpdateDocuments) {
        onUpdateDocuments(updatedList);
      }
      setExportSuccessMessage(`Dokumen ${result.title} (.docx) berhasil diunduh!`);
      setTimeout(() => setExportSuccessMessage(null), 6000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghasilkan dokumen';
      setExportErrorMessage(msg);
    } finally {
      setGeneratingDocType(null);
    }
  };

  const handleGenerateAllDocs = async () => {
    setIsExportingAll(true);
    setExportErrorMessage(null);
    setExportSuccessMessage(null);

    const docTypes: DocumentType[] = ['ANALISIS_CP_TP', 'ATP', 'PROTA', 'PROMES', 'MODUL_AJAR', 'ASESMEN', 'JURNAL'];
    let successCount = 0;
    const newRecords: AppDocumentRecord[] = [...localDocs];

    try {
      for (const type of docTypes) {
        const val = validateDocumentRequirements(type, context);
        if (val.isValid) {
          const res = await generateDocument(type, context);
          const existingIdx = newRecords.findIndex((d) => d.type === type && (!d.workspaceId || d.workspaceId === workspace?.id));
          if (existingIdx >= 0) {
            newRecords[existingIdx] = res.record;
          } else {
            newRecords.push(res.record);
          }
          successCount++;
          // Delay between downloads to prevent browser throttling
          await new Promise((r) => setTimeout(r, 600));
        }
      }
      setLocalDocs(newRecords);
      if (onUpdateDocuments) {
        onUpdateDocuments(newRecords);
      }
      setExportSuccessMessage(`Sukses! ${successCount} paket dokumen administrasi (.docx) telah selesai diunduh.`);
      setTimeout(() => setExportSuccessMessage(null), 8000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kendala saat menghasilkan berkas';
      setExportErrorMessage(msg);
    } finally {
      setIsExportingAll(false);
    }
  };

  const today = new Date();
  const dateFormatted = `${school.district?.replace(/^Kec\.\s*/i, '') || school.regency || school.village || 'Tempat'}, ${today.getDate()} ${
    INDONESIAN_MONTHS[today.getMonth()]
  } ${today.getFullYear()}`;

  const isSemesterGanjil =
    academicSetting.semester?.includes('1') || academicSetting.semester?.toLowerCase().includes('ganjil');
  const semesterMonths = isSemesterGanjil
    ? ['Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    : ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni'];

  // Categories defined in official sequence
  const catalogCategories = [
    { key: 'Perencanaan Utama', label: '1. PERENCANAAN UTAMA' },
    { key: 'Perangkat Pembelajaran', label: '2. PERANGKAT PEMBELAJARAN' },
    { key: 'Asesmen', label: '3. ASESMEN & EVALUASI' },
    { key: 'Pelaksanaan', label: '4. PELAKSANAAN & JURNAL' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center">
                06
              </span>
              <h3 className="text-lg font-bold text-slate-900">Pusat Generator Dokumen Administrasi Pembelajaran</h3>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Generator dokumen Kurikulum Merdeka nyata dalam format <strong>Microsoft Word (.docx)</strong> berstandar resmi (PPA Revisi 2025), lengkap dari <strong>Analisis CP → TP</strong>, Alur ATP, Prota, Promes, Modul Ajar, Asesmen KKTP, hingga Jurnal Harian.
            </p>
            {workspace && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                <FolderTree className="w-3.5 h-3.5 text-blue-600" />
                <span>Workspace: <strong>{workspace.name}</strong></span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-export-all-docs"
              onClick={handleGenerateAllDocs}
              disabled={isExportingAll || !isCPValid}
              className="inline-flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-950 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-900/15 transition-all cursor-pointer disabled:opacity-50"
            >
              {isExportingAll ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Memproses Berkas (.docx)...</span>
                </>
              ) : (
                <>
                  <Files className="w-4 h-4 text-blue-300" />
                  <span>Download Semua Dokumen (.docx)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {exportSuccessMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{exportSuccessMessage}</span>
          </div>
        )}

        {exportErrorMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs whitespace-pre-line flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Perhatian: </span>
              {exportErrorMessage}
            </div>
          </div>
        )}
      </div>

      {/* Grid: Workflow Integrity, Document Catalog & Live Paper Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Integrity & Document Engine List (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Integrity Checklist */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Integritas Rantai Administrasi</span>
              </h4>
              <span className="text-[11px] text-slate-400">Prasyarat Dokumen</span>
            </div>

            <div className="space-y-2 text-xs">
              <div
                onClick={() => onBackToStep('profile')}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition"
              >
                <span className="font-semibold text-slate-700">1. Profil Guru & Sekolah</span>
                {isProfileValid && isSchoolValid ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Lengkap
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Belum Lengkap
                  </span>
                )}
              </div>

              <div
                onClick={() => onBackToStep('academic')}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition"
              >
                <span className="font-semibold text-slate-700">2. Data Akademik Mapel</span>
                {isAcademicValid ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {academicSetting.subject}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Belum Diisi
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
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {tp.items.length} Butir TP
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
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {atp.items.length} Unit ({totalJP} JP)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-rose-700 font-bold">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Kosong
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Document Engine Catalog with Categories */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Katalog Dokumen Administrasi ({DOCUMENT_CATALOG.length})</span>
              </h4>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Format Resmi .docx
              </span>
            </div>

            <div className="space-y-5">
              {catalogCategories.map((category) => {
                const itemsInCategory = DOCUMENT_CATALOG.filter((c) => c.category === category.key);
                if (itemsInCategory.length === 0) return null;

                return (
                  <div key={category.key} className="space-y-2.5">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-1">
                      {category.label}
                    </div>

                    <div className="space-y-2.5">
                      {itemsInCategory.map((catItem) => {
                        const record = getDocRecord(catItem.type);
                        const validation = validateDocumentRequirements(catItem.type, context);
                        const isOutdated = isDocOutdated(catItem.type, record);
                        const isGenerating = generatingDocType === catItem.type;
                        const isSelectedForPreview = activePreviewType === catItem.type;

                        // Status resolution:
                        let statusText = 'Siap dibuat';
                        let statusColor = 'bg-blue-100 text-blue-800 border-blue-200';

                        if (!validation.isValid) {
                          statusText = 'Belum lengkap datanya';
                          statusColor = 'bg-slate-100 text-slate-600 border-slate-200';
                        } else if (record && isOutdated) {
                          statusText = 'Perlu diperbarui';
                          statusColor = 'bg-amber-100 text-amber-900 border-amber-300';
                        } else if (record) {
                          statusText = 'Siap diunduh';
                          statusColor = 'bg-emerald-100 text-emerald-900 border-emerald-300';
                        }

                        return (
                          <div
                            key={catItem.id}
                            className={`p-3.5 rounded-xl border transition cursor-pointer ${
                              isSelectedForPreview
                                ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                                : 'border-slate-200/80 bg-white hover:border-slate-300'
                            }`}
                            onClick={() => setActivePreviewType(catItem.type)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-bold text-slate-900">{catItem.title}</span>
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusColor}`}
                                  >
                                    {statusText}
                                  </span>
                                </div>
                                <span className="text-[10px] text-blue-700 font-semibold bg-blue-100/60 px-1.5 py-0.2 rounded inline-block">
                                  {catItem.category}
                                </span>
                              </div>

                              <button
                                type="button"
                                id={`btn-download-${catItem.type.toLowerCase()}`}
                                disabled={isGenerating || isExportingAll || !validation.isValid}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGenerateSingleDoc(catItem.type);
                                }}
                                className="px-3 py-1.5 bg-blue-800 hover:bg-blue-900 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              >
                                {isGenerating ? (
                                  <>
                                    <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    <span>Exporting...</span>
                                  </>
                                ) : (
                                  <>
                                    <Download className="w-3.5 h-3.5 text-blue-200" />
                                    <span>{record ? 'Unduh Ulang' : 'Unduh .docx'}</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <p className="text-[11px] text-slate-500 mt-1.5 leading-normal">{catItem.description}</p>

                            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                              <span>Sumber data: {catItem.requiredSources.join(' → ')}</span>
                              {isSelectedForPreview ? (
                                <span className="text-blue-700 font-bold flex items-center gap-0.5">
                                  Sedang Ditinjau <ChevronRight className="w-3 h-3" />
                                </span>
                              ) : (
                                <span className="hover:text-slate-600">Klik untuk pratinjau</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Document Paper Preview with Switcher (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Document Type Switcher Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
              {DOCUMENT_CATALOG.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActivePreviewType(cat.type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    activePreviewType === cat.type
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat.type}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleGenerateSingleDoc(activePreviewType)}
              disabled={generatingDocType === activePreviewType || !validateDocumentRequirements(activePreviewType, context).isValid}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-200 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh {activePreviewType} (.docx)</span>
            </button>
          </div>

          {/* Paper Canvas */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-300 shadow-md space-y-6 text-slate-900 font-sans text-xs min-h-[580px]">
            {/* Header / KOP */}
            <div className="text-center space-y-1 border-b-2 border-slate-900 pb-3">
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight uppercase text-blue-950">
                {activePreviewType === 'ANALISIS_CP_TP' && 'ANALISIS CAPAIAN PEMBELAJARAN (CP) MENUJU TUJUAN PEMBELAJARAN (TP)'}
                {activePreviewType === 'ATP' && 'ALUR TUJUAN PEMBELAJARAN (ATP)'}
                {activePreviewType === 'PROTA' && 'PROGRAM TAHUNAN (PROTA)'}
                {activePreviewType === 'PROMES' && 'PROGRAM SEMESTER (PROMES)'}
                {activePreviewType === 'MODUL_AJAR' && 'MODUL AJAR / RPP BERDIFERENSIASI'}
                {activePreviewType === 'ASESMEN' && 'PANDUAN INSTRUMEN ASESMEN & RUBRIK KKTP'}
                {activePreviewType === 'JURNAL' && 'JURNAL HARIAN PELAKSANAAN PEMBELAJARAN'}
              </h2>
              <h3 className="text-xs sm:text-sm font-bold uppercase text-slate-700">
                {academicSetting.curriculum} — TP {academicSetting.academicYear || '2025/2026'}
              </h3>
            </div>

            {/* Metadata Identity Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-800 border-b border-slate-200 pb-3 bg-slate-50/50 p-3 rounded-xl">
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

            {/* DOCUMENT-SPECIFIC PREVIEW CONTENT */}

            {/* 0. ANALISIS CP -> TP PREVIEW */}
            {activePreviewType === 'ANALISIS_CP_TP' && (
              <div className="space-y-4">
                {cp.generalDescription && (
                  <div className="space-y-1">
                    <h5 className="font-bold text-slate-900 uppercase">A. Capaian Pembelajaran Umum Fase {academicSetting.phase}</h5>
                    <p className="text-slate-700 leading-relaxed text-justify bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {cp.generalDescription}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <h5 className="font-bold text-slate-900 uppercase">B. Tabel Analisis Penurunan CP Menjadi TP</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] border border-slate-300 border-collapse">
                      <thead>
                        <tr className="bg-blue-900 text-white font-semibold">
                          <th className="p-1.5 border border-blue-800 text-center w-7">No</th>
                          <th className="p-1.5 border border-blue-800 w-28">Elemen CP</th>
                          <th className="p-1.5 border border-blue-800 min-w-[140px]">Teks Capaian Pembelajaran</th>
                          <th className="p-1.5 border border-blue-800 min-w-[100px]">Analisis Kompetensi (KKO)</th>
                          <th className="p-1.5 border border-blue-800 min-w-[100px]">Analisis Lingkup Materi</th>
                          <th className="p-1.5 border border-blue-800 min-w-[140px]">Rumusan Tujuan Pembelajaran (TP)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(cp.elements && cp.elements.length > 0) ? (
                          cp.elements.map((elem, idx) => {
                            const relatedTps = tp.items.filter((t) => t.elementId === elem.id || t.element === elem.name);
                            return (
                              <tr key={elem.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                <td className="p-1.5 border border-slate-300 text-center font-bold">{idx + 1}</td>
                                <td className="p-1.5 border border-slate-300 font-bold text-blue-950">{elem.name}</td>
                                <td className="p-1.5 border border-slate-300 text-slate-700">{elem.description}</td>
                                <td className="p-1.5 border border-slate-300">
                                  <div className="text-[10px] text-slate-600">
                                    Mengidentifikasi, memahami, menerapkan, mengevaluasi materi {elem.name}
                                  </div>
                                </td>
                                <td className="p-1.5 border border-slate-300">
                                  <div className="text-[10px] text-slate-600">
                                    Konsep dan aplikasi esensial {elem.name}
                                  </div>
                                </td>
                                <td className="p-1.5 border border-slate-300">
                                  {relatedTps.length > 0 ? (
                                    <ul className="space-y-1 list-disc list-inside">
                                      {relatedTps.map((t) => (
                                        <li key={t.id} className="text-[10px]">
                                          <strong className="text-blue-900">{t.code}:</strong> {t.statement}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 italic">Rumusan TP diturunkan dari CP elemen ini</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={6} className="p-4 text-center text-slate-400 italic">
                              Capaian Pembelajaran (CP) belum tersedia. Silakan lengkapi pada langkah 03.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 1. ATP PREVIEW */}
            {activePreviewType === 'ATP' && (
              <div className="space-y-4">
                {atp.rationale && (
                  <div className="space-y-1">
                    <h5 className="font-bold text-slate-900 uppercase">A. Rasionalisasi Alur Pembelajaran</h5>
                    <p className="text-slate-700 leading-relaxed text-justify bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {atp.rationale}
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <h5 className="font-bold text-slate-900 uppercase">B. Matriks Alur Tujuan Pembelajaran</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] border border-slate-300 border-collapse">
                      <thead>
                        <tr className="bg-blue-900 text-white font-semibold">
                          <th className="p-1.5 border border-blue-800 text-center w-7">No</th>
                          <th className="p-1.5 border border-blue-800 w-14">Kode</th>
                          <th className="p-1.5 border border-blue-800 min-w-[160px]">Tujuan Pembelajaran</th>
                          <th className="p-1.5 border border-blue-800 min-w-[100px]">Materi Pokok</th>
                          <th className="p-1.5 border border-blue-800 min-w-[90px]">Profil Pancasila</th>
                          <th className="p-1.5 border border-blue-800 text-center w-10">JP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {atp.items.map((item, idx) => (
                          <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="p-1.5 border border-slate-300 text-center font-bold">{idx + 1}</td>
                            <td className="p-1.5 border border-slate-300 font-mono font-bold text-blue-900">{item.tpCode}</td>
                            <td className="p-1.5 border border-slate-300">{item.tpStatement}</td>
                            <td className="p-1.5 border border-slate-300">{item.materialScope}</td>
                            <td className="p-1.5 border border-slate-300">{item.p3Dimensions?.join(', ') || '-'}</td>
                            <td className="p-1.5 border border-slate-300 text-center font-bold">{item.jp || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PROTA PREVIEW */}
            {activePreviewType === 'PROTA' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h5 className="font-bold text-slate-900 uppercase">Distribusi Alokasi Waktu Pembelajaran Tahunan</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] border border-slate-300 border-collapse">
                      <thead>
                        <tr className="bg-blue-900 text-white font-semibold">
                          <th className="p-1.5 border border-blue-800 text-center w-7">No</th>
                          <th className="p-1.5 border border-blue-800 w-16">Kode TP</th>
                          <th className="p-1.5 border border-blue-800">Tujuan Pembelajaran & Ruang Lingkup Materi</th>
                          <th className="p-1.5 border border-blue-800 text-center w-16">Alokasi</th>
                          <th className="p-1.5 border border-blue-800 text-center w-24">Semester</th>
                        </tr>
                      </thead>
                      <tbody>
                        {atp.items.map((item, idx) => (
                          <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="p-1.5 border border-slate-300 text-center font-bold">{idx + 1}</td>
                            <td className="p-1.5 border border-slate-300 font-mono font-bold text-blue-900 text-center">{item.tpCode}</td>
                            <td className="p-1.5 border border-slate-300">
                              <div className="font-medium">{item.tpStatement}</div>
                              {item.materialScope && <div className="text-[10px] text-slate-500 italic">Materi: {item.materialScope}</div>}
                            </td>
                            <td className="p-1.5 border border-slate-300 text-center font-bold">{item.jp || 4} JP</td>
                            <td className="p-1.5 border border-slate-300 text-center">{academicSetting.semester || '1 (Ganjil)'}</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-100 font-bold">
                          <td colSpan={3} className="p-1.5 border border-slate-300 text-right">TOTAL ALOKASI TAHUNAN:</td>
                          <td className="p-1.5 border border-slate-300 text-center text-blue-900">{totalJP + 4} JP</td>
                          <td className="p-1.5 border border-slate-300"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 3. PROMES PREVIEW */}
            {activePreviewType === 'PROMES' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h5 className="font-bold text-slate-900 uppercase">Matriks Distribusi Jam Pembelajaran Mingguan per Bulan</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[10px] border border-slate-300 border-collapse">
                      <thead>
                        <tr className="bg-blue-900 text-white font-semibold">
                          <th className="p-1 border border-blue-800 text-center w-6">No</th>
                          <th className="p-1 border border-blue-800 w-12">Kode</th>
                          <th className="p-1 border border-blue-800 min-w-[120px]">Tujuan Pembelajaran</th>
                          <th className="p-1 border border-blue-800 text-center w-10">JP</th>
                          {semesterMonths.map((m) => (
                            <th key={m} className="p-1 border border-blue-800 text-center w-10">
                              {m.slice(0, 3)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {atp.items.map((item, idx) => (
                          <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="p-1 border border-slate-300 text-center font-bold">{idx + 1}</td>
                            <td className="p-1 border border-slate-300 font-mono font-bold text-blue-900">{item.tpCode}</td>
                            <td className="p-1 border border-slate-300 truncate max-w-[140px]">{item.tpStatement}</td>
                            <td className="p-1 border border-slate-300 text-center font-bold">{item.jp || 4}</td>
                            {semesterMonths.map((_, mIdx) => (
                              <td key={mIdx} className="p-1 border border-slate-300 text-center">
                                {mIdx === idx % 6 ? `${item.jp || 4}` : '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 4. MODUL AJAR PREVIEW */}
            {activePreviewType === 'MODUL_AJAR' && (
              <div className="space-y-3 text-slate-800">
                <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 space-y-1">
                  <div className="font-bold text-blue-950 uppercase text-[11px]">I. Informasi Umum & Model Pembelajaran</div>
                  <div className="text-[11px] text-slate-600 leading-relaxed">
                    Pendekatan Kontekstual Saintifik, Model Problem Based Learning (PBL) & Pembelajaran Berdiferensiasi (Konten, Proses, Produk).
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 uppercase text-[11px]">II. Komponen Inti & Pertanyaan Pemantik</div>
                  <div className="text-[11px] text-slate-600 leading-relaxed">
                    Tujuan Pembelajaran: {tp.items.length > 0 ? `${tp.items.length} Butir TP terintegrasi` : 'Berdasarkan alur ATP'}. Pemahaman bermakna dan LKPD terlampir.
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 uppercase text-[11px]">III. Kegiatan Pembelajaran Berdiferensiasi</div>
                  <div className="text-[11px] text-slate-600 leading-relaxed">
                    Sintaks: Pendahuluan (15 mnt) → Kegiatan Inti Berdiferensiasi (70 mnt) → Penutup & Refleksi (15 mnt) per pertemuan.
                  </div>
                </div>
              </div>
            )}

            {/* 5. ASESMEN PREVIEW */}
            {activePreviewType === 'ASESMEN' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h5 className="font-bold text-slate-900 uppercase">Rubrik Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] border border-slate-300 border-collapse">
                      <thead>
                        <tr className="bg-blue-900 text-white font-semibold">
                          <th className="p-1.5 border border-blue-800 text-center w-28">Kategori</th>
                          <th className="p-1.5 border border-blue-800 text-center w-20">Interval</th>
                          <th className="p-1.5 border border-blue-800">Kriteria Kualitatif</th>
                          <th className="p-1.5 border border-blue-800">Tindak Lanjut</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-rose-50/40">
                          <td className="p-1.5 border border-slate-300 font-bold text-rose-800">Perlu Bimbingan</td>
                          <td className="p-1.5 border border-slate-300 text-center">0 - 60%</td>
                          <td className="p-1.5 border border-slate-300">Belum mencapai ketuntasan pemahaman esensial.</td>
                          <td className="p-1.5 border border-slate-300">Remedial intensif awal konsep.</td>
                        </tr>
                        <tr className="bg-amber-50/40">
                          <td className="p-1.5 border border-slate-300 font-bold text-amber-800">Cukup</td>
                          <td className="p-1.5 border border-slate-300 text-center">61 - 70%</td>
                          <td className="p-1.5 border border-slate-300">Memahami konsep dasar namun perlu penguatan penerapan.</td>
                          <td className="p-1.5 border border-slate-300">Remedial pada indikator parsial.</td>
                        </tr>
                        <tr className="bg-emerald-50/40">
                          <td className="p-1.5 border border-slate-300 font-bold text-emerald-800">Baik</td>
                          <td className="p-1.5 border border-slate-300 text-center">71 - 85%</td>
                          <td className="p-1.5 border border-slate-300">Mencapai seluruh tujuan pembelajaran dengan mandiri.</td>
                          <td className="p-1.5 border border-slate-300">Apresiasi & lanjut materi berikutnya.</td>
                        </tr>
                        <tr className="bg-blue-50/40">
                          <td className="p-1.5 border border-slate-300 font-bold text-blue-800">Sangat Baik</td>
                          <td className="p-1.5 border border-slate-300 text-center">86 - 100%</td>
                          <td className="p-1.5 border border-slate-300">Menguasai secara mendalam dan terampil menganalisis (HOTS).</td>
                          <td className="p-1.5 border border-slate-300">Pengayaan & tutor sebaya.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 6. JURNAL PREVIEW */}
            {activePreviewType === 'JURNAL' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h5 className="font-bold text-slate-900 uppercase">Jurnal Harian Mengajar & Refleksi</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] border border-slate-300 border-collapse">
                      <thead>
                        <tr className="bg-blue-900 text-white font-semibold">
                          <th className="p-1.5 border border-blue-800 text-center w-8">No</th>
                          <th className="p-1.5 border border-blue-800 w-24">Hari / Tanggal</th>
                          <th className="p-1.5 border border-blue-800 w-16">Kode TP</th>
                          <th className="p-1.5 border border-blue-800">Aktivitas di Kelas</th>
                          <th className="p-1.5 border border-blue-800 w-28">Kehadiran</th>
                        </tr>
                      </thead>
                      <tbody>
                        {atp.items.slice(0, 4).map((item, idx) => (
                          <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="p-1.5 border border-slate-300 text-center font-bold">{idx + 1}</td>
                            <td className="p-1.5 border border-slate-300 text-center text-[10px]">Minggu ke-{idx + 1}</td>
                            <td className="p-1.5 border border-slate-300 font-mono font-bold text-blue-900 text-center">{item.tpCode}</td>
                            <td className="p-1.5 border border-slate-300">
                              <div className="font-medium">{item.materialScope}</div>
                              <div className="text-[10px] text-slate-500">Eksplorasi konsep, diskusi aktif, dan LKPD.</div>
                            </td>
                            <td className="p-1.5 border border-slate-300 text-[10px]">Hadir: Lengkap</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Official Sign-off Block Preview */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-800">
              <div className="space-y-1">
                <div>Mengetahui,</div>
                <div className="font-semibold">Kepala Satuan Pendidikan</div>
                <div className="h-16 flex items-end">
                  <div className="font-bold underline">
                    {school.principalName || '...................................................'}
                  </div>
                </div>
                <div className="text-[11px] text-slate-600">
                  NIP. {school.principalNip || '...................................................'}
                </div>
              </div>

              <div className="space-y-1">
                <div>{dateFormatted}</div>
                <div className="font-semibold">Guru Mata Pelajaran</div>
                <div className="h-16 flex items-end">
                  <div className="font-bold underline">
                    {profile.name || '...................................................'}
                  </div>
                </div>
                <div className="text-[11px] text-slate-600">
                  NIP. {profile.nip || '...................................................'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
