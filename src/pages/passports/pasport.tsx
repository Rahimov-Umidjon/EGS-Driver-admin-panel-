import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    SlidersHorizontal,
    RotateCcw,
    X, 
} from "lucide-react";
import api from "../../api/api.ts";
import ImageViewerModal from "../../components/ImageviewerModal";
import { useParams } from "react-router-dom";
import { Driver } from "../../interface/index.ts";
import PassportTable from "../../components/PassportTable/index.tsx";


type DriverStatistics =
    "driver_rejected"
    | "driver_pending"
    | "driver_inprogress"
    | "driver_completed"
// | "driver_cancelled"





// API dan qaytadigan pagination meta
interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}


const statisticsConfig: Record<DriverStatistics, { label: string; subClass: string }> = {
    driver_pending: { label: "Hammasi", subClass: "text-blue-500" },
    driver_completed: { label: "Tasdiqlandi", subClass: "text-emerald-500" },
    driver_inprogress: { label: "tasdiqlash kutilmoqda", subClass: "text-yellow-500" },
    // driver_cancelled: { label: "Hujjat yuklanmagan", subClass: "text-orange-500" },
    driver_rejected: { label: "Rad etildi", subClass: "text-red-500" },
};

const statsList = [
    "driver_rejected",
    "driver_pending",
    "driver_inprogress",
    "driver_completed",
    // "driver_cancelled"
] as const;



export interface ImageItem {
    id: number;
    queue_id: number;
    path: string;
    status: string;
    created_at: string;
    updated_at: string;
    type: string;
}


type SelectedImages = {
    driving_license: ImageItem[];
    passport: ImageItem[];
    tex_passport: ImageItem[];
};


export default function Passport() {
    const [currentPage, setCurrentPage] = useState(1);
    const [syncing, setSyncing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [statistics, setStatistics] = useState<Record<DriverStatistics, number> | null>(null);
    const [data, setData] = useState<Driver[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedImages, setSelectedImages] =
        useState<SelectedImages | undefined>(undefined);
    const { status } = useParams(); // Agar URL parametrlari kerak bo'lsa, shu yerda olish mumkin

    const [search, setSearch] = useState("");

    console.log("STATUS:", selectedImages);

    const handleOpenDocs = (item: Driver) => {

        setSelectedImages({
            driving_license: item?.documents?.filter((obj) => obj.type === 'driving_license') || [],
            tex_passport: item?.documents?.filter((obj) => obj.type === 'tex_passport') || [],
            passport: item?.documents?.filter((obj) => obj.type === 'passport') || [],
        });

        setModalOpen(true);
    };

    const handleSync = () => {
        setSyncing(true);
        void getDriverVerify(currentPage);
        setTimeout(() => setSyncing(false), 1800);
    };

    const getDriverVerify = async (page: number, searchValue = search) => {
        try {
            setLoading(true);

            const res = await api.get(`/admin/driver-verify`, {
                params: {
                    page,
                    search: searchValue,
                }
            });

            const responseData = res.data.data;

            setData(responseData);
            setMeta({
                current_page: res?.data?.data.current_page,
                last_page: res?.data?.data?.last_page,
                per_page: res?.data?.data?.per_page,
                total: res?.data?.data?.total,
                from: res?.data?.data?.from,
                to: res?.data?.data?.to,
            });
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };



    const getStatistics = async () => {
        try {
            const res = await api.get(`/admin/driver-verify/statistics`);
            setStatistics(res.data.data);
        } catch (error) {
            console.log(error);
        }
    };

    // Sahifa o'zgarganda qayta fetch qilish
    useEffect(() => {
        void getDriverVerify(currentPage);
    }, [currentPage, status]);

    useEffect(() => {
        void getStatistics();
    }, [status]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1);
            getDriverVerify(1, search);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);



    return (
        <div className="min-h-screen overflow-y-auto scrollbar scrollbar-thumb-gray-400 scrollbar-thin scrollbar-track-gray-100 bg-[#f0f4f3] p-8 font-sans">
            <div className="mx-auto">

                {/* Header */}
                <div className="flex items-start justify-between mb-7">
                    <div>
                        <h1 className="text-[22px] font-bold text-gray-900 leading-tight">
                            Haydovchini tekshirish
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {/* Review and validate incoming driver documents and payment proofs. */}
                        </p>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Haydovchi qidirish..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-96 pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />

                            {search ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch("");
                                        setCurrentPage(1);
                                        getDriverVerify(1, "");
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            ) : (
                                <SlidersHorizontal
                                    size={16}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                            )}
                        </div>
                        <motion.button
                            onClick={handleSync}
                            whileTap={{ scale: 0.97 }}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors"
                        >
                            <motion.span
                                animate={syncing ? { rotate: 360 } : { rotate: 0 }}
                                transition={syncing ? { repeat: Infinity, duration: 0.8, ease: "linear" } : {}}
                            >
                                <RotateCcw size={14} />
                            </motion.span>
                            Ma'lumotlarni yangilash
                        </motion.button>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-5 gap-3.5 mb-5">
                    {statsList.map((stat: DriverStatistics, i) => (
                        <motion.div
                            key={statisticsConfig[stat].label}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07, duration: 0.35 }}
                            className="bg-white rounded-2xl p-5 shadow-sm"
                        >
                            <p className={`text-[10.5px] font-semibold tracking-widest uppercase mb-2.5 ${statisticsConfig[stat].subClass}`}>
                                {statisticsConfig[stat].label}
                            </p>
                            <div className="flex items-baseline gap-2.5">
                                <span className="text-[28px] font-bold text-gray-900 leading-none">
                                    {statistics ? statistics[stat] : '—'}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Table Card */}
                {meta && data && (
                    <PassportTable
                        loading={loading}
                        data={data}
                        meta={meta}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        handleOpenDocs={(item: Driver) => handleOpenDocs(item)}
                        refetch={() => getDriverVerify(currentPage)}
                        type={'passport'}

                    />
                )}
            </div>

            <ImageViewerModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                images={selectedImages}
                imgType={['tex_passport', 'driving_license', 'passport']}
            />


        </div>
    );
}