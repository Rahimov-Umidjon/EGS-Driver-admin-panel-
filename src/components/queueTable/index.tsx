import { motion } from "framer-motion";
import { Check, CheckCircle2, Clock, RefreshCw, XCircle } from "lucide-react";
import { ChangeEvent, Dispatch, ReactNode, SetStateAction, useState } from "react";

import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import FolderIcon from '@mui/icons-material/Folder';
import { Button, TextField } from "@mui/material";
import api from "../../api/api.ts";
import RejectModal from "../RejectModal";
import { toast } from "react-toastify";
import FileUploadModal from "../fileUploadModal";
import EmailIcon from '@mui/icons-material/Email';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ConfirmModal from "../confirmModal/index.tsx";
import { BorderQueue } from "../../interface/index.ts";



// API dan qaytadigan pagination meta
interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}


interface Column {
    id: 'id' | 'driver' | 'documents' | 'status' | 'border_name' | 'date' | 'cmr' | 'action' | 'duration' | 'insurance_type' | 'country' | 'bakat_kazavtajuli_type' | 'authorize_payment' | 'external_id' | 'time' | 'price';
    label: string;
    minWidth?: number;
    align?: 'left';
    format?: (value: number) => string;
    render?: (row: any) => React.ReactNode;
}


// const columns: readonly Column[] = [
//     { id: 'id', label: 'ID', minWidth: 170 },
//     { id: 'driver', label: 'DRIVER INFORMATION', minWidth: 100 },
//     {
//         id: 'documents',
//         label: 'Hujjatlar',
//         minWidth: 170,
//         align: 'left',
//         format: (value: number) => value.toLocaleString('en-US')
//     },
//     {
//         id: 'status',
//         label: 'To‘lov',
//         minWidth: 170,
//         align: 'left',
//         format: (value: number) => value.toLocaleString('en-US')
//     },
//     {
//         id: 'border_name',
//         label: "Navbat ma'lumotlari",
//         minWidth: 170,
//         align: 'left',
//         format: (value: number) => value.toFixed(2)
//     },
//     { id: 'cmr', label: "Cmr", minWidth: 170, align: 'left', format: (value: number) => value.toFixed(2) },
//     { id: 'date', label: "Vaqt", minWidth: 170, align: 'left', format: (value: number) => value.toFixed(2) },
//     { id: 'action', label: "Amallar", minWidth: 170, align: 'left', format: (value: number) => value.toFixed(2) },
// ];








const statusConfig: Record<Status, { label: string; classes: string; icon: ReactNode }> = {
    pending: {
        label: "Kutilmoqda",
        classes: "bg-yellow-50 text-yellow-800 ring-1 ring-yellow-200",
        icon: <Clock size={11} className="text-yellow-500" />,
    },
    pending_review: {
        label: "Ko‘rib chiqilmoqda",
        classes: "bg-blue-50 text-blue-800 ring-1 ring-blue-200",
        icon: <RefreshCw size={11} className="text-blue-500" />,
    },
    payment_uploaded: {
        label: "To‘lov yuklandi",
        classes: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
        icon: <CheckCircle2 size={11} className="text-amber-600" />,
    },
    payment_approved: {
        label: "To‘lov tasdiqlandi",
        classes: "bg-teal-50 text-teal-800 ring-1 ring-teal-200",
        icon: <CheckCircle2 size={11} className="text-teal-600" />,
    },
    payment_rejected: {
        label: "To‘lov rad etildi",
        classes: "bg-red-50 text-red-800 ring-1 ring-red-200",
        icon: <XCircle size={11} className="text-red-600" />,
    },
    waiting_payment: {
        label: "To‘lov kutilmoqda",
        classes: "bg-fuchsia-50 text-fuchsia-800 ring-1 ring-fuchsia-200",
        icon: <XCircle size={11} className="text-fuchsia-600" />,
    },
    approved: {
        label: "Tasdiqlandi",
        classes: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
        icon: <CheckCircle2 size={11} className="text-emerald-500" />,
    },
    rejected: {
        label: "Rad etildi",
        classes: "bg-red-50 text-red-800 ring-1 ring-red-200",
        icon: <XCircle size={11} className="text-red-500" />,
    },
    cancelled: {
        label: "Bekor qilindi",
        classes: "bg-gray-50 text-gray-700 ring-1 ring-gray-200",
        icon: <XCircle size={11} className="text-gray-500" />,
    },
};

type Status =
    | 'pending'
    | 'pending_review'
    | 'waiting_payment'
    | 'payment_uploaded'
    | 'payment_approved'
    | 'approved'
    | 'rejected'
    | 'payment_rejected'
    | 'cancelled';




interface QueueTableProps {
    loading: boolean;
    data: BorderQueue[];
    meta: PaginationMeta;
    setCurrentPage: Dispatch<SetStateAction<number>>; 
    currentPage: number;
    handleOpenDocs: (item: BorderQueue) => void;
    refetch: () => void;
    type: 'queue' | 'kazepi' | 'uzepi' | 'russia-queue' | 'insurance' | 'guarantee' | 'bakat-kazavtajuli';
}




function QueueTable({ type, data, handleOpenDocs, refetch, setCurrentPage  }: QueueTableProps) {





    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [rejectModal, setRejectModal] = useState<{
        open: boolean;
        type: "queue" | "payment" | "kazepi" | "uzepi" | "russia-queue" | "guarantee" | "insurance" | 'bakat-kazavtajuli' | null;
    }>({ open: false, type: null });
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [comment, setComment] = useState<string>("");
    const [externalId, setExternalId] = useState<string>("");
    const navigate = useNavigate();

    const [confirmModal, setConfirmModal] = useState<{
        open: boolean;
        title: string;
        description: string;
        confirmColor: "success" | "error";
        confirmLabel: string;
        onConfirm: () => void;
    }>({
        open: false,
        title: "",
        description: "",
        confirmColor: "success",
        confirmLabel: "Tasdiqlash",
        onConfirm: () => { },
    });

    const openConfirm = (config: Omit<typeof confirmModal, "open">) => {
        setConfirmModal({ open: true, ...config });
    };

    const closeConfirm = () => {
        setConfirmModal(prev => ({ ...prev, open: false }));
    };





    const handleConfirmReject = async (comment: string, id: number) => {
        const endpoint =
            rejectModal.type === "payment"
                ? `/admin/${type}/${id}/reject-payment`
                : `/admin/${type}/${id}/reject`;
        try {
            await api.post(endpoint, { comment });
            toast.success("Navbat bekor qilindi");
            refetch()

        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                toast.error(error?.response?.data?.message || "Ma'lumotlarni olishda xatolik");
            } else {
                toast.error("Ma'lumotlarni olishda xatolik");
            }
        }
    };


    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
        setCurrentPage(newPage + 1);
        console.log(newPage + 1);
    };

    const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };





    const handleConfirmPolis = async (id: number) => {
        try {
            const res = await api.post(`/admin/${type}/${id}/waiting-payment`)
            console.log(res)
            toast.success("File tasdiqlandi");
            refetch()

        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                toast.error(e?.response?.data.message || "Ma'lumotlarni olishda xatolik");
            } else {
                toast.error("Ma'lumotlarni olishda xatolik");
            }
        }
    }
    const handleRejectedPolis = async (id: number) => {
        try {
            const res = await api.post(`/admin/${type}/${id}/cancelled`)
            console.log(res)
            toast.success("File tasdiqlanmadi");
            refetch()

        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                toast.error(e?.response?.data.message || "Ma'lumotlarni olishda xatolik");
            } else {
                toast.error("Ma'lumotlarni olishda xatolik");
            }
        }
    }

    const handleConfirmPayment = async (id: number) => {
        try {
            const res = await api.post(`/admin/${type}/${id}/approve-payment`)
            console.log(res)
            toast.success("Check tasdiqlandi");
            refetch()

        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                toast.error(e?.response?.data.message || "Ma'lumotlarni olishda xatolik");
            } else {
                toast.error("Ma'lumotlarni olishda xatolik");
            }
        }
    }
    const handleRejectedPayment = async (id: number) => {
        try {
            const res = await api.post(`/admin/${type}/${id}/reject-payment`)
            console.log(res)
            toast.success("Check tasdiqlanmadi");
            refetch()

        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                toast.error(e?.response?.data.message || "Ma'lumotlarni olishda xatolik");
            } else {
                toast.error("Ma'lumotlarni olishda xatolik");
            }
        }
    }

    const handleConfirmExternalId = async (id: number, external_id: string) => {
        try {
            const res = await api.post(`/admin/add-queue-service-id`, {
                driver_id: id,
                external_id
            })
            console.log(res)
            toast.success("ID tasdiqlandi");
            setExternalId('')
            refetch()
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                toast.error(e?.response?.data.message || "Ma'lumotlarni olishda xatolik");
            } else {
                toast.error("Ma'lumotlarni olishda xatolik");
            }
        }
    }





    const columnsConfig: Record<'queue' | 'kazepi' | 'uzepi' | 'russia_queue' | 'insurance' | 'guarantee' | 'bakat_kazavtajuli', Column[]> = {
        queue: [
            {
                id: "id",
                label: "ID",
                minWidth: 100,
                render: (row: BorderQueue) => row.id,
            },
            {
                id: "external_id",
                label: "Tashqi ID",
                minWidth: 60,
                render: (row: BorderQueue) => (
                    <div className={'flex items-center gap-2 min-w-[150px] '}>
                        <TextField

                            variant="standard"
                            label="Tashqi ID"
                            value={row?.driver?.external_id}
                            onChange={(e) => setExternalId(e.target.value)}

                        />
                        <Button
                            sx={{
                                height: 30
                            }}
                            variant="contained" color="success" size="small"
                            onClick={() => handleConfirmExternalId(row?.driver?.id, externalId)}
                        >
                            <Check />
                        </Button>
                    </div>
                ),
            },

            {
                id: "driver",
                label: "Haydovchi malumotlari",
                minWidth: 250,
                render: (row: BorderQueue) => (
                    <div>
                        <p className="text-[13.5px] font-semibold text-gray-900">
                            {row?.driver?.fio}
                        </p>
                        <p className="text-[11.5px] text-gray-400 mt-0.5">
                            {row?.driver?.phone_number}
                        </p>
                    </div>
                ),
            },

            {
                id: "documents",
                label: "Hujjatlar",
                minWidth: 200,
                render: (row: BorderQueue) => (
                    <div className={'flex items-center gap-x-2'}>
                        <Button onClick={() => handleOpenDocs(row)} variant={'outlined'} color={'info'}
                            className={'py-1 px-2 border w-max   cursor-pointer'}>
                            <FolderIcon color={'info'} />
                            <p className={'ml-2'}>{row?.files.filter((obj) => obj.type !== 'payment_check').length}</p>
                        </Button>

                        {/* pending_review uchun */}
                        {row.status === 'pending_review' && (
                            <div className="flex flex-col gap-y-2">
                                <Button
                                    variant="contained" color="success" size="small"
                                    onClick={() => openConfirm({
                                        title: "Hujjatni tasdiqlash",
                                        description: "Haqiqatdan ham ushbu hujjatni tasdiqlaysizmi?",
                                        confirmColor: "success",
                                        confirmLabel: "Tasdiqlash",
                                        onConfirm: () => { handleConfirmPolis(row.id); closeConfirm(); },
                                    })}
                                >
                                    Tasdiqlash
                                </Button>
                                <Button
                                    className={"whitespace-nowrap"}
                                    variant="contained" color="error" size="small"
                                    onClick={() => openConfirm({
                                        title: "Hujjatni bekor qilish",
                                        description: "Haqiqatdan ham ushbu hujjatni bekor qilasizmi?",
                                        confirmColor: "error",
                                        confirmLabel: "Bekor qilish",
                                        onConfirm: () => { handleRejectedPolis(row.id); closeConfirm(); },
                                    })}
                                >
                                    Bekor qilish
                                </Button>
                            </div>
                        )}
                    </div>
                ),
            },

            {
                id: "status",
                label: "To'lov holati",
                minWidth: 180,
                render: (row: BorderQueue) => {
                    const cfg = statusConfig[row.status];

                    return (
                        <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold ${cfg?.classes}`}
                        >
                            {cfg?.icon}
                            {cfg?.label}
                        </span>
                    );
                },
            },

            {
                id: "border_name",
                label: "Navbat ma'lumotlari",
                minWidth: 180,
                render: (row: BorderQueue) => (
                    <p className="text-[13.5px] font-medium text-gray-800">
                        {row.border_name}
                    </p>
                ),
            },

            {
                id: "time",
                label: "Vaqt oralig'i",
                minWidth: 180,
                render: (row: BorderQueue) => (
                    <p className="text-[13.5px] font-medium text-gray-800">
                        {row?.time_from?.slice(0, 5) + " - " + row?.time_to?.slice(0, 5)}
                    </p>
                ),
            },

            {
                id: "cmr",
                label: "CMR",
                minWidth: 200,
                render: (row: BorderQueue) => (
                    <div className={'flex items-center gap-x-2'}>
                        <Button onClick={() => handleOpenDocs(row)} variant={'outlined'} color={'info'}
                            className={'py-1 px-2 border w-max   cursor-pointer'}>
                            <FolderIcon color={'info'} />
                            <p className={'ml-2'}>{row?.files.filter((obj) => obj.type === 'payment_check').length}</p>
                        </Button>

                        {/* payment_uploaded uchun */}
                        {row.status === 'payment_uploaded' && (
                            <div className="flex flex-col gap-y-2">
                                <Button
                                    variant="contained" color="success" size="small"
                                    onClick={() => openConfirm({
                                        title: "To'lovni tasdiqlash",
                                        description: "Haqiqatdan ham ushbu to'lovni tasdiqlaysizmi?",
                                        confirmColor: "success",
                                        confirmLabel: "Tasdiqlash",
                                        onConfirm: () => { handleConfirmPayment(row.id); closeConfirm(); },
                                    })}
                                >
                                    Tasdiqlash
                                </Button>
                                <Button
                                    className={"whitespace-nowrap"}
                                    variant="contained" color="error" size="small"
                                    onClick={() => openConfirm({
                                        title: "To'lovni rad etish",
                                        description: "Haqiqatdan ham ushbu to'lovni rad etasizmi?",
                                        confirmColor: "error",
                                        confirmLabel: "Rad etish",
                                        onConfirm: () => { handleRejectedPayment(row.id); closeConfirm(); },
                                    })}
                                >
                                    Bekor qilish
                                </Button>
                            </div>
                        )}
                    </div>

                ),
            },

            {
                id: "date",
                label: "Vaqt",
                minWidth: 170,
                render: (row: BorderQueue) => row.date,
            },

            {
                id: "action",
                label: "Amallar",
                minWidth: 250,
                render: (row: BorderQueue) => (
                    <div className="flex gap-x-2 items-center">
                        <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => {
                                setSelectedId(row.id);
                                setIsOpen(true);
                            }}
                        >
                            Tasdiqlash
                        </Button>

                        <Button
                            className={"whitespace-nowrap"}
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => {
                                setSelectedId(row.id);
                                setRejectModal({
                                    open: true,
                                    type,
                                });
                            }}
                        >
                            Bekor qilish
                        </Button>

                        <Button
                            variant="outlined"
                            color="info"
                            onClick={() => navigate(`/chats/${row?.driver?.id}`)}
                        >
                            <EmailIcon />
                        </Button>
                    </div>
                ),
            },
        ],
        russia_queue: [
            {
                id: "id",
                label: "ID",
                minWidth: 100,
                render: (row: BorderQueue) => row.id,
            },

            {
                id: "driver",
                label: "Haydovchi malumotlari",
                minWidth: 250,
                render: (row: BorderQueue) => (
                    <div>
                        <p className="text-[13.5px] font-semibold text-gray-900">
                            {row?.driver?.fio}
                        </p>
                        <p className="text-[11.5px] text-gray-400 mt-0.5">
                            {row?.driver?.phone_number}
                        </p>
                    </div>
                ),
            },

            {
                id: "documents",
                label: "Hujjatlar",
                minWidth: 200,
                render: (row: BorderQueue) => (
                    <div className={'flex items-center gap-x-2'}>
                        <Button onClick={() => handleOpenDocs(row)} variant={'outlined'} color={'info'}
                            className={'py-1 px-2 border w-max cursor-pointer'}>
                            <FolderIcon color={'info'} />
                            <p className={'ml-2'}>{row?.files.filter((obj) => obj.type === 'payment_check').length}</p>
                        </Button>

                        {/* payment_uploaded uchun */}
                        {row.status === 'payment_uploaded' && (
                            <div className="flex flex-col gap-y-2">
                                <Button
                                    variant="contained" color="success" size="small"
                                    onClick={() => openConfirm({
                                        title: "To'lovni tasdiqlash",
                                        description: "Haqiqatdan ham ushbu to'lovni tasdiqlaysizmi?",
                                        confirmColor: "success",
                                        confirmLabel: "Tasdiqlash",
                                        onConfirm: () => { handleConfirmPayment(row.id); closeConfirm(); },
                                    })}
                                >
                                    Tasdiqlash
                                </Button>
                                <Button
                                    className={"whitespace-nowrap"}
                                    variant="contained" color="error" size="small"
                                    onClick={() => openConfirm({
                                        title: "To'lovni rad etish",
                                        description: "Haqiqatdan ham ushbu to'lovni rad etasizmi?",
                                        confirmColor: "error",
                                        confirmLabel: "Rad etish",
                                        onConfirm: () => { handleRejectedPayment(row.id); closeConfirm(); },
                                    })}
                                >
                                    Bekor qilish
                                </Button>
                            </div>
                        )}
                    </div>

                ),
            },

            {
                id: "status",
                label: "To'lov holati",
                minWidth: 180,
                render: (row: BorderQueue) => {
                    const cfg = statusConfig[row.status];

                    return (
                        <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold ${cfg?.classes}`}
                        >
                            {cfg?.icon}
                            {cfg?.label}
                        </span>
                    );
                },
            },

            {
                id: "date",
                label: "Vaqt",
                minWidth: 170,
                render: (row: BorderQueue) =>
                    new Date(row.created_at).toLocaleString("uz-UZ", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                    })

            },

            {
                id: "action",
                label: "Amallar",
                minWidth: 250,
                render: (row: BorderQueue) => (
                    <div className="flex gap-x-2 items-center">
                        <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => {
                                setSelectedId(row.id);
                                setIsOpen(true);
                            }}
                        >
                            Tasdiqlash
                        </Button>

                        <Button
                            className={"whitespace-nowrap"}
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => {
                                setSelectedId(row.id);
                                setRejectModal({
                                    open: true,
                                    type,
                                });
                            }}
                        >
                            Bekor qilish
                        </Button>

                        <Button
                            variant="outlined"
                            color="info"
                            onClick={() => navigate(`/chats/${row?.driver?.id}`)}
                        >
                            <EmailIcon />
                        </Button>
                    </div>
                ),
            },
        ],
        kazepi: [
            {
                id: "id",
                label: "ID",
                minWidth: 100,
                render: (row: BorderQueue) => row.id,
            },

            {
                id: "driver",
                label: "Haydovchi malumotlari",
                minWidth: 250,
                render: (row: BorderQueue) => (
                    <div>
                        <p className="text-[13.5px] font-semibold text-gray-900">
                            {row?.driver?.fio}
                        </p>
                        <p className="text-[11.5px] text-gray-400 mt-0.5">
                            {row?.driver?.phone_number}
                        </p>
                    </div>
                ),
            },

            {
                id: "documents",
                label: "Hujjatlar",
                minWidth: 200,
                render: (row: BorderQueue) => (
                    <div className={'flex items-center gap-x-2'}>
                        <Button onClick={() => handleOpenDocs(row)} variant={'outlined'} color={'info'}
                            className={'py-1 px-2 border w-max   cursor-pointer'}>
                            <FolderIcon color={'info'} />
                            <p className={'ml-2'}>{row?.files.filter((obj) => obj.type !== 'payment_check').length}</p>
                        </Button>

                        {/* pending_review uchun */}
                        {row.status === 'pending_review' && (
                            <div className="flex flex-col gap-y-2">
                                <Button
                                    variant="contained" color="success" size="small"
                                    onClick={() => openConfirm({
                                        title: "Hujjatni tasdiqlash",
                                        description: "Haqiqatdan ham ushbu hujjatni tasdiqlaysizmi?",
                                        confirmColor: "success",
                                        confirmLabel: "Tasdiqlash",
                                        onConfirm: () => { handleConfirmPolis(row.id); closeConfirm(); },
                                    })}
                                >
                                    Tasdiqlash
                                </Button>
                                <Button
                                    className={"whitespace-nowrap"}
                                    variant="contained" color="error" size="small"
                                    onClick={() => openConfirm({
                                        title: "Hujjatni bekor qilish",
                                        description: "Haqiqatdan ham ushbu hujjatni bekor qilasizmi?",
                                        confirmColor: "error",
                                        confirmLabel: "Bekor qilish",
                                        onConfirm: () => { handleRejectedPolis(row.id); closeConfirm(); },
                                    })}
                                >
                                    Bekor qilish
                                </Button>
                            </div>
                        )}
                    </div>
                ),
            },

            {
                id: "status",
                label: "To'lov holati",
                minWidth: 180,
                render: (row: BorderQueue) => {
                    const cfg = statusConfig[row.status];

                    return (
                        <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold ${cfg?.classes}`}
                        >
                            {cfg?.icon}
                            {cfg?.label}
                        </span>
                    );
                },
            },

            {
                id: "border_name",
                label: "KazEPI ma'lumotlari",
                minWidth: 180,
                render: (row: BorderQueue) => (
                    <p className="text-[13.5px] font-medium text-gray-800">
                        {row.border_name}
                    </p>
                ),
            },

            {
                id: "cmr",
                label: "CMR",
                minWidth: 200,
                render: (row: BorderQueue) => (
                    <div className={'flex items-center gap-x-2'}>
                        <Button onClick={() => handleOpenDocs(row)} variant={'outlined'} color={'info'}
                            className={'py-1 px-2 border w-max   cursor-pointer'}>
                            <FolderIcon color={'info'} />
                            <p className={'ml-2'}>{row?.files.filter((obj) => obj.type === 'payment_check').length}</p>
                        </Button>

                        {/* payment_uploaded uchun */}
                        {row.status === 'payment_uploaded' && (
                            <div className="flex flex-col gap-y-2">
                                <Button
                                    variant="contained" color="success" size="small"
                                    onClick={() => openConfirm({
                                        title: "To'lovni tasdiqlash",
                                        description: "Haqiqatdan ham ushbu to'lovni tasdiqlaysizmi?",
                                        confirmColor: "success",
                                        confirmLabel: "Tasdiqlash",
                                        onConfirm: () => { handleConfirmPayment(row.id); closeConfirm(); },
                                    })}
                                >
                                    Tasdiqlash
                                </Button>
                                <Button
                                    className={"whitespace-nowrap"}
                                    variant="contained" color="error" size="small"
                                    onClick={() => openConfirm({
                                        title: "To'lovni rad etish",
                                        description: "Haqiqatdan ham ushbu to'lovni rad etasizmi?",
                                        confirmColor: "error",
                                        confirmLabel: "Rad etish",
                                        onConfirm: () => { handleRejectedPayment(row.id); closeConfirm(); },
                                    })}
                                >
                                    Bekor qilish
                                </Button>
                            </div>
                        )}
                    </div>

                ),
            },

            {
                id: "date",
                label: "Vaqt",
                minWidth: 170,
                render: (row: BorderQueue) => row.date,
            },

            {
                id: "action",
                label: "Amallar",
                minWidth: 250,
                render: (row: BorderQueue) => (
                    <div className="flex gap-x-2 items-center">
                        <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => {
                                setSelectedId(row.id);
                                setIsOpen(true);
                            }}
                        >
                            Tasdiqlash
                        </Button>

                        <Button
                            className={"whitespace-nowrap"}
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => {
                                setSelectedId(row.id);
                                setRejectModal({
                                    open: true,
                                    type,
                                });
                            }}
                        >
                            Bekor qilish
                        </Button>

                        <Button
                            variant="outlined"
                            color="info"
                            onClick={() => navigate(`/chats/${row?.driver?.id}`)}
                        >
                            <EmailIcon />
                        </Button>
                    </div>
                ),
            },
        ],
        uzepi: [
            {
                id: "id",
                label: "ID",
                minWidth: 100,
                render: (row: BorderQueue) => row.id,
            },

            {
                id: "driver",
                label: "Haydovchi malumotlari",
                minWidth: 250,
                render: (row: BorderQueue) => (
                    <div>
                        <p className="text-[13.5px] font-semibold text-gray-900">
                            {row?.driver?.fio}
                        </p>
                        <p className="text-[11.5px] text-gray-400 mt-0.5">
                            {row?.driver?.phone_number}
                        </p>
                    </div>
                ),
            },

            {
                id: "documents",
                label: "Hujjatlar",
                minWidth: 200,
                render: (row: BorderQueue) => (
                    <div className={'flex items-center gap-x-2'}>
                        <Button onClick={() => handleOpenDocs(row)} variant={'outlined'} color={'info'}
                            className={'py-1 px-2 border w-max   cursor-pointer'}>
                            <FolderIcon color={'info'} />
                            <p className={'ml-2'}>{row?.files.filter((obj) => obj.type !== 'payment_check').length}</p>
                        </Button>

                        {/* pending_review uchun */}
                        {row.status === 'pending_review' && (
                            <div className="flex flex-col gap-y-2">
                                <Button
                                    variant="contained" color="success" size="small"
                                    onClick={() => openConfirm({
                                        title: "Hujjatni tasdiqlash",
                                        description: "Haqiqatdan ham ushbu hujjatni tasdiqlaysizmi?",
                                        confirmColor: "success",
                                        confirmLabel: "Tasdiqlash",
                                        onConfirm: () => { handleConfirmPolis(row.id); closeConfirm(); },
                                    })}
                                >
                                    Tasdiqlash
                                </Button>
                                <Button
                                    className={"whitespace-nowrap"}
                                    variant="contained" color="error" size="small"
                                    onClick={() => openConfirm({
                                        title: "Hujjatni bekor qilish",
                                        description: "Haqiqatdan ham ushbu hujjatni bekor qilasizmi?",
                                        confirmColor: "error",
                                        confirmLabel: "Bekor qilish",
                                        onConfirm: () => { handleRejectedPolis(row.id); closeConfirm(); },
                                    })}
                                >
                                    Bekor qilish
                                </Button>
                            </div>
                        )}
                    </div>
                ),
            },

            {
                id: "status",
                label: "To'lov holati",
                minWidth: 180,
                render: (row: BorderQueue) => {
                    const cfg = statusConfig[row.status];

                    return (
                        <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold ${cfg?.classes}`}
                        >
                            {cfg?.icon}
                            {cfg?.label}
                        </span>
                    );
                },
            },



            {
                id: "cmr",
                label: "CMR",
                minWidth: 200,
                render: (row: BorderQueue) => (
                    <div className={'flex items-center gap-x-2'}>
                        <Button onClick={() => handleOpenDocs(row)} variant={'outlined'} color={'info'}
                            className={'py-1 px-2 border w-max   cursor-pointer'}>
                            <FolderIcon color={'info'} />
                            <p className={'ml-2'}>{row?.files.filter((obj) => obj.type === 'payment_check').length}</p>
                        </Button>

                        {/* payment_uploaded uchun */}
                        {row.status === 'payment_uploaded' && (
                            <div className="flex flex-col gap-y-2">
                                <Button
                                    variant="contained" color="success" size="small"
                                    onClick={() => openConfirm({
                                        title: "To'lovni tasdiqlash",
                                        description: "Haqiqatdan ham ushbu to'lovni tasdiqlaysizmi?",
                                        confirmColor: "success",
                                        confirmLabel: "Tasdiqlash",
                                        onConfirm: () => { handleConfirmPayment(row.id); closeConfirm(); },
                                    })}
                                >
                                    Tasdiqlash
                                </Button>
                                <Button
                                    className={"whitespace-nowrap"}
                                    variant="contained" color="error" size="small"
                                    onClick={() => openConfirm({
                                        title: "To'lovni rad etish",
                                        description: "Haqiqatdan ham ushbu to'lovni rad etasizmi?",
                                        confirmColor: "error",
                                        confirmLabel: "Rad etish",
                                        onConfirm: () => { handleRejectedPayment(row.id); closeConfirm(); },
                                    })}
                                >
                                    Bekor qilish
                                </Button>
                            </div>
                        )}
                    </div>

                ),
            },

            {
                id: "date",
                label: "Vaqt",
                minWidth: 170,
                render: (row: BorderQueue) =>
                    new Date(row.created_at).toLocaleString("uz-UZ", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                    })
            },

            {
                id: "action",
                label: "Amallar",
                minWidth: 250,
                render: (row: BorderQueue) => (
                    <div className="flex gap-x-2 items-center">
                        <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => {
                                setSelectedId(row.id);
                                setIsOpen(true);
                            }}
                        >
                            Tasdiqlash
                        </Button>

                        <Button
                            className={"whitespace-nowrap"}
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => {
                                setSelectedId(row.id);
                                setRejectModal({
                                    open: true,
                                    type,
                                });
                            }}
                        >
                            Bekor qilish
                        </Button>

                        <Button
                            variant="outlined"
                            color="info"
                            onClick={() => navigate(`/chats/${row?.driver?.id}`)}
                        >
                            <EmailIcon />
                        </Button>
                    </div>
                ),
            },
        ],
        insurance: [
            {
                id: "id",
                label: "ID",
                minWidth: 100,
                render: (row: BorderQueue) => row.id,
            },

            {
                id: "country",
                label: "Mamlakat",
                minWidth: 250,
                render: (row: BorderQueue) => (

                    <span className="text-[13.5px] font-semibold text-gray-900">
                        {row?.country}
                    </span>
                ),
            },

            {
                id: "driver",
                label: "Haydovchi malumotlari",
                minWidth: 250,
                render: (row: BorderQueue) => (
                    <div>
                        <p className="text-[13.5px] font-semibold text-gray-900">
                            {row?.driver?.fio}
                        </p>
                        <p className="text-[11.5px] text-gray-400 mt-0.5">
                            {row?.driver?.phone_number}
                        </p>
                    </div>
                ),
            },

            {
                id: "documents",
                label: "Hujjatlar",
                minWidth: 200,
                render: (row: BorderQueue) => (
                    <div className={'flex items-center gap-x-2'}>
                        <Button onClick={() => handleOpenDocs(row)} variant={'outlined'} color={'info'}
                            className={'py-1 px-2 border w-max cursor-pointer'}>
                            <FolderIcon color={'info'} />
                            <p className={'ml-2'}>{row?.files.filter((obj) => obj.type === 'payment_check').length}</p>
                        </Button>

                        {/* payment_uploaded uchun */}
                        {row.status === 'pending_review' && (
                            <div className="flex flex-col gap-y-2">
                                <Button
                                    variant="contained" color="success" size="small"
                                    onClick={() => openConfirm({
                                        title: "To'lovni tasdiqlash",
                                        description: "Haqiqatdan ham ushbu to'lovni tasdiqlaysizmi?",
                                        confirmColor: "success",
                                        confirmLabel: "Tasdiqlash",
                                        onConfirm: () => { handleConfirmPayment(row.id); closeConfirm(); },
                                    })}
                                >
                                    Tasdiqlash
                                </Button>
                                <Button
                                    className={"whitespace-nowrap"}
                                    variant="contained" color="error" size="small"
                                    onClick={() => openConfirm({
                                        title: "To'lovni rad etish",
                                        description: "Haqiqatdan ham ushbu to'lovni rad etasizmi?",
                                        confirmColor: "error",
                                        confirmLabel: "Rad etish",
                                        onConfirm: () => { handleRejectedPayment(row.id); closeConfirm(); },
                                    })}
                                >
                                    Bekor qilish
                                </Button>
                            </div>
                        )}
                    </div>

                ),
            },

            {
                id: "status",
                label: "To'lov holati",
                minWidth: 180,
                render: (row: BorderQueue) => {
                    const cfg = statusConfig[row.status];

                    return (
                        <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold ${cfg?.classes}`}
                        >
                            {cfg?.icon}
                            {cfg?.label}
                        </span>
                    );
                },
            },

            {
                id: "date",
                label: "Vaqt",
                minWidth: 170,
                render: (row: BorderQueue) =>
                    new Date(row.created_at).toLocaleString("uz-UZ", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                    })

            },

            {
                id: "duration",
                label: "Davomiyligi",
                minWidth: 170,
                render: (row: BorderQueue) => (
                    <span className="text-[13px] font-medium text-gray-800">
                        {row.duration || '—'}
                    </span>
                )
            },

            {
                id: "insurance_type",
                label: "Sug'urta turi",
                minWidth: 170,
                render: (row: BorderQueue) => (
                    <span className="text-[13px] font-medium text-gray-800">
                        {row.insurance_type === 'unlimited' ? 'Cheklanmagan' : 'Cheklangan'}
                    </span>
                )
            },

            {
                id: "action",
                label: "Amallar",
                minWidth: 250,
                render: (row: BorderQueue) => (
                    <div className="flex gap-x-2 items-center">
                        <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => {
                                setSelectedId(row.id);
                                setIsOpen(true);
                            }}
                        >
                            Tasdiqlash
                        </Button>

                        <Button
                            className={"whitespace-nowrap"}
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => {
                                setSelectedId(row.id);
                                setRejectModal({
                                    open: true,
                                    type,
                                });
                            }}
                        >
                            Bekor qilish
                        </Button>

                        <Button
                            variant="outlined"
                            color="info"
                            onClick={() => navigate(`/chats/${row?.driver?.id}`)}
                        >
                            <EmailIcon />
                        </Button>
                    </div>
                ),
            },
        ],
        guarantee: [
            {
                id: "id",
                label: "ID",
                minWidth: 100,
                render: (row: BorderQueue) => row.id,
            },

            {
                id: "driver",
                label: "Haydovchi malumotlari",
                minWidth: 250,
                render: (row: BorderQueue) => (
                    <div>
                        <p className="text-[13.5px] font-semibold text-gray-900">
                            {row?.driver?.fio}
                        </p>
                        <p className="text-[11.5px] text-gray-400 mt-0.5">
                            {row?.driver?.phone_number}
                        </p>
                    </div>
                ),
            },

            {
                id: "documents",
                label: "Hujjatlar",
                minWidth: 200,
                render: (row: BorderQueue) => (
                    <div className={'flex items-center gap-x-2'}>
                        <Button onClick={() => handleOpenDocs(row)} variant={'outlined'} color={'info'}
                            className={'py-1 px-2 border w-max   cursor-pointer'}>
                            <FolderIcon color={'info'} />
                            <p className={'ml-2'}>{row?.files.filter((obj) => obj.type !== 'payment_check').length}</p>
                        </Button>

                        {/* pending_review uchun */}
                        {row.status === 'pending_review' && (
                            <div className="flex flex-col gap-y-2">
                                <Button
                                    variant="contained" color="success" size="small"
                                    onClick={() => openConfirm({
                                        title: "Hujjatni tasdiqlash",
                                        description: "Haqiqatdan ham ushbu hujjatni tasdiqlaysizmi?",
                                        confirmColor: "success",
                                        confirmLabel: "Tasdiqlash",
                                        onConfirm: () => { handleConfirmPolis(row.id); closeConfirm(); },
                                    })}
                                >
                                    Tasdiqlash
                                </Button>
                                <Button
                                    className={"whitespace-nowrap"}
                                    variant="contained" color="error" size="small"
                                    onClick={() => openConfirm({
                                        title: "Hujjatni bekor qilish",
                                        description: "Haqiqatdan ham ushbu hujjatni bekor qilasizmi?",
                                        confirmColor: "error",
                                        confirmLabel: "Bekor qilish",
                                        onConfirm: () => { handleRejectedPolis(row.id); closeConfirm(); },
                                    })}
                                >
                                    Bekor qilish
                                </Button>
                            </div>
                        )}
                    </div>
                ),
            },

            {
                id: "status",
                label: "To'lov holati",
                minWidth: 180,
                render: (row: BorderQueue) => {
                    const cfg = statusConfig[row.status];

                    return (
                        <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold ${cfg?.classes}`}
                        >
                            {cfg?.icon}
                            {cfg?.label}
                        </span>
                    );
                },
            },

            {
                id: "border_name",
                label: "Kafolat ma'lumotlari",
                minWidth: 180,
                render: (row: BorderQueue) => (
                    <p className="text-[13.5px] font-medium text-gray-800">
                        {row.border_name}
                    </p>
                ),
            },

            {
                id: "cmr",
                label: "CMR",
                minWidth: 200,
                render: (row: BorderQueue) => (
                    <div className={'flex items-center gap-x-2'}>
                        <Button onClick={() => handleOpenDocs(row)} variant={'outlined'} color={'info'}
                            className={'py-1 px-2 border w-max   cursor-pointer'}>
                            <FolderIcon color={'info'} />
                            <p className={'ml-2'}>{row?.files.filter((obj) => obj.type === 'payment_check').length}</p>
                        </Button>

                        {/* payment_uploaded uchun */}
                        {row.status === 'payment_uploaded' && (
                            <div className="flex flex-col gap-y-2">
                                <Button
                                    variant="contained" color="success" size="small"
                                    onClick={() => openConfirm({
                                        title: "To'lovni tasdiqlash",
                                        description: "Haqiqatdan ham ushbu to'lovni tasdiqlaysizmi?",
                                        confirmColor: "success",
                                        confirmLabel: "Tasdiqlash",
                                        onConfirm: () => { handleConfirmPayment(row.id); closeConfirm(); },
                                    })}
                                >
                                    Tasdiqlash
                                </Button>
                                <Button
                                    className={"whitespace-nowrap"}
                                    variant="contained" color="error" size="small"
                                    onClick={() => openConfirm({
                                        title: "To'lovni rad etish",
                                        description: "Haqiqatdan ham ushbu to'lovni rad etasizmi?",
                                        confirmColor: "error",
                                        confirmLabel: "Rad etish",
                                        onConfirm: () => { handleRejectedPayment(row.id); closeConfirm(); },
                                    })}
                                >
                                    Bekor qilish
                                </Button>
                            </div>
                        )}
                    </div>

                ),
            },

            {
                id: "date",
                label: "Vaqt",
                minWidth: 170,
                render: (row: BorderQueue) => row.date,
            },

            {
                id: "action",
                label: "Amallar",
                minWidth: 250,
                render: (row: BorderQueue) => (
                    <div className="flex gap-x-2 items-center">
                        <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => {
                                setSelectedId(row.id);
                                setIsOpen(true);
                            }}
                        >
                            Tasdiqlash
                        </Button>

                        <Button
                            className={"whitespace-nowrap"}
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => {
                                setSelectedId(row.id);
                                setRejectModal({
                                    open: true,
                                    type,
                                });
                            }}
                        >
                            Bekor qilish
                        </Button>

                        <Button
                            variant="outlined"
                            color="info"
                            onClick={() => navigate(`/chats/${row?.driver?.id}`)}
                        >
                            <EmailIcon />
                        </Button>
                    </div>
                ),
            },
        ],
        bakat_kazavtajuli: [
            {
                id: "id",
                label: "ID",
                minWidth: 100,
                render: (row: BorderQueue) => row.id,
            },

            {
                id: "bakat_kazavtajuli_type",
                label: "Xizmat turi",
                minWidth: 250,
                render: (row: BorderQueue) => (

                    <span className="text-[13.5px] font-semibold text-gray-900">
                        {row?.type}
                    </span>
                ),
            },

            {
                id: "driver",
                label: "Haydovchi malumotlari",
                minWidth: 250,
                render: (row: BorderQueue) => (
                    <div>
                        <p className="text-[13.5px] font-semibold text-gray-900">
                            {row?.driver?.fio}
                        </p>
                        <p className="text-[11.5px] text-gray-400 mt-0.5">
                            {row?.driver?.phone_number}
                        </p>
                    </div>
                ),
            },

            {
                id: "authorize_payment",
                label: "To'lovga ruxsat berish",
                minWidth: 200,
                render: (row: BorderQueue) => (
                    <div className={'flex items-center gap-x-2'}>

                        {/* pending_review uchun */}
                        {row.status === 'pending_review' ? (
                            <div className="flex flex-col gap-y-2">
                                <Button
                                    variant="contained" color="success" size="small"
                                    onClick={() => openConfirm({
                                        title: "Hujjatni tasdiqlash",
                                        description: "Haqiqatdan ham ushbu hujjatni tasdiqlaysizmi?",
                                        confirmColor: "success",
                                        confirmLabel: "Tasdiqlash",
                                        onConfirm: () => { handleConfirmPolis(row.id); closeConfirm(); },
                                    })}
                                >
                                    Tasdiqlash
                                </Button>
                                <Button
                                    className={"whitespace-nowrap"}
                                    variant="contained" color="error" size="small"
                                    onClick={() => openConfirm({
                                        title: "Hujjatni bekor qilish",
                                        description: "Haqiqatdan ham ushbu hujjatni bekor qilasizmi?",
                                        confirmColor: "error",
                                        confirmLabel: "Bekor qilish",
                                        onConfirm: () => { handleRejectedPolis(row.id); closeConfirm(); },
                                    })}
                                >
                                    Bekor qilish
                                </Button>
                            </div>
                        )

                            :
                            'N/A'
                        }
                    </div>

                ),
            },


            {
                id: "status",
                label: "To'lov holati",
                minWidth: 180,
                render: (row: BorderQueue) => {
                    const cfg = statusConfig[row.status];

                    return (
                        <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold ${cfg?.classes}`}
                        >
                            {cfg?.icon}
                            {cfg?.label}
                        </span>
                    );
                },
            },

            {
                id: "price",
                label: "To'lov qiymati",
                minWidth: 180,
                render: (row: BorderQueue) => { 

                    return (
                        <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold `}
                        >
                            {row?.price ? `${row?.price}` : 'N/A'}
                        </span>
                    );
                },
            },
            {
                id: "documents",
                label: "Hujjatlar",
                minWidth: 200,
                render: (row: BorderQueue) => (
                    <div className={'flex items-center gap-x-2'}>
                        <Button onClick={() => handleOpenDocs(row)} variant={'outlined'} color={'info'}
                            className={'py-1 px-2 border w-max cursor-pointer'}>
                            <FolderIcon color={'info'} />
                            <p className={'ml-2'}>{row?.files.filter((obj) => obj.type === 'payment_check').length}</p>
                        </Button>

                        {/* payment_uploaded uchun */}
                        {row.status === 'payment_uploaded' && (
                            <div className="flex flex-col gap-y-2">
                                <Button
                                    variant="contained" color="success" size="small"
                                    onClick={() => openConfirm({
                                        title: "To'lovni tasdiqlash",
                                        description: "Haqiqatdan ham ushbu to'lovni tasdiqlaysizmi?",
                                        confirmColor: "success",
                                        confirmLabel: "Tasdiqlash",
                                        onConfirm: () => { handleConfirmPayment(row.id); closeConfirm(); },
                                    })}
                                >
                                    Tasdiqlash
                                </Button>
                                <Button
                                    className={"whitespace-nowrap"}
                                    variant="contained" color="error" size="small"
                                    onClick={() => openConfirm({
                                        title: "To'lovni rad etish",
                                        description: "Haqiqatdan ham ushbu to'lovni rad etasizmi?",
                                        confirmColor: "error",
                                        confirmLabel: "Rad etish",
                                        onConfirm: () => { handleRejectedPayment(row.id); closeConfirm(); },
                                    })}
                                >
                                    Bekor qilish
                                </Button>
                            </div>
                        )}
                    </div>

                ),
            },



            {
                id: "date",
                label: "Vaqt",
                minWidth: 170,
                render: (row: BorderQueue) =>
                    new Date(row.created_at).toLocaleString("uz-UZ", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                    })

            },

            {
                id: "action",
                label: "Amallar",
                minWidth: 250,
                render: (row: BorderQueue) => (
                    <div className="flex gap-x-2 items-center">
                        <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => {
                                setSelectedId(row.id);
                                setIsOpen(true);
                            }}
                        >
                            Tasdiqlash
                        </Button>

                        <Button
                            className={"whitespace-nowrap"}
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => {
                                setSelectedId(row.id);
                                setRejectModal({
                                    open: true,
                                    type,
                                });
                            }}
                        >
                            Bekor qilish
                        </Button>

                        <Button
                            variant="outlined"
                            color="info"
                            onClick={() => navigate(`/chats/${row?.driver?.id}`)}
                        >
                            <EmailIcon />
                        </Button>
                    </div>
                ),
            },
        ],
    }







    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.4 }}
            className="bg-white rounded-2xl shadow-sm overflow-hidden "
        >


            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer className={"overflow-y-auto scrollbar scrollbar-thumb-gray-400 scrollbar-thin scrollbar-track-gray-100"}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                {columnsConfig[type === 'russia-queue' ? 'russia_queue' : type === 'bakat-kazavtajuli' ? 'bakat_kazavtajuli' : type]?.map((column, index) => (
                                    <TableCell
                                        key={index + "_" + column.label}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data && data.map((item) => (

                                <TableRow key={item.id}>
                                    {columnsConfig[type === 'russia-queue' ? 'russia_queue' : type === 'bakat-kazavtajuli' ? 'bakat_kazavtajuli' : type]?.map((column) => (
                                        <TableCell key={column.id} align={column.align}>
                                            {column.render
                                                ? column.render(item)
                                                : "N/A"}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    component="div"
                    count={data?.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>




            <RejectModal
                comment={comment}
                setComment={setComment}
                isOpen={rejectModal.open}
                onClose={() => setRejectModal({ open: false, type: null })}
                onConfirm={() => handleConfirmReject(comment, selectedId as number)}
                title={rejectModal.type === "kazepi" ? "KazEpini bekor qilish" : "Navbatni bekor qilish"}
                subtitle={
                    rejectModal.type === "kazepi"
                        ? "Ushbu kazepi bekor qilinadi"
                        : "Ushbu navbat bekor qilinadi"
                }
            />

            <ConfirmModal
                open={confirmModal.open}
                title={confirmModal.title}
                description={confirmModal.description}
                confirmColor={confirmModal.confirmColor}
                confirmLabel={confirmModal.confirmLabel}
                onClose={closeConfirm}
                onConfirm={confirmModal.onConfirm}
            />

            <FileUploadModal type={type} refetch={refetch} setSelectedId={setSelectedId} selectedId={selectedId} isOpen={isOpen} setIsOpen={setIsOpen} />


        </motion.div>
    );
}

export default QueueTable;