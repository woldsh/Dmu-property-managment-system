import { NextRequest, NextResponse } from 'next/server';
import { uploadImageFromBuffer } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = (formData.get('image') || formData.get('file')) as File | null;
        const folder = formData.get('folder') as string || 'meeting-attachments';
        const publicId = formData.get('publicId') as string | undefined;

        if (!file) {
            console.log('Error: No file provided to API');
            return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
        }

        console.log('API received file:', file.name, 'size:', file.size, 'type:', file.type);
        console.log('Uploading to folder:', folder);

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Cloudinary
        let result;
        try {
            result = await uploadImageFromBuffer(buffer, folder, publicId);
            console.log('Cloudinary upload successful:', result.secure_url);
        } catch (uploadError: any) {
            console.error('Cloudinary upload error in API:', uploadError);
            return NextResponse.json({
                success: false,
                error: `Cloudinary Error: ${uploadError.message || 'Unknown upload error'}`,
                details: uploadError
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: {
                publicId: result.public_id,
                url: result.secure_url,
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes,
                resource_type: result.resource_type
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
