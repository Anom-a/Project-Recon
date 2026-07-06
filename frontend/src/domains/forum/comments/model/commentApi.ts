import { MOCK_FORUM_POSTS } from '../../../../shared/constants/mock-data';
import type { ForumReply } from '../../../../shared/types';

export async function getReplies(postId: string): Promise<ForumReply[]> {
  await new Promise(r => setTimeout(r, 200));
  const post = MOCK_FORUM_POSTS.find(p => p.id === postId);
  return post?.replies || [];
}

export async function addReply(postId: string, reply: Omit<ForumReply, 'id'>): Promise<ForumReply> {
  await new Promise(r => setTimeout(r, 300));
  return { ...reply, id: Date.now().toString() };
}
