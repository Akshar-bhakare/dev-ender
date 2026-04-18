import Tesseract from 'tesseract.js';

export class OcrService {
  /**
   * Extracts text from an image and guesses the country/Document Type.
   * @param base64Image The image as a base64 string (preferably with data URI prefix, or we convert to buffer)
   */
  static async extractCountryFromImage(base64Image: string): Promise<string> {
    try {
      // Strip data:image/...;base64, if present, or feed directly if supported.
      // Tesseract actually supports data uris or buffers. 
      // Let's ensure we just pass it a buffer to be safe.
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      const result = await Tesseract.recognize(buffer, 'eng', {
        // Tesseract configuration (can be omitted for defaults)
      });
      
      const text = result.data.text;
      return this.detectCountryFromText(text);
    } catch (err) {
      console.error('OCR Error:', err);
      return 'unknown';
    }
  }

  static detectCountryFromText(text: string): string {
    const content = text.toLowerCase();
    if (/aadhaar|uidai|government of india/i.test(content)) return 'India';
    if (/republic of india|passport.*ind/i.test(content)) return 'India';
    if (/emirates|uae|united arab emirates/i.test(content)) return 'UAE';
    if (/united kingdom|dvla|hmpo|driver and vehicle licensing/i.test(content)) return 'UK';
    if (/united states|us passport|usa/i.test(content)) return 'USA';
    if (/singapore|nric/i.test(content)) return 'Singapore';
    
    // Look for MRZ patterns (Machine Readable Zone)
    const mrzMatch = text.match(/^P<([A-Z]{3})/m);
    if (mrzMatch) return mrzMatch[1];
    
    return 'unknown';
  }
}
