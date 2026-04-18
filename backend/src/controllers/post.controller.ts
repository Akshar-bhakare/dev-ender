import { FastifyRequest, FastifyReply } from 'fastify';
import { Post, User } from '../models/index.js';

export const getFeed = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const posts = await Post.find({})
      .populate('author', 'name uid email identityVerified kycStatus avatar company')
      .sort({ createdAt: -1 })
      .limit(20);
    
    return reply.send(posts);
  } catch (error: any) {
    request.log.error(error);
    return reply.status(500).send({ message: 'Error fetching feed' });
  }
};

export const createPost = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const userPayload = (request as any).user;
    const { content, mediaUrls, visibility } = request.body as any;

    const user = await User.findOne({ uid: userPayload.sub });
    if (!user) {
      return reply.status(404).send({ message: 'User not found' });
    }

    const post = new Post({
      author: user._id,
      content,
      mediaUrls: mediaUrls || [],
      visibility: visibility || 'public'
    });

    await post.save();
    
    // Return populated post
    const populatedPost = await post.populate('author', 'name uid email identityVerified kycStatus avatar company');

    return reply.status(201).send(populatedPost);
  } catch (error: any) {
    request.log.error(error);
    return reply.status(500).send({ message: 'Error creating post' });
  }
};
