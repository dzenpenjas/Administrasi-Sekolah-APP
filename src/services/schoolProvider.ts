import { SchoolData } from '../types';

export interface SchoolCandidate extends Omit<SchoolData, 'id' | 'createdAt' | 'updatedAt'> {
  source: string;
  sourceUrl?: string;
  level?: string;
  status?: string;
  accreditation?: string;
  phone?: string;
  email?: string;
  website?: string;
  isCandidate?: boolean;
}

export interface SchoolSearchResponse {
  query: string;
  found: boolean;
  candidates: SchoolCandidate[];
  message: string;
  error?: boolean;
  sourceType?: 'online_search' | 'official_api';
}

/**
 * SchoolSearchService:
 * Client-side service communicating with the backend trusted web search and education data providers.
 * Strictly adheres to the rule of NEVER fabricating NPSN, address, or principal info.
 */
export class SchoolSearchService {
  /**
   * Search for official school records via backend service.
   */
  static async searchSchool(query: string): Promise<SchoolSearchResponse> {
    const trimmed = query.trim();
    if (!trimmed) {
      return {
        query,
        found: false,
        candidates: [],
        message: 'Masukkan nama sekolah atau NPSN untuk mencari data identitas.',
      };
    }

    try {
      const response = await fetch(`/api/schools/search?q=${encodeURIComponent(trimmed)}`);
      if (response.ok) {
        const data = await response.json();
        return {
          query: trimmed,
          found: data.found ?? false,
          candidates: data.candidates || [],
          message:
            data.message ||
            (data.found
              ? 'Data sekolah ditemukan dari sumber online.'
              : 'Tidak ditemukan pada sumber data yang tersedia.'),
          sourceType: data.sourceType,
        };
      } else {
        const errData = await response.json().catch(() => ({}));
        return {
          query: trimmed,
          found: false,
          candidates: [],
          message: errData.message || 'Tidak dapat menghubungi sumber data sekolah saat ini.',
          error: true,
        };
      }
    } catch (err) {
      console.warn('[SchoolSearchService] Search request error:', err);
      return {
        query: trimmed,
        found: false,
        candidates: [],
        message: 'Tidak dapat terhubung ke server pencarian. Anda dapat memasukkan data sekolah secara manual.',
        error: true,
      };
    }
  }

  /**
   * Format full school address into standard Indonesian official mailing string.
   */
  static formatFullAddress(school: Partial<SchoolData>): string {
    const parts = [
      school.address,
      school.village ? `Desa/Kel. ${school.village}` : '',
      school.district ? (school.district.startsWith('Kec.') ? school.district : `Kec. ${school.district}`) : '',
      school.regency ? school.regency : '',
      school.province ? (school.province.startsWith('Prov.') ? school.province : `Prov. ${school.province}`) : '',
    ].filter(Boolean);

    return parts.join(', ') || 'Alamat belum dilengkapi';
  }
}

// Alias for backward compatibility
export const SchoolIdentityProvider = SchoolSearchService;
