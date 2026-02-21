

export interface PinData {
    _id: string;
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
        createdAt: string;
    }[];
    votes: {
        yes: number;
        no: number;
    };
    votedDeviceIds?: string[];
    createdAt: string;
}
