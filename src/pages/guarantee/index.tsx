import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    SlidersHorizontal,
    RotateCcw,
} from "lucide-react";
import api from "../../api/api.ts";
import QueueTable from "../../components/queueTable";
import ImageViewerModal from "../../components/ImageviewerModal";
import { useParams } from "react-router-dom";
import { BorderQueue, File } from "../../interface/index.ts";


type KazEPIStatistics = "kaz_epi_pending" | "kaz_epi_approved" | "kaz_epi_rejected" | "kaz_epi_waiting_payment" | "kaz_epi_payment_uploaded"



type SelectedImages = {
    invoice: File[];
    packing_list: File[];
    export_declaration: File[];

    ct1: File[];
    fito: File[];
    obshiy_forma: File[];
    forma_a: File[];
    cmr: File[];
    payment_check: File[];
};







// API dan qaytadigan pagination meta
interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}


const statisticsConfig: Record<KazEPIStatistics, { label: string; subClass: string }> = {
    guarantee_pending: { label: "Kutilmoqda", subClass: "text-blue-500" },
    guarantee_approved: { label: "Tasdiqlandi", subClass: "text-emerald-500" },
    guarantee_payment_uploaded: { label: "To‘lov yuklandi", subClass: "text-yellow-500" },
    guarantee_payment_approved: { label: "Hujjat yuklanmagan", subClass: "text-orange-500" },
    guarantee_rejected: { label: "Rad etildi", subClass: "text-red-500" },
};

const statsList = [
    "guarantee_pending",
    "guarantee_payment_approved",
    "guarantee_payment_uploaded",
    "guarantee_approved",
    "guarantee_rejected",
] as const;


export default function Guarantee() {
    const [currentPage, setCurrentPage] = useState(1);
    const [syncing, setSyncing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [statistics, setStatistics] = useState<Record<KazEPIStatistics, number> | null>(null);
    const [data, setData] = useState<BorderQueue[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedImages, setSelectedImages] = useState<SelectedImages | undefined>(undefined);

    const { status: statusUrl } = useParams(); // Agar URL parametrlari kerak bo'lsa, shu yerda olish mumkin




    const handleOpenDocs = (item: BorderQueue) => {
        setSelectedImages({
            invoice: item.files.filter((obj) => obj.type === 'invoice'),   // your API field
            packing_list: item.files.filter((obj) => obj.type === 'packing_list'),   // your API field
            export_declaration: item.files.filter((obj) => obj.type === 'export_declaration'),   // your API field

            ct1: item.files.filter((obj) => obj.type === 'ct1'),   // your API field
            fito: item.files.filter((obj) => obj.type === 'fito'),   // your API field
            obshiy_forma: item.files.filter((obj) => obj.type === 'obshiy_forma'),   // your API field
            forma_a: item.files.filter((obj) => obj.type === 'forma_a'),   // your API field
            cmr: item.files.filter((obj) => obj.type === 'cmr'),     // your API field
            payment_check: item.files.filter((obj) => obj.type === 'payment_check'),    // your API field
        });
        setModalOpen(true);
    };

    const handleSync = () => {
        setSyncing(true);
        void getGuarantees(currentPage);
        setTimeout(() => setSyncing(false), 1800);
    };

    const getGuarantees = async (page: number) => {
        try {
            setLoading(true);
            // API ga page va per_page parametrlarini yuborish
            const res = await api.get(`/admin/guarantee${statusUrl === 'pending' ? '' : statusUrl === 'success' ? '/approved-history' : '/rejected-history'}`, {
                params: {
                    page,
                    // per_page: 10, // har sahifada nechta ko'rsatilsin
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
            const res = await api.get(`/admin/guarantee/statistics`);
            setStatistics(res.data.data);
        } catch (error) {
            console.log(error);
        }
    };

    // Sahifa o'zgarganda qayta fetch qilish
    useEffect(() => {
        void getGuarantees(currentPage);
    }, [currentPage, statusUrl]);

    useEffect(() => {
        void getStatistics();
    }, []);



    return (
        <div className="min-h-screen bg-[#f0f4f3] p-8 font-sans">
            <div className="mx-auto">

                {/* Header */}
                <div className="flex items-start justify-between mb-7">
                    <h1 className="text-[22px] font-bold text-gray-900 leading-tight">
                        Kafolat
                    </h1>
                    <div className="flex items-center gap-2.5">
                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                            <SlidersHorizontal size={14} />
                            Ma'lumotllarni saralash 
                        </button>
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
                    {statsList.map((stat: KazEPIStatistics, i) => (
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
                        type={'guarantee'}
                        loading={loading}
                        data={data}
                        meta={meta}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        handleOpenDocs={(item: BorderQueue) => handleOpenDocs(item)}
                        refetch={() => getGuarantees(currentPage)}
                    />
                )}
            </div>

            <ImageViewerModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                images={selectedImages}
                type={'guarantee'}
                imgType={['invoice', 'cmr', 'packing_list', 'export_declaration', 'ct1', 'fito', 'obshiy_forma', 'forma_a', 'payment_check']}
            />


        </div>
    );
}