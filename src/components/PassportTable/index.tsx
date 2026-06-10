import { motion } from "framer-motion";
import { CheckCircle2, Clock, RefreshCw, XCircle } from "lucide-react";
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
import { Button } from "@mui/material";
import api from "../../api/api.ts";
import RejectModal from "../RejectModal";
import { toast } from "react-toastify";
import EmailIcon from '@mui/icons-material/Email';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ConfirmModal from "../confirmModal/index.tsx";
import { BorderQueue } from "../../interface/index.ts";
import FileUploadModal from "../fileUploadModal/index.tsx";



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
    id: 'name' | 'code' | 'population' | 'size' | 'density' | 'time' | 'cmr' | 'action';
    label: string;
    minWidth?: number;
    align?: 'left';
    format?: (value: number) => string;
}


const columns: readonly Column[] = [
    { id: 'name', label: 'ID', minWidth: 170 },
    { id: 'code', label: 'F.I.O.', minWidth: 100 },
    {
        id: 'population',
        label: 'Hujjatlar',
        minWidth: 170,
        align: 'left',
        format: (value: number) => value.toLocaleString('en-US')
    },
    {
        id: 'size',
        label: 'Telefon raqami',
        minWidth: 170,
        align: 'left',
        format: (value: number) => value.toLocaleString('en-US')
    },
    {
        id: 'density',
        label: "Mashina raqami",
        minWidth: 170,
        align: 'left',
        format: (value: number) => value.toFixed(2)
    },
    { id: 'cmr', label: "Holati", minWidth: 170, align: 'left', format: (value: number) => value.toFixed(2) },
    { id: 'action', label: "Amallar", minWidth: 170, align: 'left', format: (value: number) => value.toFixed(2) },
];






const statusConfig: Record<Status, { label: string; classes: string; icon: ReactNode }> = {
    pending: {
        label: "Pending",
        classes: "bg-yellow-50 text-yellow-800 ring-1 ring-yellow-200",
        icon: <Clock size={11} className="text-yellow-500" />,
    },
    inprogress: {
        label: "In Progress",
        classes: "bg-fuchsia-50 text-fuchsia-800 ring-1 ring-fuchsia-200",
        icon: <XCircle size={11} className="text-fuchsia-600" />,
    },
    completed: {
        label: "Completed",
        classes: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
        icon: <CheckCircle2 size={11} className="text-emerald-500" />,
    },
    rejected: {
        label: "Rejected",
        classes: "bg-red-50 text-red-800 ring-1 ring-red-200",
        icon: <XCircle size={11} className="text-red-500" />,
    },

};

type Status =
    | 'pending'
    | 'completed'
    | 'inprogress'
    | 'rejected'




interface PassportTableProps {
    loading: boolean;
    data: BorderQueue[];
    meta: PaginationMeta;
    setCurrentPage: Dispatch<SetStateAction<number>>;
    currentPage: number;
    handleOpenDocs: (item: BorderQueue) => void;
    refetch: () => void;
    type: 'queue' | 'payment' | 'kazepi' | 'uzepi' | 'passport';
}




function PassportTable({ type, data, handleOpenDocs, refetch, setCurrentPage }: PassportTableProps) {

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [rejectModal, setRejectModal] = useState<{
        open: boolean;
        type: "queue" | "payment" | "kazepi" | "uzepi" | "passport" | null;
    }>({ open: false, type: null });
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [comment, setComment] = useState<string>("");
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





    const handleConfirmReject = async (id: number) => {
        const endpoint = `/admin/drivers/${id}/cancelled-documents`
        try {
            await api.post(endpoint);
            toast.success("Hujattlar bekor qilindi");
            refetch()
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                toast.error(error?.response?.data?.message || "Ma'lumotlarni olishda xatolik");
            } else {
                toast.error("Ma'lumotlarni olishda xatolik");
            }
        }
    };

    const handleConfirm = async (id: number) => {
        const endpoint = `/admin/drivers/${id}/approve-documents`
        try {
            await api.post(endpoint);
            toast.success("Hujattlar tasdiqlandi");
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









    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.4 }}
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
        >


            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        align={column.align}
                                    // style={{minWidth: column.minWidth}}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data && data.map((item) => {

                                const cfg = statusConfig[item.is_verified];

                                return (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={item.id}>
                                        <TableCell>
                                            {item?.id}
                                        </TableCell>
                                        <TableCell>
                                            <div className={''}>
                                                <p className="text-[13.5px] font-semibold text-gray-900">
                                                    {item?.fio || "Unknown"}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className={'flex items-center gap-x-2'}>
                                                <Button onClick={() => handleOpenDocs(item)} variant={'outlined'} color={'info'} sx={{ borderRadius: 8 }}
                                                    className={'py-1 px-2 border w-max rounded-[20px] cursor-pointer'}>
                                                    <FolderIcon color={'info'} />
                                                    <p className={'ml-2'}>{item?.documents.filter((obj) => obj.type !== 'payment_check')?.length}</p>
                                                </Button>

                                                {/* pending_review uchun */}
                                                {item.status === 'pending_review' && (
                                                    <div className="flex flex-col gap-y-2">
                                                        <Button
                                                            variant="contained" color="success" size="small"
                                                            onClick={() => openConfirm({
                                                                title: "Hujjatni tasdiqlash",
                                                                description: "Haqiqatdan ham ushbu hujjatni tasdiqlaysizmi?",
                                                                confirmColor: "success",
                                                                confirmLabel: "Tasdiqlash",
                                                                onConfirm: () => { handleConfirmPolis(item.id); closeConfirm(); },
                                                            })}
                                                        >
                                                            Confirm
                                                        </Button>
                                                        <Button
                                                            variant="contained" color="error" size="small"
                                                            onClick={() => openConfirm({
                                                                title: "Hujjatni bekor qilish",
                                                                description: "Haqiqatdan ham ushbu hujjatni bekor qilasizmi?",
                                                                confirmColor: "error",
                                                                confirmLabel: "Bekor qilish",
                                                                onConfirm: () => { handleRejectedPolis(item.id); closeConfirm(); },
                                                            })}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-[13.5px] font-medium text-gray-800">
                                                {item?.phone_number || "N/A"}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-[13.5px] font-medium text-gray-800">
                                                {item?.number || "N/A"}
                                            </p>
                                        </TableCell>
                                        <TableCell>

                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold ${cfg?.classes}`}>
                                                {cfg?.icon}
                                                {cfg?.label}
                                            </span>



                                        </TableCell>

                                        <TableCell>


                                            <div className={'flex gap-x-2 items-center'}>

                                                <Button
                                                    onClick={() => {
                                                        handleConfirm(item?.id)
                                                    }}
                                                    // fullWidth={true}

                                                    variant={'contained'}
                                                    color={'success'}
                                                    size={'small'}
                                                >
                                                    Confirm
                                                </Button>

                                                <Button
                                                    onClick={() => {
                                                        handleConfirmReject(item?.id)
                                                    }}
                                                    // fullWidth={true}
                                                    variant={'contained'}
                                                    color={'error'}
                                                    size={'small'}
                                                >
                                                    Cancel
                                                </Button>


                                                <Button onClick={() => navigate(`/chats/${item?.driver?.id}`)} variant={'outlined'} color={'info'} sx={{ borderRadius: 8 }}
                                                    className={'py-1 px-2 border w-max rounded-[20px] cursor-pointer'}>
                                                    <EmailIcon color={'info'} />
                                                </Button>

                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
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

export default PassportTable;