import { Dispatch, SetStateAction } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Save } from "lucide-react";

interface UpdatePriceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: {
        price: number;
        cardNumber: string;
        fio: string;
        currency: "UZS" | "USD" | "RUB" | "KZT";
        // convertedPrice: number;
    }) => void;

    price: number;
    setPrice: Dispatch<SetStateAction<number>>;
    currency: "UZS" | "USD" | "RUB" | "KZT";
    setCurrency: Dispatch<SetStateAction<"UZS" | "USD" | "RUB" | "KZT">>;
    cardNumber: string;
    setCardNumber: Dispatch<SetStateAction<string>>;
    setFio: Dispatch<SetStateAction<string>>;
    fio: string;

    title?: string;
    subtitle?: string;
}

export default function UpdatePriceModal({
    isOpen,
    onClose,
    onConfirm,
    price,
    setPrice,
    currency,
    setCurrency,
    cardNumber,
    setCardNumber,
    setFio,
    fio,
    title = "Narxni yangilash",
    subtitle = "Xizmat narxini o'zgartirish",
}: UpdatePriceModalProps) {


  
 

    const handleConfirm = () => {
        onConfirm({
            price,
            cardNumber,
            fio,
            currency, 
        });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
                >
                    <motion.div
                        initial={{ scale: 0.94, opacity: 0, y: 8 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.94, opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                                <CreditCard size={18} className="text-blue-500" />
                            </div>
                            <div>
                                <p className="text-[15px] font-semibold text-gray-900">{title}</p>
                                <p className="text-[12px] text-gray-400">{subtitle}</p>
                            </div>
                        </div>

                        <hr className="border-gray-100 mb-4" />

                        {/* Price */}
                        <label className="text-[12.5px] text-gray-500 block mb-1.5">
                            Narx
                        </label>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            placeholder="Narx kiriting..."
                            className="w-full rounded-xl border border-gray-200 text-[13px] px-3 py-2.5 outline-none focus:border-blue-300 bg-gray-50"
                        />

                        {/* Currency */}
                        <label className="text-[12.5px] text-gray-500 block mt-3 mb-1.5">
                            Valyuta
                        </label>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value as "UZS" | "USD" | "RUB" | "KZT")}
                            className="w-full rounded-xl border border-gray-200 text-[13px] px-3 py-2.5 outline-none focus:border-blue-300 bg-gray-50"
                        >
                            <option value="UZS">UZS</option>
                            <option value="USD">USD</option>
                            <option value="RUB">RUB</option>
                            <option value="KZT">KZT</option>
                        </select>



                        {/* Card Number */}
                        <label className="text-[12.5px] text-gray-500 block mt-3 mb-1.5">
                            Karta raqami
                        </label>
                        <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="8600...."
                            className="w-full rounded-xl border border-gray-200 text-[13px] px-3 py-2.5 outline-none focus:border-blue-300 bg-gray-50"
                        />

                        {/* FIO */}
                        <label className="text-[12.5px] text-gray-500 block mt-3 mb-1.5">
                            FIO
                        </label>
                        <input
                            type="text"
                            value={fio}
                            onChange={(e) => setFio(e.target.value)}
                            placeholder="FIO kiriting..."
                            className="w-full rounded-xl border border-gray-200 text-[13px] px-3 py-2.5 outline-none focus:border-blue-300 bg-gray-50"
                        />

                        {/* Actions */}
                        <div className="flex gap-2 mt-5">
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50"
                            >
                                Yopish
                            </motion.button>

                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={handleConfirm}
                                className="flex-1 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-semibold flex items-center justify-center gap-1.5"
                            >
                                <Save size={14} />
                                Saqlash
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}