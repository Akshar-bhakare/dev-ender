import { FastifyRequest, FastifyReply } from 'fastify';
import { User, Company } from '../../models/index.js';

export async function calculateOrganizerScore(request: FastifyRequest, reply: FastifyReply) {
  const { organizerId, organizerModel } = request.body as { organizerId: string, organizerModel: 'User' | 'Company' };

  if (!organizerId || !organizerModel) {
    return reply.status(400).send({ error: 'Missing organizerId or organizerModel' });
  }

  try {
    let organizer;
    if (organizerModel === 'Company') {
      organizer = await Company.findById(organizerId);
    } else {
      organizer = await User.findById(organizerId);
    }

    if (!organizer) {
      return reply.status(404).send({ error: 'Organizer not found' });
    }

    // Trust Score Calculation Engine Logic
    const identityVerifiedScore = organizer.identityVerified ? 40 : 0;
    const eventsScore = Math.min((organizer.totalEventsHosted || 0) * 5, 25);
    
    let ratingScore = 0;
    const avgRating = organizer.avgRating || 0;
    if (avgRating > 4.5) {
      ratingScore = 15;
    } else if (avgRating >= 3.0) {
      ratingScore = 8;
    }

    const cancellationPenalty = (organizer.cancellationsCount || 0) * 10;

    let score = identityVerifiedScore + eventsScore + ratingScore - cancellationPenalty;
    
    // Additional Company Trust (if applicable)
    if (organizerModel === 'Company' && (organizer as any).verifiedStatus) {
      score += 15;
    }
    
    // Bounds check
    if (score < 0) score = 0;
    if (score > 100) score = 100;

    organizer.trustScore = score;
    await organizer.save();

    let decisionStatus = 'PENDING_REVIEW';
    if (score >= 60) decisionStatus = 'AUTO_APPROVED';
    else if (score < 30) decisionStatus = 'BLOCKED';

    return reply.status(200).send({
      trustScore: score,
      status: decisionStatus,
      message: 'Trust score calculated successfully.'
    });
  } catch (error: any) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Failed to calculate trust score' });
  }
}

export async function updateReputation(request: FastifyRequest, reply: FastifyReply) {
  const { organizerId, organizerModel, newRating, eventCancelled } = request.body as { 
    organizerId: string, 
    organizerModel: 'User' | 'Company',
    newRating?: number,
    eventCancelled?: boolean
  };

  try {
    let organizer;
    if (organizerModel === 'Company') {
      organizer = await Company.findById(organizerId);
    } else {
      organizer = await User.findById(organizerId);
    }

    if (!organizer) {
      return reply.status(404).send({ error: 'Organizer not found' });
    }

    if (eventCancelled) {
      organizer.cancellationsCount = (organizer.cancellationsCount || 0) + 1;
    } else {
      organizer.totalEventsHosted = (organizer.totalEventsHosted || 0) + 1;
      
      if (newRating !== undefined) {
        // Simple rolling average approx, or exact if we tracked total reviews
        // For hackathon: (currentAvg * eventsHosted + newRating) / (eventsHosted + 1)
        const currentAvg = organizer.avgRating || 0;
        const total = organizer.totalEventsHosted; // already incremented
        organizer.avgRating = ((currentAvg * (total - 1)) + newRating) / total;
      }
    }

    await organizer.save();

    // Trigger score recalculation
    const mockRequest = {
      body: { organizerId, organizerModel },
      log: request.log
    } as any;
    
    // We can just call the logic directly or reuse the helper if we separate it. 
    // Since it's a hackathon demo, we can just save and return success, asking them to call calculate again,
    // OR we recalculate here inline. Let's recalculate inline briefly.
    
    const identityVerifiedScore = organizer.identityVerified ? 40 : 0;
    const eventsScore = Math.min((organizer.totalEventsHosted || 0) * 5, 25);
    let ratingScore = 0;
    const avgRating = organizer.avgRating || 0;
    if (avgRating > 4.5) ratingScore = 15;
    else if (avgRating >= 3.0) ratingScore = 8;
    const cancellationPenalty = (organizer.cancellationsCount || 0) * 10;

    let score = identityVerifiedScore + eventsScore + ratingScore - cancellationPenalty;
    if (organizerModel === 'Company' && (organizer as any).verifiedStatus) score += 15;
    if (score < 0) score = 0;
    if (score > 100) score = 100;

    organizer.trustScore = score;
    await organizer.save();

    return reply.status(200).send({
      message: 'Reputation updated',
      organizer: {
        totalEventsHosted: organizer.totalEventsHosted,
        avgRating: organizer.avgRating,
        cancellationsCount: organizer.cancellationsCount,
        trustScore: score
      }
    });
  } catch (error: any) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Failed to update reputation' });
  }
}
