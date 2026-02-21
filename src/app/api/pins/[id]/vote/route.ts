import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Pin } from "@/models/Pin";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        // Await context.params in Next.js 15
        const { id } = await context.params;
        const body = await req.json();
        const { type, deviceId } = body; // 'yes' or 'no', and deviceId

        if (!deviceId) {
            return NextResponse.json({ error: "Device ID is required to vote" }, { status: 400 });
        }

        if (type !== "yes" && type !== "no") {
            return NextResponse.json({ error: "Invalid vote type" }, { status: 400 });
        }

        const pin = await Pin.findById(id);
        if (!pin) {
            return NextResponse.json({ error: "Pin not found" }, { status: 404 });
        }

        if (pin.votedDeviceIds && pin.votedDeviceIds.includes(deviceId)) {
            return NextResponse.json({ error: "User has already voted" }, { status: 400 });
        }

        const updateKey = `votes.${type}`;
        const updatedPin = await Pin.findByIdAndUpdate(
            id,
            {
                $inc: { [updateKey]: 1 },
                $push: { votedDeviceIds: deviceId }
            },
            { new: true }
        );

        if (!updatedPin) {
            return NextResponse.json({ error: "Pin not found" }, { status: 404 });
        }

        return NextResponse.json(updatedPin);
    } catch (error) {
        console.error("Error voting:", error);
        return NextResponse.json({ error: "Failed to submit vote" }, { status: 500 });
    }
}
