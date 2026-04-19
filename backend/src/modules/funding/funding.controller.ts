import { FastifyRequest, FastifyReply } from 'fastify';
import Stripe from 'stripe';
import { FundingRound, Investment, Company, Portfolio, User } from '../../models/index.js';
import { generateEmbedding, computeSimilarity } from '../../utils/embedding.utils.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-06-30.basil' as any });
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

export const listRounds = async (request: FastifyRequest, reply: FastifyReply) => {
  const { cursor, limit = 12 } = request.query as any;
  const query: any = { status: 'active', adminApproved: true };
  if (cursor) query.createdAt = { $lt: new Date(cursor) };

  const rounds = await FundingRound.find(query)
    .populate('companyId', 'displayName legalName logoUrl industry trustScore badges verificationStatus')
    .sort({ createdAt: -1 })
    .limit(Number(limit) + 1);

  const hasMore = rounds.length > Number(limit);
  return reply.send({ rounds: rounds.slice(0, Number(limit)), nextCursor: hasMore ? rounds[Number(limit) - 1].createdAt.toISOString() : null });
};

export const getRound = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as any;
  const round = await FundingRound.findById(id)
    .populate('companyId', 'displayName legalName logoUrl industry trustScore badges verificationStatus registeredCountry website');
  if (!round) return reply.status(404).send({ error: 'Funding round not found' });
  return reply.send(round);
};

export const createRound = async (request: FastifyRequest, reply: FastifyReply) => {
  const accountType = (request as any).accountType;
  const company = (request as any).company;

  if (accountType !== 'company' || !company || company.verificationStatus !== 'verified') {
    return reply.status(403).send({ error: 'Only verified companies can create funding rounds' });
  }

  const body = request.body as any;
  
  // Calculate trust score based on weighted average
  const calculateTrustScore = (comp: any) => {
    let score = 0;
    if (comp.founderVerified === 'verified') score += 30;
    if (comp.registrationCertificateUrl) score += 20;
    if (comp.registrationNumber) score += 20;
    if (comp.domainEmailVerified) score += 15;
    if (comp.identityVerified) score += 15;
    return score;
  };

  const trustScore = calculateTrustScore(company);
  const embedding = await generateEmbedding(`${body.title} ${body.pitch} ${company.industry}`);

  const round = await FundingRound.create({
    companyId: company._id,
    ...body,
    status: 'pending_approval',
    founderVerified: company.founderVerified === 'verified',
    registryMatched: !!company.registrationNumber,
    financialDocsUploaded: !!company.registrationCertificateUrl,
    trustScore,
    riskScore: Math.max(10, 100 - trustScore),
    embedding,
  });
  return reply.status(201).send(round);
};

export const updateRound = async (request: FastifyRequest, reply: FastifyReply) => {
  const company = (request as any).company;
  const { id } = request.params as any;
  const round = await FundingRound.findOneAndUpdate(
    { _id: id, companyId: company._id, status: { $in: ['draft', 'pending_approval'] } },
    request.body as any, { new: true }
  );
  if (!round) return reply.status(404).send({ error: 'Round not found or cannot be edited' });
  return reply.send(round);
};

export const approveRound = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as any;
  const round = await FundingRound.findByIdAndUpdate(id, { adminApproved: true, status: 'active' }, { new: true });
  if (!round) return reply.status(404).send({ error: 'Round not found' });
  return reply.send(round);
};

export const freezeRound = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as any;
  const round = await FundingRound.findByIdAndUpdate(id, { status: 'frozen' }, { new: true });
  if (!round) return reply.status(404).send({ error: 'Round not found' });
  return reply.send(round);
};

export const createInvestmentSession = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  const { fundingRoundId, amount } = request.body as any;

  const round = await FundingRound.findById(fundingRoundId).populate('companyId', 'displayName');
  if (!round || round.status !== 'active') return reply.status(400).send({ error: 'Funding round not available' });

  if (amount < round.minimumInvestment)
    return reply.status(400).send({ error: `Minimum investment is ₹${round.minimumInvestment}` });
  if (amount > round.maxInvestmentPerUser)
    return reply.status(400).send({ error: `Max investment per user is ₹${round.maxInvestmentPerUser}` });
  if (round.raisedAmount + amount > round.targetAmount)
    return reply.status(400).send({ error: 'Investment exceeds funding target' });

  const investment = await Investment.create({ userId: user._id, fundingRoundId, amount, status: 'pending' });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: round.currency.toLowerCase(),
        product_data: { name: `Investment in ${(round.companyId as any).displayName} — ${round.title}` },
        unit_amount: amount * 100,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${FRONTEND_URL}/marketplace/funding/${fundingRoundId}?invested=true`,
    cancel_url: `${FRONTEND_URL}/marketplace/funding/${fundingRoundId}?cancelled=true`,
    metadata: { investmentId: investment._id.toString(), fundingRoundId, userId: user._id.toString() },
  });

  await Investment.findByIdAndUpdate(investment._id, { stripeSessionId: session.id });
  return reply.send({ url: session.url, sessionId: session.id });
};

export const stripeWebhook = async (request: FastifyRequest, reply: FastifyReply) => {
  const sig = request.headers['stripe-signature'] as string;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent((request as any).rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return reply.status(400).send({ error: 'Webhook signature invalid' });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { investmentId, fundingRoundId, userId } = session.metadata!;
    const amount = session.amount_total! / 100;

    await Investment.findByIdAndUpdate(investmentId, { status: 'success', stripePaymentIntentId: session.payment_intent });
    
    // Update Funding Round
    const round = await FundingRound.findByIdAndUpdate(fundingRoundId, { $inc: { raisedAmount: amount } }, { new: true });
    if (round && round.raisedAmount >= round.targetAmount) {
      await FundingRound.findByIdAndUpdate(fundingRoundId, { status: 'closed' });
    }

    // Update Portfolio
    await Portfolio.findOneAndUpdate(
      { userId },
      { 
        $push: { investments: investmentId },
        $inc: { totalInvested: amount },
        $set: { lastUpdated: new Date() }
      },
      { upsert: true, new: true }
    );
  }
  return reply.send({ received: true });
};

export const getPortfolio = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  let portfolio = await Portfolio.findOne({ userId: user._id })
    .populate({ 
      path: 'investments', 
      match: { status: 'success' },
      populate: { path: 'fundingRoundId', populate: { path: 'companyId', select: 'displayName logoUrl industry' } } 
    });

  if (!portfolio) {
    portfolio = await Portfolio.create({ userId: user._id, investments: [] });
  }

  return reply.send(portfolio);
};

export const getRecommended = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  const userInterests = `${user.industry} ${user.skills?.join(' ') || ''}`;
  const userEmbedding = await generateEmbedding(userInterests);

  const activeRounds = await FundingRound.find({ status: 'active', adminApproved: true })
    .populate('companyId', 'displayName logoUrl industry trustScore');

  const scoredRounds = activeRounds.map(round => {
    const similarity = round.embedding ? computeSimilarity(userEmbedding, round.embedding) : 0;
    // Weighted score: 60% AI similarity, 40% Trust Score
    const finalScore = (similarity * 60) + ((round.trustScore / 100) * 40);
    return { ...round.toObject(), matchScore: finalScore };
  });

  return reply.send(scoredRounds.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)).slice(0, 6));
};

export const getMarketplaceConnections = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  
  // Find users who invested in similar categories
  const myPortfolio = await Portfolio.findOne({ userId: user._id }).populate({
    path: 'investments',
    populate: { path: 'fundingRoundId', select: 'companyId' }
  });

  const investedCompanyIds = (myPortfolio?.investments || []).map((inv: any) => inv.fundingRoundId.companyId);

  // Simple recommendation: return 5 active professional users with high trust score who are NOT the current user
  const suggestions = await User.find({ 
    _id: { $ne: user._id },
    role: 'professional',
    trustScore: { $gte: 50 }
  })
  .select('fullName fullName jobTitle avatar trustScore industry')
  .limit(5);

  return reply.send(suggestions);
};

export const getMyRounds = async (request: FastifyRequest, reply: FastifyReply) => {
  const company = (request as any).company;
  const rounds = await FundingRound.find({ companyId: company._id }).sort({ createdAt: -1 });
  return reply.send(rounds);
};
