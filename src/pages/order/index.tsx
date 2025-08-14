import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ClipboardList, Truck, User, MapPin, Calendar, Edit, Trash2, Plus } from "lucide-react";
import { DeleteOrderModal } from "../../components/order/deleteModal";
import { UpdateOrderModal } from "../../components/order/updateModal";
import { useAuth } from "../../context/AuthContext";

interface Carrier {
    id: number;
    name: string;
    phone: string;
    email: string;
}

interface Driver {
    id: number;
    name: string;
    phone: string;
    email: string;
}

interface Order {
    id: number;
    carrier: Carrier;
    driver: Driver;
    point_of_departure: string;
    country_of_departure: string;
    point_of_destination: string;
    country_of_destination: string;
    nature_of_cargo: string;
    shipment_date: string;
    shipment_type: string;
    service_type: string;
    transportation_date: string;
    unloading_date: string;
    act_date: string;
    status: string;
    driver_summa: number;
    reward_summa: number;
    load_summa: number;
    created_at: string;
    updated_at: string;
}

export default function OrderPage() {
    const { token } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://192.168.10.37:8000/api/orders", {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (res.ok) {
                // Parse string values to numbers for financial fields
                const parsedData = data.map((order: any) => ({
                    ...order,
                    driver_summa: parseFloat(order.driver_summa),
                    reward_summa: parseFloat(order.reward_summa),
                    load_summa: parseFloat(order.load_summa),
                }));
                setOrders(parsedData);
            } else {
                toast.error(data.message || "Buyurtmalarni olishda xatolik");
            }
        } catch {
            toast.error("Server bilan bog‘lanishda xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchOrders();
    }, [token]);

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`http://192.168.10.37:8000/api/orders/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.ok) {
                toast.success("Buyurtma o‘chirildi");
                fetchOrders();
                setIsDeleteModalOpen(false);
            } else {
                const errorData = await res.json();
                toast.error(errorData.message || "O‘chirishda xatolik");
            }
        } catch {
            toast.error("Server bilan xatolik");
        }
    };

    const handleUpdate = async (formData: Partial<Order>) => {
        const payload = {
            ...formData,
            shipment_date: formData.shipment_date
                ? new Date(formData.shipment_date).toISOString().split("T")[0]
                : undefined,
            transportation_date: formData.transportation_date
                ? new Date(formData.transportation_date).toISOString()
                : undefined,
            unloading_date: formData.unloading_date
                ? new Date(formData.unloading_date).toISOString().split("T")[0]
                : undefined,
            act_date: formData.act_date
                ? new Date(formData.act_date).toISOString().split("T")[0]
                : undefined,
        };

        try {
            const isUpdate = selectedOrder !== null;
            const url = isUpdate
                ? `http://192.168.10.37:8000/api/orders/${selectedOrder!.id}`
                : "http://192.168.10.37:8000/api/orders";
            const method = isUpdate ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast.success(isUpdate ? "Buyurtma yangilandi" : "Buyurtma yaratildi");
                fetchOrders();
                setIsUpdateModalOpen(false);
                setSelectedOrder(null);
            } else {
                const errorData = await res.json();
                toast.error(errorData.message || (isUpdate ? "Yangilashda xatolik" : "Yaratishda xatolik"));
            }
        } catch {
            toast.error("Server bilan xatolik");
        }
    };

    const openUpdateModal = (order: Order) => {
        setSelectedOrder(order);
        setIsUpdateModalOpen(true);
    };

    const openDeleteModal = (order: Order) => {
        setSelectedOrder(order);
        setIsDeleteModalOpen(true);
    };

    const closeModals = () => {
        setIsUpdateModalOpen(false);
        setIsDeleteModalOpen(false);
        setSelectedOrder(null);
    };

    const openCreateModal = () => {
        setSelectedOrder(null);
        setIsUpdateModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="flex items-center gap-2 text-base font-medium text-gray-600">
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
        <section className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ClipboardList size={24} /> Buyurtmalar
                    </h2>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                        aria-label="Yangi buyurtma qo'shish"
                    >
                        <Plus size={18} /> Yangi buyurtma
                    </button>
                </div>
                {orders.length === 0 ? (
                    <p className="text-center text-base text-gray-500">Buyurtmalar mavjud emas</p>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-lg"
                            >
                                <div className="flex items-start justify-between">
                                    <h3 className="text-lg font-semibold text-blue-600">
                                        #{order.id} - {order.status.toUpperCase()}
                                    </h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openUpdateModal(order)}
                                            className="rounded-full p-2 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors duration-200"
                                            aria-label={`Tahrirlash buyurtma #${order.id}`}
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(order)}
                                            className="rounded-full p-2 text-red-600 hover:bg-red-50 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                                            aria-label={`O'chirish buyurtma #${order.id}`}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-3 space-y-2 text-sm text-gray-600">
                                    <p className="flex items-center gap-2">
                                        <MapPin size={16} className="text-gray-500" />
                                        {order.point_of_departure}, {order.country_of_departure} →{" "}
                                        {order.point_of_destination}, {order.country_of_destination}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Truck size={16} className="text-gray-500" />
                                        Yuk: {order.nature_of_cargo} ({order.shipment_type}, {order.service_type})
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Calendar size={16} className="text-gray-500" />
                                        Jo‘natish: {new Date(order.shipment_date).toLocaleDateString()}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Calendar size={16} className="text-gray-500" />
                                        Tashish: {new Date(order.transportation_date).toLocaleString()}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Calendar size={16} className="text-gray-500" />
                                        Yetkazib berish: {new Date(order.unloading_date).toLocaleDateString()}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Calendar size={16} className="text-gray-500" />
                                        Yozib olingan: {new Date(order.act_date).toLocaleDateString()}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <User size={16} className="text-gray-500" />
                                        Haydovchi: {order.driver.name} ({order.driver.phone})
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <User size={16} className="text-gray-500" />
                                        Tashuvchi: {order.carrier.name} ({order.carrier.phone})
                                    </p>
                                    <div className="pt-2 border-t border-gray-200">
                                        <p className="flex items-center gap-2">
                                            <span className="text-gray-500">💸</span> Haydovchi summasi: $
                                            {typeof order.driver_summa === "number" ? order.driver_summa.toFixed(2) : order.driver_summa}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <span className="text-gray-500">💸</span> Mukofot summasi: $
                                            {typeof order.reward_summa === "number" ? order.reward_summa.toFixed(2) : order.reward_summa}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <span className="text-gray-500">💸</span> Yuk summasi: $
                                            {typeof order.load_summa === "number" ? order.load_summa.toFixed(2) : order.load_summa}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <UpdateOrderModal
                    isOpen={isUpdateModalOpen}
                    order={selectedOrder}
                    onClose={closeModals}
                    onUpdate={handleUpdate}
                />
                <DeleteOrderModal
                    isOpen={isDeleteModalOpen}
                    order={selectedOrder}
                    onClose={closeModals}
                    onDelete={handleDelete}
                />
            </div>
        </section>
    );
}