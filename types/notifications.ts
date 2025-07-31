export type NotificationType =
  | 'mention'
  | 'like'
  | 'comment'
  | 'reply'
  | 'post_approved'
  | 'post_reported'
  | 'post_deleted'
  | 'community_announcement';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: NotificationData;
  priority: NotificationPriority;
  userId: string;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
  actionUrl?: string;
}

export interface NotificationData {
  postId?: string;
  commentId?: string;
  mentionedBy?: string;
  likedBy?: string;
  commentBy?: string;
  reportedBy?: string;
  moderatorAction?: string;
  [key: string]: any;
}

export interface NotificationSettings {
  userId: string;
  mentions: boolean;
  likes: boolean;
  comments: boolean;
  replies: boolean;
  announcements: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
  };
  updatedAt: Date;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  data: {
    type: NotificationType;
    actionUrl: string;
    [key: string]: any;
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  lastWeek: number;
  thisWeek: number;
}

export const NOTIFICATION_TEMPLATES = {
  mention: {
    title: (mentioner: string) => `${mentioner} mentioned you`,
    body: (mentioner: string, content: string) =>
      `${mentioner} mentioned you in a post: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
    priority: 'high' as NotificationPriority,
  },
  like: {
    title: (liker: string) => `${liker} liked your post`,
    body: (liker: string, postContent: string) =>
      `${liker} liked your post: "${postContent.substring(0, 50)}${postContent.length > 50 ? '...' : ''}"`,
    priority: 'medium' as NotificationPriority,
  },
  comment: {
    title: (commenter: string) => `${commenter} commented on your post`,
    body: (commenter: string, comment: string) =>
      `${commenter}: "${comment.substring(0, 80)}${comment.length > 80 ? '...' : ''}"`,
    priority: 'high' as NotificationPriority,
  },
  reply: {
    title: (replier: string) => `${replier} replied to your comment`,
    body: (replier: string, reply: string) =>
      `${replier}: "${reply.substring(0, 80)}${reply.length > 80 ? '...' : ''}"`,
    priority: 'high' as NotificationPriority,
  },
  post_approved: {
    title: () => 'Your post has been approved',
    body: (postContent: string) =>
      `Your post "${postContent.substring(0, 50)}${postContent.length > 50 ? '...' : ''}" is now visible to the community`,
    priority: 'medium' as NotificationPriority,
  },
  post_reported: {
    title: () => 'Post reported for review',
    body: (postContent: string) =>
      `Your post "${postContent.substring(0, 50)}${postContent.length > 50 ? '...' : ''}" has been reported and is under review`,
    priority: 'high' as NotificationPriority,
  },
  post_deleted: {
    title: () => 'Your post has been removed',
    body: (reason: string) =>
      `Your post has been removed by a moderator. Reason: ${reason}`,
    priority: 'high' as NotificationPriority,
  },
  community_announcement: {
    title: (title: string) => title,
    body: (body: string) => body,
    priority: 'urgent' as NotificationPriority,
  },
} as const;
