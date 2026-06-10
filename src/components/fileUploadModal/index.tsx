import {useState, useRef, useCallback, Dispatch, SetStateAction, useEffect} from "react";
import {motion, AnimatePresence} from "framer-motion"; 
import api from "../../api/api.ts";

const ALLOWED_TYPES: Record<string, { label: string; icon: string }> = {
    "image/jpeg": {label: "JPG", icon: "🖼️"},
    "image/png": {label: "PNG", icon: "🖼️"},
    "application/pdf": {label: "PDF", icon: "📄"},
    "application/msword": {label: "DOC", icon: "📝"},
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
        label: "DOCX",
        icon: "📝",
    },
};

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx"];
const ACCEPT_STRING = Object.keys(ALLOWED_TYPES).join(",") + ",.doc,.docx";

interface ApproveModalProps {
    queueId?: number;
    token?: string;
    onSuccess?: () => void;
    onClose?: () => void;
    setIsOpen: Dispatch<SetStateAction<boolean>>
    setSelectedId: Dispatch<SetStateAction<number | null>>
    isOpen: boolean
    selectedId: number | null;
    refetch: () => void;
    type: string;

}

export default function FileUploadModal({
                                            queueId = 1,
                                            token = "665|OLjtxDMmZjOEHjNqoDyqrtUPOrnmFZAtsYpOpQmR3f66c481",
                                            onSuccess,
                                            onClose,
                                            isOpen,
                                            setIsOpen, 
                                            selectedId,
                                            refetch,
                                            type
                                        }: ApproveModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);



    useEffect(() => {
        setFile(null);
        setError(null);
        setSuccess(false);
    }, [isOpen]);

    const closeModal = () => {
        if (loading) return;
        setIsOpen(false);
        onClose?.();
    };

    const handleFile = (f: File) => {
        const ext = "." + f.name.split(".").pop()?.toLowerCase();
        const isValidType = ALLOWED_TYPES[f.type] !== undefined;
        const isValidExt = ALLOWED_EXTENSIONS.includes(ext);
        if (!isValidType && !isValidExt) {
            setError(`Noto'g'ri fayl turi. Faqat ${ALLOWED_EXTENSIONS.join(", ")} formatlar qabul qilinadi.`);
            return;
        }
        setFile(f);
        setError(null);
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) handleFile(dropped);
    }, []);

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => setIsDragging(false);

    const handleSubmit = async () => {
        if (!file) {
            setError("Iltimos, fayl tanlang");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", "admin_document");

            await api.post(
                `/admin/${type}/${selectedId}/approve`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            refetch()


            setSuccess(true);
            setTimeout(() => {
                setIsOpen(false);
                onSuccess?.();
            }, 1500);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                "Xatolik yuz berdi. Qaytadan urinib ko'ring."
            );
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getFileIcon = (type: string) => {
        return ALLOWED_TYPES[type]?.icon ?? "📎";
    };

    return (
        <>


            {/* Backdrop + Modal */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="backdrop"
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            transition={{duration: 0.2}}
                            onClick={closeModal}
                            className="fixed inset-0 z-50"
                            style={{background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)"}}
                        />

                        {/* Modal */}
                        <motion.div
                            key="modal"
                            initial={{opacity: 0, scale: 0.92, y: 30}}
                            animate={{opacity: 1, scale: 1, y: 0}}
                            exit={{opacity: 0, scale: 0.92, y: 20}}
                            transition={{type: "spring", stiffness: 300, damping: 25}}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                        >
                            <div
                                className="pointer-events-auto w-full max-w-md rounded-2xl overflow-hidden"
                                style={{
                                    background: "linear-gradient(145deg, #1e1e2e 0%, #16162a 100%)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.15)",
                                }}
                            >
                                {/* Header */}
                                <div
                                    className="flex items-center justify-between px-6 py-5"
                                    style={{borderBottom: "1px solid rgba(255,255,255,0.07)"}}
                                >
                                    <div>
                                        <h2 className="text-white font-bold text-lg tracking-tight">
                                            Hujjat yuklash
                                        </h2>
                                        <p className="text-xs mt-0.5" style={{color: "#6b7280"}}>
                                            Queue #{queueId} ni tasdiqlash uchun fayl kiriting
                                        </p>
                                    </div>
                                    <motion.button
                                        onClick={closeModal}
                                        whileHover={{scale: 1.1, rotate: 90}}
                                        whileTap={{scale: 0.9}}
                                        disabled={loading}
                                        className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                                        style={{
                                            background: "rgba(255,255,255,0.06)",
                                            color: "#9ca3af",
                                        }}
                                    >
                                        ✕
                                    </motion.button>
                                </div>

                                {/* Body */}
                                <div className="p-6 space-y-4">
                                    {/* Drop Zone */}
                                    <motion.div
                                        animate={{
                                            borderColor: isDragging
                                                ? "#6366f1"
                                                : file
                                                    ? "#22c55e"
                                                    : "rgba(255,255,255,0.1)",
                                            background: isDragging
                                                ? "rgba(99,102,241,0.08)"
                                                : file
                                                    ? "rgba(34,197,94,0.05)"
                                                    : "rgba(255,255,255,0.02)",
                                        }}
                                        transition={{duration: 0.2}}
                                        onDrop={onDrop}
                                        onDragOver={onDragOver}
                                        onDragLeave={onDragLeave}
                                        onClick={() => !file && fileInputRef.current?.click()}
                                        className="relative rounded-xl border-2 border-dashed cursor-pointer transition-all"
                                        style={{minHeight: 160}}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept={ACCEPT_STRING}
                                            className="hidden"
                                            onChange={(e) => {
                                                const f = e.target.files?.[0];
                                                if (f) handleFile(f);
                                            }}
                                        />

                                        <AnimatePresence mode="wait">
                                            {file ? (
                                                <motion.div
                                                    key="file-info"
                                                    initial={{opacity: 0, scale: 0.9}}
                                                    animate={{opacity: 1, scale: 1}}
                                                    exit={{opacity: 0, scale: 0.9}}
                                                    className="flex flex-col items-center justify-center h-full p-6 text-center"
                                                >
                          <span className="text-4xl mb-3">
                            {getFileIcon(file.type)}
                          </span>
                                                    <p
                                                        className="font-semibold text-sm truncate max-w-full"
                                                        style={{color: "#e5e7eb"}}
                                                    >
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs mt-1" style={{color: "#6b7280"}}>
                                                        {formatSize(file.size)}
                                                    </p>
                                                    <motion.button
                                                        whileHover={{scale: 1.05}}
                                                        whileTap={{scale: 0.95}}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setFile(null);
                                                            if (fileInputRef.current)
                                                                fileInputRef.current.value = "";
                                                        }}
                                                        className="mt-3 text-xs px-3 py-1 rounded-full"
                                                        style={{
                                                            background: "rgba(239,68,68,0.15)",
                                                            color: "#f87171",
                                                        }}
                                                    >
                                                        Olib tashlash
                                                    </motion.button>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="upload-prompt"
                                                    initial={{opacity: 0}}
                                                    animate={{opacity: 1}}
                                                    exit={{opacity: 0}}
                                                    className="flex flex-col items-center justify-center h-full p-8 text-center"
                                                >
                                                    <motion.div
                                                        animate={isDragging ? {scale: 1.2, rotate: -5} : {
                                                            scale: 1,
                                                            rotate: 0
                                                        }}
                                                        transition={{type: "spring", stiffness: 300}}
                                                        className="text-4xl mb-3"
                                                    >
                                                        📁
                                                    </motion.div>
                                                    <p className="text-sm font-medium" style={{color: "#d1d5db"}}>
                                                        Faylni bu yerga tashlang
                                                    </p>
                                                    <p className="text-xs mt-1" style={{color: "#6b7280"}}>
                                                        yoki{" "}
                                                        <span style={{color: "#818cf8"}} className="underline">
                              tanlash uchun bosing
                            </span>
                                                    </p>
                                                    <div className="flex gap-1.5 mt-4 flex-wrap justify-center">
                                                        {Object.values(ALLOWED_TYPES).map((t) => t.label).filter((v, i, a) => a.indexOf(v) === i).map((label) => (
                                                            <span
                                                                key={label}
                                                                className="text-xs px-2 py-0.5 rounded-md font-mono"
                                                                style={{
                                                                    background: "rgba(99,102,241,0.12)",
                                                                    color: "#a5b4fc",
                                                                    border: "1px solid rgba(99,102,241,0.2)",
                                                                }}
                                                            >
                                {label}
                              </span>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>

                                    {/* Error */}
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div
                                                initial={{opacity: 0, height: 0}}
                                                animate={{opacity: 1, height: "auto"}}
                                                exit={{opacity: 0, height: 0}}
                                                className="rounded-lg px-4 py-3 text-sm"
                                                style={{
                                                    background: "rgba(239,68,68,0.1)",
                                                    border: "1px solid rgba(239,68,68,0.2)",
                                                    color: "#f87171",
                                                }}
                                            >
                                                ⚠️ {error}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Success */}
                                    <AnimatePresence>
                                        {success && (
                                            <motion.div
                                                initial={{opacity: 0, scale: 0.9}}
                                                animate={{opacity: 1, scale: 1}}
                                                className="rounded-lg px-4 py-3 text-sm text-center"
                                                style={{
                                                    background: "rgba(34,197,94,0.1)",
                                                    border: "1px solid rgba(34,197,94,0.2)",
                                                    color: "#4ade80",
                                                }}
                                            >
                                                ✅ Muvaffaqiyatli tasdiqlandi!
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Footer */}
                                <div
                                    className="flex gap-3 px-6 pb-6"
                                >
                                    <motion.button
                                        onClick={closeModal}
                                        whileHover={{scale: 1.02}}
                                        whileTap={{scale: 0.98}}
                                        disabled={loading}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
                                        style={{
                                            background: "rgba(255,255,255,0.06)",
                                            color: "#9ca3af",
                                            border: "1px solid rgba(255,255,255,0.08)",
                                        }}
                                    >
                                        Bekor qilish
                                    </motion.button>

                                    <motion.button
                                        onClick={handleSubmit}
                                        whileHover={!loading ? {scale: 1.02} : {}}
                                        whileTap={!loading ? {scale: 0.98} : {}}
                                        disabled={loading || !file}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white relative overflow-hidden"
                                        style={{
                                            background:
                                                !file || loading
                                                    ? "rgba(99,102,241,0.3)"
                                                    : "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                                            boxShadow:
                                                file && !loading
                                                    ? "0 4px 15px rgba(99,102,241,0.4)"
                                                    : "none",
                                            cursor: !file || loading ? "not-allowed" : "pointer",
                                        }}
                                    >
                                        <AnimatePresence mode="wait">
                                            {loading ? (
                                                <motion.span
                                                    key="loading"
                                                    initial={{opacity: 0}}
                                                    animate={{opacity: 1}}
                                                    exit={{opacity: 0}}
                                                    className="flex items-center justify-center gap-2"
                                                >
                                                    <motion.span
                                                        animate={{rotate: 360}}
                                                        transition={{repeat: Infinity, duration: 0.8, ease: "linear"}}
                                                        className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                                    />
                                                    Yuklanmoqda...
                                                </motion.span>
                                            ) : (
                                                <motion.span
                                                    key="idle"
                                                    initial={{opacity: 0}}
                                                    animate={{opacity: 1}}
                                                    exit={{opacity: 0}}
                                                >
                                                    Tasdiqlash
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}