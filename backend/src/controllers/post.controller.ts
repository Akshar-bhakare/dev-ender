import { FastifyRequest, FastifyReply } from 'fastify';
import { Post, User, Comment } from '../models/index.js';
import mongoose from 'mongoose';

const AUTHOR_SELECT = 'fullName name uid email identityVerified faceVerified documentVerificationStatus trustScore badges avatar jobTitle currentCompany';

export const getFeed = async (request: FastifyRequest, reply: FastifyReply) => {
  const { cursor, limit = 15 } = request.query as any;
  const authUser = (request as any).user;

  const query: any = { visibility: 'public' };
  if (cursor) query.createdAt = { $lt: new Date(cursor) };

  let followingIds: mongoose.Types.ObjectId[] = [];
  let connectionIds: mongoose.Types.ObjectId[] = [];

  if (authUser) {
    const me = await User.findById(authUser._id).select('following');
    followingIds = (me?.following || []) as mongoose.Types.ObjectId[];
  }

  // Fetch posts — connections/following first, then rest
  const posts = await Post.find(query)
    .populate('author', AUTHOR_SELECT)
    .sort({ createdAt: -1 })
    .limit(Number(limit) + 1);

  const hasMore = posts.length > Number(limit);
  const result = posts.slice(0, Number(limit));

  // Attach isLiked flag if authenticated
  const myId = authUser?._id?.toString();
  const normalized = result.map(p => ({
    ...p.toObject(),
    isLiked: myId ? p.likes.some((id: any) => id.toString() === myId) : false,
    likesCount: p.likes.length,
  }));

  return reply.send({
    posts: normalized,
    nextCursor: hasMore ? result[result.length - 1].createdAt.toISOString() : null,
  });
};

export const createPost = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  const { content, mediaUrls, visibility, opportunityTag } = request.body as any;

  const post = await Post.create({
    author: user._id,
    content,
    mediaUrls: mediaUrls || [],
    visibility: visibility || 'public',
    opportunityTag: opportunityTag || null,
  });

  const populated = await post.populate('author', AUTHOR_SELECT);
  return reply.status(201).send({ ...populated.toObject(), likesCount: 0, isLiked: false });
};

export const updatePost = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  const { id } = request.params as any;
  const { content, opportunityTag } = request.body as any;

  const post = await Post.findOneAndUpdate(
    { _id: id, author: user._id },
    { content, opportunityTag },
    { new: true }
  ).populate('author', AUTHOR_SELECT);

  if (!post) return reply.status(404).send({ error: 'Post not found or unauthorized' });
  return reply.send(post);
};

export const deletePost = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  const { id } = request.params as any;

  const post = await Post.findOneAndDelete({ _id: id, author: user._id });
  if (!post) return reply.status(404).send({ error: 'Post not found or unauthorized' });

  await Comment.deleteMany({ post: id });
  return reply.send({ success: true });
};

export const toggleLike = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  const { id } = request.params as any;

  const post = await Post.findById(id);
  if (!post) return reply.status(404).send({ error: 'Post not found' });

  const alreadyLiked = post.likes.some((uid: any) => uid.toString() === user._id.toString());

  if (alreadyLiked) {
    post.likes = post.likes.filter((uid: any) => uid.toString() !== user._id.toString()) as any;
  } else {
    post.likes.push(user._id);
  }
  await post.save();

  return reply.send({ likesCount: post.likes.length, isLiked: !alreadyLiked });
};

export const getComments = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as any;
  const comments = await Comment.find({ post: id, parentComment: null })
    .populate('author', AUTHOR_SELECT)
    .sort({ createdAt: 1 })
    .limit(50);
  return reply.send(comments);
};

export const addComment = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  const { id } = request.params as any;
  const { content } = request.body as any;

  const comment = await Comment.create({ post: id, author: user._id, content });
  await Post.findByIdAndUpdate(id, { $inc: { commentCount: 1 } });
  const populated = await comment.populate('author', AUTHOR_SELECT);
  return reply.status(201).send(populated);
};

export const deleteComment = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  const { commentId } = request.params as any;

  const comment = await Comment.findOneAndDelete({ _id: commentId, author: user._id });
  if (!comment) return reply.status(404).send({ error: 'Comment not found or unauthorized' });

  await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } });
  return reply.send({ success: true });
};

export const getUserPosts = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.params as any;
  const user = await User.findById(userId);
  if (!user) return reply.status(404).send({ error: 'User not found' });

  const posts = await Post.find({ author: userId })
    .populate('author', AUTHOR_SELECT)
    .sort({ createdAt: -1 })
    .limit(20);

  return reply.send(posts.map(p => ({ ...p.toObject(), likesCount: p.likes.length })));
};
