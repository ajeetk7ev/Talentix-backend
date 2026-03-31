import multer from 'multer';
import { storage } from '../config/cloudinary.config.js';

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

export const uploadPaymentScreenshot = upload.single('screenshot');
