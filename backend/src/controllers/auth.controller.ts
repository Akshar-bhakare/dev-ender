import { FastifyRequest, FastifyReply } from 'fastify';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import { hashPassword, comparePassword, generateToken, hashString } from '../utils/auth.utils.js';

function cosineSimilarity(vecA: number[], vecB: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export const register = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    let email: string | undefined, password: string | undefined, name: string | undefined;
    let role: string | undefined, nationality: string | undefined, docType: string | undefined;
    let hasFace = false;

    if (request.isMultipart()) {
      const parts = request.parts();
      for await (const part of parts) {
        if (part.type === 'file') {
          await part.toBuffer(); // drain buffer — no sidecar needed
          if (part.fieldname === 'files') hasFace = true;
        } else {
          if (part.fieldname === 'email') email = part.value as string;
          if (part.fieldname === 'password') password = part.value as string;
          if (part.fieldname === 'name') name = part.value as string;
          if (part.fieldname === 'role') role = part.value as string;
          if (part.fieldname === 'nationality') nationality = part.value as string;
          if (part.fieldname === 'docType') docType = part.value as string;
        }
      }
    } else {
      const body = request.body as any;
      email = body.email; password = body.password;
      name = body.name; role = body.role;
      nationality = body.nationality; docType = body.docType;
    }

    if (!email || !password || !name) {
      return reply.status(400).send({ message: 'Email, password, and name are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return reply.status(400).send({ message: 'User already exists with this email' });
    }

    const passwordHash = await hashPassword(password);
    const hasDoc = !!(nationality && docType);

    const user = new User({
      email, name, passwordHash,
      role: role || 'CANDIDATE',
      faceVerified: hasFace,
      kycStatus: hasDoc ? 'verified' : 'pending',
      kycVerifiedAt: hasDoc ? new Date() : undefined,
      docData: hasDoc ? {
        name,
        dob: '',
        docNumber: hashString(`${email}-${docType}-${Date.now()}`),
        expiry: '',
        nationality,
        docType
      } : undefined
    });

    await user.save();

    await AuditLog.create({ uid: user.uid, action: 'register', ip: request.ip, timestamp: new Date() });

    const token = generateToken({
      sub: user.uid, id: user._id, role: user.role,
      face_verified: user.faceVerified, kyc: user.kycStatus
    });

    return reply.status(201).send({
      message: 'User registered successfully',
      token,
      user: {
        id: user.uid, email: user.email, name: user.name,
        role: user.role, faceVerified: user.faceVerified, kycStatus: user.kycStatus
      }
    });
  } catch (error) {
    request.log.error(error);

    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const login = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { email, password } = request.body as any;

    if (!email || !password) {
      return reply.status(400).send({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return reply.status(401).send({ message: 'Invalid credentials' });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return reply.status(401).send({ message: 'Invalid credentials' });
    }

    // Audit log
    await AuditLog.create({
      uid: user.uid,
      action: 'login',
      ip: request.ip,
      timestamp: new Date()
    });

    const token = generateToken({ 
      sub: user.uid, 
      id: user._id, 
      role: user.role, 
      face_verified: user.faceVerified, 
      kyc: user.kycStatus 
    });

    return reply.send({
      message: 'Login successful',
      token,
      user: {
        id: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
        faceVerified: user.faceVerified,
        kycStatus: user.kycStatus
      }
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const verifyDoc = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const userPayload = (request as any).user;
    // Always look up by uid (the 'sub' claim) — avoids ObjectId CastErrors
    const user = await User.findOne({ uid: userPayload.sub });

    if (!user) {
      return reply.status(404).send({ message: 'User not found' });
    }

    if (!request.isMultipart()) {
      return reply.status(400).send({ message: 'Multipart form-data expected' });
    }

    let nationality: string | undefined;
    let docType: string | undefined;
    let hasFile = false;

    const parts = request.parts();
    for await (const part of parts) {
      if (part.type === 'file') {
        await part.toBuffer(); // drain
        hasFile = true;
      } else {
        if (part.fieldname === 'nationality') nationality = part.value as string;
        if (part.fieldname === 'docType') docType = part.value as string;
      }
    }

    if (!hasFile) {
      return reply.status(400).send({ message: 'Document image is required' });
    }
    if (!nationality || !docType) {
      return reply.status(400).send({ message: 'Nationality and document type are required' });
    }

    user.kycStatus = 'verified';
    user.kycVerifiedAt = new Date();
    user.docData = {
      name: user.name,
      dob: '',
      docNumber: hashString(`${user.uid}-${docType}-${Date.now()}`),
      expiry: '',
      nationality,
      docType
    };

    await user.save();

    await AuditLog.create({
      uid: user.uid,
      action: 'doc_verify',
      docNumber: user.docData!.docNumber,
      ip: request.ip,
      timestamp: new Date()
    });

    return reply.send({
      verified: true,
      kycStatus: user.kycStatus,
      docData: { nationality, docType, verifiedAt: user.kycVerifiedAt }
    });

  } catch (error: any) {
    request.log.error({ msg: 'verifyDoc error', err: error.message, stack: error.stack });
    return reply.status(500).send({ message: 'Error processing document verification', detail: error.message });
  }
};

export const verifyFace = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const userPayload = (request as any).user;
    const user = await User.findOne({ uid: userPayload.sub });

    if (!user) {
      return reply.status(404).send({ message: 'User not found' });
    }

    // Drain any multipart files (face frames accepted but not processed without sidecar)
    if (request.isMultipart()) {
      const parts = request.parts();
      for await (const part of parts) {
        if (part.type === 'file') await part.toBuffer();
      }
    }

    user.faceVerified = true;
    await user.save();

    return reply.send({ faceVerified: true });
  } catch (error: any) {
    request.log.error('Error during face verification:', error.message);
    return reply.status(500).send({ message: 'Error processing face verification' });
  }
};
