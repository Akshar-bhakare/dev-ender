import { v4 as uuidv4 } from 'uuid';

export const generateQrToken = (): string => {
  return uuidv4();
};
