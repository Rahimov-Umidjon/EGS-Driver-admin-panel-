import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { CarrierUpdate } from "../../components/carriers/updateModal";
import { DeleteCarrierModal } from "../../components/carriers/deleteModal";

export interface Carrier {
    id: number;
    name: string;
    email: string;
    phone: string;
}

export interface CarrierFormData {
    name: string;
    email: string;
    phone: string;
}

export default function CarrierPage() {
    const [carriers, setCarriers] = useState<Carrier[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const { token } = useAuth();

    const axiosConfig = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const fetchCarriers = async () => {
        try {
            const res = await axios.get<Carrier[]>(
                "http://192.168.10.37:8000/api/carriers",
                axiosConfig
            );
            setCarriers(res.data);
        } catch (error) {
            toast.error("Xatolik yuz berdi: carrierlarni yuklashda");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCarriers();
    }, []);

    const handleSaveCarrier = async (formData: CarrierFormData) => {
        try {
            if (selectedCarrier) {
                await axios.put(
                    `http://192.168.10.37:8000/api/carriers/${selectedCarrier.id}`,
                    formData,
                    axiosConfig
                );
                toast.success("Carrier yangilandi");
            } else {
                await axios.post(
                    "http://192.168.10.37:8000/api/carriers",
                    formData,
                    axiosConfig
                );
                toast.success("Carrier qo'shildi");
            }
            setIsFormModalOpen(false);
            setSelectedCarrier(null);
            fetchCarriers();
        } catch (error) {
            toast.error("Saqlashda xatolik yuz berdi");
        }
    };

    const handleDeleteCarrier = async (id: number) => {
        try {
            await axios.delete(
                `http://192.168.10.37:8000/api/carriers/${id}`,
                axiosConfig
            );
            toast.success("Carrier o'chirildi");
            setIsDeleteModalOpen(false);
            setSelectedCarrier(null);
            fetchCarriers();
        } catch (error) {
            toast.error("Carrierni o'chirishda xatolik yuz berdi");
        }
    };

    const openCreateModal = () => {
        setSelectedCarrier(null);
        setIsFormModalOpen(true);
    };

    const openEditModal = (carrier: Carrier) => {
        setSelectedCarrier(carrier);
        setIsFormModalOpen(true);
    };

    const openDeleteConfirmation = (carrier: Carrier) => {
        setSelectedCarrier(carrier);
        setIsDeleteModalOpen(true);
    };

    const closeModals = () => {
        setIsFormModalOpen(false);
        setIsDeleteModalOpen(false);
        setSelectedCarrier(null);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="flex items-center gap-2 text-lg font-medium text-gray-600">
                    <svg
                        className="h-6 w-6 animate-spin text-blue-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    Yuklanmoqda...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Carrierlar</h1>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                        aria-label="Yangi carrier qo'shish"
                    >
                        <Plus size={18} />
                        Yangi carrier
                    </button>
                </div>
                {carriers.length === 0 ? (
                    <p className="text-center text-base text-gray-500">
                        Carrierlar mavjud emas
                    </p>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {carriers.map((carrier) => (
                            <div
                                key={carrier.id}
                                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-lg"
                            >
                                <h2 className="mb-2 text-lg font-semibold text-blue-600">
                                    {carrier.name}
                                </h2>
                                <p className="mb-1 text-sm text-gray-600">
                                    Email: {carrier.email}
                                </p>
                                <p className="mb-3 text-sm text-gray-600">
                                    Telefon: {carrier.phone}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEditModal(carrier)}
                                        className="rounded-full p-2 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors duration-200"
                                        aria-label={`Tahrirlash ${carrier.name}`}
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        onClick={() => openDeleteConfirmation(carrier)}
                                        className="rounded-full p-2 text-red-600 hover:bg-red-50 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                                        aria-label={`O'chirish ${carrier.name}`}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <CarrierUpdate
                    isOpen={isFormModalOpen}
                    carrier={selectedCarrier}
                    onClose={closeModals}
                    onSave={handleSaveCarrier}
                />

                <DeleteCarrierModal
                    isOpen={isDeleteModalOpen}
                    carrier={selectedCarrier}
                    onClose={closeModals}
                    onDelete={handleDeleteCarrier}
                />
            </div>
        </div>
    );
}