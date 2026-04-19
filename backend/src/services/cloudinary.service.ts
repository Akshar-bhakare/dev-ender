import { v2 as cloudinary } from 'cloudinary';

if (process.env.CLOUDINARY_URL) {
  const url = process.env.CLOUDINARY_URL;
  // Format: cloudinary://api_key:api_secret@cloud_name
  const regex = /cloudinary:\/\/([^:]+):([^@]+)@(.+)/;
  const matches = url.match(regex);
  if (matches) {
    cloudinary.config({
      cloud_name: matches[3],
      api_key: matches[1],
      api_secret: matches[2],
      secure: true
    });
    console.log('[Cloudinary] Configured successfully from URL.');
  } else {
    console.error('[Cloudinary] Invalid CLOUDINARY_URL format.');
  }
} else {
  console.warn('[Cloudinary] WARNING: CLOUDINARY_URL not found in environment.');
}

export class CloudinaryService {
  static async uploadImage(base64Image: string, folder: string): Promise<string> {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder,
      resource_type: 'image',
      // Security: private access for sensitive documents
      type: folder.includes('documents') || folder.includes('face') ? 'private' : 'upload',
      // Auto-delete after 1 year for compliance
      invalidate: true,
    });
    return result.secure_url;
  }

  static async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId, { invalidate: true });
  }
}
