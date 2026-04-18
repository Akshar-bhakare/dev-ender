import * as faceapi from '@vladmandic/face-api';
import { Canvas, Image, ImageData, loadImage } from 'canvas';
import { User } from '../models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Monkey patch faceapi to use canvas in Node environment
faceapi.env.monkeyPatch({ Canvas: Canvas as any, Image: Image as any, ImageData: ImageData as any });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// __dirname is now '.../dev-clash/backend/src/services' or '.../backend/dist/services'
// Model path is two levels up from src/services -> backend/models/face-api
const MODELS_PATH = path.join(__dirname, '..', '..', 'models', 'face-api');

let modelsLoaded = false;

export class FaceService {
  /**
   * Initialize models lazily
   */
  static async loadModels() {
    if (modelsLoaded) return;
    
    console.log(`Loading face-api models from ${MODELS_PATH}`);
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_PATH),
      faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH),
      faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_PATH)
    ]);
    
    modelsLoaded = true;
    console.log('Face-api models loaded perfectly.');
  }

  /**
   * Process face image to get descriptor
   * @param base64Image Base64 image
   */
  static async processFaceImage(base64Image: string): Promise<{ descriptor: number[], confidence: number }> {
    await this.loadModels();

    // Remove data-uri prefix if exists
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Load image into node-canvas
    const img = await loadImage(buffer);

    // Detect face
    const detection = await faceapi.detectSingleFace(img as any).withFaceLandmarks().withFaceDescriptor();

    if (!detection) {
      throw new Error('No face detected in the frame');
    }

    return {
      descriptor: Array.from(detection.descriptor), // Convert Float32Array to standard array
      confidence: detection.detection.score // Confidence that it is a face
    };
  }

  /**
   * Compare new face descriptor against all existing ones to find duplicates
   */
  static async findDuplicateFace(newDescriptor: number[]): Promise<boolean> {
    const DUPLICATE_THRESHOLD = 0.55; // Lower is stricter

    // We fetch all active users with a valid face descriptor
    const users = await User.find({ 
      faceDescriptor: { $exists: true, $not: { $size: 0 } } 
    }).select('faceDescriptor');

    for (const user of users) {
      if (user.faceDescriptor && user.faceDescriptor.length === 128) {
        const floatArrayA = new Float32Array(user.faceDescriptor);
        const floatArrayB = new Float32Array(newDescriptor);
        
        const distance = faceapi.euclideanDistance(floatArrayA, floatArrayB);
        if (distance < DUPLICATE_THRESHOLD) {
          return true; // Match found
        }
      }
    }

    return false;
  }
}
