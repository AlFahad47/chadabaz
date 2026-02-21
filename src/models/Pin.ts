import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPin extends Document {
    lat: number;
    lng: number;
    locationName: string;
    collectorName: string;
    sourceOfInfo: string;
    amount: number;
    photos: string[];
    videoLinks: string[];
    category: string;
    evidences?: {
        photos: string[];
        videoLinks: string[];
        sourceOfInfo: string;
        createdAt: Date;
    }[];
    votes: {
        yes: number;
        no: number;
    };
    votedDeviceIds: string[];
    createdAt: Date;
}

const PinSchema: Schema<IPin> = new mongoose.Schema(
    {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        locationName: { type: String, required: true },
        collectorName: { type: String, required: true },
        sourceOfInfo: { type: String, required: true },
        amount: { type: Number, default: 0 },
        photos: { type: [String], default: [] },
        videoLinks: { type: [String], default: [] },
        category: { type: String, required: true },
        votes: {
            yes: { type: Number, default: 0 },
            no: { type: Number, default: 0 }
        },
        votedDeviceIds: { type: [String], default: [] },
        evidences: {
            type: [{
                photos: { type: [String], default: [] },
                videoLinks: { type: [String], default: [] },
                sourceOfInfo: { type: String, required: true },
                createdAt: { type: Date, default: Date.now }
            }],
            default: []
        }
    },
    { timestamps: true }
);

// Force delete the model to prevent schema caching issues during development
if (mongoose.models.Pin) {
    delete mongoose.models.Pin;
}

export const Pin: Model<IPin> = mongoose.model<IPin>("Pin", PinSchema);
