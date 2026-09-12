import React, { useState } from 'react';
import {
  User,
  Plus,
  Edit2,
  Trash2,
  School,
  Check,
  Building2,
  MapPin,
  ShieldCheck,
  Search,
  ArrowRight,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { TeacherProfile, SchoolData } from '../types';
import { EDUCATION_LEVELS } from '../data/curriculumDefaults';
import { SchoolIdentityProvider, SchoolCandidate } from '../services/schoolProvider';

interface ProfileManagerProps {
  profiles: TeacherProfile[];
  activeProfileId: string;
  schools: SchoolData[];
  onSelectProfile: (id: string) => void;
  onSaveProfile: (profile: TeacherProfile) => void;
  onDeleteProfile: (id: string) => void;
  onSaveSchool: (school: SchoolData) => void;
  onNextStep: () => void;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({
  profiles,
  activeProfileId,
  schools,
  onSelectProfile,
  onSaveProfile,
  onDeleteProfile,
  onSaveSchool,
  onNextStep,
}) => {
  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];
  const activeSchool =
    schools.find((s) => s.id === activeProfile?.schoolId) || schools[0] || {
      id: 'sch-1',
      name: '',
      npsn: '',
      address: '',
      village: '',
      district: '',
      regency: '',
      province: '',
      principalName: '',
      principalNip: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

  // Profile Modal State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<TeacherProfile>({ ...activeProfile });

  // School Edit State
  const [isEditingSchool, setIsEditingSchool] = useState(false);
  const [schoolForm, setSchoolForm] = useState<SchoolData>({ ...activeSchool });

  // School Search / Candidate Lookup State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SchoolCandidate[]>([]);
  const [searchNotice, setSearchNotice] = useState<string | null>(null);

  const handleOpenAddProfile = () => {
    const newProfile: TeacherProfile = {
      id: `prof-${Date.now()}`,
      name: '',
      nip: '',
      nuptk: '',
      status: 'PNS',
      defaultSubject: 'Bahasa Indonesia',
      defaultLevel: 'SD',
      schoolId: activeSchool.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProfileForm(newProfile);
    setIsEditingProfile(true);
  };

  const handleOpenEditProfile = (profile: TeacherProfile) => {
    setProfileForm({ ...profile });
    setIsEditingProfile(true);
  };

  const handleSaveProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      alert('Nama guru wajib diisi.');
      return;
    }
    onSaveProfile({
      ...profileForm,
      updatedAt: new Date().toISOString(),
    });
    setIsEditingProfile(false);
  };

  const handleSearchSchool = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const result = SchoolIdentityProvider.searchSchool(searchQuery);
    setSearchResults(result.candidates);
    setSearchNotice(result.message);
  };

  const handleSelectCandidate = (cand: SchoolCandidate) => {
    setSchoolForm((prev) => ({
      ...prev,
      name: cand.name,
      npsn: cand.npsn,
      address: cand.address,
      village: cand.village,
      district: cand.district,
      regency: cand.regency,
      province: cand.province,
      principalName: cand.principalName,
      principalNip: cand.principalNip,
    }));
    setSearchNotice(`Data dipilih dari: ${cand.source}. Silakan tinjau dan sesuaikan.`);
  };

  const handleSaveSchoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolForm.name.trim()) {
      alert('Nama sekolah wajib diisi.');
      return;
    }
    onSaveSchool({
      ...schoolForm,
      updatedAt: new Date().toISOString(),
    });
    setIsEditingSchool(false);
    setSearchQuery('');
    setSearchResults([]);
    setSearchNotice(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Instruction */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center">
                01
              </span>
              <h3 className="text-lg font-bold text-slate-900">Manajemen Profil Guru & Sekolah</h3>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Data profil guru dan identitas sekolah bersifat bersama (shared) untuk semua administrasi pembelajaran yang dibuat oleh guru ini.
            </p>
          </div>

          <button
            id="btn-add-new-profile"
            onClick={handleOpenAddProfile}
            className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Profil Guru</span>
          </button>
        </div>
      </div>

      {/* Grid: Profiles List & Active School Data */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Profiles List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Daftar Profil Guru ({profiles.length})</span>
            </h4>
            <span className="text-xs text-slate-400">Pilih guru untuk mengelola</span>
          </div>

          <div className="space-y-3">
            {profiles.map((p) => {
              const isSelected = p.id === activeProfileId;
              return (
                <div
                  key={p.id}
                  id={`profile-card-${p.id}`}
                  onClick={() => onSelectProfile(p.id)}
                  className={`p-4 rounded-2xl border transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-600/80 ring-2 ring-blue-600/20 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200/80 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base shrink-0 ${
                          isSelected
                            ? 'bg-blue-700 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {p.name.charAt(0).toUpperCase() || 'G'}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-bold text-slate-900 text-sm">{p.name}</h5>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">
                            {p.status}
                          </span>
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <Check className="w-3 h-3 text-emerald-600" /> Aktif
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 space-y-0.5">
                          <div>NIP: {p.nip || 'Belum diisi'}</div>
                          {p.nuptk && <div>NUPTK: {p.nuptk}</div>}
                          <div className="text-slate-600 font-medium pt-0.5">
                            Jenjang: {p.defaultLevel}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        id={`btn-edit-profile-${p.id}`}
                        onClick={() => handleOpenEditProfile(p)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        title="Edit Profil Guru"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {profiles.length > 1 && (
                        <button
                          id={`btn-delete-profile-${p.id}`}
                          onClick={() => {
                            if (confirm(`Apakah Anda yakin ingin menghapus profil "${p.name}"? Seluruh administrasi profil ini akan terhapus.`)) {
                              onDeleteProfile(p.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Hapus Profil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: School Data of Active Profile (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <School className="w-4 h-4 text-blue-600" />
              <span>Data Satuan Pendidikan</span>
            </h4>
            <button
              id="btn-edit-school"
              onClick={() => {
                setSchoolForm({ ...activeSchool });
                setIsEditingSchool(true);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Ubah Data Sekolah</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h5 className="font-bold text-slate-900 text-base">{activeSchool.name || 'Nama Sekolah Belum Diisi'}</h5>
              <p className="text-xs text-slate-500 mt-0.5">NPSN: {activeSchool.npsn || '-'}</p>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  {SchoolIdentityProvider.formatFullAddress(activeSchool)}
                </span>
              </div>

              <div className="flex items-start gap-2 pt-2 border-t border-slate-100">
                <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800">Kepala Sekolah:</div>
                  <div className="text-slate-900 font-medium">{activeSchool.principalName || '-'}</div>
                  <div className="text-slate-500">NIP: {activeSchool.principalNip || '-'}</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-[11px] text-slate-500">
              💡 <em>Data sekolah ini terikat secara otomatis pada dokumen administrasi dan kop/tanda tangan resmi.</em>
            </div>
          </div>

          {/* Next step CTA */}
          <button
            id="btn-next-to-academic"
            onClick={onNextStep}
            className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-950 text-white py-3 px-4 rounded-xl text-sm font-semibold shadow-sm transition cursor-pointer"
          >
            <span>Lanjut ke 02 Data Pembelajaran</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MODAL: Edit/Add Profile */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {profileForm.name ? 'Edit Profil Guru' : 'Tambah Profil Guru Baru'}
              </h3>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nama Lengkap & Gelar Guru <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-teacher-name"
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso, S.Pd."
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    NIP (Nomor Induk Pegawai)
                  </label>
                  <input
                    id="input-teacher-nip"
                    type="text"
                    placeholder="19850720 201001 1 015"
                    value={profileForm.nip}
                    onChange={(e) => setProfileForm({ ...profileForm, nip: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    NUPTK (Opsional)
                  </label>
                  <input
                    id="input-teacher-nuptk"
                    type="text"
                    placeholder="4538761234900021"
                    value={profileForm.nuptk || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, nuptk: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Status Guru
                  </label>
                  <select
                    id="select-teacher-status"
                    value={profileForm.status}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        status: e.target.value as TeacherProfile['status'],
                      })
                    }
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    <option value="PNS">PNS (Pegawai Negeri Sipil)</option>
                    <option value="PPPK">PPPK</option>
                    <option value="Guru Tetap Yayasan (GTY)">Guru Tetap Yayasan (GTY)</option>
                    <option value="Guru Tidak Tetap (GTT) / Honorer">Guru Tidak Tetap / Honorer</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Jenjang Utama
                  </label>
                  <select
                    id="select-teacher-level"
                    value={profileForm.defaultLevel}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        defaultLevel: e.target.value as 'SD' | 'SMP' | 'SMA' | 'SMK',
                      })
                    }
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    {EDUCATION_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Mata Pelajaran Utama (Default)
                </label>
                <input
                  id="input-teacher-subject"
                  type="text"
                  placeholder="Contoh: Bahasa Indonesia / Guru Kelas"
                  value={profileForm.defaultSubject}
                  onChange={(e) => setProfileForm({ ...profileForm, defaultSubject: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  id="btn-save-profile"
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 shadow-sm transition cursor-pointer"
                >
                  Simpan Profil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit School Data with SchoolIdentityProvider Lookup */}
      {isEditingSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Ubah Data Satuan Pendidikan & Kepala Sekolah</h3>
              <button
                onClick={() => {
                  setIsEditingSchool(false);
                  setSearchResults([]);
                  setSearchNotice(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* School Lookup Section */}
            <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-100 space-y-2">
              <label className="block text-xs font-bold text-blue-950 uppercase flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-blue-600" />
                <span>Cari / Lengkapi Otomatis dari Direktori Sekolah</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ketik nama sekolah atau NPSN (misal: SDN Karang Tengah, Menteng, Surabaya)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearchSchool();
                    }
                  }}
                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={() => handleSearchSchool()}
                  className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
                >
                  Cari
                </button>
              </div>

              {searchNotice && (
                <p className="text-[11px] text-blue-900 font-medium">{searchNotice}</p>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-1.5 pt-2 max-h-40 overflow-y-auto">
                  {searchResults.map((cand, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectCandidate(cand)}
                      className="p-2.5 rounded-lg bg-white border border-blue-200 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition flex items-start justify-between gap-2"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900">{cand.name}</div>
                        <div className="text-[11px] text-slate-500">
                          NPSN: {cand.npsn} • {cand.regency}, {cand.province}
                        </div>
                        <div className="text-[10px] text-blue-700">Kepsek: {cand.principalName}</div>
                      </div>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded shrink-0">
                        Gunakan Data
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleSaveSchoolSubmit} className="space-y-3.5 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nama Satuan Pendidikan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input-school-name"
                    type="text"
                    required
                    placeholder="SD Negeri 01 Nusantara"
                    value={schoolForm.name}
                    onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    NPSN
                  </label>
                  <input
                    id="input-school-npsn"
                    type="text"
                    placeholder="20234567"
                    value={schoolForm.npsn}
                    onChange={(e) => setSchoolForm({ ...schoolForm, npsn: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Alamat Jalan / Gedung
                </label>
                <input
                  id="input-school-address"
                  type="text"
                  placeholder="Jl. Merdeka Pendidikan No. 45"
                  value={schoolForm.address}
                  onChange={(e) => setSchoolForm({ ...schoolForm, address: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Desa / Kelurahan
                  </label>
                  <input
                    type="text"
                    placeholder="Sukamaju"
                    value={schoolForm.village}
                    onChange={(e) => setSchoolForm({ ...schoolForm, village: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Kecamatan
                  </label>
                  <input
                    type="text"
                    placeholder="Kecamatan Cerdas"
                    value={schoolForm.district}
                    onChange={(e) => setSchoolForm({ ...schoolForm, district: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Kabupaten / Kota
                  </label>
                  <input
                    type="text"
                    placeholder="Kabupaten Gemilang"
                    value={schoolForm.regency}
                    onChange={(e) => setSchoolForm({ ...schoolForm, regency: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Provinsi
                  </label>
                  <input
                    type="text"
                    placeholder="Jawa Barat"
                    value={schoolForm.province}
                    onChange={(e) => setSchoolForm({ ...schoolForm, province: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-3">
                <h6 className="text-xs font-bold text-slate-800 uppercase">Data Kepala Sekolah (Untuk Lembar Pengesahan)</h6>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nama & Gelar Kepala Sekolah
                    </label>
                    <input
                      id="input-principal-name"
                      type="text"
                      placeholder="Dra. Hj. Siti Rahmawati, M.Pd."
                      value={schoolForm.principalName}
                      onChange={(e) => setSchoolForm({ ...schoolForm, principalName: e.target.value })}
                      className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      NIP Kepala Sekolah
                    </label>
                    <input
                      id="input-principal-nip"
                      type="text"
                      placeholder="19680512 199303 2 004"
                      value={schoolForm.principalNip}
                      onChange={(e) => setSchoolForm({ ...schoolForm, principalNip: e.target.value })}
                      className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingSchool(false);
                    setSearchResults([]);
                    setSearchNotice(null);
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  id="btn-save-school"
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 shadow-sm transition cursor-pointer"
                >
                  Simpan Data Sekolah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
