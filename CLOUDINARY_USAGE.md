# Cloudinary Integration Guide

This guide explains how to use Cloudinary for image uploads in the Property Management System.

## Setup

### Frontend

The Cloudinary credentials are already configured in `.env.local`:
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dsfzkdwre`
- `NEXT_PUBLIC_CLOUDINARY_API_KEY=332469666959356`
- `NEXT_PUBLIC_CLOUDINARY_API_SECRET=Js2tazrsEme3JQF1PvUIn22HE5s`
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=Property-images`

### Backend

The Cloudinary credentials are in `backend/.env`:
- `CLOUDINARY_CLOUD_NAME=dsfzkdwre`
- `CLOUDINARY_API_KEY=332469666959356`
- `CLOUDINARY_API_SECRET=Js2tazrsEme3JQF1PvUIn22HE5s`

## Usage Examples

### Frontend - Direct Upload (Using Upload Preset)

```typescript
import { uploadImageToCloudinary } from '@/lib/cloudinary';

// In your component
const handleUpload = async (file: File) => {
  try {
    const result = await uploadImageToCloudinary(file, 'property-images');
    console.log('Image URL:', result.secure_url);
    // Use result.secure_url to save to your database
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Frontend - Upload via Backend API

```typescript
import { uploadImageViaAPI } from '@/utils/imageUpload';

// In your component
const handleUpload = async (file: File) => {
  try {
    const imageUrl = await uploadImageViaAPI(file, 'property-images');
    console.log('Image URL:', imageUrl);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Backend - Upload Endpoint Usage

```bash
# Upload an image
curl -X POST http://localhost:5000/api/images/upload \
  -F "image=@/path/to/image.jpg" \
  -F "folder=property-images"

# Response:
# {
#   "success": true,
#   "data": {
#     "publicId": "property-images/abc123",
#     "url": "https://res.cloudinary.com/...",
#     "width": 1920,
#     "height": 1080,
#     "format": "jpg",
#     "bytes": 245678
#   }
# }
```

### Backend - Delete Image

```bash
curl -X DELETE http://localhost:5000/api/images/delete \
  -H "Content-Type: application/json" \
  -d '{"publicId": "property-images/abc123"}'
```

## Utility Functions

### Property Images

```typescript
// Frontend
import { uploadPropertyImage } from '@/utils/imageUpload';
const url = await uploadPropertyImage(file, propertyId);

// Backend
import { uploadPropertyImage } from '../utils/imageUpload';
const result = await uploadPropertyImage(buffer, propertyId);
```

### Profile Images

```typescript
// Frontend
import { uploadProfileImage } from '@/utils/imageUpload';
const url = await uploadProfileImage(file, userId);

// Backend
import { uploadProfileImage } from '../utils/imageUpload';
const result = await uploadProfileImage(buffer, userId);
```

## Image Folders

- `property-images/` - For property photos
- `user-profiles/` - For user profile pictures

## Security Notes

- The upload preset is safe to expose on the frontend
- The API secret should only be used on the backend
- Always validate file types and sizes before uploading
- Consider implementing authentication for upload endpoints in production

## File Size Limits

- Frontend direct upload: No hard limit (check Cloudinary dashboard settings)
- Backend API upload: 10MB limit (configurable in `backend/src/routes/images.ts`)

