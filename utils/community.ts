import { CategoryType, Post, User } from '@/types/community';

/**
 * Format time ago from date
 */
export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
};

/**
 * Get category display name with icon
 */
export const getCategoryDisplay = (
  category: CategoryType,
): { name: string; icon: string } => {
  const categories = {
    all: { name: 'All', icon: '📋' },
    my_posts: { name: 'My Posts', icon: '👤' },
    announcement: { name: 'Announcement', icon: '📢' },
    buy_sell: { name: 'Buy/Sell', icon: '🛒' },
    events: { name: 'Events', icon: '🎉' },
    lost_found: { name: 'Lost/Found', icon: '🔍' },
    help: { name: 'Help', icon: '🙋‍♂️' },
    feedback: { name: 'Feedback', icon: '💬' },
  };

  return categories[category] || { name: 'General', icon: '📝' };
};

/**
 * Check if user can create posts in category
 */
export const canCreatePostInCategory = (
  category: CategoryType,
  userRole: User['role'],
): boolean => {
  if (category === 'announcement') {
    return userRole === 'committee' || userRole === 'admin';
  }
  return true;
};

/**
 * Check if user can edit/delete post
 */
export const canModifyPost = (
  post: Post,
  currentUserId: string,
  userRole: User['role'],
): boolean => {
  if (post.userId === currentUserId) return true;
  if (userRole === 'admin') return true;
  return false;
};

/**
 * Filter posts based on criteria
 */
export const filterPosts = (
  posts: Post[],
  filter: CategoryType,
  searchQuery: string,
  currentUserId?: string,
): Post[] => {
  let filtered = posts;

  // Filter by category
  if (filter === 'my_posts') {
    filtered = filtered.filter((post) => post.userId === currentUserId);
  } else if (filter !== 'all') {
    filtered = filtered.filter((post) => post.category === filter);
  }

  // Filter by search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (post) =>
        post.content.toLowerCase().includes(query) ||
        post.userName.toLowerCase().includes(query),
    );
  }

  // Sort by creation date (newest first)
  return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

/**
 * Validate post content
 */
export const validatePostContent = (
  content: string,
  maxLength: number = 500,
): {
  isValid: boolean;
  error?: string;
} => {
  const trimmed = content.trim();

  if (!trimmed) {
    return { isValid: false, error: 'Post content cannot be empty' };
  }

  if (trimmed.length > maxLength) {
    return {
      isValid: false,
      error: `Post cannot exceed ${maxLength} characters`,
    };
  }

  if (trimmed.length < 10) {
    return {
      isValid: false,
      error: 'Post must be at least 10 characters long',
    };
  }

  return { isValid: true };
};

/**
 * Generate user initials for avatar
 */
export const generateInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

/**
 * Format post content with basic text processing
 */
export const formatPostContent = (content: string): string => {
  return content
    .trim()
    .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double
    .replace(/\s{2,}/g, ' '); // Replace multiple spaces with single
};

/**
 * Check if post can be edited (within time limit)
 */
export const canEditPost = (
  post: Post,
  currentUserId: string,
  timeLimitMinutes: number = 30,
): boolean => {
  if (post.userId !== currentUserId) return false;

  const now = new Date();
  const postAge = (now.getTime() - post.createdAt.getTime()) / (1000 * 60); // in minutes

  return postAge <= timeLimitMinutes;
};

/**
 * Get post statistics text
 */
export const getPostStats = (
  likesCount: number,
  commentsCount: number,
): {
  likes: string;
  comments: string;
} => {
  return {
    likes: likesCount === 1 ? '1 like' : `${likesCount} likes`,
    comments: commentsCount === 1 ? '1 comment' : `${commentsCount} comments`,
  };
};
