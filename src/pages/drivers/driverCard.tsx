import { Phone, Mail, Star, Edit, Trash2 } from 'lucide-react';

interface DriverCardProps {
  id: number;
  name: string;
  phone: string;
  email: string;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onEdit: () => void;
  onDelete: () => void;
}

const DriverCard = ({
  id,
  name,
  phone,
  email,
  isFavorite,
  onToggleFavorite,
  onEdit,
  onDelete,
}: DriverCardProps) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow hover:shadow-lg transition relative">
      {/* Favorite */}
      <button
        onClick={() => onToggleFavorite(id)}
        aria-label="Yulduzcha holatini o'zgartirish"
        className="absolute top-3 right-3"
      >
        <Star
          size={24}
          className={isFavorite ? 'text-yellow-400' : 'text-gray-300'}
          fill={isFavorite ? '#FACC15' : 'none'}
        />
      </button>

      <h3 className="text-xl font-semibold mb-2 text-indigo-700">{name}</h3>

      <p className="text-gray-600 flex items-center gap-2 mb-1">
        <Phone size={16} /> {phone}
      </p>
      <p className="text-gray-600 flex items-center gap-2 mb-4">
        <Mail size={16} /> {email}
      </p>

      <div className="flex gap-4">
        <button
          onClick={onEdit}
          aria-label="Haydovchini tahrirlash"
          className="flex items-center gap-1 px-3 py-1 border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50 transition"
        >
          <Edit size={16} /> Tahrirlash
        </button>

        <button
          onClick={onDelete}
          aria-label="Haydovchini o‘chirish"
          className="flex items-center gap-1 px-3 py-1 border border-red-600 text-red-600 rounded hover:bg-red-50 transition"
        >
          <Trash2 size={16} /> O‘chirish
        </button>
      </div>
    </div>
  );
};

export default DriverCard;
