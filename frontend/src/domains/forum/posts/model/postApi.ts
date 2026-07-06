import { MOCK_FORUM_POSTS } from '../../../../shared/constants/mock-data';
import type { ForumPost } from '../../../../shared/types';

export async function getForumPosts(): Promise<ForumPost[]> {
  await new Promise(r => setTimeout(r, 300));
  return MOCK_FORUM_POSTS;
}

export async function getForumPostById(id: string): Promise<ForumPost | undefined> {
  await new Promise(r => setTimeout(r, 200));
  return MOCK_FORUM_POSTS.find(p => p.id === id);
}
