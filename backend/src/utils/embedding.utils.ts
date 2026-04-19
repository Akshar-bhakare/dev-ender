import * as tf from '@tensorflow/tfjs-node';

/**
 * A simple embedding utility using TensorFlow.js.
 * In a production environment, this would load a pre-trained model like Universal Sentence Encoder.
 * For this hackathon, we implement a persistent vector space model to keep it lightweight and fast.
 */

// Simple vocabulary for the hackathon context
const VOCAB = [
  'funding', 'round', 'valuation', 'equity', 'revenue', 'growth', 'startup', 'investment',
  'fintech', 'ai', 'crypto', 'saas', 'marketplace', 'b2b', 'b2c', 'security', 'design',
  'development', 'legal', 'audit', 'compliance', 'blockchain', 'enterprise', 'consumer',
  'healthcare', 'edtech', 'logistics', 'energy', 'retail', 'ecommerce'
];

export const generateEmbedding = async (text: string): Promise<number[]> => {
  const lowercaseText = text.toLowerCase();
  const vector = VOCAB.map(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = lowercaseText.match(regex);
    return matches ? matches.length : 0;
  });

  // Convert to tensor and normalize
  return tf.tidy(() => {
    const tensor = tf.tensor1d(vector);
    const norm = tf.norm(tensor);
    if (norm.arraySync() === 0) return vector;
    const normalized = tensor.div(norm);
    return Array.from(normalized.dataSync());
  });
};

export const computeSimilarity = (vecA: number[], vecB: number[]): number => {
  return tf.tidy(() => {
    const a = tf.tensor1d(vecA);
    const b = tf.tensor1d(vecB);
    const dotProduct = tf.sum(a.mul(b));
    return dotProduct.arraySync() as number;
  });
};
