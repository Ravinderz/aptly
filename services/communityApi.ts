import { Post, Comment, CreatePostRequest, CreateCommentRequest, User } from '@/types/community';

// Mock current user - in production this would come from AuthContext
const CURRENT_USER: User = {
  id: 'user1',
  name: 'Ravinder Singh',
  flatNumber: 'A-201',
  role: 'resident'
};

// Mock users data
const MOCK_USERS: User[] = [
  CURRENT_USER,
  { id: 'user2', name: 'Priya Sharma', flatNumber: 'B-305', role: 'committee' },
  { id: 'user3', name: 'Amit Kumar', flatNumber: 'C-102', role: 'resident' },
  { id: 'user4', name: 'Neha Gupta', flatNumber: 'A-401', role: 'resident' },
  { id: 'user5', name: 'Society Admin', flatNumber: 'Office', role: 'admin' },
];

// Mock posts data
let MOCK_POSTS: Post[] = [
  {
    id: 'post1',
    userId: 'user2',
    userName: 'Priya Sharma',
    flatNumber: 'B-305',
    category: 'announcement',
    content: 'Reminder: Society maintenance meeting scheduled for this Saturday at 5 PM in the community hall. Please attend to discuss upcoming infrastructure improvements.',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    likesCount: 12,
    commentsCount: 3,
    isLikedByUser: false,
    canEdit: false,
    canDelete: false,
    status: 'active'
  },
  {
    id: 'post2',
    userId: 'user1',
    userName: 'Ravinder Singh',
    flatNumber: 'A-201',
    category: 'buy_sell',
    content: 'Selling barely used dining table set (4 seater) in excellent condition. Moving to a new place. Price: ₹8,000 (negotiable). Contact me if interested!',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    likesCount: 5,
    commentsCount: 2,
    isLikedByUser: true,
    canEdit: true,
    canDelete: true,
    status: 'active'
  },
  {
    id: 'post3',
    userId: 'user3',
    userName: 'Amit Kumar',
    flatNumber: 'C-102',
    category: 'lost_found',
    content: 'Found a set of keys near the main gate yesterday evening. Has a BMW keychain. Please contact me if these are yours.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    likesCount: 8,
    commentsCount: 1,
    isLikedByUser: false,
    canEdit: false,
    canDelete: false,
    status: 'active'
  },
  {
    id: 'post4',
    userId: 'user4',
    userName: 'Neha Gupta',
    flatNumber: 'A-401',
    category: 'events',
    content: 'Planning a Holi celebration in the society courtyard next weekend! Please let me know if you\'d like to contribute or help with arrangements. Let\'s make it memorable! 🎨🎉',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    likesCount: 15,
    commentsCount: 7,
    isLikedByUser: true,
    canEdit: false,
    canDelete: false,
    status: 'active'
  }
];

// Mock comments data
let MOCK_COMMENTS: Comment[] = [
  {
    id: 'comment1',
    postId: 'post1',
    userId: 'user1',
    userName: 'Ravinder Singh',
    flatNumber: 'A-201',
    content: 'Will definitely attend. Thanks for organizing!',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    canDelete: true
  },
  {
    id: 'comment2',
    postId: 'post2',
    userId: 'user4',
    userName: 'Neha Gupta',
    flatNumber: 'A-401',
    content: 'Interested! Can I see some pictures?',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    canDelete: false
  },
  {
    id: 'comment3',
    postId: 'post4',
    userId: 'user3',
    userName: 'Amit Kumar',
    flatNumber: 'C-102',
    content: 'Great idea! I can help with decorations and organizing games for kids.',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    canDelete: false
  },
  {
    id: 'comment4',
    postId: 'post4',
    userId: 'user1',
    userName: 'Ravinder Singh',
    flatNumber: 'A-201',
    content: 'Count me in! Will bring some sweets. Should we coordinate on WhatsApp?',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    canDelete: true
  }
];

// API simulation delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Community API Service
 */
export const communityApi = {
  // Get current user
  getCurrentUser: async (): Promise<User> => {
    await delay(100);
    return CURRENT_USER;
  },

  // Fetch all posts
  getPosts: async (): Promise<Post[]> => {
    await delay(800);
    return MOCK_POSTS.filter(post => post.status === 'active');
  },

  // Create new post
  createPost: async (request: CreatePostRequest): Promise<Post> => {
    await delay(1000);
    
    const newPost: Post = {
      id: `post${Date.now()}`,
      userId: CURRENT_USER.id,
      userName: CURRENT_USER.name,
      flatNumber: CURRENT_USER.flatNumber,
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
      status: 'active'
    };

    MOCK_POSTS.unshift(newPost);
    return newPost;
  },

  // Toggle like on post
  toggleLike: async (postId: string): Promise<{ liked: boolean; likesCount: number }> => {
    await delay(300);
    
    const post = MOCK_POSTS.find(p => p.id === postId);
    if (!post) throw new Error('Post not found');

    if (post.isLikedByUser) {
      post.isLikedByUser = false;
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      post.isLikedByUser = true;
      post.likesCount += 1;
    }

    return {
      liked: post.isLikedByUser,
      likesCount: post.likesCount
    };
  },

  // Get comments for a post
  getComments: async (postId: string): Promise<Comment[]> => {
    await delay(500);
    return MOCK_COMMENTS
      .filter(comment => comment.postId === postId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()); // Oldest first for comments
  },

  // Add comment to post
  addComment: async (request: CreateCommentRequest): Promise<Comment> => {
    await delay(600);
    
    const newComment: Comment = {
      id: `comment${Date.now()}`,
      postId: request.postId,
      userId: CURRENT_USER.id,
      userName: CURRENT_USER.name,
      flatNumber: CURRENT_USER.flatNumber,
      content: request.content.trim(),
      createdAt: new Date(),
      parentId: request.parentId,
      canDelete: true
    };

    MOCK_COMMENTS.push(newComment);
    
    // Update comment count on post
    const post = MOCK_POSTS.find(p => p.id === request.postId);
    if (post) {
      post.commentsCount += 1;
    }

    return newComment;
  },

  // Delete post
  deletePost: async (postId: string): Promise<boolean> => {
    await delay(500);
    
    const postIndex = MOCK_POSTS.findIndex(p => p.id === postId);
    if (postIndex === -1) throw new Error('Post not found');
    
    const post = MOCK_POSTS[postIndex];
    if (post.userId !== CURRENT_USER.id && CURRENT_USER.role !== 'admin') {
      throw new Error('Not authorized to delete this post');
    }

    MOCK_POSTS.splice(postIndex, 1);
    return true;
  },

  // Delete comment
  deleteComment: async (commentId: string): Promise<boolean> => {
    await delay(400);
    
    const commentIndex = MOCK_COMMENTS.findIndex(c => c.id === commentId);
    if (commentIndex === -1) throw new Error('Comment not found');
    
    const comment = MOCK_COMMENTS[commentIndex];
    if (comment.userId !== CURRENT_USER.id && CURRENT_USER.role !== 'admin') {
      throw new Error('Not authorized to delete this comment');
    }

    // Update comment count on post
    const post = MOCK_POSTS.find(p => p.id === comment.postId);
    if (post) {
      post.commentsCount = Math.max(0, post.commentsCount - 1);
    }

    MOCK_COMMENTS.splice(commentIndex, 1);
    return true;
  },

  // Update post
  updatePost: async (postId: string, updates: { content: string; imageUrl?: string }): Promise<Post> => {
    await delay(800);
    
    const postIndex = MOCK_POSTS.findIndex(p => p.id === postId);
    if (postIndex === -1) {
      throw new Error('Post not found');
    }

    const post = MOCK_POSTS[postIndex];
    
    // Update the post
    MOCK_POSTS[postIndex] = {
      ...post,
      content: updates.content.trim(),
      imageUrl: updates.imageUrl,
      updatedAt: new Date()
    };
    
    return MOCK_POSTS[postIndex];
  },

  // Get user by ID (for mentions, etc.)
  getUser: async (userId: string): Promise<User | null> => {
    await delay(200);
    return MOCK_USERS.find(user => user.id === userId) || null;
  }
};