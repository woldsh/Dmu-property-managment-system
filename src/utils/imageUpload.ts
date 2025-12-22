import { uploadImageToCloudinary } from '../lib/cloudinary';

/**
 * Upload property image to Cloudinary
 */
export const uploadPropertyImage = async (
  file: File | Blob,
  propertyId?: string
): Promise<string> => {
  const folder = 'property-images';
  const result = await uploadImageToCloudinary(file, folder);
  return result.secure_url;
};

/**
 * Upload user profile image to Cloudinary
 */
export const uploadProfileImage = async (
  file: File | Blob,
  userId: string
): Promise<string> => {
  const folder = 'user-profiles';
  const result = await uploadImageToCloudinary(file, folder);
  return result.secure_url;
};

/**
 * Upload image via backend API (alternative method)
 */
export const uploadImageViaAPI = async (
  file: File,
  folder?: string
): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  if (folder) {
    formData.append('folder', folder);
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const response = await fetch(`${apiUrl}/api/images/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }

  const data = await response.json();
  return data.data.url;
};

