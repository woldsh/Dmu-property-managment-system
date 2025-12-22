import { NextRequest, NextResponse } from 'next/server';
import { deleteImage } from '@/lib/cloudinary';

export async function DELETE(req: NextRequest) {
    try {
        const body = await req.json();
        const { publicId } = body;

        if (!publicId) {
            return NextResponse.json({ success: false, error: 'Public ID is required' }, { status: 400 });
        }

        await deleteImage(publicId);

        return NextResponse.json({
            success: true,
            message: 'Image deleted successfully'
        });

    } catch (error: any) {
        console.error('Error deleting image:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to delete image'
        }, { status: 500 });
    }
}
