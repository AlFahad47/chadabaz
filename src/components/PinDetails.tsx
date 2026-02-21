import { PinData } from "@/types";
import { X, MapPin, DollarSign, Info, Calendar, ThumbsUp, ThumbsDown, CheckCircle } from "lucide-react";
import { FaTruck, FaIndustry, FaHardHat, FaStore, FaHome, FaMapMarkerAlt } from "react-icons/fa";
import Image from "next/image";
import { useState, useEffect } from "react";
import AddEvidenceForm from "./AddEvidenceForm";

interface PinDetailsProps {
    pin: PinData;
    onClose: () => void;
    onVoteSuccess: (updatedPin: PinData) => void;
}

export default function PinDetails({ pin, onClose, onVoteSuccess }: PinDetailsProps) {
    const [voting, setVoting] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);
    const [deviceId, setDeviceId] = useState<string>("");
    const [showAddEvidence, setShowAddEvidence] = useState(false);

    useEffect(() => {
        let storedDeviceId = localStorage.getItem("chadabaze_device_id");
        if (!storedDeviceId) {
            // Fallback for environments where crypto.randomUUID is not available
            storedDeviceId = typeof crypto !== 'undefined' && crypto.randomUUID
                ? crypto.randomUUID()
                : Date.now().toString(36) + Math.random().toString(36).substring(2);
            localStorage.setItem("chadabaze_device_id", storedDeviceId);
        }
        setDeviceId(storedDeviceId);

        // Pre-check if current device already voted to disable UI
        if (pin.votedDeviceIds && pin.votedDeviceIds.includes(storedDeviceId)) {
            setHasVoted(true);
        } else {
            setHasVoted(false);
        }
    }, [pin.votedDeviceIds]);

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "Transport": return <FaTruck size={16} className="text-blue-500" title="Transport" />;
            case "Industrial": return <FaIndustry size={16} className="text-purple-500" title="Industrial" />;
            case "Construction": return <FaHardHat size={16} className="text-orange-500" title="Construction" />;
            case "Market": return <FaStore size={16} className="text-green-500" title="Market" />;
            case "Neighborhood": return <FaHome size={16} className="text-pink-500" title="Neighborhood" />;
            default: return <FaMapMarkerAlt size={16} className="text-red-500" title="Unknown Category" />;
        }
    };


    const handleVote = async (type: "yes" | "no") => {
        if (voting || hasVoted) return;
        setVoting(true);

        try {
            const response = await fetch(`/api/pins/${pin._id}/vote`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, deviceId }),
            });

            if (response.ok) {
                const updatedPin = await response.json();
                onVoteSuccess(updatedPin);
                setHasVoted(true);
            }
        } catch (error) {
            console.error("Failed to vote:", error);
        } finally {
            setVoting(false);
        }
    };

    if (showAddEvidence) {
        return (
            <AddEvidenceForm
                pinId={pin._id}
                onClose={() => setShowAddEvidence(false)}
                onSubmitSuccess={(updatedPin) => {
                    onVoteSuccess(updatedPin);
                    setShowAddEvidence(false);
                }}
            />
        );
    }

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-zinc-200 dark:border-zinc-800 flex flex-col">
            <div className="sticky top-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between z-10">
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                        <MapPin className="text-red-500" />
                        {pin.locationName}
                    </h2>
                    {pin.category && (
                        <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full w-fit">
                            {getCategoryIcon(pin.category)}
                            {pin.category}
                        </span>
                    )}
                </div>
                <button onClick={onClose} className="p-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full transition-colors text-zinc-500">
                    <X size={18} />
                </button>
            </div>

            <div className="p-6 space-y-6">
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                            <Info size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Collector / Group</p>
                            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{pin.collectorName}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Collection Rates (BDT)</p>
                            <div className="flex gap-4 mt-1">
                                <div>
                                    <span className="text-xs text-zinc-500">Amount:</span>
                                    <p className="font-semibold text-zinc-900 dark:text-zinc-50">{(pin.amount || 0) > 0 ? `৳${pin.amount}` : "N/A"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Reported On</p>
                            <p className="font-medium text-zinc-900 dark:text-zinc-50">
                                {new Date(pin.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">Source: {pin.sourceOfInfo}</p>
                        </div>
                    </div>
                </div>

                {pin.photos && pin.photos.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">Photographic Evidence</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {pin.photos.map((photo, i) => (
                                <a key={i} href={photo} target="_blank" rel="noopener noreferrer" className="block relative aspect-video rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:opacity-90 transition-opacity">
                                    <Image src={photo} alt={`Evidence ${i + 1}`} fill className="object-cover" unoptimized />
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {pin.videoLinks && pin.videoLinks.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">Video Evidence</h3>
                        <div className="flex flex-col gap-2">
                            {pin.videoLinks.map((link, i) => (
                                <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg truncate text-ellipsis">
                                    <CheckCircle size={16} className="flex-shrink-0" />
                                    <span className="truncate">{link}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {pin.evidences && pin.evidences.length > 0 && (
                    <div className="space-y-6 mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 border-b border-zinc-200 dark:border-zinc-800 pb-2">Additional Evidence</h3>
                        {pin.evidences.map((evidence, index) => (
                            <div key={index} className="space-y-3 bg-zinc-50 dark:bg-zinc-800/30 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                                <p className="text-xs font-medium text-zinc-500">Source: <span className="text-zinc-900 dark:text-zinc-300">{evidence.sourceOfInfo}</span></p>

                                {evidence.photos && evidence.photos.length > 0 && (
                                    <div className="grid grid-cols-2 gap-2">
                                        {evidence.photos.map((photo, i) => (
                                            <a key={i} href={photo} target="_blank" rel="noopener noreferrer" className="block relative aspect-video rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:opacity-90 transition-opacity">
                                                <Image src={photo} alt={`Additional Evidence ${i + 1}`} fill className="object-cover" unoptimized />
                                            </a>
                                        ))}
                                    </div>
                                )}

                                {evidence.videoLinks && evidence.videoLinks.length > 0 && (
                                    <div className="flex flex-col gap-2">
                                        {evidence.videoLinks.map((link, i) => (
                                            <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg truncate text-ellipsis">
                                                <CheckCircle size={16} className="flex-shrink-0" />
                                                <span className="truncate">{link}</span>
                                            </a>
                                        ))}
                                    </div>
                                )}
                                <p className="text-[10px] text-zinc-400 text-right">{new Date(evidence.createdAt).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="px-6 pb-6 mt-4">
                <button
                    onClick={() => setShowAddEvidence(true)}
                    className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border border-blue-100 dark:border-blue-900/30"
                >
                    Add More Evidence
                </button>
            </div>

            <div className="mt-auto p-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800">
                <p className="text-center text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">Is this information accurate?</p>
                <div className="flex gap-3">
                    <button
                        onClick={() => handleVote("yes")}
                        disabled={voting || hasVoted}
                        className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all
              ${hasVoted ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 cursor-not-allowed" : "bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400"}
            `}
                    >
                        <ThumbsUp size={18} />
                        <span>Yes ({pin.votes?.yes || 0})</span>
                    </button>

                    <button
                        onClick={() => handleVote("no")}
                        disabled={voting || hasVoted}
                        className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all
              ${hasVoted ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 cursor-not-allowed" : "bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400"}
            `}
                    >
                        <ThumbsDown size={18} />
                        <span>No ({pin.votes?.no || 0})</span>
                    </button>
                </div>
                {hasVoted && <p className="text-center text-xs text-emerald-600 dark:text-emerald-400 mt-2">Thank you for fact-checking!</p>}
            </div>
        </div>
    );
}
