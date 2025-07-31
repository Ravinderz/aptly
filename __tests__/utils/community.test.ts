import {
  formatTimeAgo,
  getCategoryDisplay,
  canCreatePostInCategory,
  canModifyPost,
  filterPosts,
  validatePostContent,
  generateInitials,
  formatPostContent,
  canEditPost,
  getPostStats,
} from '../../utils/community';
import { CategoryType, Post, User } from '../../types/community';

// Mock types for testing
const mockPost: Post = {
  id: 'post-1',
  userId: 'user-1',
  userName: 'John Doe',
  userAvatar: 'avatar-url',
  content: 'This is a test post content',
  category: 'general',
  createdAt: new Date('2024-01-15T10:00:00Z'),
  likesCount: 5,
  commentsCount: 3,
  liked: false,
  comments: [],
};

const mockUser: User = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'resident',
  avatar: 'avatar-url',
};

describe('Community Utilities', () => {
  describe('formatTimeAgo', () => {
    test('should format "Just now" for recent timestamps', () => {
      const now = new Date();
      const recent = new Date(now.getTime() - 30 * 1000); // 30 seconds ago
      expect(formatTimeAgo(recent)).toBe('Just now');
    });

    test('should format minutes ago', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

      expect(formatTimeAgo(fiveMinutesAgo)).toBe('5m ago');
      expect(formatTimeAgo(thirtyMinutesAgo)).toBe('30m ago');
    });

    test('should format hours ago', () => {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

      expect(formatTimeAgo(twoHoursAgo)).toBe('2h ago');
      expect(formatTimeAgo(twelveHoursAgo)).toBe('12h ago');
    });

    test('should format days ago', () => {
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      const sixDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);

      expect(formatTimeAgo(threeDaysAgo)).toBe('3d ago');
      expect(formatTimeAgo(sixDaysAgo)).toBe('6d ago');
    });

    test('should format as date for week+ old posts', () => {
      const now = new Date();
      const weekOld = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
      const result = formatTimeAgo(weekOld);

      expect(result).not.toContain('ago');
      expect(result).toMatch(/\d{1,2}\s\w{3}/); // Format like "15 Jan"
    });
  });

  describe('getCategoryDisplay', () => {
    test('should return correct display for all categories', () => {
      expect(getCategoryDisplay('all')).toEqual({ name: 'All', icon: '📋' });
      expect(getCategoryDisplay('my_posts')).toEqual({
        name: 'My Posts',
        icon: '👤',
      });
      expect(getCategoryDisplay('announcement')).toEqual({
        name: 'Announcement',
        icon: '📢',
      });
      expect(getCategoryDisplay('buy_sell')).toEqual({
        name: 'Buy/Sell',
        icon: '🛒',
      });
      expect(getCategoryDisplay('events')).toEqual({
        name: 'Events',
        icon: '🎉',
      });
      expect(getCategoryDisplay('lost_found')).toEqual({
        name: 'Lost/Found',
        icon: '🔍',
      });
      expect(getCategoryDisplay('help')).toEqual({ name: 'Help', icon: '🙋‍♂️' });
      expect(getCategoryDisplay('feedback')).toEqual({
        name: 'Feedback',
        icon: '💬',
      });
    });

    test('should return default for unknown categories', () => {
      expect(getCategoryDisplay('unknown' as CategoryType)).toEqual({
        name: 'General',
        icon: '📝',
      });
    });
  });

  describe('canCreatePostInCategory', () => {
    test('should allow committee and admin to create announcements', () => {
      expect(canCreatePostInCategory('announcement', 'committee')).toBe(true);
      expect(canCreatePostInCategory('announcement', 'admin')).toBe(true);
    });

    test('should not allow residents to create announcements', () => {
      expect(canCreatePostInCategory('announcement', 'resident')).toBe(false);
    });

    test('should allow all roles to create posts in other categories', () => {
      const categories: CategoryType[] = [
        'buy_sell',
        'events',
        'lost_found',
        'help',
        'feedback',
      ];
      const roles: User['role'][] = ['resident', 'committee', 'admin'];

      categories.forEach((category) => {
        roles.forEach((role) => {
          expect(canCreatePostInCategory(category, role)).toBe(true);
        });
      });
    });
  });

  describe('canModifyPost', () => {
    test('should allow post owner to modify their post', () => {
      expect(canModifyPost(mockPost, 'user-1', 'resident')).toBe(true);
    });

    test('should not allow non-owners to modify posts', () => {
      expect(canModifyPost(mockPost, 'user-2', 'resident')).toBe(false);
    });

    test('should allow admin to modify any post', () => {
      expect(canModifyPost(mockPost, 'user-2', 'admin')).toBe(true);
    });

    test('should not allow committee to modify other user posts', () => {
      expect(canModifyPost(mockPost, 'user-2', 'committee')).toBe(false);
    });
  });

  describe('filterPosts', () => {
    const mockPosts: Post[] = [
      {
        ...mockPost,
        id: 'post-1',
        userId: 'user-1',
        userName: 'John Doe',
        content: 'Buy/sell post content',
        category: 'buy_sell',
        createdAt: new Date('2024-01-15T10:00:00Z'),
      },
      {
        ...mockPost,
        id: 'post-2',
        userId: 'user-2',
        userName: 'Jane Smith',
        content: 'Event announcement',
        category: 'events',
        createdAt: new Date('2024-01-14T10:00:00Z'),
      },
      {
        ...mockPost,
        id: 'post-3',
        userId: 'user-1',
        userName: 'John Doe',
        content: 'General discussion',
        category: 'general',
        createdAt: new Date('2024-01-16T10:00:00Z'),
      },
    ];

    test('should filter by "my_posts" category', () => {
      const filtered = filterPosts(mockPosts, 'my_posts', '', 'user-1');
      expect(filtered).toHaveLength(2);
      expect(filtered.every((post) => post.userId === 'user-1')).toBe(true);
    });

    test('should filter by specific category', () => {
      const filtered = filterPosts(mockPosts, 'buy_sell', '', 'user-1');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].category).toBe('buy_sell');
    });

    test('should return all posts for "all" filter', () => {
      const filtered = filterPosts(mockPosts, 'all', '', 'user-1');
      expect(filtered).toHaveLength(3);
    });

    test('should filter by search query in content', () => {
      const filtered = filterPosts(mockPosts, 'all', 'event', 'user-1');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].content.toLowerCase()).toContain('event');
    });

    test('should filter by search query in userName', () => {
      const filtered = filterPosts(mockPosts, 'all', 'jane', 'user-1');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].userName.toLowerCase()).toContain('jane');
    });

    test('should sort posts by creation date (newest first)', () => {
      const filtered = filterPosts(mockPosts, 'all', '', 'user-1');
      expect(filtered[0].id).toBe('post-3'); // Created on Jan 16
      expect(filtered[1].id).toBe('post-1'); // Created on Jan 15
      expect(filtered[2].id).toBe('post-2'); // Created on Jan 14
    });

    test('should handle empty search query', () => {
      const filtered = filterPosts(mockPosts, 'all', '   ', 'user-1');
      expect(filtered).toHaveLength(3);
    });
  });

  describe('validatePostContent', () => {
    test('should validate correct post content', () => {
      const result = validatePostContent(
        'This is a valid post with enough content',
      );
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should reject empty content', () => {
      const result = validatePostContent('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Post content cannot be empty');
    });

    test('should reject whitespace-only content', () => {
      const result = validatePostContent('   \n\t   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Post content cannot be empty');
    });

    test('should reject content that is too short', () => {
      const result = validatePostContent('Short');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Post must be at least 10 characters long');
    });

    test('should reject content that exceeds max length', () => {
      const longContent = 'a'.repeat(501);
      const result = validatePostContent(longContent);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Post cannot exceed 500 characters');
    });

    test('should handle custom max length', () => {
      const content = 'a'.repeat(51);
      const result = validatePostContent(content, 50);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Post cannot exceed 50 characters');
    });

    test('should validate content at boundaries', () => {
      const minLengthContent = 'a'.repeat(10);
      const maxLengthContent = 'a'.repeat(500);

      expect(validatePostContent(minLengthContent).isValid).toBe(true);
      expect(validatePostContent(maxLengthContent).isValid).toBe(true);
    });
  });

  describe('generateInitials', () => {
    test('should generate initials from full name', () => {
      expect(generateInitials('John Doe')).toBe('JD');
      expect(generateInitials('Jane Smith Wilson')).toBe('JS'); // Only first two
    });

    test('should handle single name', () => {
      expect(generateInitials('John')).toBe('J');
    });

    test('should handle multiple spaces', () => {
      expect(generateInitials('John  Doe')).toBe('J'); // Multiple spaces create empty elements
    });

    test('should handle lowercase names', () => {
      expect(generateInitials('john doe')).toBe('JD');
    });

    test('should handle empty name gracefully', () => {
      expect(generateInitials('')).toBe('');
    });
  });

  describe('formatPostContent', () => {
    test('should trim whitespace', () => {
      expect(formatPostContent('  content  ')).toBe('content');
    });

    test('should replace multiple newlines and then all multi-whitespace', () => {
      const content = 'Line 1\n\n\n\nLine 2';
      // Step 1: Replace \n{3,} with \n\n -> 'Line 1\n\nLine 2'
      // Step 2: Replace \s{2,} with single space -> 'Line 1 Line 2' (because \n\n is 2+ whitespace)
      expect(formatPostContent(content)).toBe('Line 1 Line 2');
    });

    test('should replace multiple spaces with single space', () => {
      const content = 'Word1    Word2     Word3';
      expect(formatPostContent(content)).toBe('Word1 Word2 Word3');
    });

    test('should handle mixed whitespace formatting', () => {
      const content = '  Line 1\n\n\n\nLine    2   ';
      // Step 1: trim -> 'Line 1\n\n\n\nLine    2'
      // Step 2: replace \n{3,} -> 'Line 1\n\nLine    2'
      // Step 3: replace \s{2,} -> 'Line 1 Line 2' (all multi-whitespace becomes single space)
      expect(formatPostContent(content)).toBe('Line 1 Line 2');
    });

    test('should preserve single newlines', () => {
      const content = 'Line 1\nLine 2';
      expect(formatPostContent(content)).toBe('Line 1\nLine 2');
    });
  });

  describe('canEditPost', () => {
    test('should allow editing own post within time limit', () => {
      const recentPost = {
        ...mockPost,
        userId: 'user-1',
        createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      };

      expect(canEditPost(recentPost, 'user-1', 30)).toBe(true);
    });

    test('should not allow editing own post after time limit', () => {
      const oldPost = {
        ...mockPost,
        userId: 'user-1',
        createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      };

      expect(canEditPost(oldPost, 'user-1', 30)).toBe(false);
    });

    test('should not allow editing other user posts', () => {
      const recentPost = {
        ...mockPost,
        userId: 'user-1',
        createdAt: new Date(Date.now() - 15 * 60 * 1000),
      };

      expect(canEditPost(recentPost, 'user-2', 30)).toBe(false);
    });

    test('should handle custom time limits', () => {
      const post = {
        ...mockPost,
        userId: 'user-1',
        createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      };

      expect(canEditPost(post, 'user-1', 5)).toBe(false); // 5-minute limit
      expect(canEditPost(post, 'user-1', 15)).toBe(true); // 15-minute limit
    });

    test('should handle edge case at exact time limit', () => {
      const post = {
        ...mockPost,
        userId: 'user-1',
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // Exactly 30 minutes ago
      };

      expect(canEditPost(post, 'user-1', 30)).toBe(true);
    });
  });

  describe('getPostStats', () => {
    test('should format singular stats correctly', () => {
      const result = getPostStats(1, 1);
      expect(result.likes).toBe('1 like');
      expect(result.comments).toBe('1 comment');
    });

    test('should format plural stats correctly', () => {
      const result = getPostStats(5, 3);
      expect(result.likes).toBe('5 likes');
      expect(result.comments).toBe('3 comments');
    });

    test('should handle zero counts', () => {
      const result = getPostStats(0, 0);
      expect(result.likes).toBe('0 likes');
      expect(result.comments).toBe('0 comments');
    });

    test('should handle large numbers', () => {
      const result = getPostStats(1234, 567);
      expect(result.likes).toBe('1234 likes');
      expect(result.comments).toBe('567 comments');
    });
  });
});
