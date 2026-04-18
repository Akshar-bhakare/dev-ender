export class CloudinaryService {
  /**
   * Stubs uploading a base64 image to Cloudinary and returns a fake URL
   */
  static async uploadImage(base64Image: string, folder: string): Promise<string> {
    // In a real app, use the Cloudinary v2 SDK
    // return (await cloudinary.uploader.upload(base64Image, { folder })).secure_url;
    
    return `https://res.cloudinary.com/demo/image/upload/v1234567890/${folder}/dummy.jpg`;
  }
}
