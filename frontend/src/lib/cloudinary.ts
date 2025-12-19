import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '',
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET || '',
  secure: true,
});

export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

/**
 * Upload image to Cloudinary from frontend (using upload preset)
 * This method uses the upload preset for client-side uploads
 */
export const uploadImageToCloudinary = async (
  file: File | Blob,
  folder?: string
): Promise<CloudinaryUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
  
  if (folder) {
    formData.append('folder', folder);
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload image to Cloudinary');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Delete image from Cloudinary
 */
export const deleteImageFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    // For client-side deletion, you'll need to call your backend API
    // as API secret should not be exposed on the frontend
    const response = await fetch(`/api/images/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete image from Cloudinary');
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

export default cloudinary;

