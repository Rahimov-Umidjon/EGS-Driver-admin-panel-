import React, { useEffect, useState } from 'react';
import DriverCard from './driverCard';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

interface Driver {
    id: number;
    name: string;
    phone: string;
    email: string;
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
    if (!isOpen) return null;
    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-white rounded-lg shadow-lg w-full max-w-md p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-xl font-semibold mb-4">{title}</h3>
                {children}
            </div>
        </div>
    );
};

const Driver: React.FC = () => {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(false);
    const [favorites, setFavorites] = useState<number[]>([]);
    const { token } = useAuth();
    const [modalOpen, setModalOpen] = useState(false);
    const [editDriver, setEditDriver] = useState<Driver | null>(null);
    const [deleteDriver, setDeleteDriver] = useState<Driver | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    // Form holati
    const [form, setForm] = useState({ name: '', phone: '', email: '' });

    // Fetch drivers
    const fetchDrivers = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://192.168.10.37:8000/api/drivers', {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (res.ok) {
                setDrivers(data);
            } else {
                toast.error(data.message || "Ma'lumotlarni olishda xatolik");
            }
        } catch (error) {
            console.error(error);
            toast.error('Server bilan bog‘lanishda xatolik yuz berdi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchDrivers();
    }, [token]);

    // Favorite toggle
    const toggleFavorite = (id: number) => {
        setFavorites((prev) =>
            prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
        );
    };

    // Form o'zgarishi
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Modalni ochish va yopish
    const openCreateModal = () => {
        setForm({ name: '', phone: '', email: '' });
        setEditDriver(null);
        setModalOpen(true);
    };

    const openEditModal = (driver: Driver) => {
        setForm({ name: driver.name, phone: driver.phone, email: driver.email });
        setEditDriver(driver);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setFormLoading(false);
    };

    // Qo'shish yoki yangilash
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const url = editDriver
                ? `http://192.168.10.37:8000/api/drivers/${editDriver.id}`
                : 'http://192.168.10.37:8000/api/drivers';

            const method = editDriver ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(editDriver ? 'Haydovchi yangilandi' : 'Yangi haydovchi qo‘shildi');
                closeModal();
                fetchDrivers();
            } else {
                toast.error(data.message || 'Xatolik yuz berdi');
            }
        } catch (error) {
            console.error(error);
            toast.error('Server bilan bog‘lanishda xatolik yuz berdi');
        } finally {
            setFormLoading(false);
        }
    };

    // O'chirish modalini ochish
    const openDeleteModal = (driver: Driver) => {
        setDeleteDriver(driver);
    };

    // O'chirishni tasdiqlash
    const confirmDelete = async () => {
        if (!deleteDriver) return;
        try {
            const res = await fetch(`http://192.168.10.37:8000/api/drivers/${deleteDriver.id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.ok) {
                toast.success('Haydovchi o‘chirildi');
                setDeleteDriver(null);
                fetchDrivers();
            } else {
                const data = await res.json();
                toast.error(data.message || 'O‘chirishda xatolik yuz berdi');
            }
        } catch (error) {
            console.error(error);
            toast.error('Server bilan bog‘lanishda xatolik yuz berdi');
        }
    };

    // O'chirish modalini yopish
    const closeDeleteModal = () => {
        setDeleteDriver(null);
    };

    return (
        <section className="p-6 bg-white min-h-screen text-gray-800">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-indigo-700">Haydovchilar boshqaruvi</h2>
                <button
                    onClick={openCreateModal}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow transition"
                >
                    + Qo‘shish
                </button>
            </div>

            {loading ? (
                <p>Yuklanmoqda...</p>
            ) : drivers.length === 0 ? (
                <p>Haydovchilar topilmadi</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {drivers.map((driver) => (
                        <DriverCard
                            key={driver.id}
                            {...driver}
                            isFavorite={favorites.includes(driver.id)}
                            onToggleFavorite={toggleFavorite}
                            onEdit={() => openEditModal(driver)}
                            onDelete={() => openDeleteModal(driver)}
                        />
                    ))}
                </div>
            )}

            {/* Yaratish va tahrirlash modali */}
            <Modal isOpen={modalOpen} onClose={closeModal} title={editDriver ? 'Haydovchini tahrirlash' : 'Yangi haydovchi qo‘shish'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block font-medium mb-1">
                            Ism
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={form.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Ism kiriting"
                        />
                    </div>

                    <div>
                        <label htmlFor="phone" className="block font-medium mb-1">
                            Telefon
                        </label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            required
                            value={form.phone}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="+998901234567"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block font-medium mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={form.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="email@example.com"
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
                            disabled={formLoading}
                        >
                            Bekor qilish
                        </button>

                        <button
                            type="submit"
                            disabled={formLoading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition disabled:bg-indigo-300"
                        >
                            {formLoading ? 'Saqlanmoqda...' : editDriver ? 'Yangilash' : 'Qo‘shish'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* O'chirish modali */}
            <Modal
                isOpen={Boolean(deleteDriver)}
                onClose={closeDeleteModal}
                title="Haydovchini o‘chirishni tasdiqlash"
            >
                <p className="mb-4">Haydovchini o‘chirishingizga ishonchingiz komilmi?</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={closeDeleteModal}
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
                    >
                        Bekor qilish
                    </button>
                    <button
                        onClick={confirmDelete}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
                    >
                        O‘chirish
                    </button>
                </div>
            </Modal>
        </section>
    );
};

export default Driver;
