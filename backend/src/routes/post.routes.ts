import { FastifyInstance } from 'fastify';
import { getFeed, createPost, updatePost, deletePost, toggleLike, getComments, addComment, deleteComment, getUserPosts } from '../controllers/post.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export default async function postRoutes(fastify: FastifyInstance) {
  fastify.get('/', getFeed);
  fastify.post('/', { preHandler: [requireAuth] }, createPost);
  fastify.patch('/:id', { preHandler: [requireAuth] }, updatePost);
  fastify.delete('/:id', { preHandler: [requireAuth] }, deletePost);
  fastify.post('/:id/like', { preHandler: [requireAuth] }, toggleLike);
  fastify.get('/:id/comments', getComments);
  fastify.post('/:id/comments', { preHandler: [requireAuth] }, addComment);
  fastify.delete('/comments/:commentId', { preHandler: [requireAuth] }, deleteComment);
  fastify.get('/user/:userId', getUserPosts);
}
