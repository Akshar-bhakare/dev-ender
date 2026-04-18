import { FastifyInstance } from 'fastify';
import { User } from '../models/User.js';
import { OtpRecord } from '../models/OtpRecord.js';

export default async function devRoutes(fastify: FastifyInstance) {
  if (process.env.NODE_ENV !== 'development') return;

  // Delete a user by email + their OTP records
  fastify.delete('/dev/user/:email', async (request, reply) => {
    const { email } = request.params as { email: string };
    const user = await User.findOneAndDelete({ email: email.toLowerCase() });
    if (!user) return reply.status(404).send({ message: 'User not found' });
    await OtpRecord.deleteMany({ target: { $in: [email.toLowerCase(), user.phone] } });
    return { message: `Deleted user ${email}` };
  });
}
