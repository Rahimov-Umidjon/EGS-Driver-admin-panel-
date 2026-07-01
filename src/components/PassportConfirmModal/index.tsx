import { Dialog, Transition } from "@headlessui/react";
import { Fragment, SetStateAction } from "react";




/* ──────────────────────  Confirm Modal ────────────────────── */
type ConfirmModalProps = {
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: "green" | "red" | "yellow";
    confirmModal: {
        open: boolean;
        driverId?: number;
        type: "approve" | "reject" | "warning" | null;
        fio?: string;
        number?: string;
    }
    setConfirmModal: React.Dispatch<SetStateAction<{
        open: boolean;
        driverId?: number;
        type: "approve" | "reject" | "warning" | null;
        fio?: string;
        number?: string;
    }>>;
};

export const PassportConfirmModal: React.FC<ConfirmModalProps> = ({
    open,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Ha",
    cancelText = "Yo'q",
    confirmColor = "green",
    confirmModal,
    setConfirmModal

}) => {
    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onCancel}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel
                                className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-semibold leading-6 text-gray-900"
                                >
                                    {title}
                                </Dialog.Title>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-600">{message}</p>
                                </div>
                                {
                                    confirmModal.type === 'approve' && (
                                        <div>
                                            <p className="text-sm text-gray-600 mt-4 mb-1">FIO</p>
                                            <div className="  flex items-center gap-3    mx-auto relative ">

                                                <input
                                                    type="text"
                                                    value={confirmModal.fio}
                                                    onChange={(e) => setConfirmModal({
                                                        ...confirmModal,
                                                        fio: e.target.value
                                                    })}
                                                    placeholder="Moshina nomeri bo'yicha qidirish..."
                                                    className="w-full p-1.5 border border-slate- 200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white shadow-sm"
                                                />
                                            </div>

                                            <p className="text-sm text-gray-600 mt-4 mb-1">Truck number</p>
                                            <div className="  flex items-center gap-3    mx-auto relative ">
                                                <input
                                                    type="text"
                                                    value={confirmModal.number}
                                                    onChange={(e) => setConfirmModal({
                                                        ...confirmModal,
                                                        number: e.target.value
                                                    })}
                                                    placeholder="Moshina nomeri bo'yicha qidirish..."
                                                    className="w-full p-1.5 border border-slate- 200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white shadow-sm"
                                                />
                                            </div>
                                        </div>
                                    )
                                }
                                <div className="mt-5 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                                        onClick={onCancel}
                                    >
                                        {cancelText}
                                    </button>
                                    <button
                                        type="button"
                                        className={`inline-flex justify-center rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${confirmColor === "green"
                                            ? "bg-green-600 hover:bg-green-700 focus-visible:ring-green-500"
                                            : confirmColor === "red" ?  "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500" : "bg-yellow-600 hover:bg-yellow-700 focus-visible:ring-yellow-500"
                                            }`}
                                        onClick={onConfirm}
                                    >
                                        {confirmText}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};