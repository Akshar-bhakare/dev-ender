import { v2 as cloudinary } from 'cloudinary';

// CLOUDINARY_URL format: cloudinary://api_key:api_secret@cloud_name
cloudinary.config({ secure: true });

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
