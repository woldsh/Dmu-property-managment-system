import { uploadImageFromBuffer } from '../config/cloudinary';
import { CloudinaryUploadResult } from '../config/cloudinary';

/**
 * Upload property image to Cloudinary
 */
export const uploadPropertyImage = async (
  buffer: Buffer,
  propertyId?: string
): Promise<CloudinaryUploadResult> => {
  const folder = 'property-images';
  const publicId = propertyId ? `property-images/${propertyId}` : undefined;
  
  return uploadImageFromBuffer(buffer, folder, publicId);
};

/**
 * Upload user profile image to Cloudinary
 */
export const uploadProfileImage = async (
  buffer: Buffer,
  userId: string
): Promise<CloudinaryUploadResult> => {
  const folder = 'user-profiles';
  const publicId = `user-profiles/${userId}`;
  
  return uploadImageFromBuffer(buffer, folder, publicId);
};

