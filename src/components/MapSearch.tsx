"use client";

import { useState } from "react";
import { Search, MapPin, Loader2, Navigation } from "lucide-react";

interface SearchResult {
    place_id: number;
    lat: string;
    lon: string;
    display_name: string;
}

interface MapSearchProps {
    onLocationSelect: (lat: number, lng: number) => void;
    onGPSSelect?: (lat: number, lng: number) => void;
}

export default function MapSearch({ onLocationSelect, onGPSSelect }: MapSearchProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setOpen(true);
        try {
            // Using OSM Nominatim API, tightly bounding to Bangladesh
            // Tighter viewbox for Bangladesh: 88.0, 20.5 to 92.7, 26.6
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=bd&viewbox=88.0,26.6,92.7,20.5&bounded=1`);
            const data = await res.json();
            setResults(data);
        } catch (error) {
            console.error("Geocoding error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (r: SearchResult) => {
        onLocationSelect(parseFloat(r.lat), parseFloat(r.lon));
        setOpen(false);
        setQuery(""); // Clear after selecting
    };

    const handleGPS = () => {
        if ("geolocation" in navigator) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLoading(false);
                    if (onGPSSelect) {
                        onGPSSelect(position.coords.latitude, position.coords.longitude);
                    } else {
                        onLocationSelect(position.coords.latitude, position.coords.longitude);
                    }
                },
                (error) => {
                    setLoading(false);
                    console.error("Error getting location:", error);
                    alert("Could not get your location. Please check permissions.");
                },
                { enableHighAccuracy: true }
            );
        } else {
            alert("Geolocation is not supported by your browser");
        }
    };

    // Close when clicking outside - simplified by just rendering
    return (
        <div className="relative w-full max-w-sm pointer-events-auto mt-4 sm:mt-0 sm:ml-auto">
            <div className="flex gap-2 relative">
                <form onSubmit={handleSearch} className="relative flex-1">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for a location..."
                        className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-white/90 dark:bg-black/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all shadow-lg text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-500"
                    />
                    <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-500">
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                    </button>
                </form>
                <button
                    onClick={handleGPS}
                    type="button"
                    title="Use Current Location"
                    className="flex-shrink-0 flex items-center justify-center w-[46px] h-[46px] sm:w-[42px] sm:h-[42px] bg-white/90 dark:bg-black/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-lg text-red-500"
                >
                    <Navigation size={18} />
                </button>
            </div>

            {open && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto z-50">
                    {results.length > 0 ? (
                        results.map((r) => (
                            <button
                                key={r.place_id}
                                type="button"
                                onClick={() => handleSelect(r)}
                                className="w-full text-left px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-800 last:border-0 flex items-start gap-3 transition-colors text-sm"
                            >
                                <MapPin size={16} className="text-zinc-400 shrink-0 mt-0.5" />
                                <span className="text-zinc-700 dark:text-zinc-300 line-clamp-2">{r.display_name}</span>
                            </button>
                        ))
                    ) : !loading && query ? (
                        <div className="p-4 text-center text-sm text-zinc-500">
                            No results found
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}
