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
        votedDeviceIds: { type: [String], default: [] }
    },
    { timestamps: true }
);

export const Pin: Model<IPin> = mongoose.models.Pin || mongoose.model<IPin>("Pin", PinSchema);
