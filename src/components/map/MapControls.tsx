import React from "react";
import { Truck, RefreshCw } from "lucide-react";

interface Props {
  truckCount: number;
  onRefresh: () => void;
  refreshing: boolean;
  error?: string;
}

export const MapControls: React.FC<Props> = ({ truckCount, onRefresh, refreshing, error }) => {
  return (
    <div className="absolute top-4 left-4 right-4 z-10 bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="text-blue-600" size={24} />
          <h1 className="text-xl font-bold">Truck Tracker</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {truckCount} trucks online
          </span>
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className={`px-3 py-1 text-white text-sm rounded-md flex items-center gap-2 ${
              refreshing ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Updating...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};