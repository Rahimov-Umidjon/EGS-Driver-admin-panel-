import { File, IdCard, MapPinned, Truck, X, MessageSquareText, FilePen, ClipboardList, CheckCircle2, XCircle, ChevronDown, ChevronRight, SlidersHorizontal, ShieldUser, UserRoundCog, UserRoundPen } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { LogOut, Loader2 } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext.tsx";
import Pusher from "pusher-js";
import api from "../../api/api.ts";
import Profile from "../profile/index.tsx";

interface SidebarItem {
    id: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
    path: string;
    children?: SidebarItem[];
    permission?: string[]
}

interface ResponseData {
    total: number;
    unread_count: {
        [key: number]: number;
    };
}

const sidebarItems: SidebarItem[] = [
    { id: "map", icon: MapPinned, label: "Xarita", path: "/new-map" },
    {
        id: "admins",
        icon: UserRoundCog,
        label: "Foydalanuvchilar",
        path: "/admins",
        permission: ["admin.view", "admin.update", "admin.approve", "admin.reject"],
    },
    {
        id: "roles",
        icon: ShieldUser,
        label: "Rollar",
        path: "/roles",
        permission: ["role.view", "role.update", "role.approve", "role.reject", "role.permissions.view", "role.permissions.assign"],

    },
    {
        id: "drivers",
        icon: Truck,
        label: "Haydovchilar",
        path: "/drivers",
        permission: ["driver.view", "driver.update"],

    },
    {
        id: "chats",
        icon: MessageSquareText,
        label: "Chatlar",
        path: "/chats",
        permission: ["chat.view", "chat.send", "chat.read"],
    },
    {
        id: "passport",
        icon: IdCard,
        label: "Passportlar",
        path: "/passports",
        permission: ["driver-verify.view", "driver-verify.approve", "driver-verify.reject"],

    },
    {
        id: "passports",
        icon: IdCard,
        label: "Passportlar",
        path: "/passport",
        permission: ["driver-verify.view", "driver-verify.approve", "driver-verify.reject"],
    },
    { id: "verificationQueue", icon: FilePen, label: "Navbat", path: "/queue/pending", permission: ["queue.view", "queue.update", "queue.approve", "queue.reject"], },
    {
        id: "queueHistory",
        icon: ClipboardList,
        label: "Navbat tarixi",
        path: "/queue",
        permission: ["queue.view", "queue.update", "queue.approve", "queue.reject"],
        children: [
            { id: "queueSuccess", icon: CheckCircle2, label: "Muvaffaqiyatli", path: "/queue/success" },
            { id: "queueFailed", icon: XCircle, label: "Muvaffaqiyatsiz", path: "/queue/failed" },
        ],
    },
    { id: "verificationKazEPI", icon: FilePen, label: "KazEPI", path: "/kazepi/pending", permission: ["kazepi.view", "kazepi.update", "kazepi.approve", "kazepi.reject"], },
    {
        id: "kazepiHistory",
        icon: ClipboardList,
        label: "KazEPI tarixi",
        path: "/kazepi",
        permission: ["kazepi.view", "kazepi.update", "kazepi.approve", "kazepi.reject"],
        children: [
            { id: "kazepiSuccess", icon: CheckCircle2, label: "Muvaffaqiyatli", path: "/kazepi/success" },
            { id: "kazepiFailed", icon: XCircle, label: "Muvaffaqiyatsiz", path: "/kazepi/failed" },
        ],
    },
    { id: "verificationUzEPI", icon: FilePen, label: "UzEPI", path: "/uzepi/pending", permission: ["uzepi.view", "uzepi.update", "uzepi.approve", "uzepi.reject"], },
    {
        id: "uzepiHistory",
        icon: ClipboardList,
        label: "UzEPI tarixi",
        path: "/uzepi",
        permission: ["uzepi.view", "uzepi.update", "uzepi.approve", "uzepi.reject"],
        children: [
            { id: "uzepiSuccess", icon: CheckCircle2, label: "Muvaffaqiyatli", path: "/uzepi/success" },
            { id: "uzepiFailed", icon: XCircle, label: "Muvaffaqiyatsiz", path: "/uzepi/failed" },
        ],
    },
    // { id: "prices", icon: SlidersHorizontal, label: "Narxlar", path: "/prices" },

    { id: "verificationRusQueue", icon: FilePen, label: "Russiya navbat", path: "/rus-queue/pending", permission: ["russia-queue.view", "russia-queue.update", "russia-queue.approve", "russia-queue.reject"] },
    {
        id: "rusQueueHistory",
        icon: ClipboardList,
        label: "Rossiya navbat tarixi",
        path: "/rus-queue",
        permission: ["russia-queue.view", "russia-queue.update", "russia-queue.approve", "russia-queue.reject"],
        children: [
            { id: "rusQueueSuccess", icon: CheckCircle2, label: "Muvaffaqiyatli", path: "/rus-queue/success" },
            { id: "rusQueueFailed", icon: XCircle, label: "Muvaffaqiyatsiz", path: "/rus-queue/failed" },
        ],
    },

    { id: "verificationRusKazInsurance", icon: FilePen, label: "RusKaz sug'urtasi", path: "/rus-kaz-insurance/pending", permission: ["insurance.view", "insurance.update", "insurance.approve", "insurance.reject"], },
    {
        id: "rusKazInsuranceHistory",
        icon: ClipboardList,
        label: "RusKaz sug'urtasi tarixi",
        path: "/rus-kaz-insurance",
        permission: ["insurance.view", "insurance.update", "insurance.approve", "insurance.reject"],
        children: [
            { id: "rusKazInsuranceSuccess", icon: CheckCircle2, label: "Muvaffaqiyatli", path: "/rus-kaz-insurance/success" },
            { id: "rusKazInsuranceFailed", icon: XCircle, label: "Muvaffaqiyatsiz", path: "/rus-kaz-insurance/failed" },
        ],
    },

    { id: "Guarantees", icon: FilePen, label: "Guarantees", path: "/guarantees/pending", permission: ["guarantee.view", "guarantee.update", "guarantee.approve", "guarantee.reject"], },
    {
        id: "guaranteesHistory",
        icon: ClipboardList,
        label: "Guarantees tarixi",
        path: "/guarantees",
        permission: ["guarantee.view", "guarantee.update", "guarantee.approve", "guarantee.reject"],
        children: [
            { id: "guaranteesSuccess", icon: CheckCircle2, label: "Muvaffaqiyatli", path: "/guarantees/success" },
            { id: "guaranteesFailed", icon: XCircle, label: "Muvaffaqiyatsiz", path: "/guarantees/failed" },
        ],
    },

    {
        id: "prices",
        icon: SlidersHorizontal,
        label: "Narxlar",
        path: "/prices",
        permission: ["service-pricing.view", "service-pricing.update"],
    },

    {
        id: "profile",
        icon: UserRoundPen,
        label: "Profil",
        path: "/",
        children: [
            { id: "logout", icon: LogOut, label: "Chiqish", path: "/" },
            // { id: "guaranteesFailed", icon: XCircle, label: "Muvaffaqiyatsiz", path: "/guarantees/failed" },
        ],
    },

];


// permission: ["profile.view", "profile.update"],



export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const { setUnreadCount, unreadCount } = useAuth();
    const [expandedItems, setExpandedItems] = useState<string[]>([]);




    const activeItem = sidebarItems.find((item) => {
        const normalizedPath = item.path.endsWith("/") ? item.path.slice(0, -1) : item.path;
        const normalizedLocation = location.pathname.endsWith("/")
            ? location.pathname.slice(0, -1)
            : location.pathname;
        return (
            normalizedLocation === normalizedPath ||
            normalizedLocation.startsWith(normalizedPath + "/")
        );
    })?.id || "";

    // Auto-expand parent if a child route is active
    useEffect(() => {
        sidebarItems.forEach((item) => {
            if (item.children) {
                const childActive = item.children.some((child) =>
                    location.pathname.startsWith(child.path)
                );
                if (childActive && !expandedItems.includes(item.id)) {
                    setExpandedItems((prev) => [...prev, item.id]);
                }
            }
        });
    }, [location.pathname]);

    const toggleExpand = (id: string) => {
        setExpandedItems((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const { logout, loading, token, user } = useAuth();
    const [open, setOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        setOpen(false);
        navigate("/login");
    };

    const hasPermission = (itemPermissions?: string[]): boolean => {
        // Permission yo'q = hammaga ko'rinadi
        if (!itemPermissions || itemPermissions.length === 0) return true;

        const userPermissions: string[] =
            user?.admin?.roles?.[0]?.permissions?.map((p: { name: string }) => p.name) ?? [];

        // Kamida bitta permission mos kelsa - ko'rinadi
        return itemPermissions.some(permission =>
            userPermissions.includes(permission)
        );
    };

    const visibleItems = sidebarItems.filter(item => hasPermission(item.permission));

    useEffect(() => {
        if (user) {
            const pusher = new Pusher(`${import.meta.env.VITE_PUSHER_APP_KEY}`, {
                cluster: `${import.meta.env.VITE_PUSHER_APP_CLUSTER}`,
                authEndpoint: 'https://mobile-test.izisol.uz/api/broadcasting/auth',
                auth: {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            });

            const channel = pusher.subscribe(`private-admin.${user?.id}`);
            channel.bind('admin.notification', (data: ResponseData) => {
                console.log('private-admin', data);
                setUnreadCount(data);
            });

            return () => {
                channel.unbind_all();
                channel.unsubscribe();
            };
        }
    }, [user]);

    const fetchUnreadCount = async () => {
        try {
            const res = await api.get('/admin/chat/unread-stats');
            setUnreadCount(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
    }, []);

    return (
        <div className={'w-[300px]  border-r border-indigo-100 pl-4 py-6 h-screen flex flex-col justify-between items-center '}>

            <div className={"flex text-center justify-center gap-2 pb-6 border-b w-full"}>
                {/* <div className={"bg-indigo-600 h-6 w-6 rounded-[6px]"}></div>
                <p>Admin Panel</p> */}
                <Profile />
            </div>

            {/* Sidebar */}
            <aside className={`overflow-y-auto scrollbar pb-12 scrollbar-thumb-gray-400 pr-4 scrollbar-thin scrollbar-track-gray-100 h-screen w-full mt-6 bg-white flex flex-col items-start space-y-1 z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 `}>
                {visibleItems?.map(({ id, icon: Icon, path, label, children }) => {
                    const isActive = activeItem === id;
                    const isExpanded = expandedItems.includes(id);
                    const hasChildren = Boolean(children?.length);
                    return (
                        <div key={id} className="w-full">
                            <button
                                onClick={() => {
                                    if (hasChildren) {
                                        toggleExpand(id);
                                    } else {
                                        navigate(path);
                                        setIsOpen(false);
                                    }
                                }}
                                className={`relative w-full flex items-center gap-x-2 px-4 py-2 rounded-lg transition-colors
                                        ${isActive
                                        ? "text-indigo-600 bg-indigo-100"
                                        : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
                                    }`}
                                aria-label={id}
                            >
                                {isActive && (
                                    <span className="absolute right-0 top-0 h-full w-1 bg-indigo-600 rounded-tr-md rounded-br-md" />
                                )}
                                {Icon && <Icon size={24} />}

                                {id === 'chats' && unreadCount?.total !== 0 && (
                                    <div className={'w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white absolute -top-2 -right-2'}>
                                        {unreadCount?.total}
                                    </div>
                                )}

                                <span className="flex-1 text-left">{label}</span>

                                {/* Chevron for expandable items */}
                                {hasChildren && (
                                    <span className="ml-auto">
                                        {isExpanded
                                            ? <ChevronDown size={16} />
                                            : <ChevronRight size={16} />
                                        }
                                    </span>
                                )}
                            </button>

                            {/* Sub-items */}
                            <AnimatePresence initial={false}>
                                {hasChildren && isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="ml-4 mt-1 space-y-1 border-l-2 border-indigo-100 pl-3">
                                            {children!.map(({ id: childId, icon: ChildIcon, path: childPath, label: childLabel }) => {
                                                const isChildActive = location.pathname === childPath || location.pathname.startsWith(childPath + "/");
                                                return (
                                                    <button
                                                        key={childId}
                                                        onClick={() => {
                                                            if (childId === 'logout') {
                                                                setOpen(true)
                                                            } else {
                                                                navigate(childPath);
                                                                setIsOpen(false);
                                                            }

                                                        }}
                                                        className={`relative w-full flex items-center gap-x-2 px-3 py-2 rounded-lg transition-colors text-sm
                                                                ${isChildActive
                                                                ? "text-indigo-600 bg-indigo-100 font-medium"
                                                                : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
                                                            }
                                                            
                                                            ${childId === 'logout'
                                                                ? "text-red-600 bg-red-100 font-medium"
                                                                : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
                                                            }
                                                            
                                                            `}
                                                    >
                                                        {/* Colored dot indicator for sub-items */}

                                                        {ChildIcon && <ChildIcon size={18} />}
                                                        {childLabel}
                                                    </button>
                                                );
                                            })}


                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )
                    // : return ;
                })}
            </aside>


            {/* Logout Dialog */}
            <Dialog.Root open={open} onOpenChange={setOpen}>
                 

                <AnimatePresence>
                    {open && (
                        <Dialog.Portal forceMount>
                            <Dialog.Overlay asChild>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
                                />
                            </Dialog.Overlay>

                            <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] focus:outline-none">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <Dialog.Title className="text-lg font-semibold text-gray-800">
                                            Chiqmoqchimisiz?
                                        </Dialog.Title>
                                        <Dialog.Close asChild>
                                            <button className="text-gray-400 hover:text-gray-600">
                                                <X className="h-5 w-5" />
                                            </button>
                                        </Dialog.Close>
                                    </div>

                                    <p className="text-gray-600 text-sm mb-5">
                                        Siz tizimdan chiqmoqchisiz. Davom etishni tasdiqlang.
                                    </p>

                                    <div className="flex justify-end gap-3">
                                        <Dialog.Close asChild>
                                            <button className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100 transition">
                                                Bekor qilish
                                            </button>
                                        </Dialog.Close>

                                        <button
                                            onClick={handleLogout}
                                            disabled={loading}
                                            className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60 flex items-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="animate-spin h-4 w-4" />
                                                    Chiqilmoqda...
                                                </>
                                            ) : (
                                                "Ha, chiqish"
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            </Dialog.Content>
                        </Dialog.Portal>
                    )}
                </AnimatePresence>
            </Dialog.Root>

            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-black opacity-40 z-30 md:hidden"
                    aria-hidden="true"
                />
            )}


        </div>
    );
}