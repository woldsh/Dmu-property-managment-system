import express, { Request, Response } from 'express';
import multer from 'multer';
import { uploadImageFromBuffer, deleteImage } from '../config/cloudinary';
import { ApiResponse } from '../types';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

/**
 * POST /api/images/upload
 * Upload image to Cloudinary
 */
router.post('/upload', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      const response: ApiResponse = {
        success: false,
        error: 'No image file provided',
      };
      return res.status(400).json(response);
    }

    const folder = (req.body.folder as string) || 'property-images';
    const publicId = req.body.publicId as string | undefined;

    const result = await uploadImageFromBuffer(req.file.buffer, folder, publicId);

    const response: ApiResponse = {
      success: true,
      data: {
        publicId: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Error uploading image:', error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image',
    };
    res.status(500).json(response);
  }
});

/**
 * DELETE /api/images/delete
 * Delete image from Cloudinary
 */
router.delete('/delete', async (req: Request, res: Response) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      const response: ApiResponse = {
        success: false,
        error: 'Public ID is required',
      };
      return res.status(400).json(response);
    }

    await deleteImage(publicId);

    const response: ApiResponse = {
      success: true,
      message: 'Image deleted successfully',
    };

    res.json(response);
  } catch (error) {
    console.error('Error deleting image:', error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete image',
    };
    res.status(500).json(response);
  }
});

export default router;

