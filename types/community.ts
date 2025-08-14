export type CategoryType =
  | 'all'
  | 'my_posts'
  | 'announcement'
  | 'buy_sell'
  | 'events'
  | 'lost_found'
  | 'help'
  | 'feedback';

export type PostStatus = 'active' | 'deleted' | 'reported';

export interface User {
  id: string;
  name: string;
  flatNumber: string;
  role: 'resident' | 'committee' | 'admin';
  avatar?: string;
  email?: string;
  phone?: string;
  bio?: string;
  joinedDate?: string;
  connectionsCount?: number;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  flatNumber: string;
  category: CategoryType;
  content: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  likesCount: number;
  commentsCount: number;
  isLikedByUser: boolean;
  canEdit: boolean;
  canDelete: boolean;
  status: PostStatus;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  flatNumber: string;
  content: string;
  createdAt: Date;
  parentId?: string; // For nested replies
  canDelete: boolean;
}

export interface CreatePostRequest {
  content: string;
  category: CategoryType;
  imageUrl?: string;
}

export interface CreateCommentRequest {
  postId: string;
  content: string;
  parentId?: string;
}

export interface CommunityState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  selectedFilter: CategoryType;
  searchQuery: string;
  draftPost: string;
  refreshing: boolean;
}

export interface FilterOption {
  key: CategoryType;
  label: string;
  icon?: string;
}

export const CATEGORY_FILTERS: FilterOption[] = [
  { key: 'all', label: 'All' },
  { key: 'my_posts', label: 'My Posts' },
  { key: 'announcement', label: 'Announcements', icon: '📢' },
  { key: 'buy_sell', label: 'Buy/Sell', icon: '🛒' },
  { key: 'events', label: 'Events', icon: '🎉' },
  { key: 'lost_found', label: 'Lost/Found', icon: '🔍' },
  { key: 'help', label: 'Help', icon: '🙋‍♂️' },
  { key: 'feedback', label: 'Feedback', icon: '💬' },
];

export const MAX_POST_LENGTH = 500;
export const MAX_COMMENT_LENGTH = 200;
