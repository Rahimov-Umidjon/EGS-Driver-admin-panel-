
import React from "react";
import { X, Truck, Phone, MapPin, Calendar } from "lucide-react";
import type { DriverDetails } from "../../interface";

interface Props {
  driver: DriverDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DriverModal: React.FC<Props> = ({ driver, isOpen, onClose }) => {
  if (!isOpen || !driver) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Truck className="text-blue-600" size={24} />
            {driver.fio}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow space-y-4">
          <div className="flex items-center gap-2">
            <Truck size={16} className="text-blue-600" />
            <span className="font-medium">Truck:</span> {driver.number}
          </div>
          
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-green-600" />
            <span className="font-medium">Phone:</span> {driver.phone_number}
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-red-600" />
            <span className="font-medium">Location:</span> {driver.latitude}, {driver.longitude}
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-purple-600" />
            <span className="font-medium">Last Update:</span> {new Date(driver.tracked_at).toLocaleString()}
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="text-sm font-medium text-gray-600">Brand:</span>
              <p>{driver.brand}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Capacity:</span>
              <p>{driver.capacity} m³</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Carrying:</span>
              <p>{driver.carrying} tons</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Dimensions:</span>
              <p>{driver.length}×{driver.width}×{driver.height}m</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};