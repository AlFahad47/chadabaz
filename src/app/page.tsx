"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { PinData } from "@/types";
import PinForm from "@/components/PinForm";
import PinDetails from "@/components/PinDetails";
import PinList from "@/components/PinList";
import MapSearch from "@/components/MapSearch";
import { Shield } from "lucide-react";

// Dynamically import the map to avoid SSR issues with Leaflet
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-zinc-100 dark:bg-zinc-900">
      <div className="animate-spin rounded-full border-4 border-red-500 border-t-transparent h-12 w-12"></div>
    </div>
  ),
});

export default function Home() {
  const [pins, setPins] = useState<PinData[]>([]);
  const [selectedPin, setSelectedPin] = useState<PinData | null>(null);
  const [newPinLocation, setNewPinLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [newPinCategory, setNewPinCategory] = useState<string>("Transport");
  const [searchedLocation, setSearchedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const fetchPins = async () => {
    try {
      const response = await fetch("/api/pins");
      if (response.ok) {
        const data = await response.json();
        setPins(data);
      }
    } catch (error) {
      console.error("Failed to fetch pins:", error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchPins();
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    setNewPinLocation({ lat, lng });
    setSelectedPin(null);
    setSearchedLocation(null);
    setNewPinCategory("Transport");
  };

  const handlePinClick = (pin: PinData) => {
    setSelectedPin(pin);
    setNewPinLocation(null);
  };

  const handlePinCreated = (newPin: PinData) => {
    setPins([newPin, ...pins]);
    setNewPinLocation(null);
    setSelectedPin(newPin); // Open details for newly created pin
  };

  const handleVoteSuccess = (updatedPin: PinData) => {
    setPins(pins.map((p) => (p._id === updatedPin._id ? updatedPin : p)));
    setSelectedPin(updatedPin);
  };

  return (
    <div className="flex h-screen w-full flex-col bg-zinc-50 dark:bg-black font-sans relative overflow-hidden">
      {/* Header overlay */}
      <header className="absolute top-0 left-0 right-0 z-10 p-4 pointer-events-none">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="bg-white/90 dark:bg-black/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 pointer-events-auto flex items-center gap-3">
            <div className="bg-red-500 p-2 rounded-xl text-white">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                Chadabaze Tracker
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Click anywhere on the map to report</p>
            </div>
          </div>
          <MapSearch onLocationSelect={(lat, lng) => {
            setSearchedLocation({ lat, lng });
            setNewPinLocation(null);
            setSelectedPin(null);
          }} />
        </div>
      </header>

      {/* Main Map Container */}
      <main className="flex-1 w-full h-full relative z-0 pb-[80px] sm:pb-[90px]">
        <Map
          pins={pins}
          onMapClick={handleMapClick}
          onPinClick={handlePinClick}
          newPinLocation={newPinLocation}
          newPinCategory={newPinCategory}
          searchedLocation={searchedLocation}
          selectedPinLocation={selectedPin ? { lat: selectedPin.lat, lng: selectedPin.lng } : null}
        />
      </main>

      {/* Pin List Bottom Sheet */}
      <PinList pins={pins} onPinClick={handlePinClick} />

      {/* Overlays */}
      {(newPinLocation || selectedPin) && (
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-end p-4 sm:p-8">
          {/* Add a slightly dark backdrop on mobile only */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm sm:hidden pointer-events-auto"
            onClick={() => { setNewPinLocation(null); setSelectedPin(null); }} />

          <div className="pointer-events-auto w-full sm:w-auto z-30 animate-in slide-in-from-right-8 fade-in duration-300">
            {newPinLocation && (
              <PinForm
                lat={newPinLocation.lat}
                lng={newPinLocation.lng}
                onClose={() => setNewPinLocation(null)}
                onSubmitSuccess={handlePinCreated}
                onCategoryChange={setNewPinCategory}
              />
            )}
            {selectedPin && (
              <PinDetails
                pin={selectedPin}
                onClose={() => setSelectedPin(null)}
                onVoteSuccess={handleVoteSuccess}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
