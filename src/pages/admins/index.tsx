import { ChangeEvent, ReactNode, useEffect, useState } from "react";
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
    CircularProgress,
    Snackbar,
    Alert,
    Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { UserPlus, Pencil, Save, Trash2, CheckCircle2, X, SlidersHorizontal } from "lucide-react";
import api from "../../api/api";
import { toast } from "react-toastify";

// ---------- Types ----------
interface Role {
    id: number;
    name: string;
    guard_name: string;
}

interface Admin {
    id: number;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
    roles: Role[];
}

interface AdminFormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: string;
}

const EMPTY_FORM: AdminFormData = {
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "admin",
};

const statusConfig: Record<string, { label: string; classes: string; icon: ReactNode }> = {

    user: {
        label: "User",
        classes: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
        icon: <CheckCircle2 size={11} className="text-amber-600" />,
    },
    admin: {
        label: "Admin",
        classes: "bg-blue-50 text-blue-800 ring-1 ring-blue-200",
        icon: <CheckCircle2 size={11} className="text-teal-600" />,
    },

    superadmin: {
        label: "Superadmin",
        classes: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
        icon: <CheckCircle2 size={11} className="text-emerald-500" />,
    },

};



// ---------- Custom Input ----------
function Field({
    label,
    type = "text",
    value,
    onChange,
    placeholder,
}: {
    label: string;
    type?: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) {
    return (
        <div>
            <label className="text-[12.5px] text-gray-500 block mb-1.5">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-gray-200 text-[13px] px-3 py-2.5 outline-none focus:border-blue-300 bg-gray-50 transition-colors"
            />
        </div>
    );
}

// ---------- Custom Select ----------
function RoleSelect({ value, onChange, roles = [] }: { value: string; onChange: (v: string) => void, roles: { id: number, name: string }[] }) {
    return (
        <div>
            <label className="text-[12.5px] text-gray-500 block mb-1.5">Rol</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-xl border border-gray-200 text-[13px] px-3 py-2.5 outline-none focus:border-blue-300 bg-gray-50 capitalize cursor-pointer"
            >
                {roles?.map((r) => (
                    <option key={r.id} value={r.name} className="capitalize">
                        {r.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

// ---------- Admin Form Modal ----------
interface AdminFormModalProps {
    isOpen: boolean;
    title: string;
    subtitle: string;
    form: AdminFormData;
    loading: boolean;
    error: string | null;
    isEdit: boolean;
    onChange: (field: keyof AdminFormData, value: string) => void;
    onClose: () => void;
    onSubmit: () => void;
    roles: { id: number, name: string }[]
}

function AdminFormModal({
    isOpen,
    title,
    subtitle,
    form,
    loading,
    error,
    isEdit,
    onChange,
    onClose,
    onSubmit,
    roles
}: AdminFormModalProps) {
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
                                {isEdit ? (
                                    <Pencil size={16} className="text-blue-500" />
                                ) : (
                                    <UserPlus size={16} className="text-blue-500" />
                                )}
                            </div>
                            <div>
                                <p className="text-[15px] font-semibold text-gray-900">{title}</p>
                                <p className="text-[12px] text-gray-400">{subtitle}</p>
                            </div>
                        </div>

                        <hr className="border-gray-100 mb-4" />

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="mb-3 px-3 py-2 rounded-xl bg-red-50 border border-red-100 text-[12.5px] text-red-500"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Fields */}
                        <div className="flex flex-col gap-3">
                            <Field
                                label="Ism *"
                                value={form.name}
                                onChange={(v) => onChange("name", v)}
                                placeholder="Ism kiriting..."
                            />
                            <Field
                                label="Email *"
                                type="email"
                                value={form.email}
                                onChange={(v) => onChange("email", v)}
                                placeholder="email@example.com"
                            />
                            <Field
                                label={isEdit ? "Yangi parol (ixtiyoriy)" : "Parol *"}
                                type="password"
                                value={form.password}
                                onChange={(v) => onChange("password", v)}
                                placeholder="••••••••"
                            />
                            <Field
                                label="Parolni tasdiqlash"
                                type="password"
                                value={form.password_confirmation}
                                onChange={(v) => onChange("password_confirmation", v)}
                                placeholder="••••••••"
                            />
                            <RoleSelect value={form.role} onChange={(v) => onChange("role", v)} roles={roles} />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-5">
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Bekor qilish
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={onSubmit}
                                disabled={loading}
                                className="flex-1 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                            >
                                {loading ? (
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                ) : (
                                    <>
                                        <Save size={14} />
                                        {isEdit ? "Saqlash" : "Yaratish"}
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ---------- Delete Confirm Modal ----------
function DeleteModal({
    isOpen,
    admin,
    loading,
    onClose,
    onConfirm,
}: {
    isOpen: boolean;
    admin: Admin | null;
    loading: boolean;
    onClose: () => void;
    onConfirm: () => void;
}) {
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
                            <span className="font-semibold text-gray-900">{admin?.name}</span> adminini o'chirmoqchimisiz?
                        </p>

                        <div className="flex gap-2">
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Bekor qilish
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={onConfirm}
                                disabled={loading}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                            >
                                {loading ? (
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                ) : (
                                    <>
                                        <Trash2 size={14} />
                                        O'chirish
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}


// API dan qaytadigan pagination meta
interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}


// ---------- Main Page ----------
export default function AdminsPage() {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [roles, setRoles] = useState<{ id: number, name: string }[]>([]);


    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const [form, setForm] = useState<AdminFormData>(EMPTY_FORM);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const [search, setSearch] = useState("");


    const [snack, setSnack] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
        open: false,
        message: "",
        severity: "success",
    });

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/admins");
            setAdmins(res.data.data ?? []);
            console.log(res)
            setMeta({ 
                current_page: res?.data?.current_page,
                last_page: res?.data?.last_page,
                per_page: res?.data?.per_page,
                total: res?.data?.total,
                from: res?.data?.from,
                to: res?.data?.to,
            });
        } catch {
            toast.error("Adminlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/roles");
            console.log(res)
            setRoles(res.data.data ?? []);
        } catch {
            toast.error("Adminlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
        fetchRoles();
    }, [currentPage ]);

    useEffect(() => {
        const timer = setTimeout(() => {
            // setCurrentPage(1);
            // fetchAdmins(1, search);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);


    const handleFormChange = (field: keyof AdminFormData, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setFormError(null);
    };

    // Create
    const openCreate = () => { setForm(EMPTY_FORM); setFormError(null); setCreateOpen(true); };
    const handleCreate = async () => {
        if (!form.name || !form.email || !form.password) { setFormError("Barcha majburiy maydonlarni to'ldiring"); return; }
        if (form.password !== form.password_confirmation) { setFormError("Parollar mos kelmadi"); return; }
        setFormLoading(true);
        try {
            await api.post("/admin/admins", form);
            toast.success("Admin muvaffaqiyatli yaratildi");
            setCreateOpen(false);
            fetchAdmins();
        } catch (err: any) {
            setFormError(err?.response?.data?.message ?? "Xatolik yuz berdi");
        } finally { setFormLoading(false); }
    };

    // Edit
    const openEdit = (admin: Admin) => {
        setSelectedAdmin(admin);
        setForm({ name: admin.name, email: admin.email, password: "", password_confirmation: "", role: admin.roles?.[0]?.name ?? "user" });
        setFormError(null);
        setEditOpen(true);
    };
    const handleEdit = async () => {
        if (!form.name || !form.email) { setFormError("Ism va email majburiy"); return; }
        if (form.password && form.password !== form.password_confirmation) { setFormError("Parollar mos kelmadi"); return; }
        setFormLoading(true);
        try {
            const payload: any = { name: form.name, email: form.email, role: form.role };
            if (form.password) { payload.password = form.password; payload.password_confirmation = form.password_confirmation; }
            await api.put(`/admin/admins/${selectedAdmin!.id}`, payload);
            toast.success("Admin muvaffaqiyatli yangilandi");
            setEditOpen(false);
            fetchAdmins();
        } catch (err: any) {
            setFormError(err?.response?.data?.message ?? "Xatolik yuz berdi");
        } finally { setFormLoading(false); }
    };

    // Delete
    const openDelete = (admin: Admin) => { setSelectedAdmin(admin); setDeleteOpen(true); };
    const handleDelete = async () => {
        setFormLoading(true);
        try {
            await api.delete(`/admin/admins/${selectedAdmin!.id}`);
            toast.success("Admin o'chirildi");
            setDeleteOpen(false);
            fetchAdmins();
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? "O'chirishda xatolik");
            setDeleteOpen(false);
        } finally { setFormLoading(false); }
    };

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
        setCurrentPage(newPage + 1);
        console.log(newPage + 1);
    };
    const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
    const paginatedAdmins = admins.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="min-h-screen  overflow-y-auto scrollbar   scrollbar-thumb-gray-400   scrollbar-thin scrollbar-track-gray-100 bg-[#f0f4f3] p-8 font-sans"
            >

                {/* Header */}
                <div className="flex items-center justify-between mb-6 ">
                    <div className="flex items-center gap-3">
                        <h1 className="text-[22px] font-bold text-gray-900 leading-tight">
                            Foydalanuvchilar
                        </h1>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Haydovchi qidirish..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-96 pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />

                            {search ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch("");
                                        // setCurrentPage(1);
                                        // getDriverVerify(1, "");
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            ) : (
                                <SlidersHorizontal
                                    size={16}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                            )}
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={openCreate}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors"
                        >
                            <AddIcon fontSize="small" />
                            Foydalanuvchi yaratish
                        </motion.button>
                    </div>
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
                            <Table stickyHeader aria-label="admins table">
                                <TableHead>
                                    <TableRow>
                                        {["#", "Ism", "Email", "Rol", "Yaratilgan", "Amallar"].map((col) => (
                                            <TableCell key={col} sx={{ fontWeight: 600, fontSize: 13 }}>
                                                {col}
                                            </TableCell>
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
                                    ) : paginatedAdmins.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary", fontSize: 13 }}>
                                                Adminlar topilmadi
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <AnimatePresence>
                                            {paginatedAdmins.map((admin, idx) => (
                                                <motion.tr
                                                    key={admin.id}
                                                    initial={{ opacity: 0, y: 6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.04 }}
                                                    style={{ display: "table-row" }}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <TableCell sx={{ fontSize: 13, color: "#9ca3af" }}>
                                                        {page * rowsPerPage + idx + 1}
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: 13, fontWeight: 500 }}>
                                                        {admin.name}
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: 13, color: "#6b7280" }}>
                                                        {admin.email}
                                                    </TableCell>
                                                    <TableCell>
                                                        {admin.roles?.map((role) => (
                                                            <span
                                                                key={role.id}
                                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold ${statusConfig[role.name]?.classes ?? 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'}`}
                                                            >
                                                                {statusConfig[role.name]?.icon ?? <CheckCircle2 size={11} className="text-teal-600" />}
                                                                {statusConfig[role.name]?.label ?? role.name}
                                                            </span>
                                                        ))}
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: 13, color: "#6b7280" }}>
                                                        {new Date(admin.created_at).toLocaleDateString("uz-UZ")}
                                                    </TableCell>
                                                    <TableCell  >


                                                        <div className="flex items-center  gap-x-2">
                                                            <Button
                                                                variant="contained" color="warning" size="small"
                                                                onClick={() => openEdit(admin)}
                                                            >
                                                                Ma'lumotlarni tahrirlash
                                                            </Button>
                                                            <Button
                                                                variant="contained" color="error" size="small"
                                                                onClick={() => openDelete(admin)}
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
                            count={admins.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Qatorlar:"
                        />
                    </Paper>
                </motion.div>
            </motion.div>

            {/* Create Modal */}
            <AdminFormModal
                isOpen={createOpen}
                title="Yangi admin yaratish"
                subtitle="Ma'lumotlarni to'ldiring"
                form={form}
                loading={formLoading}
                error={formError}
                isEdit={false}
                onChange={handleFormChange}
                onClose={() => setCreateOpen(false)}
                onSubmit={handleCreate}
                roles={roles}
            />

            {/* Edit Modal */}
            <AdminFormModal
                isOpen={editOpen}
                title="Adminni tahrirlash"
                subtitle={selectedAdmin?.email ?? ""}
                form={form}
                loading={formLoading}
                error={formError}
                isEdit={true}
                onChange={handleFormChange}
                onClose={() => setEditOpen(false)}
                onSubmit={handleEdit}
                roles={roles}
            />

            {/* Delete Modal */}
            <DeleteModal
                isOpen={deleteOpen}
                admin={selectedAdmin}
                loading={formLoading}
                onClose={() => setDeleteOpen(false)}
                onConfirm={handleDelete}
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