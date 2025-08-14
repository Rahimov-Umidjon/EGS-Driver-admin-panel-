
import type React from "react"
import { X } from "lucide-react"
export interface Carrier {
    id: number
    name: string
    email: string
    phone: string
}

interface DeleteCarrierModalProps {
    isOpen: boolean
    carrier: Carrier | null
    onClose: () => void
    onDelete: (id: number) => void
}

const DeleteCarrierModal: React.FC<DeleteCarrierModalProps> = ({ isOpen, carrier, onClose, onDelete }) => {
    if (!isOpen || !carrier) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-2xl transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-red-600">Carrierni o‘chirish</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                        aria-label="Yopish"
                    >
                        <X size={24} />
                    </button>
                </div>
                <p className="text-gray-600 mb-6">
                    {`"${carrier.name}" (${carrier.email}) raqamli carrierni o‘chirishni tasdiqlaysizmi? Bu amalni qaytarib bo‘lmaydi.`}
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                    >
                        Bekor qilish
                    </button>
                    <button
                        onClick={() => onDelete(carrier.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                        O‘chirish
                    </button>
                </div>
            </div>
        </div>
    )
}

export { DeleteCarrierModal }
