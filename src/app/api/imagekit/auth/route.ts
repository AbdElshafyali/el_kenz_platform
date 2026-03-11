export const dynamic = 'force-static';
import { NextResponse } from "next/server";
import ImageKit from "@imagekit/nodejs";

export async function GET() {
    try {
        const imagekit = new ImageKit({
            baseURL: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
        });

        const authenticationParameters = imagekit.helper.getAuthenticationParameters();

        return NextResponse.json(authenticationParameters);
    } catch (error) {
        console.error("ImageKit Auth Error:", error);
        return NextResponse.json(
            { error: "Failed to generate authentication parameters" },
            { status: 500 }
        );
    }
}
