import Tesseract from 'tesseract.js';

export class OcrService {
  /**
   * Performs full OCR on an identity document and extracts key metadata.
   */
  static async processIdentityDocument(base64Image: string, type: string): Promise<{
    docNumber?: string;
    fullName?: string;
    dob?: string;
    country?: string;
    rawText: string;
  }> {
    try {
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      const result = await Tesseract.recognize(buffer, 'eng');
      const text = result.data.text;
      const country = this.detectCountryFromText(text);

      const info = this.parseIdentityInfo(text, type);

      return {
        ...info,
        country,
        rawText: text
      };
    } catch (err) {
      console.error('OCR Error:', err);
      return { rawText: '', country: 'unknown' };
    }
  }

  private static parseIdentityInfo(text: string, type: string): { docNumber?: string; fullName?: string; dob?: string } {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const content = text.toUpperCase();
    let docNumber: string | undefined;
    let fullName: string | undefined;
    let dob: string | undefined;

    // 1. Extract Document Number based on type
    if (type === 'aadhaar') {
      const match = text.match(/\d{4}\s?\d{4}\s?\d{4}/);
      if (match) docNumber = match[0].replace(/\s/g, '');
    } else if (type === 'emirates_id') {
      const match = text.match(/784-?\d{4}-?\d{7}-?\d{1}/);
      if (match) docNumber = match[0].replace(/-/g, '');
    } else if (type === 'passport') {
      // Look for Passport No label or MRZ
      const passportMatch = text.match(/PASSPORT NO\.?\s*:?\s*([A-Z0-9]{7,15})/i);
      if (passportMatch) docNumber = passportMatch[1];
      
      // MRZ parsing (simplified)
      const mrzMatch = text.match(/[A-Z0-9<]{44}/g);
      if (mrzMatch && mrzMatch.length >= 2) {
        // Line 2 of MRZ usually contains Passport Number in positions 0-9
        docNumber = mrzMatch[1].substring(0, 9).replace(/</g, '');
      }
    } else if (type === 'registration_cert') {
      // Look for Registration Number, CIN, etc.
      const cinMatch = text.match(/(?:CIN|REGISTRATION NO|REG\.?\s*NO|UIN)\s*:?\s*([A-Z0-9-]{10,21})/i);
      if (cinMatch) docNumber = cinMatch[1].replace(/-/g, '');
    }

    // 2. Extract Name (Heuristic: Look for labels or prominent lines)
    const nameMatch = text.match(/(?:NAME|FULL NAME|NOM|APELLIDOS)\s*:?\s*([A-Z\s]{3,30})/i);
    if (nameMatch) fullName = nameMatch[1].trim();

    // 3. Extract DOB
    const dobMatch = text.match(/(?:DOB|DATE OF BIRTH|BORN)\s*:?\s*(\d{2}[/-]\d{2}[/-]\d{4})/i);
    if (dobMatch) dob = dobMatch[1];

    return { docNumber, fullName, dob };
  }

  /**
   * Performs full OCR on a company document and extracts business metadata.
   */
  static async processCompanyDocument(base64Image: string, type: string): Promise<{
    registrationNumber?: string;
    gstin?: string;
    pan?: string;
    legalName?: string;
    address?: string;
    dateOfIncorporation?: string;
    rawText: string;
  }> {
    try {
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      const result = await Tesseract.recognize(buffer, 'eng');
      const text = result.data.text;
      const info = this.parseCompanyInfo(text, type);

      return {
        ...info,
        rawText: text
      };
    } catch (err) {
      console.error('Company OCR Error:', err);
      return { rawText: '' };
    }
  }

  private static parseCompanyInfo(text: string, type: string): any {
    const content = text.toUpperCase();
    let registrationNumber: string | undefined;
    let gstin: string | undefined;
    let pan: string | undefined;
    let legalName: string | undefined;
    let address: string | undefined;
    let dateOfIncorporation: string | undefined;

    // 1. Extract GSTIN (15 characters: 2 state code, 10 PAN, 1 entity, 1 blank, 1 check digit)
    const gstinMatch = text.match(/\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/);
    if (gstinMatch) gstin = gstinMatch[0];

    // 2. Extract Business PAN (10 characters: 5 letters, 4 digits, 1 letter)
    const panMatch = text.match(/[A-Z]{5}\d{4}[A-Z]{1}/);
    if (panMatch) pan = panMatch[0];

    // 3. Extract Registration Number / CIN
    const cinMatch = text.match(/(?:CIN|REGISTRATION NO|REG\.?\s*NO|UIN)\s*:?\s*([A-Z0-9-]{10,21})/i);
    if (cinMatch) registrationNumber = cinMatch[1].replace(/-/g, '');

    // 4. Extract Legal Name (Look for labels)
    const nameMatch = text.match(/(?:NAME|LEGAL NAME|COMPANY NAME|TRADE NAME)\s*:?\s*([A-Z\s]{3,50})/i);
    if (nameMatch) legalName = nameMatch[1].trim();

    // 5. Extract Date
    const dateMatch = text.match(/(?:DATE OF INCORPORATION|REGISTRATION DATE|INCORPORATED ON)\s*:?\s*(\d{2}[/-]\d{2}[/-]\d{4})/i);
    if (dateMatch) dateOfIncorporation = dateMatch[1];

    // 6. Extract Address (Heuristic: Look for labels or long text containing State/Pin)
    const addressMatch = text.match(/(?:REGISTERED ADDRESS|OFFICE ADDRESS|ADDRESS)\s*:?\s*([\w\s,.-]{10,100})/i);
    if (addressMatch) address = addressMatch[1].trim();

    return { registrationNumber, gstin, pan, legalName, address, dateOfIncorporation };
  }

  static async extractCountryFromImage(base64Image: string): Promise<string> {
    const res = await this.processIdentityDocument(base64Image, 'unknown');
    return res.country || 'unknown';
  }

  static detectCountryFromText(text: string): string {
    const content = text.toLowerCase();
    if (/aadhaar|uidai|government of india|republic of india/i.test(content)) return 'India';
    if (/emirates|uae|united arab emirates/i.test(content)) return 'UAE';
    if (/united kingdom|dvla|hmpo/i.test(content)) return 'UK';
    if (/united states|us passport|usa/i.test(content)) return 'USA';
    if (/singapore|nric/i.test(content)) return 'Singapore';
    
    // Passport MRZ check
    if (text.match(/^P<IND/m)) return 'India';
    if (text.match(/^P<ARE/m)) return 'UAE';
    if (text.match(/^P<GBR/m)) return 'UK';
    if (text.match(/^P<USA/m)) return 'USA';

    return 'unknown';
  }
}
