import axios from 'axios';
import { format } from 'date-fns';
import {
    AlertCircle,
    Calendar,
    Download,
    FileText,
    Loader2,
    Phone,
    Trash2,
    User
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface File {
    id: number;
    name: string;
    path: string;
    url: string;
    created_at: string;
    updated_at: string;
}

interface Driver {
    id: number;
    fio: string;
    number: string;
    phone_number: string;
}

interface FileData {
    file: File;
    driver: Driver;
}

interface ApiResponse {
    status: boolean;
    message: string;
    data: FileData[];
}

// Confirmation Modal
const ConfirmModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    fileName: string;
    isDeleting: boolean;
}> = ({ isOpen, onClose, onConfirm, fileName, isDeleting }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center  bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="w-full max-w-md transform transition-all animate-in fade-in zoom-in duration-200">
                <div className="bg-white rounded-xl shadow-2xl p-6 border border-gray-100">
                    <div className="flex items-center gap-3 text-red-600 mb-4">
                        <AlertCircle className="w-6 h-6" />
                        <h3 className="text-lg font-semibold">O'chirishni tasdiqlang</h3>
                    </div>

                    <p className="text-gray-600 mb-6">
                        <span className="font-medium text-gray-900">{fileName}</span> faylini o'chirishni xohlaysizmi?
                        Bu amalni ortga qaytarib bo'lmaydi.
                    </p>

                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            Bekor qilish
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    O'chirilmoqda...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    O'chirish
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function Files() {
    const [files, setFiles] = useState<FileData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteFileName, setDeleteFileName] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const { token } = useAuth();
    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await axios.get<ApiResponse>(
                    'https://mobile-test.izisol.uz/api/admin/upload-files',
                    {
                        headers: {
                            'accept': 'application/json',
                            'Authorization': `Bearer ${token}`,
                            'X-CSRF-TOKEN': '',
                        },
                    }
                );
                setFiles(response.data.data);
            } catch (err) {
                setError('Fayllarni yuklashda xatolik yuz berdi');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
    }, []);

    // Delete file
    const handleDelete = async () => {
        if (!deleteId) return;

        setIsDeleting(true);
        try {
            await axios.delete(
                `https://mobile-test.izisol.uz/api/admin/upload-files/${deleteId}`,
                {
                    headers: {
                        'accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'X-CSRF-TOKEN': '',
                    },
                }
            );

            setFiles(prev => prev.filter(f => f.file.id !== deleteId));
            closeModal();
        } catch (err) {
            setError('Faylni o\'chirishda xatolik');
            console.error(err);
        } finally {
            setIsDeleting(false);
        }
    };

    const openConfirm = (id: number, name: string) => {
        setDeleteId(id);
        setDeleteFileName(name);
    };

    const closeModal = () => {
        setDeleteId(null);
        setDeleteFileName('');
    };

    return (
        <>
            <div className="min-h-screen p-6  ">
                <div className="max-w-8xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <FileText className="w-9 h-9 text-blue-600" />
                            Yuklangan Fayllar
                        </h1>
                        <p className="text-gray-600 mt-2">Haydovchilar tomonidan yuklangan hujjatlarni boshqaring</p>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                            <div className="flex flex-col items-center gap-4 text-gray-500">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                <p className="text-lg font-medium">Fayllar yuklanmoqda...</p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                            <div className="flex items-center gap-3 text-red-700">
                                <AlertCircle className="w-6 h-6" />
                                <p className="font-medium">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Files Table */}
                    {!loading && !error && files.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4" />
                                                    Fayl
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4" />
                                                    Haydovchi
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4" />
                                                    Telefon
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    Yuklangan sana
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                                                Amallar
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {files.map((item) => (
                                            <tr
                                                key={item.file.id}
                                                className="hover:bg-blue-50/50 transition-colors duration-150"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <a
                                                        href={item.file.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium group"
                                                    >
                                                        <Download className="w-4 h-4 group-hover:animate-bounce" />
                                                        <span className="truncate max-w-xs">{item.file.name}</span>
                                                    </a>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{item.driver.fio}</p>
                                                        <p className="text-sm text-gray-500">#{item.driver.number}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <a
                                                        href={`tel:${item.driver.phone_number}`}
                                                        className="text-gray-700 hover:text-blue-600 flex items-center gap-1.5"
                                                    >
                                                        <Phone className="w-4 h-4" />
                                                        {item.driver.phone_number}
                                                    </a>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {format(new Date(item.file.created_at), 'dd MMM yyyy, HH:mm')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => openConfirm(item.file.id, item.file.name)}
                                                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-200 hover:shadow-md active:scale-95"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        O'chirish
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && files.length === 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <div className="max-w-md mx-auto">
                                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Fayllar topilmadi</h3>
                                <p className="text-gray-500">Hozircha hech qanday fayl yuklanmagan.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteId !== null}
                onClose={closeModal}
                onConfirm={handleDelete}
                fileName={deleteFileName}
                isDeleting={isDeleting}
            />
        </>
    );
}