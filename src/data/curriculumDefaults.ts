import { SchoolData, TeacherProfile, AcademicSetting, CPData, TPData, ATPData } from '../types';

export const CURRICULA = [
  'Kurikulum Merdeka',
  'Kurikulum Nasional (K-13 Penyesuaian)',
  'Kurikulum Satuan Pendidikan Khusus / Inklusif',
];

export const ACADEMIC_YEARS = [
  '2024/2025',
  '2025/2026',
  '2026/2027',
  '2027/2028',
];

export const SEMESTERS = ['1 (Ganjil)', '2 (Genap)'] as const;

export const EDUCATION_LEVELS = ['SD', 'SMP', 'SMA', 'SMK'] as const;

export const GRADE_PHASE_MAP: Record<string, { grade: string; phase: string; level: 'SD' | 'SMP' | 'SMA' | 'SMK' }[]> = {
  SD: [
    { grade: 'Kelas 1', phase: 'Fase A', level: 'SD' },
    { grade: 'Kelas 2', phase: 'Fase A', level: 'SD' },
    { grade: 'Kelas 3', phase: 'Fase B', level: 'SD' },
    { grade: 'Kelas 4', phase: 'Fase B', level: 'SD' },
    { grade: 'Kelas 5', phase: 'Fase C', level: 'SD' },
    { grade: 'Kelas 6', phase: 'Fase C', level: 'SD' },
  ],
  SMP: [
    { grade: 'Kelas 7', phase: 'Fase D', level: 'SMP' },
    { grade: 'Kelas 8', phase: 'Fase D', level: 'SMP' },
    { grade: 'Kelas 9', phase: 'Fase D', level: 'SMP' },
  ],
  SMA: [
    { grade: 'Kelas 10', phase: 'Fase E', level: 'SMA' },
    { grade: 'Kelas 11', phase: 'Fase F', level: 'SMA' },
    { grade: 'Kelas 12', phase: 'Fase F', level: 'SMA' },
  ],
  SMK: [
    { grade: 'Kelas 10', phase: 'Fase E', level: 'SMK' },
    { grade: 'Kelas 11', phase: 'Fase F', level: 'SMK' },
    { grade: 'Kelas 12', phase: 'Fase F', level: 'SMK' },
  ],
};

export const SUBJECT_OPTIONS: Record<'SD' | 'SMP' | 'SMA' | 'SMK', string[]> = {
  SD: [
    'Bahasa Indonesia',
    'Matematika',
    'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    'Pendidikan Pancasila',
    'Pendidikan Agama Islam dan Budi Pekerti',
    'Pendidikan Agama Kristen dan Budi Pekerti',
    'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    'Seni Rupa',
    'Seni Musik',
    'Seni Tari',
    'Seni Teater',
    'Bahasa Inggris',
    'Muatan Lokal (Bahasa Daerah)',
  ],
  SMP: [
    'Bahasa Indonesia',
    'Matematika',
    'Ilmu Pengetahuan Alam (IPA)',
    'Ilmu Pengetahuan Sosial (IPS)',
    'Pendidikan Pancasila',
    'Pendidikan Agama dan Budi Pekerti',
    'Bahasa Inggris',
    'Informatika',
    'PJOK',
    'Seni dan Prakarya',
  ],
  SMA: [
    'Bahasa Indonesia',
    'Matematika (Wajib/Pilihan)',
    'Bahasa Inggris',
    'Pendidikan Pancasila',
    'Fisika',
    'Kimia',
    'Biologi',
    'Ekonomi',
    'Sosiologi',
    'Geografi',
    'Sejarah',
    'Informatika',
  ],
  SMK: [
    'Bahasa Indonesia',
    'Matematika',
    'Bahasa Inggris',
    'Pendidikan Pancasila',
    'Dasar-dasar Kejuruan',
    'Konsentrasi Keahlian',
    'Projek Kreatif dan Kewirausahaan',
    'Informatika',
  ],
};

export const P3_DIMENSIONS = [
  'Beriman, Bertakwa kepada Tuhan YME, dan Berakhlak Mulia',
  'Berkebinekaan Global',
  'Gotong Royong',
  'Mandiri',
  'Bernalar Kritis',
  'Kreatif',
];

export interface CPSamplePreset {
  subject: string;
  grade: string;
  phase: string;
  generalDescription: string;
  elements: { name: string; content: string }[];
}

export const CP_PRESETS: CPSamplePreset[] = [
  {
    subject: 'Bahasa Indonesia',
    grade: 'Kelas 4',
    phase: 'Fase B',
    generalDescription:
      'Pada akhir Fase B, peserta didik memiliki kemampuan berbahasa untuk berkomunikasi dan bernalar, sesuai dengan tujuan, konteks sosial, akademis, dan dunia kerja. Peserta didik mampu memahami pesan dan informasi tentang kehidupan sehari-hari, teks narasi, dan puisi sederhana dalam bentuk cetak atau elektronik.',
    elements: [
      {
        name: 'Menyimak',
        content:
          'Peserta didik mampu memahami ide pokok (gagasan) suatu pesan lisan, informasi dari media audio, teks aural (teks yang dibacakan dan/atau didengar), dan instruksi lisan yang berkaitan dengan tujuan berkomunikasi.',
      },
      {
        name: 'Membaca dan Memirsa',
        content:
          'Peserta didik mampu memahami pesan dan informasi tentang kehidupan sehari-hari, teks narasi, dan puisi anak dalam bentuk cetak atau elektronik. Peserta didik mampu membaca kata-kata baru berdasarkan pola kombinasi huruf yang telah dikenali dengan fasih.',
      },
      {
        name: 'Berbicara dan Mempresentasikan',
        content:
          'Peserta didik mampu berbicara dengan pilihan kata dan sikap tubuh/gestur yang santun, menggunakan volume dan intonasi yang tepat sesuai konteks. Peserta didik mengajukan dan menanggapi pertanyaan secara santun dalam suatu percakapan.',
      },
      {
        name: 'Menulis',
        content:
          'Peserta didik mampu menulis teks narasi, teks deskripsi, teks rekon, teks prosedur, dan teks eksposisi dengan rangkaian kalimat yang beragam, informasi yang rinci dan akurat dengan topik yang beragam.',
      },
    ],
  },
  {
    subject: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    grade: 'Kelas 4',
    phase: 'Fase B',
    generalDescription:
      'Pada akhir Fase B, peserta didik mengidentifikasi keterkaitan antara bentuk serta fungsi bagian tubuh pada manusia dan tumbuhan. Peserta didik dapat membuat simulasi menggunakan bagan/alat bantu sederhana tentang siklus hidup makhluk hidup, wujud zat dan perubahannya, serta bentuk energi dan perubahannya.',
    elements: [
      {
        name: 'Pemahaman IPAS (Sains dan Sosial)',
        content:
          'Peserta didik menganalisis hubungan antara bentuk dan fungsi bagian tubuh pada tumbuhan dan hewan; mendeskripsikan proses fotosintesis dan kaitannya dengan makhluk hidup lain; mendemonstrasikan bagaimana wujud zat berubah; mengidentifikasi sumber dan bentuk energi serta perubahannya dalam kehidupan sehari-hari; dan mengenali kearifan lokal di daerah tempat tinggalnya.',
      },
      {
        name: 'Keterampilan Proses',
        content:
          'Mengamati, mempertanyakan dan memprediksi, merencanakan dan melakukan penyelidikan, memproses, menganalisis data dan informasi, mengevaluasi dan refleksi, serta mengomunikasikan hasil penyelidikan secara lisan dan tertulis.',
      },
    ],
  },
  {
    subject: 'Matematika',
    grade: 'Kelas 4',
    phase: 'Fase B',
    generalDescription:
      'Pada akhir Fase B, peserta didik dapat menunjukkan pemahaman dan intuisi bilangan (number sense) pada bilangan cacah sampai 10.000. Mereka dapat melakukan operasi penjumlahan, pengurangan, perkalian, dan pembagian bilangan cacah sampai 100.',
    elements: [
      {
        name: 'Bilangan',
        content:
          'Peserta didik menunjukkan pemahaman dan intuisi bilangan pada bilangan cacah sampai 10.000, membaca, menulis, membandingkan, mengurutkan nilai tempat, serta melakukan operasi penjumlahan dan pengurangan sampai 1.000, perkalian dan pembagian sampai 100.',
      },
      {
        name: 'Pengukuran',
        content:
          'Peserta didik dapat mengukur panjang dan berat benda menggunakan satuan baku, serta mengukur luas dan volume menggunakan satuan tidak baku dan satuan baku berupa bilangan cacah.',
      },
      {
        name: 'Geometri',
        content:
          'Peserta didik dapat mendeskripsikan ciri berbagai bentuk bangun datar (segiempat, segitiga, segibanyak) dan menyusun/mengurai gabungan bangun datar.',
      },
    ],
  },
  {
    subject: 'Pendidikan Pancasila',
    grade: 'Kelas 4',
    phase: 'Fase B',
    generalDescription:
      'Pada akhir Fase B, peserta didik mampu memahami dan menyajikan pesan moral berdasarkan sila-sila Pancasila, mengenal identitas diri dan lingkungan, serta mempraktikkan gotong royong dan mematuhi norma/aturan yang berlaku.',
    elements: [
      {
        name: 'Pancasila',
        content:
          'Peserta didik mampu memahami dan menjelaskan makna sila-sila Pancasila serta menceritakan contoh penerapan sila Pancasila dalam kehidupan sehari-hari.',
      },
      {
        name: 'Undang-Undang Dasar Negara Republik Indonesia 1945',
        content:
          'Peserta didik mampu mengidentifikasi aturan di keluarga, sekolah, dan lingkungan sekitar tempat tinggal serta melaksanakannya dengan bimbingan orang tua dan guru.',
      },
      {
        name: 'Bhinneka Tunggal Ika',
        content:
          'Peserta didik mampu mengidentifikasi dan menghargai keragaman suku bangsa, budaya, bahasa, dan agama di lingkungan sekitar.',
      },
      {
        name: 'Negara Kesatuan Republik Indonesia',
        content:
          'Peserta didik mampu mengenal susunan wilayah NKRI mulai dari lingkungan RT, RW, desa/kelurahan, hingga kecamatan sebagai bagian tak terpisahkan.',
      },
    ],
  },
];

// Initial starter seed profiles and school
export const INITIAL_SCHOOL: SchoolData = {
  id: 'sch-default-1',
  name: 'SD Negeri 01 Nusantara',
  npsn: '20234567',
  address: 'Jl. Merdeka Pendidikan No. 45',
  village: 'Sukamaju',
  district: 'Kecamatan Cerdas',
  regency: 'Kabupaten Gemilang',
  province: 'Jawa Barat',
  principalName: 'Dra. Hj. Siti Rahmawati, M.Pd.',
  principalNip: '19680512 199303 2 004',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const INITIAL_PROFILES: TeacherProfile[] = [
  {
    id: 'prof-1',
    name: 'Budi Santoso, S.Pd.',
    nip: '19850720 201001 1 015',
    nuptk: '4538761234900021',
    status: 'PNS',
    defaultSubject: 'Bahasa Indonesia',
    defaultLevel: 'SD',
    schoolId: 'sch-default-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prof-2',
    name: 'Ratna Dewi, S.Pd.SD',
    nip: '19920315 201902 2 008',
    nuptk: '8923765412900043',
    status: 'PPPK',
    defaultSubject: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    defaultLevel: 'SD',
    schoolId: 'sch-default-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prof-3',
    name: 'Ahmad Fauzi, S.Pd.',
    nip: '19951110 202203 1 005',
    nuptk: '1245890345900012',
    status: 'Guru Tetap Yayasan (GTY)',
    defaultSubject: 'Matematika',
    defaultLevel: 'SD',
    schoolId: 'sch-default-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_ACADEMIC_SETTINGS: AcademicSetting[] = [
  {
    id: 'acad-prof-1',
    profileId: 'prof-1',
    curriculum: 'Kurikulum Merdeka',
    academicYear: '2025/2026',
    semester: '1 (Ganjil)',
    level: 'SD',
    grade: 'Kelas 4',
    phase: 'Fase B',
    subject: 'Bahasa Indonesia',
    totalHoursPerWeek: 6,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acad-prof-2',
    profileId: 'prof-2',
    curriculum: 'Kurikulum Merdeka',
    academicYear: '2025/2026',
    semester: '1 (Ganjil)',
    level: 'SD',
    grade: 'Kelas 4',
    phase: 'Fase B',
    subject: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    totalHoursPerWeek: 5,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acad-prof-3',
    profileId: 'prof-3',
    curriculum: 'Kurikulum Merdeka',
    academicYear: '2025/2026',
    semester: '1 (Ganjil)',
    level: 'SD',
    grade: 'Kelas 4',
    phase: 'Fase B',
    subject: 'Matematika',
    totalHoursPerWeek: 5,
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_CP_DATA: CPData[] = [
  {
    id: 'cp-prof-1',
    academicSettingId: 'acad-prof-1',
    generalDescription: CP_PRESETS[0].generalDescription,
    elements: CP_PRESETS[0].elements.map((el, i) => ({
      id: `elem-${i + 1}`,
      name: el.name,
      content: el.content,
    })),
    aiNotes: 'Capaian Pembelajaran Bahasa Indonesia Fase B (Kelas 3-4 SD) berfokus pada pengembangan literasi menyimak, membaca teks narasi, berbicara santun, serta menulis teks beragam secara terstruktur.',
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_TP_DATA: TPData[] = [
  {
    id: 'tp-prof-1',
    academicSettingId: 'acad-prof-1',
    items: [
      {
        id: 'tp-1',
        code: 'TP 4.1',
        elementName: 'Menyimak',
        statement: 'Peserta didik mampu mengidentifikasi ide pokok dan informasi penting dari teks narasi lisan yang didengar dengan tepat.',
        competence: 'Mengidentifikasi',
        contentScope: 'Ide pokok dan informasi rinci teks narasi',
        p3Dimensions: ['Bernalar Kritis', 'Mandiri'],
        order: 1,
      },
      {
        id: 'tp-2',
        code: 'TP 4.2',
        elementName: 'Membaca dan Memirsa',
        statement: 'Peserta didik mampu membaca teks narasi sederhana dengan intonasi yang tepat serta menjelaskan kosakata baru yang ditemukan dalam teks.',
        competence: 'Membaca dan Menjelaskan',
        contentScope: 'Membaca nyaring, intonasi, dan kosakata baru',
        p3Dimensions: ['Bernalar Kritis', 'Kreatif'],
        order: 2,
      },
      {
        id: 'tp-3',
        code: 'TP 4.3',
        elementName: 'Berbicara dan Mempresentasikan',
        statement: 'Peserta didik mampu menceritakan kembali isi teks narasi di depan kelas dengan gestur tubuh yang santun dan artikulasi jelas.',
        competence: 'Menceritakan kembali',
        contentScope: 'Presentasi lisan dan gestur santun',
        p3Dimensions: ['Mandiri', 'Berkebinekaan Global'],
        order: 3,
      },
      {
        id: 'tp-4',
        code: 'TP 4.4',
        elementName: 'Menulis',
        statement: 'Peserta didik mampu menulis paragraf teks narasi pengalaman pribadi menggunakan huruf kapital, tanda titik, dan kalimat majemuk sederhana.',
        competence: 'Menulis',
        contentScope: 'Teks narasi pengalaman pribadi dan kaidah ejaan',
        p3Dimensions: ['Kreatif', 'Bernalar Kritis'],
        order: 4,
      },
    ],
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_ATP_DATA: ATPData[] = [
  {
    id: 'atp-prof-1',
    academicSettingId: 'acad-prof-1',
    rationale: 'Alur Tujuan Pembelajaran disusun secara berurutan mulai dari kecakapan reseptif (menyimak dan membaca) menuju kecakapan produktif (berbicara dan menulis) agar peserta didik membangun pondasi pemahaman konsep sebelum menghasilkan karya bahasa.',
    totalJP: 24,
    items: [
      {
        id: 'atp-row-1',
        stepNumber: 1,
        tpId: 'tp-1',
        tpCode: 'TP 4.1',
        tpStatement: 'Peserta didik mampu mengidentifikasi ide pokok dan informasi penting dari teks narasi lisan yang didengar dengan tepat.',
        materialScope: 'Mendengarkan Teks Cerita & Menemukan Ide Pokok',
        jp: 6,
        p3Dimensions: ['Bernalar Kritis', 'Mandiri'],
        assessmentPlan: 'Asesmen Awal: Tanya jawab cerita dongeng; Formatif: Lembar kerja menyimak audio cerita',
        glossary: 'Ide Pokok, Teks Narasi, Cerita Rakyat, Tokoh Utama',
        resources: 'Audio dongeng nusantara, Buku Siswa Bahasa Indonesia Kelas 4',
      },
      {
        id: 'atp-row-2',
        stepNumber: 2,
        tpId: 'tp-2',
        tpCode: 'TP 4.2',
        tpStatement: 'Peserta didik mampu membaca teks narasi sederhana dengan intonasi yang tepat serta menjelaskan kosakata baru yang ditemukan dalam teks.',
        materialScope: 'Membaca Nyaring & Eksplorasi Kosakata Baru (Kamus Kecil)',
        jp: 6,
        p3Dimensions: ['Bernalar Kritis', 'Kreatif'],
        assessmentPlan: 'Formatif: Rubrik kelancaran membaca dan kuis menjodohkan arti kata',
        glossary: 'Intonasi, Kamus, Kosakata, Kalimat Efektif',
        resources: 'Buku teks bacaan, Kartu kata pintar, Kamus Besar Bahasa Indonesia (KBBI)',
      },
      {
        id: 'atp-row-3',
        stepNumber: 3,
        tpId: 'tp-3',
        tpCode: 'TP 4.3',
        tpStatement: 'Peserta didik mampu menceritakan kembali isi teks narasi di depan kelas dengan gestur tubuh yang santun dan artikulasi jelas.',
        materialScope: 'Bercerita di Depan Kelas & Percakapan Santun',
        jp: 6,
        p3Dimensions: ['Mandiri', 'Berkebinekaan Global'],
        assessmentPlan: 'Formatif: Lembar observasi penampilan bercerita (Unjuk Kerja)',
        glossary: 'Artikulasi, Gestur, Volume Suara, Alur Cerita',
        resources: 'Panggung boneka/media gambar seri, Rubrik penampilan lisan',
      },
      {
        id: 'atp-row-4',
        stepNumber: 4,
        tpId: 'tp-4',
        tpCode: 'TP 4.4',
        tpStatement: 'Peserta didik mampu menulis paragraf teks narasi pengalaman pribadi menggunakan huruf kapital, tanda titik, dan kalimat majemuk sederhana.',
        materialScope: 'Menulis Karangan Narasi Pengalaman Pribadi yang Menyenangkan',
        jp: 6,
        p3Dimensions: ['Kreatif', 'Bernalar Kritis'],
        assessmentPlan: 'Sumatif Lingkup Materi: Produk tulisan narasi mandiri dengan rubrik ejaan & isi',
        glossary: 'Ejaan, Huruf Kapital, Paragraf, Pengalaman Pribadi',
        resources: 'Buku catatan bergaris, Panduan tanda baca dan ejaan',
      },
    ],
    updatedAt: new Date().toISOString(),
  },
];
