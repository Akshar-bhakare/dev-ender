import { FastifyRequest, FastifyReply } from 'fastify';
import { User, Post } from '../models/index.js';

export const getProfile = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { userId } = request.params as { userId: string };
    
    // userId is expected to be the 'uid' (UUID)
    const user = await User.findOne({ uid: userId });
    
    if (!user) {
      return reply.status(404).send({ message: 'User not found' });
    }

    // Get user's posts
    const posts = await Post.find({ author: user._id })
      .populate('author', 'name uid email faceVerified kycStatus')
      .sort({ createdAt: -1 });

    return reply.send({
      user: {
        id: user.uid,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        company: user.company,
        bio: user.bio,
        faceVerified: user.faceVerified,
        kycStatus: user.kycStatus,
        docData: user.docData,
        createdAt: user.createdAt
      },
      posts
    });
  } catch (error: any) {
    request.log.error(error);
    return reply.status(500).send({ message: 'Error fetching profile' });
  }
};

export const updateProfile = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const userPayload = (request as any).user;
    const body = request.body as any;

    const user = await User.findOne({ uid: userPayload.sub });
    if (!user) {
      return reply.status(404).send({ message: 'User not found' });
    }

    if (body.name) user.name = body.name;
    if (body.avatar) user.avatar = body.avatar;
    if (body.company) user.company = body.company;
    if (body.bio) user.bio = body.bio;

    await user.save();

    return reply.send({
      message: 'Profile updated successfully',
      user: {
        id: user.uid,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        company: user.company,
        bio: user.bio,
        faceVerified: user.faceVerified,
        kycStatus: user.kycStatus
      }
    });
  } catch (error: any) {
    request.log.error(error);
    return reply.status(500).send({ message: 'Error updating profile' });
  }
};
