import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Sparkles,
  Plus,
  Trash2,
  BookOpen,
  ArrowRight,
  Check,
  BrainCircuit,
  Lightbulb,
  Tag,
  Target,
  FileText,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { CPData, CPElem, AcademicSetting, TeacherProfile } from '../types';
import { CP_PRESETS } from '../data/curriculumDefaults';
import { analyzeCPWithAI, CPAnalysisResult } from '../services/aiService';

interface CPManagerProps {
  cp: CPData;
  academicSetting: AcademicSetting;
  profile: TeacherProfile;
  onSaveCP: (cp: CPData) => void;
  onNextStep: () => void;
}

export const CPManager: React.FC<CPManagerProps> = ({
  cp,
  academicSetting,
  profile,
  onSaveCP,
  onNextStep,
}) => {
  const [generalDescription, setGeneralDescription] = useState(cp.generalDescription || '');
  const [elements, setElements] = useState<CPElem[]>(cp.elements || []);
  const [aiNotes, setAiNotes] = useState(cp.aiNotes || '');

  // AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CPAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState(false);

  // Sync if prop changes
  useEffect(() => {
    setGeneralDescription(cp.generalDescription || '');
    setElements(cp.elements || []);
    setAiNotes(cp.aiNotes || '');
  }, [cp]);

  // Check if a preset is available for the current subject & grade/phase
  const availablePreset = CP_PRESETS.find(
    (p) =>
      p.subject.toLowerCase() === academicSetting.subject?.toLowerCase() ||
      (academicSetting.subject?.toLowerCase().includes('bahasa indonesia') && p.subject === 'Bahasa Indonesia') ||
      (academicSetting.subject?.toLowerCase().includes('matematika') && p.subject === 'Matematika') ||
      (academicSetting.subject?.toLowerCase().includes('ipas') && p.subject.includes('IPAS')) ||
      (academicSetting.subject?.toLowerCase().includes('pancasila') && p.subject.includes('Pancasila'))
  );

  const handleApplyPreset = (preset = availablePreset) => {
    if (!preset) return;
    if (
      generalDescription.trim().length > 0 &&
      !confirm('Gantikan teks CP saat ini dengan data referensi resmi Kurikulum Merdeka?')
    ) {
      return;
    }
    setGeneralDescription(preset.generalDescription);
    setElements(
      preset.elements.map((el, idx) => ({
        id: `elem-${Date.now()}-${idx}`,
        name: el.name,
        content: el.content,
      }))
    );
  };

  const handleAddElement = () => {
    const newElem: CPElem = {
      id: `elem-${Date.now()}`,
      name: '',
      content: '',
    };
    setElements([...elements, newElem]);
  };

  const handleRemoveElement = (id: string) => {
    setElements(elements.filter((e) => e.id !== id));
  };

  const handleElementChange = (id: string, field: 'name' | 'content', val: string) => {
    setElements(elements.map((e) => (e.id === id ? { ...e, [field]: val } : e)));
  };

  const handleSave = () => {
    const updated: CPData = {
      ...cp,
      academicSettingId: academicSetting.id,
      generalDescription,
      elements,
      aiNotes: aiNotes || (analysisResult ? analysisResult.summary : ''),
      updatedAt: new Date().toISOString(),
    };
    onSaveCP(updated);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleSaveAndNext = () => {
    if (!generalDescription.trim() && elements.length === 0) {
      alert('Mohon isi deskripsi CP umum atau minimal 1 elemen CP sebelum melanjutkan.');
      return;
    }
    handleSave();
    onNextStep();
  };

  const handleRunAIAnalysis = async () => {
    if (!generalDescription.trim() && elements.length === 0) {
      alert('Isi deskripsi CP terlebih dahulu agar AI dapat membedah kompetensinya.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const res = await analyzeCPWithAI({
        cpText: generalDescription,
        elements,
        subject: academicSetting.subject,
        grade: academicSetting.grade,
        phase: academicSetting.phase,
        curriculum: academicSetting.curriculum,
      });
      setAnalysisResult(res);
      setAiNotes(res.summary);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menganalisis CP dengan AI';
      setAnalysisError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center">
                03
              </span>
              <h3 className="text-lg font-bold text-slate-900">Capaian Pembelajaran (CP)</h3>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Masukkan Capaian Pembelajaran untuk <strong>{academicSetting.subject}</strong> ({academicSetting.grade} - {academicSetting.phase}).
              Data CP ini menjadi fondasi mutlak dalam penurunan Tujuan Pembelajaran (TP) pada tahap berikutnya.
            </p>
          </div>

          {/* Quick preset loader */}
          {availablePreset && (
            <button
              id="btn-load-cp-preset"
              onClick={() => handleApplyPreset(availablePreset)}
              className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-800 px-3.5 py-2 rounded-xl text-xs font-semibold border border-blue-200 transition cursor-pointer self-start sm:self-auto"
              title="Gunakan draft referensi Capaian Pembelajaran Kurikulum Merdeka resmi"
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Muat Referensi CP Resmi</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: CP Input (7 cols) & AI Assistant Panel (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: CP Editor Form */}
        <div className="lg:col-span-7 space-y-5">
          {/* General CP Textarea */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Capaian Pembelajaran Umum (Fase {academicSetting.phase})</span>
              </label>
              <span className="text-[11px] text-slate-400">Teks naratif fase</span>
            </div>

            <textarea
              id="textarea-cp-general"
              rows={4}
              placeholder="Contoh: Pada akhir Fase B, peserta didik memiliki kemampuan berbahasa untuk berkomunikasi dan bernalar, sesuai dengan tujuan, konteks sosial, akademis..."
              value={generalDescription}
              onChange={(e) => setGeneralDescription(e.target.value)}
              className="w-full text-sm p-3.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 leading-relaxed"
            />
          </div>

          {/* CP Elements Section */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Rincian Elemen CP ({elements.length})
                </h4>
                <p className="text-[11px] text-slate-500">
                  Elemen mata pelajaran (misal: Menyimak, Membaca, Menulis, Bilangan, Geometri, dll)
                </p>
              </div>

              <button
                id="btn-add-cp-element"
                type="button"
                onClick={handleAddElement}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Elemen</span>
              </button>
            </div>

            {elements.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <p className="text-xs text-slate-500">
                  Belum ada elemen CP terpisah. Anda dapat menambahkan elemen atau mengandalkan deskripsi CP umum di atas.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {elements.map((elem, idx) => (
                  <div key={elem.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        placeholder="Nama Elemen (misal: Menyimak / Bilangan)"
                        value={elem.name}
                        onChange={(e) => handleElementChange(elem.id, 'name', e.target.value)}
                        className="text-xs font-bold text-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveElement(elem.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                        title="Hapus elemen ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      placeholder="Uraian capaian pada elemen ini..."
                      value={elem.content}
                      onChange={(e) => handleElementChange(elem.id, 'content', e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 leading-relaxed"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: AI Analysis & Pedagogical Insight Assistant */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gradient-to-b from-blue-900 to-indigo-950 text-white rounded-2xl p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">AI Bedah & Pahami CP</h4>
                  <p className="text-[11px] text-blue-200">Analisis kata kerja, materi esensial, & profil pelajar</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-blue-100/90 leading-relaxed">
              AI akan menganalisis teks CP Anda untuk mengekstraksi kompetensi kunci (KKO), konten esensial, dan dimensi Profil Pelajar Pancasila yang harus tercapai.
            </p>

            <button
              id="btn-run-ai-cp-analysis"
              onClick={handleRunAIAnalysis}
              disabled={isAnalyzing}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2.5 px-4 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sedang Membedah CP dengan AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Analisis & Bedah CP dengan AI</span>
                </>
              )}
            </button>

            {analysisError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs">
                ⚠️ {analysisError}
              </div>
            )}
          </div>

          {/* AI Analysis Result Display */}
          {analysisResult && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-2">
                <h5 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Hasil Analisis CP</span>
                </h5>
                <p className="text-slate-600 mt-1 leading-relaxed">{analysisResult.summary}</p>
              </div>

              {/* Key competencies */}
              <div>
                <span className="font-bold text-slate-800 uppercase text-[10px] block mb-1.5">
                  Kompetensi Utama / KKO:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.keyCompetencies.map((k, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-semibold border border-blue-200/80"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key contents */}
              <div>
                <span className="font-bold text-slate-800 uppercase text-[10px] block mb-1.5">
                  Konten / Materi Esensial:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.keyContents.map((c, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-semibold border border-amber-200"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* P3 focus */}
              <div>
                <span className="font-bold text-slate-800 uppercase text-[10px] block mb-1.5">
                  Profil Pelajar Pancasila:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.p3Focus.map((p, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pedagogical tips */}
              {analysisResult.pedagogicalTips && analysisResult.pedagogicalTips.length > 0 && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 space-y-1">
                  <span className="font-bold text-slate-800 uppercase text-[10px] block">
                    Tips Strategi Pembelajaran:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                    {analysisResult.pedagogicalTips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            id="btn-save-cp-draft"
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 shadow-xs transition"
          >
            Simpan Draft CP
          </button>
          {saveToast && (
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <Check className="w-4 h-4 text-emerald-600" /> Data CP tersimpan
            </span>
          )}
        </div>

        <button
          id="btn-next-to-tp"
          type="button"
          onClick={handleSaveAndNext}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-950 text-white py-2.5 px-6 rounded-xl text-sm font-semibold shadow-sm transition cursor-pointer"
        >
          <span>Simpan & Lanjut ke 04 Perumusan TP (Tujuan Pembelajaran)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
