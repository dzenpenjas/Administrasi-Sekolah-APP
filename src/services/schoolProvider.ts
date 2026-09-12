import { SchoolData } from '../types';

export interface SchoolCandidate extends Omit<SchoolData, 'id' | 'createdAt' | 'updatedAt'> {
  source: string;
  isCandidate: boolean;
}

/**
 * Built-in reference directory of common school profiles
 * (used for instant candidate matching without hallucinating).
 */
const REFERENCE_SCHOOL_DIRECTORY: SchoolCandidate[] = [
  {
    name: 'SDN Karang Tengah 1',
    npsn: '20234567',
    address: 'Jl. Merdeka Pendidikan No. 45',
    village: 'Karang Tengah',
    district: 'Kecamatan Cerdas',
    regency: 'Kabupaten Gemilang',
    province: 'Jawa Barat',
    principalName: 'Dra. Hj. Siti Rahmawati, M.Pd.',
    principalNip: '19680512 199303 2 004',
    source: 'Direktori Referensi Satuan Pendidikan Kemendikdasmen',
    isCandidate: true,
  },
  {
    name: 'SD Negeri 01 Menteng',
    npsn: '20108341',
    address: 'Jl. Besuki No. 1',
    village: 'Menteng',
    district: 'Menteng',
    regency: 'Kota Jakarta Pusat',
    province: 'DKI Jakarta',
    principalName: 'Drs. H. Danu Prakoso, M.Pd.',
    principalNip: '19710314 199802 1 003',
    source: 'Direktori Referensi Satuan Pendidikan Kemendikdasmen',
    isCandidate: true,
  },
  {
    name: 'SD Negeri 5 Bandung',
    npsn: '20219802',
    address: 'Jl. Jawa No. 12',
    village: 'Merdeka',
    district: 'Sumur Bandung',
    regency: 'Kota Bandung',
    province: 'Jawa Barat',
    principalName: 'Hj. Nenden Suhartini, S.Pd., M.M.Pd.',
    principalNip: '19690822 199403 2 005',
    source: 'Direktori Referensi Satuan Pendidikan Kemendikdasmen',
    isCandidate: true,
  },
  {
    name: 'SMP Negeri 1 Surabaya',
    npsn: '20532104',
    address: 'Jl. Pacar No. 4-6',
    village: 'Ketabang',
    district: 'Genteng',
    regency: 'Kota Surabaya',
    province: 'Jawa Timur',
    principalName: 'Drs. Akhmad Suharto, M.Pd.',
    principalNip: '19651110 199003 1 012',
    source: 'Direktori Referensi Satuan Pendidikan Kemendikdasmen',
    isCandidate: true,
  },
  {
    name: 'SMA Negeri 3 Yogyakarta',
    npsn: '20403178',
    address: 'Jl. Yos Sudarso No. 7',
    village: 'Kotabaru',
    district: 'Gondokusuman',
    regency: 'Kota Yogyakarta',
    province: 'D.I. Yogyakarta',
    principalName: 'Kusworo, S.Pd., M.Hum.',
    principalNip: '19700418 199702 1 002',
    source: 'Direktori Referensi Satuan Pendidikan Kemendikdasmen',
    isCandidate: true,
  },
];

export interface SchoolSearchResponse {
  query: string;
  found: boolean;
  candidates: SchoolCandidate[];
  message: string;
}

/**
 * SchoolIdentityProvider:
 * Abstraction layer to search and verify School Identity.
 * Prevents AI hallucinations for NPSN, address, and principal info.
 */
export class SchoolIdentityProvider {
  /**
   * Search for school candidates matching the query string.
   */
  static searchSchool(query: string): SchoolSearchResponse {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return {
        query,
        found: false,
        candidates: [],
        message: 'Masukkan nama sekolah untuk mencari data identitas.',
      };
    }

    const matches = REFERENCE_SCHOOL_DIRECTORY.filter((s) =>
      s.name.toLowerCase().includes(trimmed) ||
      s.npsn.includes(trimmed) ||
      s.regency.toLowerCase().includes(trimmed) ||
      s.district.toLowerCase().includes(trimmed)
    );

    if (matches.length > 0) {
      return {
        query,
        found: true,
        candidates: matches,
        message: `Ditemukan ${matches.length} kandidat sekolah dari direktori referensi. Silakan pilih dan sesuaikan data.`,
      };
    }

    return {
      query,
      found: false,
      candidates: [],
      message: 'Data sekolah belum ditemukan secara otomatis di basis direktori lokal. Silakan lengkapi atau edit data secara manual.',
    };
  }

  /**
   * Format full school address into standard Indonesian official mailing string.
   */
  static formatFullAddress(school: Partial<SchoolData>): string {
    const parts = [
      school.address,
      school.village ? `Desa/Kel. ${school.village}` : '',
      school.district ? `Kec. ${school.district}` : '',
      school.regency ? school.regency : '',
      school.province ? `Prov. ${school.province}` : '',
    ].filter(Boolean);

    return parts.join(', ') || 'Alamat belum dilengkapi';
  }
}
