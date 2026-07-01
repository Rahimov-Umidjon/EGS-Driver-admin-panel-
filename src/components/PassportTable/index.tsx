import { motion } from "framer-motion";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
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
import { toast } from "react-toastify";
import EmailIcon from '@mui/icons-material/Email';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Driver } from "../../interface/index.ts";
import FileUploadModal from "../fileUploadModal/index.tsx";
import { PassportConfirmModal } from "../PassportConfirmModal/index.tsx";



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
        label: "Kutilmoqda",
        classes: "bg-yellow-50 text-yellow-800 ring-1 ring-yellow-200",
        icon: <Clock size={11} className="text-yellow-500" />,
    },
    inprogress: {
        label: "Jarayonda",
        classes: "bg-fuchsia-50 text-fuchsia-800 ring-1 ring-fuchsia-200",
        icon: <XCircle size={11} className="text-fuchsia-600" />,
    },
    completed: {
        label: "Yakunlandi",
        classes: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
        icon: <CheckCircle2 size={11} className="text-emerald-500" />,
    },
    rejected: {
        label: "Rad etildi",
        classes: "bg-red-50 text-red-800 ring-1 ring-red-200",
        icon: <XCircle size={11} className="text-red-500" />,
    },
    incomplete: {
        label: "Jarayonda",
        classes: "bg-fuchsia-50 text-fuchsia-800 ring-1 ring-fuchsia-200",
        icon: <XCircle size={11} className="text-fuchsia-600" />,
    },
};

type Status =
    | 'pending'
    | 'completed'
    | 'inprogress'
    | 'rejected'
    | 'incomplete'

interface PassportTableProps {
    loading: boolean;
    data: Driver[];
    meta: PaginationMeta;
    setCurrentPage: Dispatch<SetStateAction<number>>;
    currentPage: number;
    handleOpenDocs: (item: Driver) => void;
    refetch: () => void;
    type: 'queue' | 'payment' | 'kazepi' | 'uzepi' | 'passport';
}




function PassportTable({ type, data, handleOpenDocs, refetch, setCurrentPage }: PassportTableProps) {

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const navigate = useNavigate();

    /* ---------- Modal state ---------- */
    const [confirmModal, setConfirmModal] = useState<{
        open: boolean;
        driverId?: number;
        type: "approve" | "reject" | "warning" | null;
        fio?: string;
        number?: string;

    }>({ open: false, type: null });

    const openConfirmModal = (driverId: number, type: "approve" | "reject" | "warning", fio?: string, number?: string) => {
        setConfirmModal({ open: true, driverId, type, fio, number });
    };

    const closeConfirmModal = () => setConfirmModal({ open: false, type: null });

    /* ---------- Approve ---------- */
    const handleApprove = async (driverId: number, fio: string, number: string) => {

        const payload: { fio: string; number: string } | null = fio && number ? { fio, number } : null;
        try {
            const res = await api.post(`/admin/drivers/${driverId}/approve-documents`,
                payload ?? {}
            );
            if (res?.status === 200) {
                toast.success("Hujjatlar tasdiqlandi!");
                refetch()
            } else {
                toast.error(res?.data?.message || "Tasdiqlashda xatolik");
            }
        } catch (err: unknown) {
            console.error(err);

            if (axios.isAxiosError(err)) {
                toast.error(err.response?.data?.message || "Server bilan bog'lanishda xatolik yuz berdi");
            } else {
                toast.error("Noma'lum xatolik yuz berdi");
            }
        } finally {
            closeConfirmModal();
        }
    };

    /* ---------- Reject ---------- */
    const handleReject = async (driverId: number) => {
        try {
            const res = await api.post(`/admin/drivers/${driverId}/cancelled-documents`);

            if (res?.status === 200) {
                toast.info("Hujjatlar rad etildi!");
                refetch()
            } else {
                toast.error(res?.data.message || "Rad etishda xatolik");
            }
        } catch (err: unknown) {
            console.error(err);

            if (axios.isAxiosError(err)) {
                toast.error(err.response?.data?.message || "Server bilan bog'lanishda xatolik yuz berdi");
            } else {
                toast.error("Noma'lum xatolik yuz berdi");
            }
        } finally {
            closeConfirmModal();
        }
    };

    /* ---------- InComplate ---------- */
    const handleInComplate = async (driverId: number) => {
        try {
            const res = await api.post(`/admin/drivers/${driverId}/incomplete`);

            if (res?.status === 200) {
                toast.info("Tex pasportni qayta yuklashga ruxsat berildi!");
                refetch()
            } else {
                toast.error(res?.data.message || "Rad etishda xatolik");
            }
        } catch (err: unknown) {
            console.error(err);
            if (axios.isAxiosError(err)) {
                toast.error(err.response?.data?.message || "Server bilan bog'lanishda xatolik yuz berdi");
            } else {
                toast.error("Noma'lum xatolik yuz berdi");
            }
        } finally {
            closeConfirmModal();
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
                                                    <p className={'ml-2'}>{item?.documents?.filter((obj) => obj.type !== 'payment_check')?.length}</p>
                                                </Button>


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
                                                    onClick={() => openConfirmModal(item.id, "approve", item.fio, item.number)}
                                                    // fullWidth={true}

                                                    variant={'contained'}
                                                    color={'success'}
                                                    size={'small'}
                                                >
                                                    Tasdiqlash
                                                </Button>

                                                <Button
                                                    className={"whitespace-nowrap"}

                                                    onClick={() => openConfirmModal(item.id, "reject", item.fio, item.number)}
                                                    // fullWidth={true}
                                                    variant={'contained'}
                                                    color={'error'}
                                                    size={'small'}
                                                >
                                                    Bekor qilish
                                                </Button>


                                                <Button
                                                    className={"whitespace-nowrap"}
                                                    onClick={() => openConfirmModal(item.id, "warning", item.fio, item.number)}
                                                    // fullWidth={true}
                                                    variant={'contained'}
                                                    color={'warning'}
                                                    size={'small'}
                                                >
                                                    Qayta yuklash
                                                </Button>


                                                <Button onClick={() => navigate(`/chats/${item?.id}`)} variant={'outlined'} color={'info'} sx={{ borderRadius: 8 }}
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


            {/* Confirm Modal */}
            <PassportConfirmModal
                open={confirmModal.open}
                title={
                    confirmModal.type === "approve"
                        ? "Hujjatlarni tasdiqlash"
                        : confirmModal.type === "reject" ? "Hujjatlarni rad etish" : "Tex pasportni qayta yuklash"
                }
                message={
                    confirmModal.type === "approve"
                        ? "Ushbu haydovchi hujjatlari tasdiqlansinmi?"
                        : confirmModal.type === "reject" ? "Ushbu haydovchi hujjatlari rad etilsinmi?" : "Ushbu haydovchi Tex pasportni qayta yuklashga ruxsat berasizmi?"
                }
                confirmColor={confirmModal.type === "approve" ? "green" : confirmModal.type === "reject" ? "red" : "yellow"}
                onConfirm={() => {
                    if (confirmModal.type === "approve" && confirmModal.driverId) {
                        handleApprove(confirmModal.driverId, confirmModal.fio || "", confirmModal.number || "");
                    } else if (confirmModal.type === "reject" && confirmModal.driverId) {
                        handleReject(confirmModal.driverId);
                    } else if (confirmModal.type === "warning" && confirmModal.driverId) {
                        handleInComplate(confirmModal.driverId);
                    }
                }}
                confirmModal={confirmModal}
                setConfirmModal={setConfirmModal}
                onCancel={closeConfirmModal}
            />


            <FileUploadModal type={type} refetch={refetch} setSelectedId={setSelectedId} selectedId={selectedId} isOpen={isOpen} setIsOpen={setIsOpen} />


        </motion.div>
    );
}

export default PassportTable;