import { NextRequest, NextResponse } from 'next/server';
import { uploadImageFromBuffer } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('image') as File | null;
        const folder = formData.get('folder') as string || 'property-images';
        const publicId = formData.get('publicId') as string | undefined;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No image file provided' }, { status: 400 });
        }

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Cloudinary
        const result = await uploadImageFromBuffer(buffer, folder, publicId);

        return NextResponse.json({
            success: true,
            data: {
                publicId: result.public_id,
                url: result.secure_url,
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes,
            }
        });

    } catch (error: any) {
        console.error('Error uploading image:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to upload image'
        }, { status: 500 });
    }
}
