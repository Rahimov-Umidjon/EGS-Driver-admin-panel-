import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    SlidersHorizontal,
    RotateCcw,
    X,
} from "lucide-react";
import api from "../../api/api.ts";
import QueueTable from "../../components/queueTable";
import ImageViewerModal from "../../components/ImageviewerModal";
import { useParams } from "react-router-dom";
import { BorderQueue } from "../../interface/index.ts";


type QueueStatistics =
    "bat_kaz_pending"
    | "bat_kaz_approved"
    | "bat_kaz_rejected"
    | "bat_kaz_payment_approved"
    | "bat_kaz_payment_uploaded"





// API dan qaytadigan pagination meta
interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}


const statisticsConfig: Record<QueueStatistics, { label: string; subClass: string }> = {
    bat_kaz_pending: { label: "Kutilmoqda", subClass: "text-blue-500" },
    bat_kaz_approved: { label: "Tasdiqlandi", subClass: "text-emerald-500" },
    bat_kaz_payment_uploaded: { label: "To‘lov yuklandi", subClass: "text-yellow-500" },
    bat_kaz_payment_approved: { label: "Hujjat yuklanmagan", subClass: "text-orange-500" },
    bat_kaz_rejected: { label: "Rad etildi", subClass: "text-red-500" },
};

const statsList = [
    "bat_kaz_pending",
    "bat_kaz_payment_approved",
    "bat_kaz_payment_uploaded",
    "bat_kaz_approved",
    "bat_kaz_rejected",

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
    polis: ImageItem[];
    cmr: ImageItem[];
    payment_check: ImageItem[];
    passport?: ImageItem[];
    driving_license?: ImageItem[];
    tex_passport?: ImageItem[];
};


export default function BakatQazAvtoJol() {
    const [currentPage, setCurrentPage] = useState(1);
    const [syncing, setSyncing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [statistics, setStatistics] = useState<Record<QueueStatistics, number> | null>(null);
    const [data, setData] = useState<BorderQueue[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedImages, setSelectedImages] =
        useState<SelectedImages | undefined>(undefined);
    const { status } = useParams();
    const [search, setSearch] = useState("");
    const [serviceId, setServiceId] = useState<number | null>(null)
    console.log("STATUS:", status);

    const handleOpenDocs = (item: BorderQueue) => {

        setSelectedImages({
            polis: item.files.filter((obj) => obj.type === 'polis'),
            cmr: item.files.filter((obj) => obj.type === 'cmr'),
            payment_check: item.files.filter((obj) => obj.type === 'payment_check'),
            passport: item.driver.document?.filter((obj) => obj.type === 'passport') ?? [],
            driving_license: item.driver.document?.filter((obj) => obj.type === 'driving_license') ?? [],
            tex_passport: item.driver.document?.filter((obj) => obj.type === 'tex_passport') ?? [],
        });

        setModalOpen(true);
        setServiceId(item?.id || null)
    };

    const handleSync = () => {
        setSyncing(true);
        void getQueue(currentPage);
        setTimeout(() => setSyncing(false), 1800);
    };

    const getQueue = async (page: number, searchValue = search) => {
        try {
            setLoading(true);
            const res = await api.get(`/admin/bakat-kazavtajuli${status === 'pending' ? '' : status === 'success' ? '/approved-history' : '/rejected-history'}`, {
                params: {
                    page,
                    // per_page: 10, // har sahifada nechta ko'rsatilsin
                    search: searchValue,
                }
            });

            const responseData = res.data.data;
            console.log(responseData);

            setData(responseData);
            setMeta({
                current_page: res?.data?.current_page,
                last_page: res?.data?.last_page,
                per_page: res?.data?.per_page,
                total: res?.data?.total,
                from: res?.data?.from,
                to: res?.data?.to,
            });
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };



    const getStatistics = async () => {

        try {
            const res = await api.get(`/admin/bakat-kazavtajuli/statistics`);

            setStatistics(res.data.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        void getQueue(currentPage);
    }, [currentPage, status]);

    useEffect(() => {
        void getStatistics();
    }, [status]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1);
            getQueue(1, search);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);


    return (
        <div className="min-h-screen overflow-y-auto scrollbar scrollbar-thumb-gray-400 scrollbar-thin scrollbar-track-gray-100 bg-[#f0f4f3] p-8 font-sans">
            <div className="mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-7">

                    <h1 className="text-[22px] font-bold text-gray-900 leading-tight">
                        Bakat QazAvtoJol
                    </h1>

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
                                        getQueue(1, "");
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
                    {statsList.map((stat: QueueStatistics, i) => (
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
                    <QueueTable
                        loading={loading}
                        data={data}
                        meta={meta}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        handleOpenDocs={(item: BorderQueue) => handleOpenDocs(item)}
                        refetch={() => getQueue(currentPage)}
                        type={'bakat-kazavtajuli'}

                    />
                )}
            </div>

            <ImageViewerModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                images={selectedImages}
                imgType={['polis', 'cmr', 'payment_check', 'passport', 'tex_passport', 'driving_license']}
                serviceId={serviceId}
                type={'bakatkazavtojuli'}
            />


        </div>
    );
}