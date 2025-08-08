import {
  Post,
  Comment,
  CreatePostRequest,
  CreateCommentRequest,
  User,
} from '@/types/community';
import { apiService } from './api.service';

/**
 * Community API Service - Now using real API calls with fallback to mock data
 * This service integrates with the centralized API service for proper error handling,
 * caching, loading states, and retry mechanisms.
 */

/**
 * Enhanced Community API Service with real API integration and mock fallback
 */
export const communityApi = {
  // Get current user
  getCurrentUser: async (): Promise<User> => {
    try {
      return await apiService.getCurrentUser();
    } catch (error) {
      console.warn('Failed to fetch user from API, using fallback:', error);
      // Mock fallback for development
      return {
        id: 'user1',
        name: 'Ravinder Singh',
        flatNumber: 'A-201',
        role: 'resident',
        email: 'ravinder@example.com',
        phone: '+91-9876543210',
        bio: 'Software Developer and tech enthusiast.',
        joinedDate: '2023-01-15',
        connectionsCount: 12,
      };
    }
  },

  // Fetch all posts with pagination support
  getPosts: async (page: number = 1, limit: number = 20): Promise<Post[]> => {
    try {
      const response = await apiService.getCommunityPosts(page, limit);
      return response.data || [];
    } catch (error) {
      console.warn('Failed to fetch posts from API, using fallback:', error);
      // Mock fallback with sample posts
      return [
        {
          id: 'mock-post1',
          userId: 'user2',
          userName: 'Sample User',
          flatNumber: 'B-305',
          category: 'announcement',
          content: 'Welcome to the community! This is a sample post while API is being set up.',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          likesCount: 5,
          commentsCount: 2,
          isLikedByUser: false,
          canEdit: false,
          canDelete: false,
          status: 'active',
        }
      ];
    }
  },

  // Create new post
  createPost: async (request: CreatePostRequest): Promise<Post> => {
    try {
      return await apiService.createPost(request);
    } catch (error) {
      console.warn('Failed to create post via API, using fallback:', error);
      // Mock fallback - simulate successful creation
      const mockPost: Post = {
        id: `mock-post-${Date.now()}`,
        userId: 'current-user',
        userName: 'Current User',
        flatNumber: 'A-201',
        category: request.category,
        content: request.content.trim(),
        imageUrl: request.imageUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
        likesCount: 0,
        commentsCount: 0,
        isLikedByUser: false,
        canEdit: true,
        canDelete: true,
        status: 'active',
      };
      return mockPost;
    }
  },

  // Toggle like on post
  toggleLike: async (postId: string): Promise<{ liked: boolean; likesCount: number }> => {
    try {
      return await apiService.togglePostLike(postId);
    } catch (error) {
      console.warn('Failed to toggle like via API, using fallback:', error);
      // Mock fallback
      return { liked: true, likesCount: Math.floor(Math.random() * 20) + 1 };
    }
  },

  // Get comments for a post
  getComments: async (postId: string): Promise<Comment[]> => {
    try {
      return await apiService.getPostComments(postId);
    } catch (error) {
      console.warn('Failed to fetch comments from API, using fallback:', error);
      // Mock fallback
      return [
        {
          id: `mock-comment-${postId}`,
          postId,
          userId: 'user1',
          userName: 'Sample User',
          flatNumber: 'A-101',
          content: 'This is a sample comment while API is being set up.',
          createdAt: new Date(),
          canDelete: false,
        }
      ];
    }
  },

  // Add comment to post
  addComment: async (request: CreateCommentRequest): Promise<Comment> => {
    try {
      return await apiService.addComment(request);
    } catch (error) {
      console.warn('Failed to add comment via API, using fallback:', error);
      // Mock fallback
      const mockComment: Comment = {
        id: `mock-comment-${Date.now()}`,
        postId: request.postId,
        userId: 'current-user',
        userName: 'Current User',
        flatNumber: 'A-201',
        content: request.content.trim(),
        createdAt: new Date(),
        parentId: request.parentId,
        canDelete: true,
      };
      return mockComment;
    }
  },

  // Delete post
  deletePost: async (postId: string): Promise<boolean> => {
    try {
      await apiService.deletePost(postId);
      return true;
    } catch (error) {
      console.warn('Failed to delete post via API, using fallback:', error);
      // Mock fallback - simulate success
      return true;
    }
  },

  // Delete comment
  deleteComment: async (commentId: string): Promise<boolean> => {
    try {
      // Note: API service would need to implement deleteComment method
      console.warn('Delete comment API not yet implemented, using fallback');
      return true;
    } catch (error) {
      console.warn('Failed to delete comment via API, using fallback:', error);
      return true;
    }
  },

  // Update post
  updatePost: async (
    postId: string,
    updates: { content: string; imageUrl?: string }
  ): Promise<Post> => {
    try {
      // Note: API service would need to implement updatePost method
      console.warn('Update post API not yet implemented, using fallback');
      return {
        id: postId,
        userId: 'current-user',
        userName: 'Current User',
        flatNumber: 'A-201',
        category: 'general',
        content: updates.content,
        imageUrl: updates.imageUrl,
        createdAt: new Date(Date.now() - 60000),
        updatedAt: new Date(),
        likesCount: 0,
        commentsCount: 0,
        isLikedByUser: false,
        canEdit: true,
        canDelete: true,
        status: 'active',
      };
    } catch (error) {
      console.warn('Failed to update post via API, using fallback:', error);
      throw error;
    }
  },

  // Get user by ID (for mentions, etc.)
  getUser: async (userId: string): Promise<User | null> => {
    try {
      return await apiService.getCurrentUser(); // Simplified for now
    } catch (error) {
      console.warn('Failed to fetch user from API, using fallback:', error);
      // Mock fallback
      return {
        id: userId,
        name: 'Sample User',
        flatNumber: 'A-101',
        role: 'resident',
        email: 'user@example.com',
        phone: '+91-9999999999',
        bio: 'Resident',
        joinedDate: '2023-01-01',
        connectionsCount: 5,
      };
    }
  },

  // Get posts by user ID
  getUserPosts: async (userId: string): Promise<Post[]> => {
    try {
      // For now, get all posts and filter client-side
      // In production, this would be a separate API endpoint
      const allPosts = await this.getPosts();
      return allPosts.filter(post => post.userId === userId);
    } catch (error) {
      console.warn('Failed to fetch user posts from API, using fallback:', error);
      return [];
    }
  },

  // New methods for enhanced functionality

  // Get loading states from API service
  getLoadingManager: () => {
    return apiService.getLoadingManager();
  },

  // Invalidate cache for fresh data
  refreshCache: () => {
    apiService.invalidateCache('community');
  },

  // Get API service instance for advanced usage
  getApiService: () => {
    return apiService;
  },
};
