"use client";

import { useState, useEffect } from "react";
import { X, Link as LinkIcon, AlertCircle } from "lucide-react";
import { PinData } from "@/types";

interface PinFormProps {
    lat: number;
    lng: number;
    onClose: () => void;
    onSubmitSuccess: (newPin: PinData) => void;
    onCategoryChange?: (category: string) => void;
}

export default function PinForm({ lat, lng, onClose, onSubmitSuccess, onCategoryChange }: PinFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        locationName: "",
        collectorName: "",
        sourceOfInfo: "",
        amount: 0,
        category: "Transport",
    });

    const [customCategory, setCustomCategory] = useState("");

    useEffect(() => {
        if (onCategoryChange) {
            onCategoryChange(formData.category === "Others" ? customCategory || "Others" : formData.category);
        }
    }, [formData.category, customCategory, onCategoryChange]);

    const [photos, setPhotos] = useState<string[]>([]);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [videoUrl, setVideoUrl] = useState("");
    const [videoLinks, setVideoLinks] = useState<string[]>([]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploadingImage(true);
        setError(null);

        const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
        if (!apiKey) {
            setError("ImgBB API key is missing. Please add NEXT_PUBLIC_IMGBB_API_KEY to .env.local");
            setUploadingImage(false);
            return;
        }

        try {
            const uploadPromises = files.map(async (file) => {
                const formData = new FormData();
                formData.append("image", file);

                const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
                    method: "POST",
                    body: formData,
                });

                const data = await response.json();
                if (data.success) {
                    return data.data.url;
                } else {
                    throw new Error("Failed to upload an image to ImgBB");
                }
            });

            const uploadedUrls = await Promise.all(uploadPromises);
            setPhotos((prev) => [...prev, ...uploadedUrls]);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message || "Failed to upload one or more images");
            } else {
                setError("Failed to upload one or more images");
            }
        } finally {
            setUploadingImage(false);
            // Reset the file input
            e.target.value = "";
        }
    };

    const handleAddVideo = () => {
        if (videoUrl) {
            setVideoLinks([...videoLinks, videoUrl]);
            setVideoUrl("");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/pins", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    category: formData.category === "Others" ? customCategory : formData.category,
                    lat,
                    lng,
                    photos,
                    videoLinks,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create pin");
            }

            const newPin = await response.json();
            onSubmitSuccess(newPin);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message || "Something went wrong");
            } else {
                setError("Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Report Chadabaze</h2>
                <button onClick={onClose} className="p-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full transition-colors text-zinc-500">
                    <X size={18} />
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2 text-sm border border-red-200 dark:border-red-900/30">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Location Name*
                    </label>
                    <input
                        type="text"
                        required
                        placeholder="e.g. Karwan Bazar, Moghbazar..."
                        className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-zinc-900 dark:text-zinc-50 placeholder-zinc-400"
                        value={formData.locationName}
                        onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Category / Extortion Target*
                    </label>
                    <select
                        required
                        className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-zinc-900 dark:text-zinc-50 placeholder-zinc-400"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                        <option value="Transport">Transport (Bus/Truck/CNG)</option>
                        <option value="Industrial">Industrial (Factories/Jhut)</option>
                        <option value="Construction">Construction (Materials/Land)</option>
                        <option value="Market">Market (Hawkers/Shops)</option>
                        <option value="Neighborhood">Neighborhood (Residents/Events)</option>
                        <option value="Others">Others</option>
                    </select>
                    {formData.category === "Others" && (
                        <input
                            type="text"
                            required
                            placeholder="Type custom category..."
                            className="w-full mt-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-zinc-900 dark:text-zinc-50 placeholder-zinc-400"
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                        />
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Collector Name / Group*
                    </label>
                    <input
                        type="text"
                        required
                        placeholder="Who is collecting?"
                        className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-zinc-900 dark:text-zinc-50 placeholder-zinc-400"
                        value={formData.collectorName}
                        onChange={(e) => setFormData({ ...formData, collectorName: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Amount (BDT)
                    </label>
                    <input
                        type="number"
                        min="0"
                        className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-zinc-900 dark:text-zinc-50 placeholder-zinc-400"
                        value={formData.amount || ""}
                        onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Source of Information*
                    </label>
                    <input
                        type="text"
                        required
                        placeholder="e.g. Personal experience, Local news..."
                        className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-zinc-900 dark:text-zinc-50 placeholder-zinc-400"
                        value={formData.sourceOfInfo}
                        onChange={(e) => setFormData({ ...formData, sourceOfInfo: e.target.value })}
                    />
                </div>

                {/* Media Inputs */}
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Photos
                    </label>
                    <div className="flex flex-col gap-2 mb-2">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                            className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 dark:file:bg-zinc-800 dark:file:text-zinc-300 dark:hover:file:bg-zinc-700 transition-all focus:outline-none"
                        />
                        {uploadingImage && <p className="text-xs text-blue-600 dark:text-blue-400 animate-pulse">Uploading images to ImgBB...</p>}
                    </div>
                    {photos.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {photos.map((p, i) => (
                                <span key={i} className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full flex items-center gap-1">
                                    Image {i + 1}
                                    <button type="button" onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))} className="hover:text-blue-900 dark:hover:text-blue-100"><X size={12} /></button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Videos (Google Drive Links)
                    </label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="url"
                            placeholder="https://drive.google.com/..."
                            className="flex-1 px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={handleAddVideo}
                            className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg font-medium transition-colors flex items-center gap-1 text-sm"
                        >
                            <LinkIcon size={16} />
                            Add
                        </button>
                    </div>
                    {videoLinks.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {videoLinks.map((v, i) => (
                                <span key={i} className="text-xs px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full flex items-center gap-1">
                                    Video {i + 1}
                                    <button type="button" onClick={() => setVideoLinks(videoLinks.filter((_, idx) => idx !== i))} className="hover:text-purple-900 dark:hover:text-purple-100"><X size={12} /></button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading || uploadingImage}
                    className="w-full mt-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
                >
                    {loading ? "Submitting..." : uploadingImage ? "Uploading Photos..." : "Submit Report"}
                </button>
            </form>
        </div>
    );
}
