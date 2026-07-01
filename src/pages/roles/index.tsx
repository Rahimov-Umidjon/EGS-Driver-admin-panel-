import { useEffect, useState, useMemo, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow, 
    Tooltip,
    CircularProgress,
    Snackbar,
    Alert,
    Button,
} from "@mui/material"; 
import AddIcon from "@mui/icons-material/Add";
import {  Save, Trash2, Pencil, Plus, Key, Check,  User } from "lucide-react";
import api from "../../api/api";
import { toast } from "react-toastify";


// ─── Types ────────────────────────────────────────────────────────────────────

interface Permission {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
}

interface Role {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    permissions?: Permission[];
}

// ─── Permission action rengi ──────────────────────────────────────────────────

const ACTION_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
    view: { bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-400" },
    update: { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-400" },
    approve: { bg: "bg-green-50", text: "text-green-600", dot: "bg-green-400" },
    reject: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400" },
    create: { bg: "bg-purple-50", text: "text-purple-600", dot: "bg-purple-400" },
    delete: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400" },
    send: { bg: "bg-teal-50", text: "text-teal-600", dot: "bg-teal-400" },
    read: { bg: "bg-sky-50", text: "text-sky-600", dot: "bg-sky-400" },
    assign: { bg: "bg-indigo-50", text: "text-indigo-600", dot: "bg-indigo-400" },
};

function getActionCfg(permName: string) {
    const action = permName.split(".").pop() ?? "";
    return ACTION_CONFIG[action] ?? { bg: "bg-gray-50", text: "text-gray-500", dot: "bg-gray-400" };
}


const statusConfig: Record<string, { label: string; classes: string; icon: ReactNode }> = {

    user: {
        label: "User",
        classes: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
        icon: <User  size={11} className="text-amber-600" />,
    },
    admin: {
        label: "Admin",
        classes: "bg-blue-50 text-blue-800 ring-1 ring-blue-200",
        icon: <User size={11} className="text-teal-600" />,
    },

    superadmin: {
        label: "Superadmin",
        classes: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
        icon: <User size={11} className="text-emerald-500" />,
    },

};


// ─── Permissions ni module bo'yicha guruhlash ─────────────────────────────────

function groupByModule(permissions: Permission[]): Record<string, Permission[]> {
    return permissions.reduce<Record<string, Permission[]>>((acc, p) => {
        const module = p.name.split(".")[0];
        if (!acc[module]) acc[module] = [];
        acc[module].push(p);
        return acc;
    }, {});
}

// ─── Reusable Field ───────────────────────────────────────────────────────────

function Field({
    label, value, onChange, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
    return (
        <div>
            <label className="text-[12.5px] text-gray-500 block mb-1.5">{label}</label>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-gray-200 text-[13px] px-3 py-2.5 outline-none focus:border-blue-300 bg-gray-50 transition-colors"
            />
        </div>
    );
}

// ─── Role Create/Edit Modal ───────────────────────────────────────────────────

interface RoleFormModalProps {
    isOpen: boolean;
    isEdit: boolean;
    name: string;
    loading: boolean;
    error: string | null;
    onChange: (v: string) => void;
    onClose: () => void;
    onSubmit: () => void;
}

function RoleFormModal({ isOpen, isEdit, name, loading, error, onChange, onClose, onSubmit }: RoleFormModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
                        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                                {isEdit ? <Pencil size={16} className="text-blue-500" /> : <Plus size={16} className="text-blue-500" />}
                            </div>
                            <div>
                                <p className="text-[15px] font-semibold text-gray-900">
                                    {isEdit ? "Rolni tahrirlash" : "Yangi rol yaratish"}
                                </p>
                                <p className="text-[12px] text-gray-400">Rol nomini kiriting</p>
                            </div>
                        </div>

                        <hr className="border-gray-100 mb-4" />

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className="mb-3 px-3 py-2 rounded-xl bg-red-50 border border-red-100 text-[12.5px] text-red-500"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Field label="Rol nomi *" value={name} onChange={onChange} placeholder="Masalan: moderator" />

                        <div className="flex gap-2 mt-5">
                            <motion.button whileTap={{ scale: 0.97 }} onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                                Bekor qilish
                            </motion.button>
                            <motion.button whileTap={{ scale: 0.97 }} onClick={onSubmit} disabled={loading}
                                className="flex-1 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors">
                                {loading
                                    ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                                    : <><Save size={14} />{isEdit ? "Saqlash" : "Yaratish"}</>
                                }
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteModal({ isOpen, roleName, loading, onClose, onConfirm }: {
    isOpen: boolean; roleName: string; loading: boolean; onClose: () => void; onConfirm: () => void;
}) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
                        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
                                <Trash2 size={16} className="text-red-500" />
                            </div>
                            <div>
                                <p className="text-[15px] font-semibold text-gray-900">O'chirishni tasdiqlang</p>
                                <p className="text-[12px] text-gray-400">Bu amalni qaytarib bo'lmaydi</p>
                            </div>
                        </div>
                        <hr className="border-gray-100 mb-4" />
                        <p className="text-[13px] text-gray-600 mb-5">
                            <span className="font-semibold text-gray-900">"{roleName}"</span> rolini o'chirmoqchimisiz?
                        </p>
                        <div className="flex gap-2">
                            <motion.button whileTap={{ scale: 0.97 }} onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                                Bekor qilish
                            </motion.button>
                            <motion.button whileTap={{ scale: 0.97 }} onClick={onConfirm} disabled={loading}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors">
                                {loading
                                    ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                                    : <><Trash2 size={14} />O'chirish</>
                                }
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ─── Permissions Modal ────────────────────────────────────────────────────────

function PermissionsModal({ isOpen, role, allPermissions, onClose, onSaved }: {
    isOpen: boolean;
    role: Role | null;
    allPermissions: Permission[];
    onClose: () => void;
    onSaved: () => void;
}) {
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Role ochildanda uning permissions larini fetch qilib selected ga qo'yamiz
    useEffect(() => {
        if (!isOpen || !role) return;
        const fetch = async () => {
            setFetchLoading(true);
            setError(null);
            try {
                const res = await api.get(`/admin/roles/${role.id}/permissions`);
                const perms: Permission[] = res.data?.permissions ?? res.data?.data ?? [];
                setSelected(new Set(perms.map((p) => p.id)));
            } catch {
                setError("Permissionlarni yuklashda xatolik");
            } finally {
                setFetchLoading(false);
            }
        };
        fetch();
    }, [isOpen, role]);

    const grouped = useMemo(() => groupByModule(allPermissions), [allPermissions]);

    const toggleOne = (id: number) => {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleModule = (perms: Permission[]) => {
        const allChecked = perms.every((p) => selected.has(p.id));
        setSelected((prev) => {
            const next = new Set(prev);
            perms.forEach((p) => allChecked ? next.delete(p.id) : next.add(p.id));
            return next;
        });
    };

    const handleSave = async () => {
        if (!role) return;
        setLoading(true);
        setError(null);
        try {
            await api.post(`/admin/roles/${role.id}/permissions`, {
                permissions_id: Array.from(selected),
            });
            onSaved();
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
                        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[85vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                            <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center">
                                <Key size={16} className="text-indigo-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[15px] font-semibold text-gray-900">Permissionlarni belgilash</p>
                                <p className="text-[12px] text-gray-400">
                                    <span className="font-medium text-gray-600">{role?.name}</span> — {selected.size} ta tanlangan
                                </p>
                            </div>
                        </div>

                        <hr className="border-gray-100 mb-4 flex-shrink-0" />

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className="mb-3 px-3 py-2 rounded-xl bg-red-50 border border-red-100 text-[12.5px] text-red-500 flex-shrink-0"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Content */}
                        <div className="overflow-y-auto scrollbar scrollbar-thumb-gray-400 pr-4 scrollbar-thin scrollbar-track-gray-100  flex-1 pr-1 space-y-4">
                            {fetchLoading ? (
                                <div className="flex items-center justify-center py-10">
                                    <CircularProgress size={28} />
                                </div>
                            ) : (
                                Object.entries(grouped).map(([module, perms]) => {
                                    const allChecked = perms.every((p) => selected.has(p.id));
                                    const someChecked = perms.some((p) => selected.has(p.id));
                                    return (
                                        <div key={module} className="border border-gray-100 rounded-xl overflow-hidden">
                                            {/* Module header */}
                                            <button
                                                onClick={() => toggleModule(perms)}
                                                className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {/* Checkbox */}
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${allChecked
                                                        ? "bg-blue-500 border-blue-500"
                                                        : someChecked
                                                            ? "bg-blue-200 border-blue-300"
                                                            : "border-gray-300 bg-white"
                                                        }`}>
                                                        {(allChecked || someChecked) && <Check size={10} className="text-white" strokeWidth={3} />}
                                                    </div>
                                                    <span className="text-[13px] font-semibold text-gray-700 capitalize">{module}</span>
                                                </div>
                                                <span className="text-[11px] text-gray-400">{perms.filter(p => selected.has(p.id)).length}/{perms.length}</span>
                                            </button>

                                            {/* Permissions */}
                                            <div className="flex flex-wrap gap-2 p-3">
                                                {perms.map((perm) => {
                                                    const cfg = getActionCfg(perm.name);
                                                    const isSelected = selected.has(perm.id);
                                                    const action = perm.name.split(".").slice(1).join(".");
                                                    return (
                                                        <button
                                                            key={perm.id}
                                                            onClick={() => toggleOne(perm.id)}
                                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium transition-all border ${isSelected
                                                                ? `${cfg.bg} ${cfg.text} border-current border-opacity-30 shadow-sm`
                                                                : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
                                                                }`}
                                                        >
                                                            {isSelected && (
                                                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                            )}
                                                            {action}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex gap-2 mt-5 flex-shrink-0">
                            <motion.button whileTap={{ scale: 0.97 }} onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                                Bekor qilish
                            </motion.button>
                            <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={loading}
                                className="flex-1 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors">
                                {loading
                                    ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                                    : <><Save size={14} />Saqlash</>
                                }
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Modals
    const [formOpen, setFormOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [permOpen, setPermOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isEdit, setIsEdit] = useState(false);

    // Form
    const [roleName, setRoleName] = useState("");
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Snack
    const [snack, setSnack] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
        open: false, message: "", severity: "success",
    });

    
    // Fetch
    const fetchRoles = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/roles");
            setRoles(res.data?.data ?? res.data?.data ?? []);
        } catch { 
             toast.error("Rollarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    const fetchPermissions = async () => {
        try {
            const res = await api.get("/admin/permissions");
            setAllPermissions(res.data?.permissions ?? []);
        } catch { 
            toast.error("Permissionlarni yuklashda xatolik");
        }
    };

    useEffect(() => {
        fetchRoles();
        fetchPermissions();
    }, []);

    // Create
    const openCreate = () => {
        setIsEdit(false); setRoleName(""); setFormError(null); setFormOpen(true);
    };
    const handleCreate = async () => {
        if (!roleName.trim()) { setFormError("Rol nomi majburiy"); return; }
        setFormLoading(true);
        try {
            await api.post("/admin/roles", { name: roleName.trim(), guard_name: 'admin' }); 
            toast.success("Rol muvaffaqiyatli yaratildi");
            setFormOpen(false);
            fetchRoles();
        } catch (err: any) {
            setFormError(err?.response?.data?.message ?? "Xatolik yuz berdi");
        } finally { setFormLoading(false); }
    };

    // Edit
    const openEdit = (role: Role) => {
        setIsEdit(true); setSelectedRole(role); setRoleName(role.name); setFormError(null); setFormOpen(true);
    };
    const handleEdit = async () => {
        if (!roleName.trim()) { setFormError("Rol nomi majburiy"); return; }
        setFormLoading(true);
        try {
            await api.put(`/admin/roles/${selectedRole!.id}`, { name: roleName.trim() , guard_name: 'admin' }); 
            toast.success("Rol muvaffaqiyatli yangilandi");
            setFormOpen(false);
            fetchRoles();
        } catch (err: any) {
            setFormError(err?.response?.data?.message ?? "Xatolik yuz berdi");
        } finally { setFormLoading(false); }
    };

    // Delete
    const openDelete = (role: Role) => { setSelectedRole(role); setDeleteOpen(true); };
    const handleDelete = async () => {
        setFormLoading(true);
        try {
            await api.delete(`/admin/roles/${selectedRole!.id}`); 
            toast.success("Rol o'chirildi");
            setDeleteOpen(false);
            fetchRoles();
        } catch (err: any) { 
            toast.error(err?.response?.data?.message ?? "O'chirishda xatolik");
            setDeleteOpen(false);
        } finally { setFormLoading(false); }
    };

    // Permissions
    const openPermissions = (role: Role) => { setSelectedRole(role); setPermOpen(true); };

    const paginatedRoles = roles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="min-h-screen  overflow-y-auto scrollbar   scrollbar-thumb-gray-400   scrollbar-thin scrollbar-track-gray-100 bg-[#f0f4f3] p-8 font-sans"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <h1 className="text-[22px] font-bold text-gray-900 leading-tight">
                            Rollar
                        </h1>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={openCreate}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors"
                    >
                        <AddIcon fontSize="small" />
                        Yangi rol yaratish
                    </motion.button>
                </div>

                {/* Table */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28, duration: 0.4 }}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
                    <Paper sx={{ width: "100%", overflow: "hidden", boxShadow: "none" }}>
                        <TableContainer>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        {["#", "Nomi", "Guard", "Yaratilgan", "Permissionlar", "Amallar"].map((col) => (
                                            <TableCell key={col} sx={{ fontWeight: 600, fontSize: 13 }}>{col}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                                <CircularProgress size={28} />
                                            </TableCell>
                                        </TableRow>
                                    ) : paginatedRoles.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary", fontSize: 13 }}>
                                                Rollar topilmadi
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <AnimatePresence>
                                            {paginatedRoles.map((role, idx) => (
                                                <motion.tr
                                                    key={role.id}
                                                    initial={{ opacity: 0, y: 6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.04 }}
                                                    style={{ display: "table-row" }}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <TableCell sx={{ fontSize: 13, color: "#9ca3af" }}>
                                                        {page * rowsPerPage + idx + 1}
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>
                                                        <span
                                                            key={role.id}
                                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold ${statusConfig[role.name]?.classes ?? 'bg-red-100 text-red-800 ring-1 ring-red-200'}`}
                                                        >
                                                            {statusConfig[role.name]?.icon ?? <User  size={11} className="text-red-600" /> }
                                                            {statusConfig[role.name]?.label ?? role?.name}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-gray-100 text-gray-500 text-[11px] font-medium">
                                                            {role.guard_name}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: 13, color: "#6b7280" }}>
                                                        {new Date(role.created_at).toLocaleDateString("uz-UZ")}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Tooltip title="Permissionlarni boshqarish">
                                                            <motion.button
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => openPermissions(role)}
                                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[12px] font-medium transition-colors"
                                                            >
                                                                <Key size={12} />
                                                                Boshqarish
                                                            </motion.button>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <div className="flex items-center  gap-x-2">
                                                            <Button
                                                                variant="contained" color="warning" size="small"
                                                                onClick={() => openEdit(role)}
                                                            >
                                                                Ma'lumotlarni tahrirlash
                                                            </Button>
                                                            <Button
                                                                variant="contained" color="error" size="small"
                                                                onClick={() => openDelete(role)}
                                                            >
                                                                O'chirish
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 100]}
                            component="div"
                            count={roles.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={(_, p) => setPage(p)}
                            onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
                            labelRowsPerPage="Qatorlar:"
                        />
                    </Paper>
                </motion.div>
            </motion.div>

            {/* Role Form Modal */}
            <RoleFormModal
                isOpen={formOpen}
                isEdit={isEdit}
                name={roleName}
                loading={formLoading}
                error={formError}
                onChange={(v) => { setRoleName(v); setFormError(null); }}
                onClose={() => setFormOpen(false)}
                onSubmit={isEdit ? handleEdit : handleCreate}
            />

            {/* Delete Modal */}
            <DeleteModal
                isOpen={deleteOpen}
                roleName={selectedRole?.name ?? ""}
                loading={formLoading}
                onClose={() => setDeleteOpen(false)}
                onConfirm={handleDelete}
            />

            {/* Permissions Modal */}
            <PermissionsModal
                isOpen={permOpen}
                role={selectedRole}
                allPermissions={allPermissions}
                onClose={() => setPermOpen(false)}
                onSaved={() => toast.success("Permissionlar saqlandi")}
            />

            {/* Snackbar */}
            <Snackbar
                open={snack.open}
                autoHideDuration={3000}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert severity={snack.severity} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))}>
                    {snack.message}
                </Alert>
            </Snackbar>
        </>
    );
}