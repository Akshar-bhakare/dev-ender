import { FastifyRequest, FastifyReply } from 'fastify';
import { User, Post, Connection } from '../models/index.js';

const PROFILE_SELECT = 'fullName name uid email identityVerified faceVerified documentVerificationStatus trustScore trustLevel badges avatar jobTitle currentCompany bio following followers skills permissionTier linkedInUrl location website education experience';

export const getProfile = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.params as { userId: string };
  const me = (request as any).user;

  const user = await User.findById(userId).select(PROFILE_SELECT);
  if (!user) return reply.status(404).send({ error: 'User not found' });

  const posts = await Post.find({ author: user._id })
    .populate('author', PROFILE_SELECT)
    .sort({ createdAt: -1 })
    .limit(20);

  const isFollowing = me ? user.followers.some((id: any) => id.toString() === me._id.toString()) : false;

  return reply.send({
    user: { ...user.toObject(), followersCount: user.followers.length, followingCount: user.following.length, isFollowing },
    posts: posts.map(p => ({ ...p.toObject(), likesCount: p.likes.length })),
  });
};

export const updateProfile = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  const { bio, jobTitle, currentCompany, skills, avatar, linkedInUrl, location, website, education, experience, fullName } = request.body as any;

  if (fullName) user.fullName = fullName;
  if (bio !== undefined) user.bio = bio;
  if (jobTitle !== undefined) user.jobTitle = jobTitle;
  if (currentCompany !== undefined) user.currentCompany = currentCompany;
  if (skills !== undefined) user.skills = skills;
  if (avatar !== undefined) user.avatar = avatar;
  if (linkedInUrl !== undefined) user.linkedInUrl = linkedInUrl;
  if (location !== undefined) user.location = location;
  if (website !== undefined) user.website = website;
  if (education !== undefined) user.education = education;
  if (experience !== undefined) user.experience = experience;

  await user.save();
  return reply.send({ success: true, user });
};

export const followUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const me = (request as any).user;
  const { userId } = request.params as any;

  if (me._id.toString() === userId) return reply.status(400).send({ error: 'Cannot follow yourself' });

  const target = await User.findById(userId);
  if (!target) return reply.status(404).send({ error: 'User not found' });

  const alreadyFollowing = me.following.some((id: any) => id.toString() === userId);
  if (alreadyFollowing) return reply.status(400).send({ error: 'Already following' });

  await User.findByIdAndUpdate(me._id, { $addToSet: { following: userId } });
  await User.findByIdAndUpdate(userId, { $addToSet: { followers: me._id } });

  return reply.send({ success: true, followersCount: target.followers.length + 1 });
};

export const unfollowUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const me = (request as any).user;
  const { userId } = request.params as any;

  await User.findByIdAndUpdate(me._id, { $pull: { following: userId } });
  await User.findByIdAndUpdate(userId, { $pull: { followers: me._id } });

  return reply.send({ success: true });
};

export const getRecommendations = async (request: FastifyRequest, reply: FastifyReply) => {
  const me = (request as any).user;

  // Exclude already following + self
  const exclude = [...(me.following || []), me._id];

  // Find users with same industry/skills, ranked by trust score
  const users = await User.find({
    _id: { $nin: exclude },
    status: 'active',
    $or: [
      { industry: me.industry },
      { skills: { $in: me.skills || [] } },
    ],
  })
    .select(PROFILE_SELECT)
    .sort({ trustScore: -1 })
    .limit(5);

  // Fallback: just top trusted users if no matches
  if (users.length < 3) {
    const fallback = await User.find({ _id: { $nin: exclude }, status: 'active' })
      .select(PROFILE_SELECT)
      .sort({ trustScore: -1 })
      .limit(5);
    return reply.send(fallback.map(u => ({ ...u.toObject(), followersCount: u.followers.length })));
  }

  return reply.send(users.map(u => ({ ...u.toObject(), followersCount: u.followers.length })));
};

export const sendConnectionRequest = async (request: FastifyRequest, reply: FastifyReply) => {
  const me = (request as any).user;
  const { userId } = request.params as any;

  const existing = await Connection.findOne({
    $or: [
      { requester: me._id, recipient: userId },
      { requester: userId, recipient: me._id },
    ],
  });
  if (existing) return reply.status(400).send({ error: 'Connection already exists' });

  const conn = await Connection.create({ requester: me._id, recipient: userId });
  return reply.status(201).send(conn);
};

export const respondToConnection = async (request: FastifyRequest, reply: FastifyReply) => {
  const me = (request as any).user;
  const { connectionId } = request.params as any;
  const { action } = request.body as any; // 'accept' | 'reject'

  const conn = await Connection.findOneAndUpdate(
    { _id: connectionId, recipient: me._id, status: 'pending' },
    { status: action === 'accept' ? 'accepted' : 'rejected' },
    { new: true }
  );
  if (!conn) return reply.status(404).send({ error: 'Connection not found' });
  return reply.send(conn);
};
