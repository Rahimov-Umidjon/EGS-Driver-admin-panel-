import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    ZoomIn,
    ZoomOut,
    Download,
    ChevronLeft,
    ChevronRight,
    Maximize2,
    FileText,
    Shield,
    Receipt,
    File,
} from "lucide-react";
import { downloadKazepiFile } from "../../api/downloadFile";

// ─── TYPES ───────────────────────────────────────────────────────────────────

type CategoryKey =
    | "polis"
    | "cmr"
    | "payment_check"
    | "invoice"
    | "packing_list"
    | "export_declaration"
    | "tir"
    | "ct1"
    | "fito"
    | "obshiy_forma"
    | "forma_a"
    | "tex_passport"
    | "passport"
    | "driving_license"
    | "insurance_certificate";

interface ImageItem {
    id: number;
    queue_id: number;
    path: string;
    type: string;
    status: "approved" | "pending" | "rejected" | string;
    created_at: string;
    updated_at: string;
    mime_type?: string;
}

interface CategoryData {
    key: CategoryKey;
    label: string;
    icon: React.ReactNode;
    color: string;
    accent: string;
    images: ImageItem[];
}

interface ImageViewerModalProps {
    open: boolean;
    onClose: () => void;
    images?: {
        polis?: ImageItem[];
        insurance_certificate?: ImageItem[];
        cmr?: ImageItem[];
        invoice?: ImageItem[];
        packing_list?: ImageItem[];
        export_declaration?: ImageItem[];
        tir?: ImageItem[];
        ct1?: ImageItem[];
        fito?: ImageItem[];
        obshiy_forma?: ImageItem[];
        forma_a?: ImageItem[];
        payment_check?: ImageItem[];
        passport?: ImageItem[];
        driving_license?: ImageItem[];
        tex_passport?: ImageItem[];
    };
    imgType?: string[];
    type?: "kazepi" | "queue" | "uzepi" | "passport" | "guarantee";
}

const BASE_URL = "https://mobile-test.izisol.uz/storage/";

// ─── CATEGORY CONFIG ──────────────────────────────────────────────────────────

const getCategoryConfig = (images: ImageViewerModalProps["images"]): CategoryData[] => [
    {
        key: "polis",
        label: "Polis",
        icon: <Shield size={14} />,
        color: "from-blue-600 to-blue-800",
        accent: "#3b82f6",
        images: images?.polis ?? [],
    },
    {
        key: "cmr",
        label: "CMR",
        icon: <FileText size={14} />,
        color: "from-emerald-600 to-emerald-800",
        accent: "#10b981",
        images: images?.cmr ?? [],
    },
    {
        key: "payment_check",
        label: "Chek",
        icon: <Receipt size={14} />,
        color: "from-violet-600 to-violet-800",
        accent: "#8b5cf6",
        images: images?.payment_check ?? [],
    },
    {
        key: "invoice",
        label: "Invoice",
        icon: <FileText size={14} />,
        color: "from-orange-600 to-orange-800",
        accent: "#f97316",
        images: images?.invoice ?? [],
    },
    {
        key: "packing_list",
        label: "Packing List",
        icon: <FileText size={14} />,
        color: "from-yellow-600 to-yellow-800",
        accent: "#eab308",
        images: images?.packing_list ?? [],
    },
    {
        key: "export_declaration",
        label: "Export Declaration",
        icon: <FileText size={14} />,
        color: "from-red-600 to-red-800",
        accent: "#ef4444",
        images: images?.export_declaration ?? [],
    },
    {
        key: "tir",
        label: "TIR",
        icon: <FileText size={14} />,
        color: "from-indigo-600 to-indigo-800",
        accent: "#6366f1",
        images: images?.tir ?? [],
    },
    {
        key: "ct1",
        label: "CT-1",
        icon: <FileText size={14} />,
        color: "from-teal-600 to-teal-800",
        accent: "#14b8a6",
        images: images?.ct1 ?? [],
    },
    {
        key: "fito",
        label: "Fito",
        icon: <FileText size={14} />,
        color: "from-green-600 to-green-800",
        accent: "#22c55e",
        images: images?.fito ?? [],
    },
    {
        key: "obshiy_forma",
        label: "Obshiy Forma",
        icon: <FileText size={14} />,
        color: "from-gray-600 to-gray-800",
        accent: "#6b7280",
        images: images?.obshiy_forma ?? [],
    },
    {
        key: "forma_a",
        label: "Forma A",
        icon: <FileText size={14} />,
        color: "from-pink-600 to-pink-800",
        accent: "#ec4899",
        images: images?.forma_a ?? [],
    },
    {
        key: "insurance_certificate",
        label: "Sug'urta sertifikati",
        icon: <FileText size={14} />,
        color: "from-pink-600 to-pink-800",
        accent: "#ec4899",
        images: images?.insurance_certificate ?? [],
    },
    {
        key: "tex_passport",
        label: "Tex Passport",
        icon: <FileText size={14} />,
        color: "from-green-600 to-green-800",
        accent: "#22c5aa",
        images: images?.tex_passport ?? [],
    },
    {
        key: "passport",
        label: "Passport",
        icon: <FileText size={14} />,
        color: "from-green-600 to-green-800",
        accent: "#29279e",
        images: images?.passport ?? [],
    },
    {
        key: "driving_license",
        label: "Driving License",
        icon: <FileText size={14} />,
        color: "from-green-600 to-green-800",
        accent: "#9722c5",
        images: images?.driving_license ?? [],
    },
];

// ─── LIGHTBOX ────────────────────────────────────────────────────────────────

interface LightboxProps {
    images: ImageItem[];
    startIndex: number;
    onClose: () => void;
    accentColor: string;
    type?: "kazepi" | "queue" | "uzepi" | "passport" | "guarantee";
}

function Lightbox({ images, startIndex, onClose, accentColor, type }: LightboxProps) {
    const [current, setCurrent] = useState(startIndex);
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef<{ x: number; y: number } | null>(null);

    const resetView = useCallback(() => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    }, []);

    const prev = useCallback(() => {
        setCurrent((c) => (c - 1 + images.length) % images.length);
        resetView();
    }, [images.length, resetView]);

    const next = useCallback(() => {
        setCurrent((c) => (c + 1) % images.length);
        resetView();
    }, [images.length, resetView]);

    const handleZoomIn = useCallback(() => {
        setZoom((z) => Math.min(4, z + 0.25));
        setPosition({ x: 0, y: 0 });
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom((z) => {
            const next = Math.max(0.5, z - 0.25);
            if (next <= 1) setPosition({ x: 0, y: 0 });
            return next;
        });
    }, []);

    // Mouse drag handlers
    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            if (zoom <= 1) return;
            e.preventDefault();
            setIsDragging(true);
            dragStart.current = {
                x: e.clientX - position.x,
                y: e.clientY - position.y,
            };
        },
        [zoom, position]
    );

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (!isDragging || !dragStart.current) return;
            setPosition({
                x: e.clientX - dragStart.current.x,
                y: e.clientY - dragStart.current.y,
            });
        },
        [isDragging]
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        dragStart.current = null;
    }, []);

    // Touch drag handlers
    const handleTouchStart = useCallback(
        (e: React.TouchEvent) => {
            if (zoom <= 1 || e.touches.length !== 1) return;
            const t = e.touches[0];
            dragStart.current = {
                x: t.clientX - position.x,
                y: t.clientY - position.y,
            };
        },
        [zoom, position]
    );

    const handleTouchMove = useCallback(
        (e: React.TouchEvent) => {
            if (!dragStart.current || e.touches.length !== 1) return;
            const t = e.touches[0];
            setPosition({
                x: t.clientX - dragStart.current.x,
                y: t.clientY - dragStart.current.y,
            });
        },
        []
    );

    const handleTouchEnd = useCallback(() => {
        dragStart.current = null;
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") prev();
            if (e.key === "ArrowRight") next();
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [prev, next, onClose]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex flex-col"
            style={{ background: "rgba(0,0,0,0.96)" }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-4 z-10">
                <div className="flex items-center gap-3">
                    <span className="text-white/50 text-sm font-mono">
                        {current + 1} / {images.length}
                    </span>
                    <span className="text-white text-sm font-medium truncate max-w-[200px]">
                        {images[current].type}
                    </span>
                    {zoom > 1 && (
                        <span className="text-white/40 text-xs">
                            — ushlab suring
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Zoom out */}
                    <button
                        onClick={handleZoomOut}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title="Kichiklashtirish"
                    >
                        <ZoomOut size={18} />
                    </button>

                    {/* Zoom level */}
                    <span className="text-white/60 text-xs w-10 text-center font-mono">
                        {Math.round(zoom * 100)}%
                    </span>

                    {/* Zoom in */}
                    <button
                        onClick={handleZoomIn}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title="Kattalashtirish"
                    >
                        <ZoomIn size={18} />
                    </button>

                    {/* Reset zoom */}
                    <button
                        onClick={resetView}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title="Asl o'lcham"
                    >
                        <Maximize2 size={18} />
                    </button>

                    {/* Download */}
                    <button
                        onClick={() =>
                            downloadKazepiFile(
                                images[current].id,
                                type === "kazepi"
                                    ? "kazepi"
                                    : type === "uzepi"
                                    ? "uzepi"
                                    : type === "passport"
                                    ? "passport"
                                    : "queue"
                            )
                        }
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title="Yuklab olish"
                    >
                        <Download size={18} />
                    </button>

                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg bg-white/10 hover:bg-red-500/80 text-white transition-colors ml-2"
                        title="Yopish"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Image area */}
            <div
                className="flex-1 flex items-center justify-center overflow-hidden relative px-16"
                style={{ cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default" }}
            >
                {/* Prev */}
                {images.length > 1 && (
                    <button
                        onClick={prev}
                        className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all z-10"
                    >
                        <ChevronLeft size={24} />
                    </button>
                )}

                <AnimatePresence mode="wait">
                    {images[current].mime_type === "application/pdf" ? (
                        <div className="flex flex-col items-center justify-center gap-4">
                            <File size={64} color="#fff" />
                            <button
                                onClick={() =>
                                    window.open(
                                        `https://mobile-test.izisol.uz/storage/${images[current].path}`,
                                        "_blank"
                                    )
                                }
                                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
                            >
                                PDF ni ochish
                            </button>
                        </div>
                    ) : (
                        <motion.div
                            key={current}
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center justify-center w-full h-full"
                        >
                            <img
                                src={BASE_URL + images[current].path}
                                alt={images[current].type}
                                style={{
                                    transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                                    transformOrigin: "center center",
                                    maxHeight: "calc(100vh - 160px)",
                                    maxWidth: "100%",
                                    objectFit: "contain",
                                    transition: isDragging ? "none" : "transform 0.2s ease",
                                    borderRadius: 8,
                                    boxShadow: `0 0 60px ${accentColor}33`,
                                    cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
                                    userSelect: "none",
                                    WebkitUserSelect: "none",
                                }}
                                draggable={false}
                                onMouseDown={handleMouseDown}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Next */}
                {images.length > 1 && (
                    <button
                        onClick={next}
                        className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all z-10"
                    >
                        <ChevronRight size={24} />
                    </button>
                )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
                <div className="flex items-center justify-center gap-2 py-4 px-6 overflow-x-auto">
                    {images.map((img, i) => (
                        <button
                            key={img.id}
                            onClick={() => {
                                setCurrent(i);
                                resetView();
                            }}
                            className="flex-shrink-0 transition-all duration-200"
                            style={{
                                width: 56,
                                height: 42,
                                borderRadius: 6,
                                overflow: "hidden",
                                border:
                                    i === current
                                        ? `2px solid ${accentColor}`
                                        : "2px solid transparent",
                                opacity: i === current ? 1 : 0.45,
                            }}
                        >
                            <img
                                src={BASE_URL + img.path}
                                alt={img.type}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </motion.div>
    );
}

// ─── MAIN MODAL ───────────────────────────────────────────────────────────────

export default function ImageViewerModal({
    open,
    onClose,
    images,
    imgType,
    type,
}: ImageViewerModalProps) {
    const [activeTab, setActiveTab] = useState<CategoryKey>("polis");
    const [lightbox, setLightbox] = useState<{
        images: ImageItem[];
        index: number;
        accent: string;
    } | null>(null);

    const categories = getCategoryConfig(images).filter((obj) =>
        imgType?.includes(obj.key)
    );

    const activeCat = categories.find((c) => c.key === activeTab)!;

    const openLightbox = (imgs: ImageItem[], index: number, accent: string) => {
        setLightbox({ images: imgs, index, accent });
    };

    useEffect(() => {
        if (imgType && imgType.length > 0) {
            setActiveTab(imgType[0] as CategoryKey);
        }
    }, [imgType]);

    return (
        <>
            <AnimatePresence>
                {open && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 z-[1200]"
                            style={{
                                background: "rgba(15,23,42,0.75)",
                                backdropFilter: "blur(2px)",
                            }}
                        />

                        {/* Modal */}
                        <motion.div
                            key="modal"
                            initial={{ opacity: 0, y: 32, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 24, scale: 0.97 }}
                            transition={{ type: "spring", damping: 28, stiffness: 320 }}
                            className="fixed inset-0 z-[1300] flex items-center justify-center p-4 pointer-events-none"
                        >
                            <div
                                className="pointer-events-auto w-full max-w-[1800px] rounded-2xl overflow-hidden shadow-2xl"
                                style={{
                                    background: "#0f172a",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    maxHeight: "90vh",
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
                                    <div>
                                        <h2 className="text-white font-semibold text-base tracking-tight">
                                            Hujjatlar
                                        </h2>
                                        <p className="text-white/40 text-xs mt-0.5">
                                            Rasmlarni ko'rish va yuklab olish
                                        </p>
                                    </div>
                                    <div className="flex items-center">
                                        <button
                                            onClick={onClose}
                                            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                                        >
                                            <Download size={18} color="#fff" />
                                        </button>
                                        <button
                                            onClick={onClose}
                                            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                                        >
                                            <X size={18} color="#fff" />
                                        </button>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex gap-1 px-6 pt-4">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.key}
                                            onClick={() => setActiveTab(cat.key)}
                                            className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                                            style={{
                                                color:
                                                    activeTab === cat.key
                                                        ? "#fff"
                                                        : "rgba(255,255,255,0.4)",
                                                background:
                                                    activeTab === cat.key
                                                        ? cat.accent + "22"
                                                        : "transparent",
                                            }}
                                        >
                                            {activeTab === cat.key && (
                                                <motion.div
                                                    layoutId="tab-pill"
                                                    className="absolute inset-0 rounded-xl"
                                                    style={{
                                                        background: cat.accent + "18",
                                                        border: `1px solid ${cat.accent}44`,
                                                    }}
                                                    transition={{
                                                        type: "spring",
                                                        damping: 24,
                                                        stiffness: 300,
                                                    }}
                                                />
                                            )}
                                            <span
                                                style={{
                                                    color:
                                                        activeTab === cat.key
                                                            ? cat.accent
                                                            : undefined,
                                                    position: "relative",
                                                }}
                                            >
                                                {cat.icon}
                                            </span>
                                            <span className="relative">{cat.label}</span>
                                            <span
                                                className="relative text-[11px] rounded-full px-1.5 py-0.5 font-mono"
                                                style={{
                                                    background:
                                                        activeTab === cat.key
                                                            ? cat.accent + "33"
                                                            : "rgba(255,255,255,0.08)",
                                                    color:
                                                        activeTab === cat.key
                                                            ? cat.accent
                                                            : "rgba(255,255,255,0.4)",
                                                }}
                                            >
                                                {cat.images.length}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                {/* Image Grid */}
                                <div className="flex-1 overflow-y-auto p-6 pt-4 scrollbar scrollbar-thumb-gray-400 scrollbar-thin scrollbar-track-gray-100">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeTab}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.18 }}
                                            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                                        >
                                            {activeCat?.images.length === 0 ? (
                                                <div className="col-span-3 flex flex-col items-center justify-center py-16 text-white/30">
                                                    <FileText
                                                        size={40}
                                                        className="mb-3 opacity-40"
                                                    />
                                                    <p className="text-sm">Hujjat topilmadi</p>
                                                </div>
                                            ) : (
                                                activeCat?.images.map((img, i) => (
                                                    <motion.div
                                                        key={img.id}
                                                        initial={{ opacity: 0, scale: 0.94 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        className="group relative rounded-xl overflow-hidden cursor-pointer"
                                                        style={{
                                                            aspectRatio: "4/3",
                                                            background: "rgba(255,255,255,0.04)",
                                                            border: "1px solid rgba(255,255,255,0.08)",
                                                        }}
                                                        onClick={() => {
                                                            if (
                                                                img.mime_type === "application/pdf"
                                                            ) {
                                                                window.open(
                                                                    `https://mobile-test.izisol.uz/storage/${img.path}`,
                                                                    "_blank"
                                                                );
                                                            } else {
                                                                openLightbox(
                                                                    activeCat?.images,
                                                                    i,
                                                                    activeCat?.accent
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        {img.mime_type === "application/pdf" ? (
                                                            <div className="flex h-full items-center justify-center">
                                                                <File size={50} color="#fff" />
                                                            </div>
                                                        ) : (
                                                            <img
                                                                src={BASE_URL + img.path}
                                                                alt={img.type}
                                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                            />
                                                        )}

                                                        {/* Hover overlay */}
                                                        <div
                                                            className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                            style={{
                                                                background: "rgba(0,0,0,0.6)",
                                                            }}
                                                        >
                                                            <Maximize2
                                                                size={22}
                                                                className="text-white mb-2"
                                                            />
                                                            <span className="text-white text-xs font-medium">
                                                                Ko'rish
                                                            </span>
                                                        </div>

                                                        {/* Label */}
                                                        <div
                                                            className="absolute bottom-0 left-0 right-0 px-3 py-4"
                                                            style={{
                                                                background:
                                                                    img.status === "approved"
                                                                        ? "linear-gradient(to top, rgba(3, 77, 22, 0.8), transparent)"
                                                                        : img.status === "pending"
                                                                        ? "linear-gradient(to top, rgba(108, 91, 4, 0.8), transparent)"
                                                                        : "linear-gradient(to top, rgba(108, 4, 4, 0.8), transparent)",
                                                            }}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <p className="text-white text-[11px] font-medium truncate">
                                                                    {img.type}
                                                                </p>
                                                                <p className="text-white text-[11px] font-medium truncate">
                                                                    {img.status}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Download btn on hover */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                downloadKazepiFile(
                                                                    img.id,
                                                                    type === "kazepi"
                                                                        ? "kazepi"
                                                                        : "queue"
                                                                );
                                                            }}
                                                            className="absolute top-2 right-2 p-4 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-[4000]"
                                                            style={{
                                                                background: "rgba(0,0,0,0.6)",
                                                            }}
                                                            title="Yuklab olish"
                                                        >
                                                            <Download
                                                                size={13}
                                                                className="text-white"
                                                            />
                                                        </button>
                                                    </motion.div>
                                                ))
                                            )}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Lightbox */}
            <AnimatePresence>
                {lightbox && (
                    <Lightbox
                        images={lightbox.images}
                        startIndex={lightbox.index}
                        accentColor={lightbox.accent}
                        onClose={() => setLightbox(null)}
                        type={type}
                    />
                )}
            </AnimatePresence>
        </>
    );
}