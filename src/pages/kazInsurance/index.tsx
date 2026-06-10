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
import { BorderQueue } from "../../interface/index.ts";


type QueueStatistics =
    "queue_pending"
    | "queue_approved"
    | "queue_rejected"
    | "queue_waiting_payment"
    | "queue_payment_uploaded"





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
    queue_pending: { label: "Pending", subClass: "text-blue-500" },
    queue_approved: { label: "Approved", subClass: "text-emerald-500" },
    queue_payment_uploaded: { label: "Payment Uploaded", subClass: "text-yellow-500" },
    queue_waiting_payment: { label: "Waiting Payment", subClass: "text-orange-500" },
    queue_rejected: { label: "Rejected", subClass: "text-red-500" },
};

const statsList = [
    "queue_pending",
    "queue_approved",
    "queue_rejected",
    "queue_waiting_payment",
    "queue_payment_uploaded"
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
};


export default function KazInsurance() {
    const [currentPage, setCurrentPage] = useState(1);
    const [syncing, setSyncing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [statistics, setStatistics] = useState<Record<QueueStatistics, number> | null>(null);
    const [data, setData] = useState<BorderQueue[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedImages, setSelectedImages] =
        useState<SelectedImages | undefined>(undefined);
    const { status } = useParams(); // Agar URL parametrlari kerak bo'lsa, shu yerda olish mumkin

    console.log("STATUS:", status);

    const handleOpenDocs = (item: BorderQueue) => {

        setSelectedImages({
            polis: item.files.filter((obj) => obj.type === 'polis'),   // your API field
            cmr: item.files.filter((obj) => obj.type === 'cmr'),     // your API field
            payment_check: item.files.filter((obj) => obj.type === 'payment_check'),    // your API field
        });

        // console.log({
        //     polis: item.files.filter((obj) => obj.type === 'polis'),   // your API field
        //     cmr: item.files.filter((obj) => obj.type === 'cmr'),     // your API field
        //     chek: item.files.filter((obj) => obj.type === 'payment_check'),    // your API field
        // });
        setModalOpen(true);
    };

    const handleSync = () => {
        setSyncing(true);
        void getQueue(currentPage);
        setTimeout(() => setSyncing(false), 1800);
    };

    const getQueue = async (page: number) => {
        try {
            setLoading(true);
            // API ga page va per_page parametrlarini yuborish
            const res = await api.get(`/admin/queue${status === 'pending' ? '' : status === 'success' ? '/approved-history' : '/rejected-history'}`, {
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
            const res = await api.get(`/admin/queue/statistics`);

            setStatistics(res.data.data);
        } catch (error) {
            console.log(error);
        }
    };

    // Sahifa o'zgarganda qayta fetch qilish
    useEffect(() => {
        void getQueue(currentPage);
    }, [currentPage, status]);

    useEffect(() => {
        void getStatistics();
    }, [status]);


    return (
        <div className="min-h-screen bg-[#f0f4f3] p-8 font-sans">
            <div className="mx-auto">

                {/* Header */}
                <div className="flex items-start justify-between mb-7">
                    <div>
                        <h1 className="text-[22px] font-bold text-gray-900 leading-tight">
                            KazInsurance
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Review and validate incoming driver documents and payment proofs.
                        </p>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <button
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                            <SlidersHorizontal size={14} />
                            Filters
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
                            Sync Queue
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
                        type={'queue'}

                    />
                )}
            </div>

            <ImageViewerModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                images={selectedImages}
                imgType={['polis', 'cmr', 'payment_check']}
            />


        </div>
    );
}