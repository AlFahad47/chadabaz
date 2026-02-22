"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { PinData } from "@/types";

interface MapProps {
    pins: PinData[];
    onMapClick: (lat: number, lng: number) => void;
    onPinClick: (pin: PinData) => void;
    newPinLocation?: { lat: number; lng: number } | null;
    selectedPinLocation?: { lat: number; lng: number } | null;
    searchedLocation?: { lat: number; lng: number } | null;
    newPinCategory?: string;
}

function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

import { useMap } from "react-leaflet";

function MapController({ newPinLocation, selectedPinLocation, searchedLocation }: { newPinLocation?: { lat: number; lng: number } | null, selectedPinLocation?: { lat: number; lng: number } | null, searchedLocation?: { lat: number; lng: number } | null }) {
    const map = useMap();
    useEffect(() => {
        if (newPinLocation) {
            map.flyTo([newPinLocation.lat, newPinLocation.lng], 14, { duration: 1.5 });
        } else if (selectedPinLocation) {
            map.flyTo([selectedPinLocation.lat, selectedPinLocation.lng], 14, { duration: 1.5 });
        } else if (searchedLocation) {
            map.flyTo([searchedLocation.lat, searchedLocation.lng], 14, { duration: 1.5 });
        }
    }, [newPinLocation, selectedPinLocation, searchedLocation, map]);
    return null;
}

import { renderToString } from 'react-dom/server';
import { FaTruck, FaIndustry, FaHardHat, FaStore, FaHome, FaMapMarkerAlt } from "react-icons/fa";

const getMarkerIcon = (category: string) => {
    let color = "#ef4444"; // red mapped to default
    let IconComponent = FaMapMarkerAlt;

    switch (category) {
        case "Transport":
            color = "#3b82f6"; // blue
            IconComponent = FaTruck;
            break;
        case "Industrial":
            color = "#a855f7"; // purple
            IconComponent = FaIndustry;
            break;
        case "Construction":
            color = "#f97316"; // orange
            IconComponent = FaHardHat;
            break;
        case "Market":
            color = "#22c55e"; // green
            IconComponent = FaStore;
            break;
        case "Neighborhood":
            color = "#ec4899"; // pink
            IconComponent = FaHome;
            break;
    }

    const iconHtml = renderToString(<IconComponent size={14} color="white" title={`Category: ${category}`} />);

    const html = `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; transform: translateY(-100%);" title="${category}">
            <!-- Base Pin Shape -->
            <svg viewBox="0 0 24 24" width="36" height="36" style="position: absolute; top: 0; left: 0; filter: drop-shadow(0 4px 3px rgb(0 0 0 / 0.15)); z-index: 1;">
                <path d="M12 0C7.58 0 4 3.58 4 8c0 4.27 4.96 11.2 7.02 13.91a1.2 1.2 0 0 0 1.96 0C15.04 19.2 20 12.27 20 8c0-4.42-3.58-8-8-8z" fill="${color}" stroke="white" stroke-width="1.5" />
            </svg>
            <!-- Inner Icon -->
            <div style="position: absolute; top: 8px; left: 50%; transform: translateX(-50%); z-index: 10; display: flex; align-items: center; justify-content: center;">
                ${iconHtml}
            </div>
        </div>
    `;

    return L.divIcon({
        html,
        className: 'custom-category-pin',
        iconSize: [36, 36],
        iconAnchor: [18, 0], // Point of the pin is at bottom center (translated via CSS instead of Leaflet anchor due to flexbox bugs)
        popupAnchor: [0, -36],
    });
};

export default function Map({ pins, onMapClick, onPinClick, newPinLocation, selectedPinLocation, searchedLocation, newPinCategory }: MapProps) {
    const [center] = useState<[number, number]>([23.685, 90.356]);

    useEffect(() => {
        // Fix missing marker icons in react-leaflet for default pins
        const DefaultIcon = L.icon({
            iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        L.Marker.prototype.options.icon = DefaultIcon;
    }, []);

    // Bangladesh coordinate bounds
    const bangladeshBounds: L.LatLngBoundsExpression = [
        [20.5937, 88.0104], // South-West
        [26.6346, 92.6737]  // North-East
    ];

    return (
        <MapContainer
            center={center}
            zoom={9}
            className="h-full w-full z-0"
            maxBounds={bangladeshBounds}
            maxBoundsViscosity={1.0}
            minZoom={7}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapEvents onMapClick={onMapClick} />
            <MapController newPinLocation={newPinLocation} selectedPinLocation={selectedPinLocation} searchedLocation={searchedLocation} />

            {/* Render a marker for the new pin location being dropped */}
            {newPinLocation && (
                <Marker position={[newPinLocation.lat, newPinLocation.lng]} icon={getMarkerIcon(newPinCategory || "Transport")} />
            )}

            {pins.map((pin) => (
                <Marker
                    key={pin._id}
                    position={[pin.lat, pin.lng]}
                    icon={getMarkerIcon(pin.category)}
                    eventHandlers={{
                        click: () => onPinClick(pin),
                    }}
                />
            ))}
        </MapContainer>
    );
}
