import React, { useCallback, useEffect, useState, useRef } from "react";
import { X, Truck, MapPin, Phone, Calendar, Info, RefreshCw } from "lucide-react";
import type { DriverDetails, DriverLocation } from "../../interface";
import { useAuth } from "../../context/AuthContext";


interface DriverModalProps {
  isOpen: boolean;
  driver: DriverDetails | null;
  onClose: () => void;
}
const GOOGLE_MAPS_API_KEY = "AIzaSyCIGsyYFsHF1FyF2ZnhAjgzQKcB7A4zwGg";
const TASHKENT_CENTER = { lat: 41.311081, lng: 69.240562 };

const DriverModal: React.FC<DriverModalProps> = ({ isOpen, driver, onClose }) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle background click to close modal
  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !driver) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleBackgroundClick}
    >
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Truck className="text-blue-600" size={24} />
            {driver.fio}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-grow">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-700">
              <Truck size={16} className="text-blue-600" />
              <span className="font-medium">Truck:</span>
              <span>{driver.number}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Phone size={16} className="text-green-600" />
              <span className="font-medium">Phone:</span>
              <span>{driver.phone_number}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin size={16} className="text-red-600" />
              <span className="font-medium">Location:</span>
              <span>{driver.latitude}, {driver.longitude}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar size={16} className="text-purple-600" />
              <span className="font-medium">Last Update:</span>
              <span>{new Date(driver.tracked_at).toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-600">Brand:</span>
                <p className="text-gray-900">{driver.brand}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Trailer:</span>
                <p className="text-gray-900">{driver.trailer_number}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Capacity:</span>
                <p className="text-gray-900">{driver.capacity} m³</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Carrying:</span>
                <p className="text-gray-900">{driver.carrying} tons</p>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Dimensions:</span>
              <p className="text-gray-900">{driver.length}m × {driver.width}m × {driver.height}m</p>
            </div>
            {driver.avatar && (
              <div className="mt-4">
                <img
                  src={driver.avatar}
                  alt={driver.fio}
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const TruckLocationMap: React.FC = () => {
  const [driverLocations, setDriverLocations] = useState<DriverLocation[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<DriverDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const {token} =useAuth()

  // Load Google Maps API
  useEffect(() => {
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    script.onerror = () => setError('Failed to load Google Maps');
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Initialize Google Map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || googleMapRef.current) return;

    googleMapRef.current = new google.maps.Map(mapRef.current, {
      center: TASHKENT_CENTER,
      zoom: 12,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ],
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
    });

    infoWindowRef.current = new google.maps.InfoWindow();
  }, [mapLoaded]);

  const fetchDriverLocations = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      const response = await fetch("https://mobile.izisol.uz/api/drivers-locations", {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
          "X-CSRF-TOKEN": "",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DriverLocation[] = await response.json();
      setDriverLocations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch driver locations");
      console.error("Error fetching driver locations:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  const fetchDriverDetails = useCallback(async (driverId: number) => {
    try {
      const response = await fetch(`https://mobile.izisol.uz/api/driver-location/${driverId}`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
          "X-CSRF-TOKEN": "",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: { status: boolean; message: string; driver: DriverDetails } = await response.json();
      
      if (data.status && data.driver) {
        setSelectedDriver(data.driver);
        setIsModalOpen(true);
      } else {
        setError("Failed to fetch driver details");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching driver details");
      console.error("Error fetching driver details:", err);
    }
  }, [token]);

  // Update markers on the map
  useEffect(() => {
    if (!googleMapRef.current || !mapLoaded || !driverLocations.length) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Create truck icon
    const truckIcon = {
      url: 'data:image/svg+xml;base64,' + btoa(`
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#2563eb" stroke="#1e40af" stroke-width="2"/>
          <g transform="translate(8, 8)">
            <path d="M3 6V4a1 1 0 011-1h10l3 3v10a1 1 0 01-1 1H4a1 1 0 01-1-1V6z" fill="white"/>
            <path d="M17 8h2l2 2v4h-4V8z" fill="white"/>
            <circle cx="7" cy="17" r="2" fill="white"/>
            <circle cx="17" cy="17" r="2" fill="white"/>
          </g>
        </svg>
      `),
      scaledSize: new google.maps.Size(40, 40),
      anchor: new google.maps.Point(20, 20)
    };

    // Add markers for each driver location
    driverLocations.forEach((driver) => {
      const marker = new google.maps.Marker({
        position: { lat: driver.latitude, lng: driver.longitude },
        map: googleMapRef.current,
        icon: truckIcon,
        title: `Truck ${driver.number}`,
        animation: google.maps.Animation.DROP,
      });

      // Add click listener to marker
      marker.addListener('click', () => {
        if (infoWindowRef.current) {
          const content = `
            <div style="padding: 10px; min-width: 200px;">
              <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 16px; font-weight: bold;">
                🚛 Truck ${driver.number}
              </h3>
              <p style="margin: 5px 0; color: #4b5563; font-size: 14px;">
                <strong>Location:</strong> ${driver.latitude.toFixed(6)}, ${driver.longitude.toFixed(6)}
              </p>
              <p style="margin: 5px 0; color: #4b5563; font-size: 14px;">
                <strong>Last Update:</strong> ${new Date(driver.tracked_at).toLocaleString()}
              </p>
              <button 
                onclick="window.showDriverDetails(${driver.driver_id})"
                style="
                  margin-top: 10px;
                  padding: 6px 12px;
                  background-color: #2563eb;
                  color: white;
                  border: none;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 12px;
                ">
                View Details
              </button>
            </div>
          `;
          
          infoWindowRef.current.setContent(content);
          infoWindowRef.current.open(googleMapRef.current, marker);
        }
      });

      markersRef.current.push(marker);
    });

    // Adjust map bounds to show all markers
    if (driverLocations.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      driverLocations.forEach(driver => {
        bounds.extend(new google.maps.LatLng(driver.latitude, driver.longitude));
      });
      googleMapRef.current.fitBounds(bounds);
      
      // Set max zoom level
      const listener = google.maps.event.addListener(googleMapRef.current, "idle", () => {
        if (googleMapRef.current!.getZoom()! > 15) {
          googleMapRef.current!.setZoom(15);
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [driverLocations, mapLoaded]);

  useEffect(() => {
    (window as any).showDriverDetails = (driverId: number) => {
      fetchDriverDetails(driverId);
    };
    return () => {
      delete (window as any).showDriverDetails;
    };
  }, [fetchDriverDetails]);

  useEffect(() => {
    fetchDriverLocations();
    

    const interval = setInterval(fetchDriverLocations, 60000*10);
    return () => clearInterval(interval);
  }, [fetchDriverLocations]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDriver(null);
  };

  const handleRefresh = () => {
    fetchDriverLocations();
  };

  if (loading && !mapLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="flex items-center gap-3 text-lg font-medium text-gray-600">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          Loading map and truck locations...
        </div>
      </div>
    );
  }

  if (error && !mapLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[85vh]">
      {/* Map Header */}
      <div className="absolute top-4 left-4 right-4 z-10 mt-10 bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-2  ">
            <Truck className="text-blue-600" size={24} />
            <h1 className="text-xl font-bold text-gray-800">Truck Location Tracker</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {driverLocations.length} truck{driverLocations.length !== 1 ? 's' : ''} online
            </span>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`px-3 py-1 text-white text-sm rounded-md transition-colors flex items-center gap-2 ${
                refreshing 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
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

      {/* Google Map */}
      <div ref={mapRef} className="w-full h-full" />

      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-4">
      <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Info size={16} className="text-blue-600" />
            <span className="font-medium">Statistics</span>
          </div>
          <p className="text-gray-600">Total Trucks: {driverLocations.length}</p>
          <p className="text-gray-600">Last Update: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>


      <DriverModal isOpen={isModalOpen} driver={selectedDriver} onClose={closeModal} />
    </div>
  );
};

export default TruckLocationMap;