/**
 * Community Service Testing
 * Tests community-related business logic including posts, comments, and interactions
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// Community Service Types
interface CommunityPost {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  attachments?: string[];
  mentions?: string[];
  tags?: string[];
}

interface Comment {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  parentCommentId?: string;
}

// Community Service Implementation (inline for testing)
class CommunityService {
  private static readonly POSTS_KEY = 'aptly_community_posts';
  private static readonly COMMENTS_KEY = 'aptly_community_comments';
  private static readonly USER_INTERACTIONS_KEY = 'aptly_user_interactions';

  static async getPosts(): Promise<CommunityPost[]> {
    try {
      const postsJson = await AsyncStorage.getItem(this.POSTS_KEY);
      return postsJson ? JSON.parse(postsJson) : [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  }

  static async createPost(postData: Omit<CommunityPost, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'comments' | 'isLiked'>): Promise<CommunityPost> {
    try {
      const posts = await this.getPosts();
      const newPost: CommunityPost = {
        ...postData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: 0,
        comments: 0,
        isLiked: false,
      };

      posts.unshift(newPost);
      await AsyncStorage.setItem(this.POSTS_KEY, JSON.stringify(posts));
      return newPost;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  static async updatePost(postId: string, updates: Partial<Pick<CommunityPost, 'content' | 'attachments' | 'mentions' | 'tags'>>): Promise<CommunityPost | null> {
    try {
      const posts = await this.getPosts();
      const postIndex = posts.findIndex(p => p.id === postId);
      
      if (postIndex === -1) return null;

      posts[postIndex] = {
        ...posts[postIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(this.POSTS_KEY, JSON.stringify(posts));
      return posts[postIndex];
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  static async deletePost(postId: string): Promise<boolean> {
    try {
      const posts = await this.getPosts();
      const filteredPosts = posts.filter(p => p.id !== postId);
      
      if (filteredPosts.length === posts.length) return false;

      await AsyncStorage.setItem(this.POSTS_KEY, JSON.stringify(filteredPosts));
      
      // Also delete associated comments
      await this.deletePostComments(postId);
      
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  static async likePost(postId: string, userId: string): Promise<boolean> {
    try {
      const posts = await this.getPosts();
      const postIndex = posts.findIndex(p => p.id === postId);
      
      if (postIndex === -1) return false;

      const post = posts[postIndex];
      const isCurrentlyLiked = post.isLiked;

      posts[postIndex] = {
        ...post,
        likes: isCurrentlyLiked ? post.likes - 1 : post.likes + 1,
        isLiked: !isCurrentlyLiked,
      };

      await AsyncStorage.setItem(this.POSTS_KEY, JSON.stringify(posts));
      await this.recordUserInteraction(userId, postId, isCurrentlyLiked ? 'unlike' : 'like');
      
      return true;
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  }

  static async getComments(postId: string): Promise<Comment[]> {
    try {
      const commentsJson = await AsyncStorage.getItem(this.COMMENTS_KEY);
      const allComments: Comment[] = commentsJson ? JSON.parse(commentsJson) : [];
      return allComments.filter(c => c.postId === postId);
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  static async addComment(commentData: Omit<Comment, 'id' | 'createdAt' | 'likes' | 'isLiked'>): Promise<Comment> {
    try {
      const commentsJson = await AsyncStorage.getItem(this.COMMENTS_KEY);
      const comments: Comment[] = commentsJson ? JSON.parse(commentsJson) : [];
      
      const newComment: Comment = {
        ...commentData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false,
      };

      comments.push(newComment);
      await AsyncStorage.setItem(this.COMMENTS_KEY, JSON.stringify(comments));
      
      // Update post comment count
      await this.incrementPostCommentCount(commentData.postId);
      
      return newComment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  static async deleteComment(commentId: string): Promise<boolean> {
    try {
      const commentsJson = await AsyncStorage.getItem(this.COMMENTS_KEY);
      const comments: Comment[] = commentsJson ? JSON.parse(commentsJson) : [];
      
      const commentIndex = comments.findIndex(c => c.id === commentId);
      if (commentIndex === -1) return false;

      const comment = comments[commentIndex];
      comments.splice(commentIndex, 1);
      
      await AsyncStorage.setItem(this.COMMENTS_KEY, JSON.stringify(comments));
      await this.decrementPostCommentCount(comment.postId);
      
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  static async getPostsByTag(tag: string): Promise<CommunityPost[]> {
    try {
      const posts = await this.getPosts();
      return posts.filter(p => p.tags?.includes(tag));
    } catch (error) {
      console.error('Error fetching posts by tag:', error);
      return [];
    }
  }

  static async getPostsByMention(userId: string): Promise<CommunityPost[]> {
    try {
      const posts = await this.getPosts();
      return posts.filter(p => p.mentions?.includes(userId));
    } catch (error) {
      console.error('Error fetching posts by mention:', error);
      return [];
    }
  }

  static async searchPosts(query: string): Promise<CommunityPost[]> {
    try {
      const posts = await this.getPosts();
      const lowerQuery = query.toLowerCase();
      
      return posts.filter(p => 
        p.content.toLowerCase().includes(lowerQuery) ||
        p.authorName.toLowerCase().includes(lowerQuery) ||
        p.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    } catch (error) {
      console.error('Error searching posts:', error);
      return [];
    }
  }

  // Private helper methods
  private static async incrementPostCommentCount(postId: string): Promise<void> {
    const posts = await this.getPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex !== -1) {
      posts[postIndex].comments += 1;
      await AsyncStorage.setItem(this.POSTS_KEY, JSON.stringify(posts));
    }
  }

  private static async decrementPostCommentCount(postId: string): Promise<void> {
    const posts = await this.getPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex !== -1) {
      posts[postIndex].comments = Math.max(0, posts[postIndex].comments - 1);
      await AsyncStorage.setItem(this.POSTS_KEY, JSON.stringify(posts));
    }
  }

  private static async deletePostComments(postId: string): Promise<void> {
    const commentsJson = await AsyncStorage.getItem(this.COMMENTS_KEY);
    const comments: Comment[] = commentsJson ? JSON.parse(commentsJson) : [];
    
    const filteredComments = comments.filter(c => c.postId !== postId);
    await AsyncStorage.setItem(this.COMMENTS_KEY, JSON.stringify(filteredComments));
  }

  private static async recordUserInteraction(userId: string, postId: string, action: string): Promise<void> {
    try {
      const interactionsJson = await AsyncStorage.getItem(this.USER_INTERACTIONS_KEY);
      const interactions = interactionsJson ? JSON.parse(interactionsJson) : [];
      
      interactions.push({
        userId,
        postId,
        action,
        timestamp: new Date().toISOString(),
      });
      
      await AsyncStorage.setItem(this.USER_INTERACTIONS_KEY, JSON.stringify(interactions));
    } catch (error) {
      console.error('Error recording interaction:', error);
    }
  }
}

describe('CommunityService', () => {
  const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockClear();
    
    // Set up default mock behavior
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
    mockAsyncStorage.removeItem.mockResolvedValue();
    mockAsyncStorage.clear.mockResolvedValue();
  });

  describe('getPosts', () => {
    test('should return empty array when no posts exist', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await CommunityService.getPosts();

      expect(result).toEqual([]);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('aptly_community_posts');
    });

    test('should return parsed posts when they exist', async () => {
      const mockPosts = [
        {
          id: '1',
          content: 'Test post',
          authorId: 'user1',
          authorName: 'John Doe',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          likes: 5,
          comments: 2,
          isLiked: false,
        }
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockPosts));

      const result = await CommunityService.getPosts();

      expect(result).toEqual(mockPosts);
    });

    test('should handle AsyncStorage errors gracefully', async () => {
      const error = new Error('Storage error');
      mockAsyncStorage.getItem.mockRejectedValue(error);

      const result = await CommunityService.getPosts();

      expect(result).toEqual([]);
      expect(mockConsoleError).toHaveBeenCalledWith('Error fetching posts:', error);
    });
  });

  describe('createPost', () => {
    test('should create new post with correct structure', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));
      
      const postData = {
        content: 'New test post',
        authorId: 'user1',
        authorName: 'John Doe',
        mentions: ['user2'],
        tags: ['test'],
      };

      const result = await CommunityService.createPost(postData);

      expect(result).toMatchObject({
        ...postData,
        id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        likes: 0,
        comments: 0,
        isLiked: false,
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'aptly_community_posts',
        expect.stringContaining('"content":"New test post"')
      );
    });

    test('should add new post to beginning of posts array', async () => {
      const existingPosts = [
        { id: '1', content: 'Old post', authorId: 'user2', authorName: 'Jane' }
      ];
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingPosts));

      const postData = {
        content: 'New post',
        authorId: 'user1',
        authorName: 'John',
      };

      await CommunityService.createPost(postData);

      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
      expect(savedData[0].content).toBe('New post');
      expect(savedData[1].content).toBe('Old post');
    });

    test('should handle creation errors', async () => {
      const error = new Error('Create error');
      mockAsyncStorage.setItem.mockRejectedValue(error);
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));

      const postData = {
        content: 'Test post',
        authorId: 'user1',
        authorName: 'John',
      };

      await expect(CommunityService.createPost(postData)).rejects.toThrow('Create error');
      expect(mockConsoleError).toHaveBeenCalledWith('Error creating post:', error);
    });
  });

  describe('updatePost', () => {
    test('should update existing post', async () => {
      const existingPosts = [
        {
          id: '1',
          content: 'Original content',
          authorId: 'user1',
          authorName: 'John',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          likes: 0,
          comments: 0,
          isLiked: false,
        }
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingPosts));

      const updates = {
        content: 'Updated content',
        tags: ['updated'],
      };

      const result = await CommunityService.updatePost('1', updates);

      expect(result).toMatchObject({
        ...existingPosts[0],
        ...updates,
        updatedAt: expect.any(String),
      });
      expect(result?.updatedAt).not.toBe(existingPosts[0].updatedAt);
    });

    test('should return null for non-existent post', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));

      const result = await CommunityService.updatePost('nonexistent', { content: 'Updated' });

      expect(result).toBeNull();
    });

    test('should handle update errors', async () => {
      const error = new Error('Update error');
      mockAsyncStorage.setItem.mockRejectedValue(error);
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([
        { id: '1', content: 'Test', authorId: 'user1', authorName: 'John', createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-01-15T10:00:00Z', likes: 0, comments: 0, isLiked: false }
      ]));

      await expect(CommunityService.updatePost('1', { content: 'Updated' })).rejects.toThrow('Update error');
    });
  });

  describe('deletePost', () => {
    test('should delete existing post and its comments', async () => {
      const existingPosts = [
        { id: '1', content: 'Post 1' },
        { id: '2', content: 'Post 2' },
      ];

      const existingComments = [
        { id: 'c1', postId: '1', content: 'Comment 1' },
        { id: 'c2', postId: '2', content: 'Comment 2' },
      ];

      // First call for getPosts
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify(existingPosts))
        // Second call for deletePostComments
        .mockResolvedValueOnce(JSON.stringify(existingComments));

      const result = await CommunityService.deletePost('1');

      expect(result).toBe(true);
      
      // Check posts were filtered
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'aptly_community_posts',
        JSON.stringify([{ id: '2', content: 'Post 2' }])
      );
      
      // Check comments were filtered
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'aptly_community_comments',
        JSON.stringify([{ id: 'c2', postId: '2', content: 'Comment 2' }])
      );
    });

    test('should return false for non-existent post', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));

      const result = await CommunityService.deletePost('nonexistent');

      expect(result).toBe(false);
    });

    test('should handle delete errors', async () => {
      const error = new Error('Delete error');
      mockAsyncStorage.setItem.mockRejectedValue(error);
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([
        { id: '1', content: 'Test post' }
      ]));

      await expect(CommunityService.deletePost('1')).rejects.toThrow('Delete error');
    });
  });

  describe('likePost', () => {
    test('should like an unliked post', async () => {
      const existingPosts = [
        {
          id: '1',
          content: 'Test post',
          likes: 5,
          isLiked: false,
          authorId: 'user1',
          authorName: 'John',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          comments: 0,
        }
      ];

      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify(existingPosts))
        .mockResolvedValueOnce(null); // for user interactions

      const result = await CommunityService.likePost('1', 'user2');

      expect(result).toBe(true);
      
      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
      expect(savedData[0].likes).toBe(6);
      expect(savedData[0].isLiked).toBe(true);
    });

    test('should unlike a liked post', async () => {
      const existingPosts = [
        {
          id: '1',
          content: 'Test post',
          likes: 5,
          isLiked: true,
          authorId: 'user1',
          authorName: 'John',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          comments: 0,
        }
      ];

      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify(existingPosts))
        .mockResolvedValueOnce(null);

      const result = await CommunityService.likePost('1', 'user2');

      expect(result).toBe(true);
      
      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
      expect(savedData[0].likes).toBe(4);
      expect(savedData[0].isLiked).toBe(false);
    });

    test('should return false for non-existent post', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));

      const result = await CommunityService.likePost('nonexistent', 'user1');

      expect(result).toBe(false);
    });

    test('should record user interaction', async () => {
      const existingPosts = [
        { id: '1', content: 'Test', likes: 0, isLiked: false, authorId: 'user1', authorName: 'John', createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-01-15T10:00:00Z', comments: 0 }
      ];

      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify(existingPosts))
        .mockResolvedValueOnce(null);

      await CommunityService.likePost('1', 'user2');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'aptly_user_interactions',
        expect.stringContaining('"action":"like"')
      );
    });
  });

  describe('getComments', () => {
    test('should return comments for specific post', async () => {
      const allComments = [
        { id: 'c1', postId: '1', content: 'Comment 1', authorId: 'user1', authorName: 'John', createdAt: '2024-01-15T10:00:00Z', likes: 0, isLiked: false },
        { id: 'c2', postId: '2', content: 'Comment 2', authorId: 'user2', authorName: 'Jane', createdAt: '2024-01-15T10:00:00Z', likes: 0, isLiked: false },
        { id: 'c3', postId: '1', content: 'Comment 3', authorId: 'user3', authorName: 'Bob', createdAt: '2024-01-15T10:00:00Z', likes: 0, isLiked: false },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(allComments));

      const result = await CommunityService.getComments('1');

      expect(result).toHaveLength(2);
      expect(result.every(c => c.postId === '1')).toBe(true);
    });

    test('should return empty array when no comments exist', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await CommunityService.getComments('1');

      expect(result).toEqual([]);
    });

    test('should handle get comments errors', async () => {
      const error = new Error('Comments error');
      mockAsyncStorage.getItem.mockRejectedValue(error);

      const result = await CommunityService.getComments('1');

      expect(result).toEqual([]);
      expect(mockConsoleError).toHaveBeenCalledWith('Error fetching comments:', error);
    });
  });

  describe('addComment', () => {
    test('should add comment and increment post comment count', async () => {
      const existingComments = [
        { id: 'c1', postId: '1', content: 'Existing comment', authorId: 'user1', authorName: 'John', createdAt: '2024-01-15T10:00:00Z', likes: 0, isLiked: false }
      ];

      const existingPosts = [
        { id: '1', content: 'Test post', comments: 1, authorId: 'user1', authorName: 'John', createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-01-15T10:00:00Z', likes: 0, isLiked: false }
      ];

      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify(existingComments)) // for addComment
        .mockResolvedValueOnce(JSON.stringify(existingPosts)); // for incrementPostCommentCount

      const commentData = {
        postId: '1',
        content: 'New comment',
        authorId: 'user2',
        authorName: 'Jane',
      };

      const result = await CommunityService.addComment(commentData);

      expect(result).toMatchObject({
        ...commentData,
        id: expect.any(String),
        createdAt: expect.any(String),
        likes: 0,
        isLiked: false,
      });

      // Check comment was added
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'aptly_community_comments',
        expect.stringContaining('New comment')
      );

      // Check post comment count was incremented
      const savedPosts = JSON.parse(mockAsyncStorage.setItem.mock.calls[1][1]);
      expect(savedPosts[0].comments).toBe(2);
    });

    test('should handle add comment errors', async () => {
      const error = new Error('Add comment error');
      mockAsyncStorage.getItem.mockRejectedValue(error);

      const commentData = {
        postId: '1',
        content: 'Test comment',
        authorId: 'user1',
        authorName: 'John',
      };

      await expect(CommunityService.addComment(commentData)).rejects.toThrow('Add comment error');
    });
  });

  describe('searchPosts', () => {
    test('should search posts by content', async () => {
      const posts = [
        { id: '1', content: 'This is about React Native', authorName: 'John', tags: [] },
        { id: '2', content: 'Vue development tips', authorName: 'Jane', tags: [] },
        { id: '3', content: 'React hooks tutorial', authorName: 'Bob', tags: [] },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(posts));

      const result = await CommunityService.searchPosts('React');

      expect(result).toHaveLength(2);
      expect(result.every(p => p.content.toLowerCase().includes('react'))).toBe(true);
    });

    test('should search posts by author name', async () => {
      const posts = [
        { id: '1', content: 'Post 1', authorName: 'John Doe', tags: [] },
        { id: '2', content: 'Post 2', authorName: 'Jane Smith', tags: [] },
        { id: '3', content: 'Post 3', authorName: 'John Wilson', tags: [] },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(posts));

      const result = await CommunityService.searchPosts('john');

      expect(result).toHaveLength(2);
      expect(result.every(p => p.authorName.toLowerCase().includes('john'))).toBe(true);
    });

    test('should search posts by tags', async () => {
      const posts = [
        { id: '1', content: 'Post 1', authorName: 'John', tags: ['react', 'javascript'] },
        { id: '2', content: 'Post 2', authorName: 'Jane', tags: ['vue', 'javascript'] },
        { id: '3', content: 'Post 3', authorName: 'Bob', tags: ['angular'] },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(posts));

      const result = await CommunityService.searchPosts('javascript');

      expect(result).toHaveLength(2);
    });

    test('should handle search errors', async () => {
      const error = new Error('Search error');
      mockAsyncStorage.getItem.mockRejectedValue(error);

      const result = await CommunityService.searchPosts('test');

      expect(result).toEqual([]);
      // The error is logged in getPosts which is called by searchPosts
      expect(mockConsoleError).toHaveBeenCalledWith('Error fetching posts:', error);
    });
  });

  describe('getPostsByTag and getPostsByMention', () => {
    test('should filter posts by tag', async () => {
      const posts = [
        { id: '1', content: 'Post 1', tags: ['react', 'mobile'] },
        { id: '2', content: 'Post 2', tags: ['vue'] },
        { id: '3', content: 'Post 3', tags: ['react', 'web'] },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(posts));

      const result = await CommunityService.getPostsByTag('react');

      expect(result).toHaveLength(2);
      expect(result.every(p => p.tags?.includes('react'))).toBe(true);
    });

    test('should filter posts by mention', async () => {
      const posts = [
        { id: '1', content: 'Post 1', mentions: ['user1', 'user2'] },
        { id: '2', content: 'Post 2', mentions: ['user3'] },
        { id: '3', content: 'Post 3', mentions: ['user1'] },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(posts));

      const result = await CommunityService.getPostsByMention('user1');

      expect(result).toHaveLength(2);
      expect(result.every(p => p.mentions?.includes('user1'))).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    test('should handle complete post lifecycle', async () => {
      // Start with empty storage
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));

      // Create post
      const postData = {
        content: 'Integration test post',
        authorId: 'user1',
        authorName: 'John',
        tags: ['test'],
      };

      const createdPost = await CommunityService.createPost(postData);
      expect(createdPost.id).toBeDefined();

      // Mock updated storage with the new post
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([createdPost]));

      // Update post
      const updatedPost = await CommunityService.updatePost(createdPost.id, {
        content: 'Updated content',
      });
      expect(updatedPost?.content).toBe('Updated content');

      // Like post
      const likeResult = await CommunityService.likePost(createdPost.id, 'user2');
      expect(likeResult).toBe(true);

      // Delete post
      const deleteResult = await CommunityService.deletePost(createdPost.id);
      expect(deleteResult).toBe(true);
    });

    test('should handle post with comments lifecycle', async () => {
      const post = {
        id: '1',
        content: 'Test post',
        authorId: 'user1',
        authorName: 'John',
        comments: 0,
        likes: 0,
        isLiked: false,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      // Setup mocks for comment flow
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify([])) // initial comments
        .mockResolvedValueOnce(JSON.stringify([post])); // for incrementing count

      // Add comment
      const commentData = {
        postId: '1',
        content: 'Test comment',
        authorId: 'user2',
        authorName: 'Jane',
      };

      const comment = await CommunityService.addComment(commentData);
      expect(comment.postId).toBe('1');

      // Setup mock for getting comments
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([comment]));

      // Get comments
      const comments = await CommunityService.getComments('1');
      expect(comments).toHaveLength(1);
    });
  });
});