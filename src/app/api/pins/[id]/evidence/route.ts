import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Pin } from "@/models/Pin";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await context.params;
        const { photos, videoLinks, sourceOfInfo } = await req.json();

        if (!sourceOfInfo) {
            return NextResponse.json({ error: "Source of information is required" }, { status: 400 });
        }

        const newEvidence = {
            photos: photos || [],
            videoLinks: videoLinks || [],
            sourceOfInfo,
            createdAt: new Date(),
        };

        const pin = await Pin.findByIdAndUpdate(
            id,
            { $push: { evidences: newEvidence } },
            { new: true }
        );

        if (!pin) {
            return NextResponse.json({ error: "Pin not found" }, { status: 404 });
        }

        return NextResponse.json(pin, { status: 200 });
    } catch (error) {
        console.error("Error adding evidence:", error);
        return NextResponse.json({ error: "Failed to add evidence" }, { status: 500 });
    }
}
