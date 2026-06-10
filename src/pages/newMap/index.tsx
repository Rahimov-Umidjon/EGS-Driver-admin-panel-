import {AdvancedMarker, APIProvider, Map, useMap} from "@vis.gl/react-google-maps";
import {useCallback, useEffect, useRef, useState} from "react";

import {Marker, MarkerClusterer, SuperClusterAlgorithm} from "@googlemaps/markerclusterer"
import {Calendar, Info, MapPin, Phone, RefreshCw, Search, Truck, X} from "lucide-react";
import type * as React from "react";
import {useAuth} from "../../context/AuthContext.tsx";

// type Point = google.maps.LatLngLiteral & { name: string };
type Props = {
    points: DriverLocation[];
    fetchDriverDetails: (driverId: number) => void;
}


interface DriverLocation {
    driver_id: number;
    number: string;
    lat: number;
    lng: number;
    tracked_at: string;
    is_online: number;
}

interface DriverDetails {
    driver_id: number;
    fio: string;
    number: string;
    phone_number: string;
    lat: number;
    lng: number;
    tracked_at: string;
    brand: string;
    trailer_number: string;
    capacity: number;
    carrying: number;
    length: number;
    width: number;
    height: number;
    avatar?: string;
}

interface DriverModalProps {
    isOpen: boolean;
    driver: DriverDetails | null;
    onClose: () => void;
}


const Markers = ({points, fetchDriverDetails}: Props,) => {
    const map = useMap()

    const [markers, setMarkers] = useState<{ [key: string]: Marker }>({});

    const clusterer = useRef<MarkerClusterer | null>(null)

    useEffect(() => {
        if (!map) return;
        if (!clusterer.current) {
            clusterer.current = new MarkerClusterer({
                map,
                algorithm: new SuperClusterAlgorithm({
                    radius: 30,
                    extent: 256,
                    maxZoom: 22
                }),

            })
            clusterer.current.addListener("click", (cluster:any) => {
                const markersInCluster = cluster.markers;
                const currentZoom = map.getZoom();
                console.log("Current zoom:", currentZoom);

                // Faqat cluster bo'lganda, ya'ni 2 va undan ortiq markerlar birlashgan paytda
                if (currentZoom === 22) {
                    // Cluster markazi uchun position
                    // const clusterPosition = cluster.position;

                    // Barcha driverlarni birlashtirib bitta content yaratish
                    const content = markersInCluster
                        .map((marker:any) => `Driver: ${(marker as any).driverNumber}`)
                        .join("<br>");

                    new google.maps.InfoWindow({
                        content,
                    }).open(map, cluster.marker); // cluster markeriga yopishtiramiz

                    map.fitBounds(cluster.bounds);
                }
            });


        }
    }, [map])

    useEffect(() => {
        clusterer.current?.clearMarkers()
        clusterer.current?.addMarkers(Object.values(markers))
    }, [markers]);


    const setMarkerRef = (marker: Marker | null, key: string) => {

        if (marker && markers[key]) return;
        if (!marker && !markers[key]) return;

        setMarkers(prev => {
            if (marker) {
                return {...prev, [key]: marker}
            } else {
                const newmarkers = {...prev}
                delete newmarkers[key]
                return newmarkers
            }
        })
    }
    return (
        <>
            {points.map((point, index) => (
                <AdvancedMarker
                    key={`${point.number}-${index}`}
                    position={point}
                    ref={marker => {
                        if (marker !== null) {
                            // marker mavjud bo'lsa custom property qo'shamiz
                            (marker as any).driverNumber = point.number;
                        }
                        setMarkerRef(marker, `${point.number}-${index}`)
                    }}
                    onClick={() => {
                        void fetchDriverDetails(Number(point.driver_id))
                    }}
                >
                    <img
                        src={point.is_online === 1 ? "/carOnline.png" : "/car.png"}
                        width={30}
                        style={{pointerEvents: 'none'}}
                        alt={'foto'}
                    />
                </AdvancedMarker>
            ))}
        </>
    );
};


// Driver Modal Component
const DriverModal: React.FC<DriverModalProps> = ({isOpen, driver, onClose}) => {


    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen || !driver) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={handleBackgroundClick}
        >
            <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <Truck className="text-blue-600" size={24}/>
                        {driver.fio}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20}/>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-grow">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-gray-700">
                            <Truck size={16} className="text-blue-600"/>
                            <span className="font-medium">Mashina raqami:</span>
                            <span>{driver.number}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                            <Phone size={16} className="text-green-600"/>
                            <span className="font-medium">Telefon:</span>
                            <span>{driver.phone_number}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                            <MapPin size={16} className="text-red-600"/>
                            <span className="font-medium">Joylashuv:</span>
                            <span>{driver.lat.toFixed(6)}, {driver.lng.toFixed(6)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                            <Calendar size={16} className="text-purple-600"/>
                            <span className="font-medium">Oxirgi yangilanish:</span>
                            <span>{new Date(driver.tracked_at).toLocaleString()}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                            <div>
                                <span className="text-sm font-medium text-gray-600">Marka:</span>
                                <p className="text-gray-900">{driver.brand}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-600">Tirkama:</span>
                                <p className="text-gray-900">{driver.trailer_number}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-600">Hajm:</span>
                                <p className="text-gray-900">{driver.capacity} m³</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-600">Yuk ko'tarish:</span>
                                <p className="text-gray-900">{driver.carrying} tonna</p>
                            </div>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-600">O'lchamlari:</span>
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
                        Yopish
                    </button>
                </div>
            </div>
        </div>
    );
};


const NewMap = () => {

    const [driverLocations, setDriverLocations] = useState<DriverLocation[]>([]);
    const [selectedDriver, setSelectedDriver] = useState<DriverDetails | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // const [mapLoaded, setMapLoaded] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [searchInput, setSearchInput] = useState('');

    const {token} = useAuth();

    // Fetch Driver Locations
    const fetchDriverLocations = useCallback(async (searchInput: string) => {
        try {
            setRefreshing(true);
            setError(null);
            const response = await fetch(`https://mobile-test.izisol.uz/api/drivers-locations?search=${searchInput}`, {
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
            console.log(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Lokatsiyalar yuklanmadi");
            console.error("Lokatsiyalarni yuklashda xato:", err);
        } finally {
            // setLoading(false);
            setRefreshing(false);
        }
    }, [token]);


    useEffect(() => {
        if (searchInput) {
            void fetchDriverLocations(searchInput)
        }
    }, [searchInput]);

    useEffect(() => {
        void fetchDriverLocations('')
    }, []);


    // Fetch Driver Details
    const fetchDriverDetails = useCallback(async (driverId: number) => {
        try {
            const response = await fetch(`https://mobile-test.izisol.uz/api/admin/driver-location/${driverId}`, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`,
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
                setError("Haydovchi ma'lumotlari topilmadi");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ma'lumot yuklanmadi");
            console.error("Haydovchi ma'lumotlarini yuklashda xato:", err);
        }
    }, [token]);

    const {driverID} = useAuth()

    useEffect(() => {
        if (driverID) {
            setSearchInput(driverID);
            void fetchDriverLocations(driverID);
        }
    }, [driverID, fetchDriverLocations]);


    const handleRefresh = useCallback(() => {
        void fetchDriverLocations(searchInput);
    }, [fetchDriverLocations, searchInput]);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedDriver(null);
    }, []);

    const clearSearch = () => {
        setSearchInput('');
        void fetchDriverLocations('');
    };


    return (
        <div className="relative w-full h-screen  ">
            <div
                className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-white rounded-lg shadow-md py-2 px-4 w-[75%]">
                <div className="flex items-center  justify-between ">
                    <div className="flex items-center gap-2">
                        <Truck className="text-blue-600" size={24}/>
                        <h1 className="text font-bold text-gray-800">Haydovchilar Xaritasi</h1>
                    </div>

                    <div className="flex items-center gap-3  w-1/2  mx-auto relative ">
                        <Search className="w-5 h-5 text-slate-500 flex-shrink-0"/>
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Moshina nomeri bo'yicha qidirish..."
                            className="w-full p-1.5 border border-slate- 200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white shadow-sm"
                        />
                        {searchInput && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-2 p-1 text-slate-500 hover:text-slate-700"
                            >
                                <X className="w-5 h-5"/>
                            </button>
                        )}
                    </div>


                    <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {driverLocations.length} ta mashina online
            </span>
                        {/*<InfoWindow  >sjgdc sdcbsdu csj cj</InfoWindow>*/}
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className={`px-3 py-1 text-white text-sm rounded-md transition-colors flex items-center gap-2 ${
                                refreshing
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''}/>
                            {refreshing ? 'Yangilanmoqda...' : 'Yangilash'}
                        </button>
                    </div>
                </div>
                {error && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                        {error}
                    </div>
                )}
            </div>

            <div className="h-screen w-full relative">
                <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY /* saqlang .env da */}>
                    <Map
                        // center={{ lat: 41.311081, lng: 69.240562 }}
                        // zoom={3}
                        mapId={import.meta.env.VITE_GOOGLE_MAPS_ID}
                        defaultCenter={{lat: 41.311081, lng: 69.240562}}
                        defaultZoom={10}
                        gestureHandling='greedy'
                        // disableDefaultUI
                    >
                        <Markers points={driverLocations as any}
                                 fetchDriverDetails={(number: number) => fetchDriverDetails(number)}/>
                    </Map>
                </APIProvider>
            </div>

            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-4">
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <Info size={16} className="text-blue-600"/>
                        <span className="font-medium">Statistika</span>
                    </div>
                    <p className="text-gray-600">Jami mashinalar: {driverLocations.length}</p>
                    <p className="text-gray-600">Oxirgi yangilanish: {new Date().toLocaleTimeString()}</p>
                </div>
            </div>

            <DriverModal isOpen={isModalOpen} driver={selectedDriver} onClose={closeModal}/>
        </div>
    );
};

export default NewMap;