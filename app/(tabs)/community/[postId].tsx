import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Heart,
  MessageSquareText,
  Trash2,
} from 'lucide-react-native';
import UserAvatar from '@/components/ui/UserAvatar';
import { Post, Comment } from '@/types/community';
import { communityApi } from '@/services/communityApi';
import {
  formatTimeAgo,
  getCategoryDisplay,
  getPostStats,
} from '@/utils/community';
import CommentInput from '@/components/community/CommentInput';
import CommentCard from '@/components/community/CommentCard';
import {
  showErrorAlert,
  showSuccessAlert,
  showDeleteConfirmAlert,
} from '@/utils/alert';
import { safeGoBack } from '@/utils/navigation';

export default function PostDetail() {
  // const router = useRouter();
  const { postId } = useLocalSearchParams<{ postId: string }>();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    if (postId) {
      loadPostData();
    }
  }, [postId, loadPostData]);

  const loadPostData = useCallback(async () => {
    try {
      setLoading(true);
      const [postsData, commentsData] = await Promise.all([
        communityApi.getPosts(),
        communityApi.getComments(postId),
      ]);

      const foundPost = postsData.find((p) => p.id === postId);
      if (!foundPost) {
        showErrorAlert('Error', 'Post not found', () => safeGoBack());
        return;
      }

      setPost(foundPost);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading post:', error);
      showErrorAlert('Error', 'Failed to load post. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const refreshData = async () => {
    try {
      setRefreshing(true);
      await loadPostData();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLike = async () => {
    if (!post || liking) return;

    try {
      setLiking(true);
      const result = await communityApi.toggleLike(post.id);
      setPost((prev) =>
        prev
          ? {
              ...prev,
              isLikedByUser: result.liked,
              likesCount: result.likesCount,
            }
          : null,
      );
    } catch (error) {
      console.error('Error toggling like:', error);
      showErrorAlert('Error', 'Failed to update like. Please try again.');
    } finally {
      setLiking(false);
    }
  };

  const handleDeletePost = async () => {
    if (!post) return;

    showDeleteConfirmAlert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      async () => {
        try {
          await communityApi.deletePost(post.id);
          showSuccessAlert('Success', 'Post deleted successfully.', () =>
            safeGoBack(),
          );
        } catch (error) {
          console.error('Error deleting post:', error);
          showErrorAlert('Error', 'Failed to delete post. Please try again.');
        }
      },
    );
  };

  const handleAddComment = async (content: string) => {
    if (!post) return;

    try {
      const newComment = await communityApi.addComment({
        postId: post.id,
        content,
      });

      setComments((prev) => [...prev, newComment]);
      setPost((prev) =>
        prev
          ? {
              ...prev,
              commentsCount: prev.commentsCount + 1,
            }
          : null,
      );
    } catch (error) {
      console.error('Error adding comment:', error);
      showErrorAlert('Error', 'Failed to add comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await communityApi.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setPost((prev) =>
        prev
          ? {
              ...prev,
              commentsCount: Math.max(0, prev.commentsCount - 1),
            }
          : null,
      );
      showSuccessAlert('Success', 'Comment deleted successfully.');
    } catch (error) {
      console.error('Error deleting comment:', error);
      showErrorAlert('Error', 'Failed to delete comment. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-row items-center px-6 py-4 border-b border-divider">
          <TouchableOpacity onPress={() => safeGoBack()} className="mr-4">
            <ArrowLeft size={24} color="#212121" />
          </TouchableOpacity>
          <Text className="text-headline-large font-bold text-text-primary">
            Post
          </Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="text-text-secondary mt-4">Loading post...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-row items-center px-6 py-4 border-b border-divider">
          <TouchableOpacity onPress={() => safeGoBack()} className="mr-4">
            <ArrowLeft size={24} color="#212121" />
          </TouchableOpacity>
          <Text className="text-headline-large font-bold text-text-primary">
            Post
          </Text>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-headline-large font-semibold text-text-primary mb-2">
            Post Not Found
          </Text>
          <Text className="text-text-secondary text-center">
            This post may have been deleted or is no longer available.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const categoryDisplay = getCategoryDisplay(post.category);
  const postStats = getPostStats(post.likesCount, post.commentsCount);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-divider">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => safeGoBack()} className="mr-4">
              <ArrowLeft size={24} color="#212121" />
            </TouchableOpacity>
            <Text className="text-headline-large font-bold text-text-primary">
              Post
            </Text>
          </View>
          {post.canDelete && (
            <TouchableOpacity onPress={handleDeletePost} className="p-1">
              <Trash2 size={20} color="#757575" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshData}
              colors={['#6366f1']}
              tintColor={'#6366f1'}
            />
          }>
          {/* Post Content */}
          <View className="bg-surface mx-4 mt-4 rounded-2xl p-6 border border-divider">
            {/* Post Header */}
            <View className="flex-row items-start justify-between mb-4">
              <View className="flex-row items-center flex-1">
                <UserAvatar name={post.userName} />
                <View className="ml-3 flex-1">
                  <Text className="text-headline-medium font-semibold text-text-primary">
                    {post.userName}
                  </Text>
                  <View className="flex-row items-center gap-2 mt-1">
                    <Text className="text-body-medium text-text-secondary">
                      Flat {post.flatNumber}
                    </Text>
                    <View className="w-1 h-1 bg-text-secondary rounded-full" />
                    <View className="bg-primary/10 px-2 py-1 rounded-full flex-row items-center">
                      <Text className="text-label-large mr-1">
                        {categoryDisplay.icon}
                      </Text>
                      <Text className="text-primary text-label-large font-medium">
                        {categoryDisplay.name}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <Text className="text-body-medium text-text-secondary">
                {formatTimeAgo(post.createdAt)}
              </Text>
            </View>

            {/* Post Content */}
            <Text className="text-text-primary leading-6 mb-4">
              {post.content}
            </Text>

            {/* Post Image */}
            {post.imageUrl && (
              <View className="rounded-xl overflow-hidden mb-4">
                {/* In a real implementation, this would be an actual Image component */}
                <View className="bg-primary/5 h-48 items-center justify-center">
                  <Text className="text-text-secondary">
                    Image: {post.imageUrl}
                  </Text>
                </View>
              </View>
            )}

            {/* Post Actions */}
            <View className="flex-row items-center justify-between pt-4 border-t border-divider">
              <TouchableOpacity
                className="flex-row items-center gap-2 py-2 flex-1"
                activeOpacity={0.7}>
                <MessageSquareText size={20} color="#757575" />
                <Text className="text-text-secondary font-medium">
                  {postStats.comments}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLike}
                disabled={liking}
                className="flex-row items-center gap-2 py-2 flex-1 justify-end"
                activeOpacity={0.7}>
                {liking ? (
                  <ActivityIndicator size="small" color="#D32F2F" />
                ) : (
                  <Heart
                    size={20}
                    color={post.isLikedByUser ? '#D32F2F' : '#757575'}
                    fill={post.isLikedByUser ? '#D32F2F' : 'transparent'}
                  />
                )}
                <Text
                  className={`font-medium ${
                    post.isLikedByUser ? 'text-error' : 'text-text-secondary'
                  }`}>
                  {postStats.likes}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Comments Section */}
          <View className="mx-4 mt-6 mb-4">
            <Text className="text-headline-medium font-semibold text-text-primary mb-4">
              Comments ({comments.length})
            </Text>

            {comments.length > 0 ? (
              comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  onDelete={handleDeleteComment}
                />
              ))
            ) : (
              <View className="bg-surface rounded-2xl p-8 border border-divider items-center">
                <MessageSquareText size={32} color="#757575" />
                <Text className="text-text-primary font-semibold text-headline-medium mt-4 mb-2">
                  No comments yet
                </Text>
                <Text className="text-text-secondary text-center">
                  Be the first to share your thoughts on this post.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Comment Input */}
        <CommentInput onSubmit={handleAddComment} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
