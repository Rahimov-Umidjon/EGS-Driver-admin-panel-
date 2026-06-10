import {
  Calendar,
  CheckCircle,
  Circle,
  Loader2,
  Phone,
  Search,
  Truck,
  User,
  X,
  XCircle,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {useAuth} from "../../context/AuthContext.tsx";
import { useNavigate} from "react-router-dom";

interface Driver {
  id: number;
  is_verified?: string;          // "pending" | "approved" | "rejected"
  in_egs?: number;
  phone_number: string | string[];
  fio: string | null;
  number: string | null;
  source_db: string;
  is_existing_driver?: boolean;
  additional_info: string | null;
  last_login_at?: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
  is_online?: number;            // 0 / 1
  source: string;
  avatar?: string | null;
  length?: string;
  width?: string;
  height?: string;
  trailer_number?: string;
  capacity?: string;
  carrying?: string;
  brand?: string;
  condition?: number;
  type?: number;
  tex_passport?: string;
  photos?: string;
  employee_id?: number;
  rating?: number;
}

interface Pagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

interface DriversResponse {
  status: boolean;
  message: string;
  drivers: Driver[];
  pagination: Pagination;
}

const API_URL = 'https://mobile-test.izisol.uz/api/admin/all-drivers';

const Drivers: React.FC = () => {
  const [driversData, setDriversData] = useState<DriversResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [goToPageInput, setGoToPageInput] = useState('');


  const navigate = useNavigate();

  const { setDriverID } = useAuth()

  /* ---------- Debounced search ---------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const BEARER_TOKEN = localStorage.getItem('token');

      const url = `${API_URL}?page=${currentPage}&per_page=${perPage}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
      });

      if (!response.ok) {
        const txt = await response.text();
        throw new Error(`HTTP ${response.status}: ${txt}`);
      }

      const rawData = await response.json();

      // YANGI: drivers ni har doim massivga aylantirish
      let driversArray: Driver[] = [];

      if (rawData.drivers) {
        if (Array.isArray(rawData.drivers)) {
          driversArray = rawData.drivers;
        } else if (typeof rawData.drivers === 'object') {
          // Object bo'lsa, qiymatlarni olamiz
          driversArray = Object.values(rawData.drivers);
        }
      }

      const data: DriversResponse = {
        ...rawData,
        drivers: driversArray,
      };

      console.log('Drivers', data);

      setDriversData(data);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Haydovchilarni yuklashda xato';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  /* ---------- Helpers ---------- */
  const formatPhoneNumber = (phone: string | string[]): string => {
    if (Array.isArray(phone)) {
      if (phone.length === 0) return 'N/A';
      try {
        const parsed = JSON.parse(phone[0]);
        return Array.isArray(parsed) ? parsed[0] || 'N/A' : parsed || 'N/A';
      } catch {
        return phone[0] || 'N/A';
      }
    }
    return phone || 'N/A';
  };

  const filteredDrivers = useMemo(() => {
    if (!driversData?.drivers) return [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) return driversData.drivers;

    return driversData.drivers.filter((d) =>
      [
        d.fio?.toLowerCase(),
        formatPhoneNumber(d.phone_number).toLowerCase(),
        d.number?.toLowerCase(),
        d.source_db?.toLowerCase(),
        d.additional_info?.toLowerCase(),
        d.source?.toLowerCase(),
        d.brand?.toLowerCase(),
      ].some((f) => f?.includes(q))
    );
  }, [driversData, searchQuery]);

  console.log(filteredDrivers , 'filteredDrivers');

  const changePage = (page: number) => {
    const last = driversData?.pagination.last_page || 1;
    if (page >= 1 && page <= last) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGoToPage = () => {
    const p = parseInt(goToPageInput, 10);
    const last = driversData?.pagination.last_page || 1;
    if (!isNaN(p) && p >= 1 && p <= last) {
      setCurrentPage(p);
      setGoToPageInput('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPerPage = parseInt(e.target.value, 10);
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="bg-yellow-200 font-medium">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  /* ---------- Pagination UI ---------- */
  const renderPaginationButtons = () => {
    if (!driversData?.pagination) return null;
    const { current_page, last_page, total, per_page } = driversData.pagination;
    if (last_page <= 1) return null;

    const startRec = (current_page - 1) * per_page + 1;
    const endRec = Math.min(current_page * per_page, total);

    const buttons: React.ReactNode[] = [];

    // First / Prev
    buttons.push(
      <button
        key="first"
        onClick={() => changePage(1)}
        disabled={current_page === 1}
        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Birinchi
      </button>,
      <button
        key="prev"
        onClick={() => changePage(current_page - 1)}
        disabled={current_page === 1}
        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Oldingi
      </button>
    );

    // Page numbers (max 5 visible)
    const startP = Math.max(1, current_page - 2);
    const endP = Math.min(last_page, current_page + 2);
    if (startP > 1) buttons.push(<span key="dots1" className="px-2 py-1.5 text-slate-400">...</span>);
    for (let i = startP; i <= endP; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => changePage(i)}
          className={`px-3 py-1.5 rounded-lg border transition-colors ${i === current_page
            ? 'bg-blue-600 text-white border-blue-600'
            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
        >
          {i}
        </button>
      );
    }
    if (endP < last_page) buttons.push(<span key="dots2" className="px-2 py-1.5 text-slate-400">...</span>);

    // Next / Last
    buttons.push(
      <button
        key="next"
        onClick={() => changePage(current_page + 1)}
        disabled={current_page === last_page}
        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Keyingi
      </button>,
      <button
        key="last"
        onClick={() => changePage(last_page)}
        disabled={current_page === last_page}
        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Oxirgi
      </button>
    );

    return (
      <div className="flex flex-wrap items-center justify-between gap-4 mt-6 px-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">
            Ko'rsatilmoqda {startRec}-{endRec} / {total}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Sahifada:</span>
          <select
            value={perPage}
            onChange={handlePerPageChange}
            className="p-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
          >
            {[10, 20, 50, 100, 300].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {buttons}
          <input
            type="number"
            value={goToPageInput}
            onChange={(e) => setGoToPageInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleGoToPage()}
            placeholder="Sahifa..."
            className="w-20 p-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            onClick={handleGoToPage}
            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            O'tish
          </button>
        </div>
      </div>
    );
  };

  /* ---------- Loading / Error ---------- */
  if (loading && !driversData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md mx-auto p-6">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Haydovchilar yuklanmoqda
          </h2>
          <p className="text-slate-600">Iltimos, kuting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Xatolik yuz berdi
          </h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={fetchDrivers}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Qayta urinish
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Main UI ---------- */
  return (
    <div className="min-h-screen px-6 pt-6 pb-10">
      <div className="w-full">
        <div className={'flex justify-between items-center '}>
            <div className="mb-8 w-1/2">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">
                Haydovchilar
            </h1>
            <p className="text-slate-600">
                Jami {driversData?.pagination.total || 0} ta haydovchi
            </p>
        </div>
            {/* Search */}
            <div className="mb-6 flex items-center gap-3  w-1/2  mx-auto relative ">
                <Search className="w-5 h-5 text-slate-500 flex-shrink-0" />
                <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="FIO, telefon, raqam, manba, brend bo'yicha qidirish..."
                    className="w-full p-2.5 border border-slate- 200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white shadow-sm"
                />
                {searchInput && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-2 p-1 text-slate-500 hover:text-slate-700"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
          <table className="w-full border-collapse">
            <thead className="bg-slate-100 sticky top-0 z-10">
              <tr>
                {[
                  { label: 'ID', w: 'w-16' },
                  { label: 'Avatar', w: 'w-20' },
                  { label: 'FIO', w: 'w-48' },
                  { label: 'Telefon', w: 'w-36' },
                  { label: 'Raqam', w: 'w-32' },
                  // { label: 'Manba DB', w: 'w-28' },
                  { label: 'Online', w: 'w-20' },
                  { label: 'Tasdiqlash', w: 'w-28' },
                  { label: 'Brend', w: 'w-32' },
                  // { label: 'Qoshimcha', w: 'w-48' },
                  { label: 'Oxirgi kirish', w: 'w-40' },
                  { label: 'Yaratilgan', w: 'w-40' },
                  { label: 'Manba', w: 'w-24' },
                  { label: 'Batafsil', w: 'w-24' },
                ].map((h, i) => (
                  <th
                    key={i}
                    className={`px-3 py-3 text-left text-xs font-semibold text-slate-700 ${h.w} border-b border-slate-200`}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.length > 0 ? (
                filteredDrivers.map((d, idx) => (
                  <tr
                      key={`${d.number}-${idx}`}
                    className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                      }`}
                  >

                    {/* ID */}
                    <td className="px-3 py-2 text-sm text-slate-600">{(currentPage-1)*perPage+idx+1}</td>

                    {/* Avatar */}
                    <td className="px-3 py-2">
                      {d.avatar ? (
                        <img
                          src={d.avatar}
                          alt="avatar"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                          <User className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                    </td>

                    {/* FIO */}
                    <td className="px-3 py-2 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        {highlightText(d.fio || 'Nomalum111', searchQuery)}
                      </div>
                    </td>

                    {/* Telefon */}
                    <td className="px-3 py-2 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        {highlightText(formatPhoneNumber(d.phone_number), searchQuery)}
                      </div>
                    </td>

                    {/* Raqam */}
                    <td className="px-3 py-2 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Truck className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        {highlightText(d.number || 'N/A', searchQuery)}
                      </div>
                    </td>

                    {/* Manba DB */}
                    {/*<td className="px-3 py-2 text-sm text-slate-600">*/}
                    {/*  <div className="flex items-center gap-1">*/}
                    {/*    <Database className="w-4 h-4 text-slate-400 flex-shrink-0" />*/}
                    {/*    {highlightText(d.source_db, searchQuery)}*/}
                    {/*  </div>*/}
                    {/*</td>*/}

                    {/* Online */}
                    <td className="px-3 py-2 text-center">
                      {d.is_online === 1 ? (
                        <Circle className="w-5 h-5 text-green-500 fill-current" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300" />
                      )}
                    </td>

                    {/* Tasdiqlash */}
                    <td className="px-3 py-2 text-center">
                      {d.is_verified === 'approved' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : d.is_verified === 'rejected' ? (
                        <XCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <span className="text-xs text-amber-600">Kutilmoqda</span>
                      )}
                    </td>

                    {/* Brend */}
                    <td className="px-3 py-2 text-sm text-slate-600">
                      {highlightText(d.brand || '-', searchQuery)}
                    </td>

                    {/* Qo'shimcha */}
                    {/*<td className="px-3 py-2 text-sm text-slate-600">*/}
                    {/*  <div className="flex items-center gap-1">*/}
                    {/*    <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />*/}
                    {/*    {highlightText(d.additional_info || 'Yo\'q', searchQuery)}*/}
                    {/*  </div>*/}
                    {/*</td>*/}

                    {/* Oxirgi kirish */}
                    <td className="px-3 py-2 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        {d.last_login_at
                          ? new Date(d.last_login_at).toLocaleString('uz-UZ')
                          : '-'}
                      </div>
                    </td>

                    {/* Yaratilgan */}
                    <td className="px-3 py-2 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        {new Date(d.created_at).toLocaleString('uz-UZ')}
                      </div>
                    </td>

                    {/* Manba */}
                    <td className="px-3 py-2 text-sm text-slate-600">
                      {highlightText(d.source, searchQuery)}
                    </td>

                      {/* BAtafsil */}
                    <td className="px-3 py-2 text-sm text-slate-600">
                      <button onClick={()=> {
                          if (typeof d.phone_number === "string") {
                              setDriverID(d.phone_number)

                          }
                          else if (typeof d.number === "string") {
                              setDriverID(d.number)
                          }
                          navigate('/newMap')
                      }} className={'px-3 py-1 text-white text-sm rounded-md transition-colors flex items-center gap-2 bg-blue-600 hover:bg-blue-700'}>
                          Ko'rish
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={13} className="px-4 py-6 text-center text-slate-500">
                    Haydovchilar topilmadi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {renderPaginationButtons()}
      </div>
    </div>
  );
};

export default Drivers;