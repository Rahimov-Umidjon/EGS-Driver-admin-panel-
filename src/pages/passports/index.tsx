import { Dialog, Transition } from "@headlessui/react";
import {
    CheckCircle,
    RefreshCcw,
    X,
    XCircle,
    ZoomIn,
} from "lucide-react";
import React, { Fragment, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api.ts";
import axios from "axios";
import { Button } from "@mui/material";
import { useNavigate } from "react-router";
import EmailIcon from '@mui/icons-material/Email';



interface FileResponse {
    id: number;
    driver_id: number;
    document_type: string;
    path: string;
    status: string;
    created_at: string;
    driver: {
        id: number;
        fio: string;
        phone_number: string;
        number: string;
        is_verified: string;
        is_online?: number;
    } | null;
}

interface GroupedDriver {
    id: number;
    fio: string;
    phone_number: string;
    number: string;
    is_verified: string;
    is_online?: number;
    files: {
        id: number;
        document_type: string;
        path: string;
        status: string;
        created_at?: string;
    }[];
}

/* ──────────────────────  Helper: Tozalash & Format ────────────────────── */
const cleanUrl = (url: string): string => url.replace(/\\/g, "");

const formatDocumentType = (type: string): string => {
    const map: Record<string, string> = {
        passport: "Pasport",
        texpassport: "Tex. pasport",
        license: "Haydovchilik guvohnomasi",
    };
    return map[type] || type.charAt(0).toUpperCase() + type.slice(1);
};

 

/* ──────────────────────  Image Zoom Modal ────────────────────── */
type ImageZoomModalProps = {
    open: boolean;
    imageUrl: string;
    title: string;
    onClose: () => void;
};

const ImageZoomModal: React.FC<ImageZoomModalProps> = ({
    open,
    imageUrl,
    title,
    onClose,
}) => {
    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/80" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="relative w-full max-w-4xl">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition"
                                >
                                    <X size={20} />
                                </button>

                                <div className="rounded-lg overflow-hidden shadow-2xl bg-white p-2">
                                    <img
                                        src={imageUrl}
                                        alt={title}
                                        className="w-full h-auto max-h-screen object-contain"
                                    />
                                    <div className="p-3 bg-gray-50 text-center text-sm text-gray-700">
                                        {title}
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

/* ──────────────────────  Confirm Modal ────────────────────── */
type ConfirmModalProps = {
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: "green" | "red";
    confirmModal: {
        open: boolean;
        driverId?: number;
        type: "approve" | "reject" | null;
        fio?: string;
        number?: string;
    }
    setConfirmModal: React.Dispatch<SetStateAction<{
        open: boolean;
        driverId?: number;
        type: "approve" | "reject" | null;
        fio?: string;
        number?: string;
    }>>;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    open,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Ha",
    cancelText = "Yo'q",
    confirmColor = "green",
    confirmModal,
    setConfirmModal

}) => {
    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onCancel}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel
                                className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-semibold leading-6 text-gray-900"
                                >
                                    {title}
                                </Dialog.Title>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-600">{message}</p>
                                </div>
                                {
                                    confirmModal.type === 'approve' && (
                                        <div>
                                            <p className="text-sm text-gray-600 mt-4 mb-1">FIO</p>
                                            <div className="  flex items-center gap-3    mx-auto relative ">

                                                <input
                                                    type="text"
                                                    value={confirmModal.fio}
                                                    onChange={(e) => setConfirmModal({
                                                        ...confirmModal,
                                                        fio: e.target.value
                                                    })}
                                                    placeholder="Moshina nomeri bo'yicha qidirish..."
                                                    className="w-full p-1.5 border border-slate- 200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white shadow-sm"
                                                />
                                            </div>

                                            <p className="text-sm text-gray-600 mt-4 mb-1">Truck number</p>
                                            <div className="  flex items-center gap-3    mx-auto relative ">
                                                <input
                                                    type="text"
                                                    value={confirmModal.number}
                                                    onChange={(e) => setConfirmModal({
                                                        ...confirmModal,
                                                        number: e.target.value
                                                    })}
                                                    placeholder="Moshina nomeri bo'yicha qidirish..."
                                                    className="w-full p-1.5 border border-slate- 200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white shadow-sm"
                                                />
                                            </div>
                                        </div>
                                    )
                                }
                                <div className="mt-5 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                                        onClick={onCancel}
                                    >
                                        {cancelText}
                                    </button>
                                    <button
                                        type="button"
                                        className={`inline-flex justify-center rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${confirmColor === "green"
                                            ? "bg-green-600 hover:bg-green-700 focus-visible:ring-green-500"
                                            : "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
                                            }`}
                                        onClick={onConfirm}
                                    >
                                        {confirmText}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

/* ──────────────────────  Main Component ────────────────────── */
const DriverVerifyAdmin: React.FC = () => {
    const { token } = useAuth();
    const [drivers, setDrivers] = useState<GroupedDriver[]>([]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();


    /* ---------- Modal state ---------- */
    const [confirmModal, setConfirmModal] = useState<{
        open: boolean;
        driverId?: number;
        type: "approve" | "reject" | null;
        fio?: string ;
        number?: string;

    }>({ open: false, type: null });

    const [zoomModal, setZoomModal] = useState<{
        open: boolean;
        imageUrl: string;
        title: string;

    }>({ open: false, imageUrl: "", title: "" });

    const openConfirmModal = (driverId: number, type: "approve" | "reject", fio?: string, number?: string) => {
        setConfirmModal({ open: true, driverId, type, fio, number });
    };
    const closeConfirmModal = () => setConfirmModal({ open: false, type: null });

    const openZoomModal = (imageUrl: string, title: string) => {
        setZoomModal({ open: true, imageUrl, title });
    };
    const closeZoomModal = () => setZoomModal({ open: false, imageUrl: "", title: "" });

    /* ---------- Fetch drivers ---------- */
    const fetchDrivers = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/driver-verify");
            console.log(res);
            if (res?.status === 200) {
                const files: FileResponse[] = res.data?.data || [];
                const grouped: Record<number, GroupedDriver> = {};

                files?.forEach((file) => {
                    // Driver null bo'lsa, o'tkazib yuborish
                    if (!file.driver) {
                        // console.warn(`File ${file.id} has no driver data, skipping...`);
                        return;
                    }

                    const d = file.driver;
                    if (!grouped[d.id]) {
                        grouped[d.id] = {
                            id: d.id,
                            fio: d.fio,
                            phone_number: d.phone_number,
                            number: d.number,
                            is_verified: d.is_verified,
                            is_online: d.is_online,
                            files: [],
                        };
                    }

                    grouped[d.id].files.push({
                        id: file.id,
                        document_type: file.document_type,
                        path: cleanUrl(file.path),
                        status: file.status,
                        created_at: file.created_at,
                    });
                });

                // Tartiblash: eng yangi hujjat yuqorida
                const sortedDrivers = Object.values(grouped).sort((a, b) => {
                    const maxA = Math.max(
                        ...a.files.map((f) => new Date(f.created_at || 0).getTime())
                    );
                    const maxB = Math.max(
                        ...b.files.map((f) => new Date(f.created_at || 0).getTime())
                    );
                    return maxB - maxA;
                });

                setDrivers(sortedDrivers);
            } else {
                toast.error(res?.data?.message || "Ma'lumotlarni olishda xatolik");
            }
        } catch (err: unknown) {
            console.error(err);

            if (axios.isAxiosError(err)) {
                toast.error(err.response?.data?.message || "Server bilan bog'lanishda xatolik yuz berdi");
            } else {
                toast.error("Noma'lum xatolik yuz berdi");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchDrivers();
    }, [token]);

    /* ---------- Approve ---------- */
    const handleApprove = async (driverId: number, fio: string, number: string) => {

        const payload: { fio: string; number: string } | null = fio && number ? { fio, number } : null;
        try {
            const res = await api.post(`/admin/drivers/${driverId}/approve-documents`,
                payload ?? {}
            );
            if (res?.status === 200) {
                toast.success("Hujjatlar tasdiqlandi!");
                await fetchDrivers();
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
                await fetchDrivers();
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

    /* ---------- Render ---------- */
    return (
        <section className="min-h-screen text-gray-800 p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl md:text-3xl font-bold text-indigo-700">
                    Haydovchi hujjatlarini tekshirish
                </h2>
                <button
                    onClick={fetchDrivers}
                    disabled={loading}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-4 py-2 rounded shadow transition"
                >
                    <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
                    Yangilash
                </button>
            </div>

            {/* Loading / Empty */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="text-indigo-600">Yuklanmoqda...</div>
                </div>
            ) : drivers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    Hujjatlar topilmadi
                </div>
            ) : (
                /* Table */
                <div className="overflow-x-auto rounded-lg shadow-sm bg-white">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-indigo-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                                    F.I.O.
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                                    Telefon
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                                    Mashina raqami
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                                    Holati
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                                    Hujjatlar
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-indigo-700 uppercase tracking-wider">
                                    Amallar
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {drivers.map((driver) => {
                                const hasRejected = driver.files.some((f) => f.status === "rejected");
                                const allApproved = driver.files.every((f) => f.status === "approved");

                                const displayStatus = allApproved
                                    ? "approved"
                                    : hasRejected
                                        ? "rejected"
                                        : "pending";

                                // Tugmalar mantiqi
                                const showApproveButton = !allApproved;
                                const showRejectButton = !hasRejected;

                                return (
                                    <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                                        {/* FIO */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {driver.fio}
                                        </td>

                                        {/* Phone */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {driver.phone_number}
                                        </td>

                                        {/* Car number */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {driver.number}
                                        </td>

                                        {/* Verification status */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${displayStatus === "approved"
                                                    ? "bg-green-100 text-green-800"
                                                    : displayStatus === "rejected"
                                                        ? "bg-red-100 text-red-800"
                                                        : "bg-yellow-100 text-yellow-800"
                                                    }`}
                                            >
                                                {displayStatus === "approved"
                                                    ? "Tasdiqlangan"
                                                    : displayStatus === "rejected"
                                                        ? "Rad etilgan"
                                                        : "Kutilmoqda"}
                                            </span>
                                        </td>

                                        {/* Documents */}
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="flex flex-wrap gap-3">
                                                {driver.files.map((file) => (
                                                    <div
                                                        key={file.id}
                                                        className="group relative cursor-pointer w-24 h-24"
                                                    >
                                                        <img
                                                            src={file.path}
                                                            alt={file.document_type}
                                                            className="h-full w-full object-cover rounded border border-gray-200 shadow-sm"
                                                            onError={(e) => {
                                                                e.currentTarget.src =
                                                                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5Ij5Ob3JlcDwvdGV4dD48L3N2Zz4=";
                                                            }}
                                                        />

                                                        {/* Hover overlay */}
                                                        <div
                                                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex flex-col items-center justify-center gap-1">
                                                            <button
                                                                onClick={() =>
                                                                    openZoomModal(
                                                                        file.path,
                                                                        formatDocumentType(file.document_type)
                                                                    )
                                                                }
                                                                className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full text-white"
                                                            >
                                                                <ZoomIn size={14} />
                                                            </button>
                                                        </div>

                                                        {/* Status badge */}
                                                        <span
                                                            className={`absolute top-1 right-1 px-1.5 py-0.5 text-[10px] font-medium rounded-full text-white ${file.status === "approved"
                                                                ? "bg-green-600"
                                                                : file.status === "rejected"
                                                                    ? "bg-red-600"
                                                                    : "bg-yellow-600"
                                                                }`}
                                                        >
                                                            {file.status === "approved"
                                                                ? "✓"
                                                                : file.status === "rejected"
                                                                    ? "✕"
                                                                    : "⏱"}
                                                        </span>

                                                        {/* Document type label */}
                                                        <div
                                                            className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 py-0.5 text-center rounded-b">
                                                            {formatDocumentType(file.document_type)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <div className="flex items-center justify-center gap-2">
                                                {showApproveButton && (
                                                    <button
                                                        onClick={() => openConfirmModal(driver.id, "approve", driver.fio, driver.number)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-green-600 hover:bg-green-700 text-white transition"
                                                    >
                                                        <CheckCircle size={16} />
                                                        Tasdiqlash
                                                    </button>
                                                )}

                                                {showRejectButton && (
                                                    <button
                                                        onClick={() => openConfirmModal(driver.id, "reject", driver.fio, driver.number)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white transition"
                                                    >
                                                        <XCircle size={16} />
                                                        Rad etish
                                                    </button>
                                                )}

                                                <Button onClick={() => navigate(`/chats/${driver.id}`)} variant={'outlined'} color={'info'} sx={{ borderRadius: 8 }}
                                                    className={'py-1 px-2 border w-max rounded-[20px] cursor-pointer'}>
                                                    <EmailIcon color={'info'} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Confirm Modal */}
            <ConfirmModal
                open={confirmModal.open}
                title={
                    confirmModal.type === "approve"
                        ? "Hujjatlarni tasdiqlash"
                        : "Hujjatlarni rad etish"
                }
                message={
                    confirmModal.type === "approve"
                        ? "Ushbu haydovchi hujjatlari tasdiqlansinmi?"
                        : "Ushbu haydovchi hujjatlari rad etilsinmi?"
                }
                confirmColor={confirmModal.type === "approve" ? "green" : "red"}
                onConfirm={() => {
                    if (confirmModal.type === "approve" && confirmModal.driverId) {
                        handleApprove(confirmModal.driverId, confirmModal.fio || "", confirmModal.number || "");
                    } else if (confirmModal.type === "reject" && confirmModal.driverId) {
                        handleReject(confirmModal.driverId);
                    }
                }}
                confirmModal={confirmModal}
                setConfirmModal={setConfirmModal}
                onCancel={closeConfirmModal}
            />

            {/* Image Zoom Modal */}
            <ImageZoomModal
                open={zoomModal.open}
                imageUrl={zoomModal.imageUrl}
                title={zoomModal.title}
                onClose={closeZoomModal}
            />
        </section>
    );
};

export default DriverVerifyAdmin;
