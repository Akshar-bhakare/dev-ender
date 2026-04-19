import { FastifyRequest, FastifyReply } from 'fastify';
import { User, EventHostInvite, EventHostAssignment, Company } from '../models/index.js';
import crypto from 'node:crypto'; // Use standard crypto for tokens
import { TrustScoreService } from '../modules/trust/trust.service.js';
import { sendEmail } from '../services/email.service.js';

export const inviteHost = async (request: FastifyRequest, reply: FastifyReply) => {
  const { email, role } = request.body as { email: string; role: 'COMPANY_ADMIN' | 'COMPANY_EVENT_HOST' };
  const admin = (request as any).user;
  const company = (request as any).company;

  if (!email || !role) {
    return reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email and role are required' } });
  }

  // Security: Check if requester is company owner or admin
  const isOwner = company.ownerId.toString() === admin._id.toString();
  if (!isOwner && admin.role !== 'company_admin') {
     return reply.status(403).send({ success: false, error: { code: 'FORBIDDEN', message: 'Only company admins can invite hosts' } });
  }

  // Check if user exists
  const targetUser = await User.findOne({ email: email.toLowerCase() });
  
  const inviteToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  if (!targetUser) {
    // Joining invitation flow
    await EventHostInvite.create({
      email: email.toLowerCase(),
      companyId: company._id,
      role,
      inviteToken,
      expiresAt,
      status: 'pending',
      isJoinInvite: true,
      invitedBy: admin._id
    });

    const subject = `You're invited to join SyncUp and host events for ${company.displayName}`;
    const html = `
      <h1>Join SyncUp</h1>
      <p>${admin.fullName} from <strong>${company.displayName}</strong> has invited you to join SyncUp as a ${role.toLowerCase().replace('_', ' ')}.</p>
      <p>Once you sign up, you will be able to manage events on behalf of the company and receive a trust score boost.</p>
      <a href="${process.env.FRONTEND_URL}/register?inviteToken=${inviteToken}" style="padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 8px;">Join SyncUp</a>
    `;
    
    await sendEmail(email, subject, html);

    return reply.send({ success: true, message: 'Joining invitation sent' });
  }

  // Registered user invite flow
  await EventHostInvite.create({
    email: email.toLowerCase(),
    companyId: company._id,
    role,
    inviteToken,
    expiresAt,
    status: 'pending',
    isJoinInvite: false,
    invitedBy: admin._id
  });

  const subject = `Invitation to host events for ${company.displayName}`;
  const html = `
    <h1>Host Events for ${company.displayName}</h1>
    <p>${admin.fullName} has invited you to become a ${role.toLowerCase().replace('_', ' ')} for <strong>${company.displayName}</strong>.</p>
    <p>Accepting this invitation will grant you a trust score bonus and hosting permissions.</p>
    <a href="${process.env.FRONTEND_URL}/dashboard/invites?token=${inviteToken}" style="padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 8px;">Accept Invitation</a>
  `;

  await sendEmail(email, subject, html);

  return reply.send({ success: true, message: 'Host invitation sent to registered user' });
};

export const verifyInviteToken = async (request: FastifyRequest, reply: FastifyReply) => {
    const { token } = request.query as { token: string };
    const invite = await EventHostInvite.findOne({ inviteToken: token, status: 'pending', expiresAt: { $gt: new Date() } }).populate('companyId', 'displayName logoUrl');
    
    if (!invite) {
        return reply.status(404).send({ success: false, error: { code: 'INVALID_TOKEN', message: 'Invite token is invalid or expired' } });
    }

    return reply.send({ success: true, invite });
};

export const acceptInvite = async (request: FastifyRequest, reply: FastifyReply) => {
    const { token } = request.body as { token: string };
    const user = (request as any).user;

    const invite = await EventHostInvite.findOne({ 
        inviteToken: token, 
        email: user.email.toLowerCase(),
        status: 'pending', 
        expiresAt: { $gt: new Date() } 
    });

    if (!invite) {
        return reply.status(400).send({ success: false, error: { code: 'INVALID_TOKEN', message: 'Invite invalid or expired' } });
    }

    // Create assignment
    await EventHostAssignment.create({
        userId: user._id,
        companyId: invite.companyId,
        role: invite.role,
        assignedBy: invite.invitedBy
    });

    // Update user role if needed
    if (user.role === 'professional') {
        user.role = invite.role === 'COMPANY_ADMIN' ? 'company_admin' : 'company_event_host';
        await user.save();
    }

    // Apply Trust Bonus
    await TrustScoreService.addPoints({
        userId: user._id.toString(),
        delta: 15,
        reason: `Vouched by ${invite.companyId}` // Trust score service will log the company ID in metadata via controller params if we pass it
    });

    invite.status = 'accepted';
    invite.acceptedAt = new Date();
    await invite.save();

    return reply.send({ success: true, message: 'Invitation accepted and trust bonus applied' });
};

export const getCompanyHosts = async (request: FastifyRequest, reply: FastifyReply) => {
    const company = (request as any).company;
    const hosts = await EventHostAssignment.find({ companyId: company._id, active: true }).populate('userId', 'fullName email trustScore identityVerified role');
    const pendingInvites = await EventHostInvite.find({ companyId: company._id, status: 'pending' });

    return reply.send({ success: true, hosts, pendingInvites });
};

export const removeCompanyHost = async (request: FastifyRequest, reply: FastifyReply) => {
    const company = (request as any).company;
    const { assignmentId } = request.params as { assignmentId: string };

    const assignment = await EventHostAssignment.findOneAndUpdate(
        { _id: assignmentId, companyId: company._id },
        { active: false },
        { new: true }
    );

    if (!assignment) {
        return reply.status(404).send({ success: false, message: 'Assignment not found' });
    }

    return reply.send({ success: true, message: 'Host removed' });
};
