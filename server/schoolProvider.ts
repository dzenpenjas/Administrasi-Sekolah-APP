import { GoogleGenAI } from '@google/genai';

export interface SchoolCandidateResult {
  name: string;
  npsn: string;
  address: string;
  village: string;
  district: string;
  regency: string;
  province: string;
  level: string; // 'SD' | 'SMP' | 'SMA' | 'SMK'
  status: string; // 'Negeri' | 'Swasta'
  source: string;
  sourceUrl?: string;
  principalName?: string;
  principalNip?: string;
  accreditation?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface SchoolSearchResponseData {
  query: string;
  found: boolean;
  candidates: SchoolCandidateResult[];
  message: string;
  sourceType: 'online_search' | 'official_api';
  error?: boolean;
}

export interface SchoolDataProvider {
  search(query: string): Promise<SchoolCandidateResult[]>;
}

/**
 * Normalizes and calculates match score for ranking candidates:
 * 1. Exact NPSN match (score: 100)
 * 2. Exact school name match (score: 90)
 * 3. Similar school name match (score: 70)
 * 4. District/regency match (score: 50)
 * 5. Official Government domain source .go.id (+15)
 * 6. Official School website .sch.id (+10)
 */
function rankSchoolCandidates(query: string, candidates: SchoolCandidateResult[]): SchoolCandidateResult[] {
  const cleanQ = query.trim().toLowerCase();
  const isNpsnQ = /^\d{6,10}$/.test(query.trim());

  const scored = candidates.map((cand) => {
    let score = 0;
    const candName = (cand.name || '').toLowerCase();
    const candNpsn = (cand.npsn || '').toLowerCase();
    const candSource = (cand.source || '').toLowerCase();
    const candUrl = (cand.sourceUrl || '').toLowerCase();

    if (isNpsnQ && candNpsn === cleanQ) {
      score += 100;
    } else if (isNpsnQ && candNpsn.includes(cleanQ)) {
      score += 80;
    }

    if (candName === cleanQ) {
      score += 90;
    } else if (candName.includes(cleanQ) || cleanQ.includes(candName)) {
      score += 70;
    } else {
      const qWords = cleanQ.split(/\s+/).filter((w) => w.length > 2);
      const matchWords = qWords.filter((w) => candName.includes(w));
      score += matchWords.length * 15;
    }

    // Source reliability bonus
    if (candSource.includes('kemendikdasmen') || candSource.includes('kemdikbud') || candUrl.includes('.go.id')) {
      score += 15;
    } else if (candUrl.includes('.sch.id')) {
      score += 10;
    }

    return { cand, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.cand);
}

/**
 * Trusted Web Search Provider:
 * Discovers and extracts official school data from trusted Indonesian education pages
 * (.kemdikbud.go.id, .kemendikdasmen.go.id, referensi.data.kemdikbud.go.id, sekolah.data.kemdikbud.go.id, dapo.kemdikbud.go.id, .sch.id).
 */
export class TrustedWebSearchProvider implements SchoolDataProvider {
  private getAIClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  /**
   * 1. Query online education reference service if available
   */
  private async queryOnlineDirectory(query: string): Promise<SchoolCandidateResult[]> {
    const isNpsnQuery = /^\d{6,10}$/.test(query.trim());
    const endpoint = isNpsnQuery
      ? `https://api-sekolah-indonesia.vercel.app/sekolah/s?npsn=${encodeURIComponent(query.trim())}`
      : `https://api-sekolah-indonesia.vercel.app/sekolah/s?nama=${encodeURIComponent(query.trim())}&perPage=10`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      const res = await fetch(endpoint, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'User-Agent': 'AdministrasiGuruAI/2.0 (Official-Education-Reference-Search)',
        },
      });
      clearTimeout(timeoutId);

      if (!res.ok) return [];

      const data: any = await res.json();
      if (data && data.dataSekolah && Array.isArray(data.dataSekolah)) {
        return data.dataSekolah.map((item: any) => {
          const npsn = item.npsn || '';
          const rawName = item.sekolah || item.nama || item.name || 'Satuan Pendidikan';
          const level = (item.bentuk || item.jenjang || (rawName.startsWith('SD') ? 'SD' : rawName.startsWith('SMP') ? 'SMP' : rawName.startsWith('SMA') ? 'SMA' : rawName.startsWith('SMK') ? 'SMK' : 'SD')).toUpperCase();
          const status = item.status || (rawName.toLowerCase().includes('negeri') ? 'Negeri' : 'Swasta');
          const refUrl = npsn
            ? `https://referensi.data.kemdikbud.go.id/tabs.php?npsn=${npsn}`
            : 'https://referensi.data.kemdikbud.go.id/';

          return {
            name: rawName,
            npsn,
            address: item.alamat_jalan || item.alamat || 'Belum tersedia',
            village: item.desa_kelurahan || item.kelurahan || '',
            district: item.kecamatan ? (item.kecamatan.startsWith('Kec.') ? item.kecamatan : `Kec. ${item.kecamatan}`) : '',
            regency: item.kabupaten_kota || item.kab_kota || '',
            province: item.propinsi || item.provinsi || '',
            level,
            status,
            source: 'Data Referensi Pendidikan Kemendikdasmen',
            sourceUrl: refUrl,
            accreditation: item.akreditasi || '',
            phone: item.telepon || '',
            email: item.email || '',
            website: item.website || '',
            principalName: '',
            principalNip: '',
          };
        });
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.log(`[TrustedWebSearchProvider] Directory endpoint notice: ${(e as Error)?.message}`);
    }
    return [];
  }

  /**
   * 2. Live Web Discovery using Google Search Grounding for government & official school domains
   */
  private async queryWebSearchGrounding(query: string): Promise<SchoolCandidateResult[]> {
    const ai = this.getAIClient();
    if (!ai) return [];

    try {
      const prompt = `Anda adalah sistem pencarian data resmi satuan pendidikan di Indonesia.
Lakukan pencarian data sekolah valid dari website resmi Kemendikdasmen/Kemdikbud (referensi.data.kemdikbud.go.id, sekolah.data.kemdikbud.go.id, dapo.kemdikbud.go.id) atau website resmi sekolah untuk query: "${query}".

PERINGATAN:
- JANGAN mengarang data atau mengarang NPSN. Jika data tidak ditemukan dari sumber resmi internet, kembalikan array kosong [].
- Hanya kembalikan data yang terverifikasi dari sumber terpercaya.
- JANGAN mengisi nama kepala sekolah atau NIP (kosongkan string "").

Kembalikan hasil dalam format JSON array:
[
  {
    "name": "Nama Lengkap Sekolah (misal: SD Negeri Menteng 01)",
    "npsn": "8 digit nomor pokok sekolah nasional",
    "address": "Alamat jalan",
    "village": "Desa atau Kelurahan",
    "district": "Kecamatan (awali dengan Kec. )",
    "regency": "Kabupaten atau Kota",
    "province": "Provinsi",
    "level": "SD / SMP / SMA / SMK",
    "status": "Negeri / Swasta",
    "source": "Nama Sumber (misal: Data Referensi Pendidikan Kemendikdasmen / Website Resmi)",
    "sourceUrl": "URL tautan web sumber rujukan resmi",
    "accreditation": "A / B / C / Belum Terakreditasi"
  }
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      let text = response.text || '';
      if (text.includes('```json')) {
        text = text.slice(text.indexOf('```json') + 7);
        if (text.includes('```')) {
          text = text.slice(0, text.indexOf('```'));
        }
      } else if (text.includes('```')) {
        text = text.slice(text.indexOf('```') + 3);
        if (text.includes('```')) {
          text = text.slice(0, text.indexOf('```'));
        }
      }
      text = text.trim();

      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item: any) => item && item.name && typeof item.name === 'string')
          .map((item: any) => ({
            name: item.name,
            npsn: item.npsn || '',
            address: item.address || 'Belum tersedia',
            village: item.village || '',
            district: item.district ? (item.district.startsWith('Kec.') ? item.district : `Kec. ${item.district}`) : '',
            regency: item.regency || '',
            province: item.province || '',
            level: (item.level || 'SD').toUpperCase(),
            status: item.status || (item.name.toLowerCase().includes('negeri') ? 'Negeri' : 'Swasta'),
            source: item.source || 'Data Referensi Pendidikan Kemendikdasmen',
            sourceUrl: item.sourceUrl || (item.npsn ? `https://referensi.data.kemdikbud.go.id/tabs.php?npsn=${item.npsn}` : 'https://referensi.data.kemdikbud.go.id/'),
            accreditation: item.accreditation || '',
            principalName: '',
            principalNip: '',
          }));
      }
    } catch (err) {
      console.log(`[TrustedWebSearchProvider] Web grounding search notice: ${(err as Error)?.message}`);
    }
    return [];
  }

  /**
   * Main search method implementing data aggregation and ranking
   */
  async search(query: string): Promise<SchoolCandidateResult[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];

    // Parallel search across online directory and live web discovery
    const [directoryResults, webResults] = await Promise.all([
      this.queryOnlineDirectory(trimmed),
      this.queryWebSearchGrounding(trimmed),
    ]);

    // Merge and deduplicate by NPSN or lowercase school name
    const combined: SchoolCandidateResult[] = [];
    const seen = new Set<string>();

    for (const cand of [...directoryResults, ...webResults]) {
      const key = cand.npsn ? cand.npsn : cand.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(cand);
      }
    }

    // Rank candidates by precision and domain credibility
    return rankSchoolCandidates(trimmed, combined);
  }
}

/**
 * School Search Service Abstraction
 */
export class OfficialEducationDataProvider {
  private static provider: SchoolDataProvider = new TrustedWebSearchProvider();

  public static setProvider(customProvider: SchoolDataProvider) {
    this.provider = customProvider;
  }

  static async search(query: string): Promise<SchoolSearchResponseData> {
    const trimmed = query.trim();
    if (!trimmed) {
      return {
        query,
        found: false,
        candidates: [],
        message: 'Masukkan nama sekolah atau NPSN untuk mencari data identitas.',
        sourceType: 'online_search',
      };
    }

    try {
      const candidates = await this.provider.search(trimmed);

      if (candidates.length > 0) {
        return {
          query: trimmed,
          found: true,
          candidates: candidates.slice(0, 10),
          message: `Ditemukan ${candidates.length} data satuan pendidikan dari sumber online. Silakan pilih dan lengkapi data sekolah di bawah.`,
          sourceType: 'online_search',
        };
      }

      return {
        query: trimmed,
        found: false,
        candidates: [],
        message: 'Tidak ditemukan pada sumber data yang tersedia.',
        sourceType: 'online_search',
      };
    } catch (error: unknown) {
      console.error('[OfficialEducationDataProvider] Search error:', error);
      return {
        query: trimmed,
        found: false,
        candidates: [],
        message: 'Tidak dapat menghubungi sumber data sekolah saat ini.',
        sourceType: 'online_search',
        error: true,
      };
    }
  }
}
