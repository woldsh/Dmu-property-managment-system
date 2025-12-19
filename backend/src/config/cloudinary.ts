import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET || '',
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
 * Upload image to Cloudinary from server
 */
export const uploadImage = async (
  filePath: string,
  folder?: string,
  publicId?: string
): Promise<CloudinaryUploadResult> => {
  try {
    const uploadOptions: any = {
      resource_type: 'image',
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
 * Upload image from buffer (for multer)
 */
export const uploadImageFromBuffer = async (
  buffer: Buffer,
  folder?: string,
  publicId?: string
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      resource_type: 'image',
      overwrite: true,
      invalidate: true,
    };

    if (folder) {
      uploadOptions.folder = folder;
    }

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result as CloudinaryUploadResult);
        }
      }
    );

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

export default cloudinary;

