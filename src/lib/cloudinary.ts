import "server-only";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;

console.log('--- Cloudinary Config Check ---');
console.log('Cloud Name set:', !!cloudName);
console.log('API Key set:', !!apiKey);
console.log('API Secret set:', !!apiSecret);
if (apiKey) console.log('API Key starts with:', apiKey.substring(0, 4) + '...');
console.log('-------------------------------');

if (!cloudName || !apiKey || !apiSecret) {
  console.error('CRITICAL: Cloudinary configuration is incomplete!');
}

cloudinary.config({
  cloud_name: cloudName || '',
  api_key: apiKey || '',
  api_secret: apiSecret || '',
  secure: true,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  bytes: number;
}

/**
 * Upload image to Cloudinary from server (using path)
 */
export const uploadImage = async (
  filePath: string,
  folder?: string,
  publicId?: string
): Promise<CloudinaryUploadResult> => {
  try {
    const uploadOptions: any = {
      resource_type: 'auto',
      overwrite: true,
      invalidate: true,
    };

    if (folder) {
      uploadOptions.folder = folder;
    }

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    const result = await cloudinary.uploader.upload(filePath, uploadOptions);
    return result as CloudinaryUploadResult;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
};

/**
 * Upload image from ArrayBuffer (Next.js App Router friendly)
 */
export const uploadImageFromBuffer = async (
  buffer: Buffer,
  folder?: string,
  publicId?: string
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      resource_type: 'auto',
      overwrite: true,
      invalidate: true,
    };

    if (folder) {
      uploadOptions.folder = folder;
    }

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    // Ensure config is applied
    cloudinary.config({
      cloud_name: cloudName || '',
      api_key: apiKey || '',
      api_secret: apiSecret || '',
      secure: true,
    });

    console.log('Starting Cloudinary upload stream with options:', uploadOptions);
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary stream error:', error);
          reject(error);
        } else {
          console.log('Cloudinary stream success');
          resolve(result as CloudinaryUploadResult);
        }
      }
    );

    uploadStream.on('error', (err) => {
      console.error('Upload stream event error:', err);
    });

    uploadStream.end(buffer);
  });
};

/**
 * Delete image from Cloudinary
 */
export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

/**
 * Get image URL with transformations
 */
export const getImageUrl = (
  publicId: string,
  transformations?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: number | string;
  }
): string => {
  return cloudinary.url(publicId, {
    ...transformations,
    secure: true,
  });
};

/**
 * Generic upload function that can be used on the server
 */
export const uploadImageToCloudinary = async (
  file: File | Blob | Buffer,
  folder?: string,
  publicId?: string
): Promise<CloudinaryUploadResult> => {
  if (Buffer.isBuffer(file)) {
    return uploadImageFromBuffer(file, folder, publicId);
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return uploadImageFromBuffer(buffer, folder, publicId);
};

export default cloudinary;
