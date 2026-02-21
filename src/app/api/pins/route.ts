import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Pin } from "@/models/Pin";

export async function GET() {
    try {
        await dbConnect();
        const pins = await Pin.find({}).sort({ createdAt: -1 });
        return NextResponse.json(pins);
    } catch (error) {
        console.error("Error fetching pins:", error);
        return NextResponse.json({ error: "Failed to fetch pins" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const pin = await Pin.create(body);
        return NextResponse.json(pin, { status: 201 });
    } catch (error) {
        console.error("Error creating pin:", error);
        return NextResponse.json({ error: "Failed to create pin" }, { status: 500 });
    }
}
