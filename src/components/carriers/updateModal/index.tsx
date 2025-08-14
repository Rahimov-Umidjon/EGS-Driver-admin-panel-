
import type React from "react"
import { useEffect, useState } from "react"
import { X } from "lucide-react"


export interface Carrier {
    id: number
    name: string
    email: string
    phone: string
  }
  
  export interface CarrierFormData {
    name: string
    email: string
    phone: string
  }
  

interface CarrierFormModalProps {
  isOpen: boolean
  carrier: Carrier | null // null for create, Carrier object for edit
  onClose: () => void
  onSave: (formData: CarrierFormData) => void
}

const CarrierUpdate: React.FC<CarrierFormModalProps> = ({ isOpen, carrier, onClose, onSave }) => {
  const [formData, setFormData] = useState<CarrierFormData>({
    name: "",
    email: "",
    phone: "",
  })

  useEffect(() => {
    if (carrier) {
      setFormData({
        name: carrier.name,
        email: carrier.email,
        phone: carrier.phone,
      })
    } else {
      setFormData({ name: "", email: "", phone: "" }) // Reset form for new carrier
    }
  }, [carrier])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-2xl transform transition-all duration-300 scale-100 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-blue-700">
            {carrier ? "Carrierni tahrirlash" : "Yangi carrier qo'shish"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
            aria-label="Yopish"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Ism
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Ism"
              value={formData.name}
              onChange={handleInputChange}
              className="block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500 focus:ring-1 transition-all duration-200 outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500 focus:ring-1 transition-all duration-200 outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Telefon
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              placeholder="Telefon"
              value={formData.phone}
              onChange={handleInputChange}
              className="block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500 focus:ring-1 transition-all duration-200 outline-none"
              required
            />
          </div>
        </form>
        <div className="flex justify-end gap-3 p-6 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Saqlash
          </button>
        </div>
      </div>
    </div>
  )
}

export { CarrierUpdate }
