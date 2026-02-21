"use client";

import { useState } from "react";
import { PinData } from "@/types";
import { Search, Filter, ChevronUp, ChevronDown } from "lucide-react";
import { FaTruck, FaIndustry, FaHardHat, FaStore, FaHome, FaMapMarkerAlt } from "react-icons/fa";
import Image from "next/image";

interface PinListProps {
    pins: PinData[];
    onPinClick: (pin: PinData) => void;
}

export default function PinList({ pins, onPinClick }: PinListProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("All");

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "Transport": return <FaTruck size={16} className="text-blue-500" title="Transport (Bus/Truck/CNG)" />;
            case "Industrial": return <FaIndustry size={16} className="text-purple-500" title="Industrial (Factories/Jhut)" />;
            case "Construction": return <FaHardHat size={16} className="text-orange-500" title="Construction (Materials/Land)" />;
            case "Market": return <FaStore size={16} className="text-green-500" title="Market (Hawkers/Shops)" />;
            case "Neighborhood": return <FaHome size={16} className="text-pink-500" title="Neighborhood (Residents/Events)" />;
            default: return <FaMapMarkerAlt size={16} className="text-red-500" title="Unknown Category" />;
        }
    };

    const filteredPins = pins.filter((pin) => {
        const matchesSearch = pin.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pin.collectorName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === "All" || pin.category === filterCategory;

        // Also match custom categories under "Others" implicitly
        const isStandardCategory = ["Transport", "Industrial", "Construction", "Market", "Neighborhood"].includes(pin.category);
        const matchesOthers = filterCategory === "Others" && !isStandardCategory;

        if (filterCategory === "Others") {
            return matchesSearch && matchesOthers;
        }

        return matchesSearch && matchesCategory;
    });

    return (
        <div
            className={`absolute bottom-0 left-0 right-0 z-10 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-all duration-300 ease-in-out flex flex-col pointer-events-auto ${isExpanded ? 'h-[80vh]' : 'h-[80px] sm:h-[90px]'}`}
        >
            {/* Handle Bar to Expand/Collapse */}
            <div
                className="w-full flex justify-center items-center py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors shrink-0"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
                    <span className="text-xs font-semibold text-zinc-500 flex items-center gap-1">
                        {isExpanded ? (
                            <><ChevronDown size={14} /> Close List</>
                        ) : (
                            <><ChevronUp size={14} /> View All Reports ({pins.length})</>
                        )}
                    </span>
                </div>
            </div>

            {/* List Content (Only visible when expanded) */}
            <div className={`flex-1 overflow-hidden flex flex-col px-4 sm:px-6 pb-6 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-3 mt-2 mb-4 shrink-0">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by location or collector..."
                            className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="relative w-full sm:w-[200px]">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={18} />
                        <select
                            className="w-full pl-10 pr-8 py-2.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-sm appearance-none text-zinc-900 dark:text-zinc-50"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            <option value="Transport">Transport</option>
                            <option value="Industrial">Industrial</option>
                            <option value="Construction">Construction</option>
                            <option value="Market">Market</option>
                            <option value="Neighborhood">Neighborhood</option>
                            <option value="Others">Others</option>
                        </select>
                    </div>
                </div>

                {/* Scrollable List */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {filteredPins.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                            <FaMapMarkerAlt size={48} className="mb-4 opacity-20" />
                            <p className="font-medium text-center">No reports found matching your criteria.</p>
                        </div>
                    ) : (
                        filteredPins.map((pin) => (
                            <div
                                key={pin._id}
                                onClick={() => {
                                    onPinClick(pin);
                                    if (window.innerWidth < 640) setIsExpanded(false); // Auto close on mobile
                                }}
                                className="bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 p-4 rounded-xl hover:border-red-500/50 dark:hover:border-red-500/50 transition-colors cursor-pointer flex gap-4 items-start shadow-sm"
                            >
                                {/* Thumbnail (optional) */}
                                {pin.photos && pin.photos.length > 0 ? (
                                    <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                                        <Image src={pin.photos[0]} alt="Evidence" fill className="object-cover" unoptimized />
                                    </div>
                                ) : (
                                    <div className="w-20 h-20 rounded-lg flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shrink-0 text-zinc-400">
                                        <FaMapMarkerAlt size={24} />
                                    </div>
                                )}

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-zinc-900 dark:text-zinc-50 truncate">{pin.locationName}</h3>
                                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 truncate mb-2">{pin.collectorName}</p>

                                    <div className="flex flex-wrap items-center gap-2 mt-auto">
                                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                                            {getCategoryIcon(pin.category)}
                                            {pin.category}
                                        </span>
                                        {(pin.amount || 0) > 0 && (
                                            <span className="px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-semibold whitespace-nowrap">
                                                ৳{pin.amount}
                                            </span>
                                        )}
                                        <div className="ml-auto text-xs text-zinc-500 flex items-center gap-3">
                                            <div className="flex gap-2 font-medium">
                                                <span className="text-emerald-600 dark:text-emerald-400">Yes ({pin.votes?.yes || 0})</span>
                                                <span className="text-red-600 dark:text-red-400">No ({pin.votes?.no || 0})</span>
                                            </div>
                                            <span>{new Date(pin.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
