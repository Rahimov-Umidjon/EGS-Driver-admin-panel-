import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";

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

interface UpdateOrderModalProps {
    isOpen: boolean;
    order: Order | null;
    onClose: () => void;
    onUpdate: (formData: Partial<Order>) => void;
}

const UpdateOrderModal: React.FC<UpdateOrderModalProps> = ({ isOpen, order, onClose, onUpdate }) => {
    const { token } = useAuth();
    const [formData, setFormData] = useState<Partial<Order>>({});
    const [carriers, setCarriers] = useState<Carrier[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);

    useEffect(() => {
        if (order) {
            setFormData({
                carrier: order.carrier,
                driver: order.driver,
                point_of_departure: order.point_of_departure,
                country_of_departure: order.country_of_departure,
                point_of_destination: order.point_of_destination,
                country_of_destination: order.country_of_destination,
                nature_of_cargo: order.nature_of_cargo,
                shipment_date: order.shipment_date ? new Date(order.shipment_date).toISOString().split("T")[0] : "",
                shipment_type: order.shipment_type,
                service_type: order.service_type,
                transportation_date: order.transportation_date
                    ? new Date(order.transportation_date).toISOString().split("T")[0]
                    : "",
                unloading_date: order.unloading_date ? new Date(order.unloading_date).toISOString().split("T")[0] : "",
                act_date: order.act_date ? new Date(order.act_date).toISOString().split("T")[0] : "",
                status: order.status,
                driver_summa: order.driver_summa,
                reward_summa: order.reward_summa,
                load_summa: order.load_summa,
            });
        } else {
            setFormData({
                carrier: undefined,
                driver: undefined,
                point_of_departure: "",
                country_of_departure: "",
                point_of_destination: "",
                country_of_destination: "",
                nature_of_cargo: "",
                shipment_date: "",
                shipment_type: "",
                service_type: "",
                transportation_date: "",
                unloading_date: "",
                act_date: "",
                status: "pending",
                driver_summa: 0,
                reward_summa: 0,
                load_summa: 0,
            });
        }
    }, [order]);

    useEffect(() => {
        const fetchCarriersAndDrivers = async () => {
            try {
                const carrierResponse = await fetch("http://192.168.10.37:8000/api/carriers", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const driverResponse = await fetch("http://192.168.10.37:8000/api/drivers", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (carrierResponse.ok) setCarriers(await carrierResponse.json());
                else throw new Error("Failed to fetch carriers");
                if (driverResponse.ok) setDrivers(await driverResponse.json());
                else throw new Error("Failed to fetch drivers");
            } catch {
                toast.error("Tashuvchi yoki haydovchilarni olishda xatolik");
            }
        };
        if (token) fetchCarriersAndDrivers();
    }, [token]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (["driver_summa", "reward_summa", "load_summa"].includes(name)) {
            setFormData({ ...formData, [name]: value ? parseFloat(value) : 0 });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === "carrier_id") {
            const selectedCarrier = carriers.find((c) => c.id === parseInt(value));
            setFormData({ ...formData, carrier: selectedCarrier });
        } else if (name === "driver_id") {
            const selectedDriver = drivers.find((d) => d.id === parseInt(value));
            setFormData({ ...formData, driver: selectedDriver });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            carrier_id: formData.carrier?.id,
            driver_id: formData.driver?.id,
        };
        onUpdate(payload);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 transition-opacity duration-300"
            aria-modal="true"
            role="dialog"
        >
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-200 p-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                        {order ? "" : "Yangi buyurtma qo'shish"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                        aria-label="Yopish"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto p-6">
                    <form id="order-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="carrier_id" className="block text-sm font-medium text-gray-700">
                                    Tashuvchi
                                </label>
                                <select
                                    id="carrier_id"
                                    name="carrier_id"
                                    value={formData.carrier?.id || ""}
                                    onChange={handleSelectChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-1 transition-all duration-200"
                                    required
                                >
                                    <option value="" disabled>
                                        Tashuvchi tanlang
                                    </option>
                                    {carriers.map((carrier) => (
                                        <option key={carrier.id} value={carrier.id}>
                                            {carrier.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="driver_id" className="block text-sm font-medium text-gray-700">
                                    Haydovchi
                                </label>
                                <select
                                    id="driver_id"
                                    name="driver_id"
                                    value={formData.driver?.id || ""}
                                    onChange={handleSelectChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-1 transition-all duration-200"
                                    required
                                >
                                    <option value="" disabled>
                                        Haydovchi tanlang
                                    </option>
                                    {drivers.map((driver) => (
                                        <option key={driver.id} value={driver.id}>
                                            {driver.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="point_of_departure" className="block text-sm font-medium text-gray-700">
                                    Jo‘natish joyi
                                </label>
                                <input
                                    type="text"
                                    id="point_of_departure"
                                    name="point_of_departure"
                                    value={formData.point_of_departure || ""}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-1 transition-all duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="country_of_departure" className="block text-sm font-medium text-gray-700">
                                    Jo‘natish mamlakati
                                </label>
                                <input
                                    type="text"
                                    id="country_of_departure"
                                    name="country_of_departure"
                                    value={formData.country_of_departure || ""}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-1 transition-all duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="point_of_destination" className="block text-sm font-medium text-gray-700">
                                    Yetkazib berish joyi
                                </label>
                                <input
                                    type="text"
                                    id="point_of_destination"
                                    name="point_of_destination"
                                    value={formData.point_of_destination || ""}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-1 transition-all duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="country_of_destination" className="block text-sm font-medium text-gray-700">
                                    Yetkazib berish mamlakati
                                </label>
                                <input
                                    type="text"
                                    id="country_of_destination"
                                    name="country_of_destination"
                                    value={formData.country_of_destination || ""}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-1 transition-all duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="nature_of_cargo" className="block text-sm font-medium text-gray-700">
                                    Yuk turi
                                </label>
                                <input
                                    type="text"
                                    id="nature_of_cargo"
                                    name="nature_of_cargo"
                                    value={formData.nature_of_cargo || ""}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-1 transition-all duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="shipment_type" className="block text-sm font-medium text-gray-700">
                                    Yuk jo‘natish turi
                                </label>
                                <select
                                    id="shipment_type"
                                    name="shipment_type"
                                    value={formData.shipment_type || ""}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-1 transition-all duration-200"
                                    required
                                >
                                    <option value="" disabled>
                                        Yuk jo‘natish turini tanlang
                                    </option>
                                    <option value="Truck">Yuk mashinasi</option>
                                    <option value="Rail">Temir yo‘l</option>
                                    <option value="Air">Havo</option>
                                    <option value="Sea">Dengiz</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="service_type" className="block text-sm font-medium text-gray-700">
                                    Xizmat turi
                                </label>
                                <select
                                    id="service_type"
                                    name="service_type"
                                    value={formData.service_type || ""}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-1 transition-all duration-200"
                                    required
                                >
                                    <option value="" disabled>
                                        Xizmat turini tanlang
                                    </option>
                                    <option value="Express">Tez yetkazib berish</option>
                                    <option value="Standard">Standart</option>
                                    <option value="Economy">Iqtisodiy</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="shipment_date" className="block text-sm font-medium text-gray-700">
                                    Jo‘natish sanasi
                                </label>
                                <input
                                    type="date"
                                    id="shipment_date"
                                    name="shipment_date"
                                    value={formData.shipment_date || ""}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-1 transition-all duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="transportation_date" className="block text-sm font-medium text-gray-700">
                                    Tashish sanasi
                                </label>
                                <input
                                    type="dat"
                                    id="transportation_date"
                                    name="transportation_date"
                                    value={formData.transportation_date || ""}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-1 transition-all duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="unloading_date" className="block text-sm font-medium text-gray-700">
                                    Yetkazib berish sanasi
                                </label>
                                <input
                                    type="date"
                                    id="unloading_date"
                                    name="unloading_date"
                                    value={formData.unloading_date || ""}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-1 transition-all duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="act_date" className="block text-sm font-medium text-gray-700">
                                    Akt sanasi
                                </label>
                                <input
                                    type="date"
                                    id="act_date"
                                    name="act_date"
                                    value={formData.act_date || ""}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-1 transition-all duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                    Status
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status || ""}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-1 transition-all duration-200"
                                    required
                                >
                                    <option value="pending">Kutilmoqda</option>
                                    <option value="in_progress">Jarayonda</option>
                                    <option value="completed">Yakunlangan</option>
                                    <option value="cancelled">Bekor qilingan</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="driver_summa" className="block text-sm font-medium text-gray-700">
                                    Haydovchi summasi ($)
                                </label>
                                <input
                                    type="number"
                                    id="driver_summa"
                                    name="driver_summa"
                                    value={formData.driver_summa ?? ""}
                                    onChange={handleInputChange}
                                    step="0.01"
                                    min="0"
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-1 transition-all duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="reward_summa" className="block text-sm font-medium text-gray-700">
                                    Mukofot summasi ($)
                                </label>
                                <input
                                    type="number"
                                    id="reward_summa"
                                    name="reward_summa"
                                    value={formData.reward_summa ?? ""}
                                    onChange={handleInputChange}
                                    step="0.01"
                                    min="0"
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-1 transition-all duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="load_summa" className="block text-sm font-medium text-gray-700">
                                    Yuk summasi ($)
                                </label>
                                <input
                                    type="number"
                                    id="load_summa"
                                    name="load_summa"
                                    value={formData.load_summa ?? ""}
                                    onChange={handleInputChange}
                                    step="0.01"
                                    min="0"
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-1 transition-all duration-200"
                                    required
                                />
                            </div>
                        </div>
                    </form>
                </div>
                <div className="flex justify-end gap-3 border-t border-gray-200 p-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                    >
                        Bekor qilish
                    </button>
                    <button
                        type="submit"
                        form="order-form"
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                        Saqlash
                    </button>
                </div>
            </div>
        </div>
    );
};

export { UpdateOrderModal };