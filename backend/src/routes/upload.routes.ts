import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/role.middleware';
import { sendSuccess } from '../utils/response.util';
import logger from '../utils/logger.util';
import Image from '../models/image.model';

const router = Router();

// Configure multer for memory storage (no disk writes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP, GIF, SVG) are allowed'));
    }
  },
});

// Helper: upload buffer to Cloudinary
function uploadToCloudinary(buffer: Buffer, folder: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `amoha/${folder}`, resource_type: 'image', quality: 'auto', format: 'auto' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      },
    );
    stream.end(buffer);
  });
}

// Configure Cloudinary from env
const configureCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    return true;
  }
  return false;
};

/** Fallback: save image buffer to MongoDB and return a served URL */
async function saveToMongo(buffer: Buffer, contentType: string, folder: string): Promise<string> {
  const img = await Image.create({ data: buffer, contentType, folder });
  const baseUrl = process.env.BACKEND_URL || 'https://amoha-backend.onrender.com';
  return `${baseUrl}/api/upload/${img._id}`;
}

// GET /api/upload/:id — serve stored image (public, no auth needed)
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const img = await Image.findById(req.params.id);
    if (!img) { res.status(404).json({ success: false, message: 'Image not found' }); return; }
    res.set('Content-Type', img.contentType);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(img.data);
  } catch (error) {
    next(error);
  }
});

// POST /api/upload — single image upload
router.post('/', authenticate, isAdmin, upload.single('image'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image file provided' });
      return;
    }

    const folder = (req.body.folder as string) || 'general';

    if (configureCloudinary()) {
      const url = await uploadToCloudinary(req.file.buffer, folder);
      sendSuccess(res, { url }, 'Image uploaded');
      return;
    }

    logger.warn('Cloudinary not configured — storing image in MongoDB');
    const url = await saveToMongo(req.file.buffer, req.file.mimetype, folder);
    sendSuccess(res, { url }, 'Image uploaded');
  } catch (error) {
    next(error);
  }
});

// POST /api/upload/multiple — multiple image upload
router.post('/multiple', authenticate, isAdmin, upload.array('images', 10), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ success: false, message: 'No image files provided' });
      return;
    }

    const folder = (req.body.folder as string) || 'general';
    const urls: string[] = [];

    if (configureCloudinary()) {
      for (const file of files) {
        const url = await uploadToCloudinary(file.buffer, folder);
        urls.push(url);
      }
    } else {
      logger.warn('Cloudinary not configured — storing images in MongoDB');
      for (const file of files) {
        const url = await saveToMongo(file.buffer, file.mimetype, folder);
        urls.push(url);
      }
    }

    sendSuccess(res, { urls }, `${urls.length} images uploaded`);
  } catch (error) {
    next(error);
  }
});

// POST /api/upload/kyc — KYC document upload (authenticated users)
router.post('/kyc', authenticate, upload.single('document'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No document file provided' });
      return;
    }

    if (configureCloudinary()) {
      const url = await uploadToCloudinary(req.file.buffer, 'kyc');
      sendSuccess(res, { url }, 'Document uploaded');
      return;
    }

    const url = await saveToMongo(req.file.buffer, req.file.mimetype, 'kyc');
    sendSuccess(res, { url }, 'Document uploaded');
  } catch (error) {
    next(error);
  }
});

export default router;
