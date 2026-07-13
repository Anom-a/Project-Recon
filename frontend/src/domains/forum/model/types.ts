export interface ForumPost {
  id: string;
  author: string;
  authorRole: string;
  avatar: string;
  title: string;
  content: string;
  category: 'General' | 'Help' | 'Showcase' | 'Competition' | 'Tutorial';
  timestamp: string;
  likes: number;
  replies: ForumReply[];
  tags: string[];
  pinned?: boolean;
}

export interface ForumReply {
  id: string;
  author: string;
  authorRole: string;
  content: string;
  timestamp: string;
  likes: number;
}
