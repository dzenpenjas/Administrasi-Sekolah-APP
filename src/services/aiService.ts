import { CPElem, TPItem, ATPItem } from '../types';

export interface CPAnalysisResult {
  summary: string;
  keyCompetencies: string[];
  keyContents: string[];
  p3Focus: string[];
  pedagogicalTips: string[];
}

export interface GenerateTPParams {
  cpGeneral: string;
  cpElements: CPElem[];
  subject: string;
  grade: string;
  phase: string;
  curriculum: string;
  count?: number;
}

export interface GenerateATPParams {
  tps: TPItem[];
  cpGeneral: string;
  subject: string;
  grade: string;
  phase: string;
  semester: string;
  academicYear: string;
  totalHoursPerWeek?: number;
}

export interface GenerateATPResult {
  rationale: string;
  items: Omit<ATPItem, 'id' | 'tpId'>[];
}

export async function analyzeCPWithAI(params: {
  cpText: string;
  elements: CPElem[];
  subject: string;
  grade: string;
  phase: string;
  curriculum: string;
}): Promise<CPAnalysisResult> {
  const res = await fetch('/api/ai/analyze-cp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Gagal menganalisis CP (Status ${res.status})`);
  }

  const data = await res.json();
  return data.data;
}

export async function generateTPWithAI(params: GenerateTPParams): Promise<TPItem[]> {
  const res = await fetch('/api/ai/generate-tp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Gagal menghasilkan TP dengan AI (Status ${res.status})`);
  }

  const data = await res.json();
  const rawItems = data.items || [];
  return rawItems.map((item: any, idx: number) => ({
    id: `tp-ai-${Date.now()}-${idx}`,
    code: item.code || `TP ${idx + 1}`,
    elementName: item.elementName || 'Umum',
    statement: item.statement,
    competence: item.competence || 'Memahami',
    contentScope: item.contentScope || 'Materi Pokok',
    p3Dimensions: item.p3Dimensions || ['Bernalar Kritis'],
    order: idx + 1,
  }));
}

export async function generateATPWithAI(params: GenerateATPParams): Promise<GenerateATPResult> {
  const res = await fetch('/api/ai/generate-atp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Gagal menyusun ATP dengan AI (Status ${res.status})`);
  }

  const data = await res.json();
  return data.data;
}

export async function refineTextWithAI(params: {
  text: string;
  instruction?: string;
  context?: string;
}): Promise<string> {
  const res = await fetch('/api/ai/refine-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Gagal menyempurnakan teks');
  }

  const data = await res.json();
  return data.refinedText;
}
