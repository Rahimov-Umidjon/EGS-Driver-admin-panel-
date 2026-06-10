import {Dispatch, SetStateAction} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {XCircle} from "lucide-react";

interface RejectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    subtitle?: string;
    setComment: Dispatch<SetStateAction<string>>;
    comment: string;

}

export default function RejectModal({
                                        isOpen,
                                        onClose,
                                        onConfirm,
                                        title = "Bekor qilish",
                                        subtitle = "Ushbu amaliyot qaytarib bo'lmaydi",
                                        comment,
                                        setComment,
                                    }: RejectModalProps) {

    const handleConfirm = () => {
        onConfirm();
        setComment("");
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                    transition={{duration: 0.18}}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
                >
                    <motion.div
                        initial={{scale: 0.94, opacity: 0, y: 8}}
                        animate={{scale: 1, opacity: 1, y: 0}}
                        exit={{scale: 0.94, opacity: 0, y: 8}}
                        transition={{duration: 0.2}}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                                <XCircle size={18} className="text-red-500"/>
                            </div>
                            <div>
                                <p className="text-[15px] font-semibold text-gray-900">{title}</p>
                                <p className="text-[12px] text-gray-400">{subtitle}</p>
                            </div>
                        </div>

                        <hr className="border-gray-100 mb-4"/>

                        {/* Comment */}
                        <label className="text-[12.5px] text-gray-500 block mb-1.5">
                            Sabab <span className="text-gray-400">(ixtiyoriy)</span>
                        </label>
                        <textarea
                            rows={3}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Izoh kiriting..."
                            className="w-full resize-none rounded-xl border border-gray-200 text-[13px] text-gray-800 px-3 py-2.5 outline-none focus:border-red-300 transition-colors bg-gray-50 placeholder-gray-300"
                        />
                        {/* Actions */}
                        <div className="flex gap-2 mt-4">
                            <motion.button
                                whileTap={{scale: 0.97}}
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Yopish
                            </motion.button>
                            <motion.button
                                whileTap={{scale: 0.97}}
                                onClick={handleConfirm}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[13px] font-semibold transition-colors flex items-center justify-center gap-1.5"
                            >
                                <XCircle size={14}/>
                                Bekor qilish
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}