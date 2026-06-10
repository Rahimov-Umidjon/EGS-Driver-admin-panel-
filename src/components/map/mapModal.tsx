import { useState } from "react";
import { AdvancedMarker, APIProvider, Map } from "@vis.gl/react-google-maps";

type Props = {
    onSelect: (lat: number, lng: number) => void;
    onClose: () => void;
    onSend?: (lat: number, lng: number) => void; // send tugma callback
};

function MapModal({ onSelect, onClose, onSend }: Props) {
    const [marker, setMarker] = useState({
        lat: 41.3111,
        lng: 69.2797,
    });

    return (
        <div
            onClick={onClose} // background click
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
        >
            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                <div
                    onClick={(e) => e.stopPropagation()} // stop modal close on content click
                    className="w-full max-w-3xl h-[500px] bg-white rounded-xl overflow-hidden flex flex-col"
                >
                    <div className="flex-1">
                        <Map
                            defaultZoom={12}
                            defaultCenter={marker}
                            gestureHandling="greedy"
                            mapId={import.meta.env.VITE_GOOGLE_MAPS_ID}
                            style={{ width: "100%", height: "100%" }}
                            onClick={(e) => {
                                if (!e.detail.latLng) return;
                                const lat = e.detail.latLng.lat;
                                const lng = e.detail.latLng.lng;
                                setMarker({ lat, lng });
                                onSelect(lat, lng);
                            }}
                        >
                            <AdvancedMarker position={marker} />
                        </Map>
                    </div>

                    <div className="flex justify-end gap-4 p-4 border-t bg-gray-50">
                        <button
                            onClick={() => onSend?.(marker.lat, marker.lng)}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Send
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </APIProvider>
        </div>
    );
}

export default MapModal;