import LucideIcons from '@/components/ui/LucideIcons';
import React, { useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import UserAvatar from './UserAvatar';
import MentionText from './MentionText';
import { Post } from '@/types/community';
import {
  formatTimeAgo,
  getCategoryDisplay,
  getPostStats,
  canEditPost,
} from '@/utils/community';
import { communityApi } from '@/services/communityApi';
import { useRouter } from 'expo-router';
import { showErrorAlert, showDeleteConfirmAlert } from '@/utils/alert';

interface PostCardProps {
  post: Post;
  onLike?: (postId: string, liked: boolean, likesCount: number) => void;
  onComment?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onEdit?: (postId: string) => void;
  onMentionPress?: (mentionUserId: string) => void;
  showReadMore?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  onDelete,
  onEdit,
  onMentionPress,
  showReadMore = true,
}) => {
  const [liking, setLiking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const router = useRouter();

  // Check if user can edit this post (within 30 minutes)
  const canEdit = canEditPost(post, post.userId);

  const handleLike = async () => {
    if (liking) return;

    try {
      setLiking(true);
      const result = await communityApi.toggleLike(post.id);
      onLike?.(post.id, result.liked, result.likesCount);
    } catch (error) {
      console.error('Error toggling like:', error);
      showErrorAlert('Error', 'Failed to update like. Please try again.');
    } finally {
      setLiking(false);
    }
  };

  const handleComment = () => {
    onComment?.(post.id);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(post.id);
    } else {
      router.push(`/(tabs)/community/edit/${post.id}`);
    }
    setShowActions(false);
  };

  const toggleActions = () => {
    setShowActions(!showActions);
  };

  const handleDelete = () => {
    showDeleteConfirmAlert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      async () => {
        try {
          setDeleting(true);
          await communityApi.deletePost(post.id);
          onDelete?.(post.id);
        } catch (error) {
          console.error('Error deleting post:', error);
          showErrorAlert('Error', 'Failed to delete post. Please try again.');
          setDeleting(false);
        }
      },
    );
  };

  const categoryDisplay = getCategoryDisplay(post.category);
  const postStats = getPostStats(post.likesCount, post.commentsCount);
  return (
    <View className="bg-surface border border-divider rounded-2xl p-5 mb-4 shadow-sm shadow-black/5">
      <View className="flex flex-row justify-between items-start mb-3">
        <View className="flex flex-row gap-3 items-center flex-1">
          <UserAvatar name={post.userName} />
          <View className="flex flex-col gap-1 flex-1">
            <Text className="text-headline-small font-semibold text-text-primary">
              {post.userName}
            </Text>
            <View className="flex flex-row items-center gap-2">
              <Text className="text-body-medium text-text-secondary">
                Flat {post.flatNumber}
              </Text>
              <View className="w-1 h-1 bg-text-secondary rounded-full" />
              <View className="bg-primary/10 px-2 py-1 rounded-full flex-row items-center">
                <Text className="text-label-small mr-1">
                  {categoryDisplay.icon}
                </Text>
                <Text className="text-primary text-label-small font-medium">
                  {categoryDisplay.name}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View className="flex flex-row items-center gap-3">
          <Text className="text-body-medium text-text-secondary">
            {formatTimeAgo(post.createdAt)}
          </Text>
          {(post.canDelete || canEdit) && (
            <View className="relative">
              <TouchableOpacity onPress={toggleActions} className="p-1">
                <LucideIcons
                  name="settings-outline"
                  size={16}
                  color="#757575"
                />
              </TouchableOpacity>

              {showActions && (
                <View className="absolute top-8 right-0 bg-surface border border-divider rounded-xl shadow-lg z-10 min-w-32">
                  {canEdit && (
                    <TouchableOpacity
                      onPress={handleEdit}
                      className="flex-row items-center px-4 py-3 border-b border-divider">
                      <LucideIcons
                        name="document-text-outline"
                        size={14}
                        color="#6366f1"
                      />
                      <Text className="text-primary ml-3 font-medium">
                        Edit
                      </Text>
                    </TouchableOpacity>
                  )}
                  {post.canDelete && (
                    <TouchableOpacity
                      onPress={() => {
                        setShowActions(false);
                        handleDelete();
                      }}
                      disabled={deleting}
                      className="flex-row items-center px-4 py-3">
                      {deleting ? (
                        <ActivityIndicator
                          size="small"
                          className="text-error"
                        />
                      ) : (
                        <LucideIcons
                          name="trash-outline"
                          size={14}
                          color="#D32F2F"
                        />
                      )}
                      <Text className="text-error ml-3 font-medium">
                        {deleting ? 'Deleting...' : 'Delete'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      </View>
      <View className="border-b border-divider pb-4 mb-4">
        <MentionText
          className="text-body-large leading-6 text-text-primary"
          onMentionPress={onMentionPress}>
          {post.content}
        </MentionText>
        {post.imageUrl && (
          <View className="mt-3 rounded-xl overflow-hidden">
            <Image
              source={{ uri: post.imageUrl }}
              style={{ width: '100%', height: 200, resizeMode: 'cover' }}
            />
          </View>
        )}
      </View>
      <View className="flex flex-row justify-between items-center">
        <TouchableOpacity
          onPress={handleComment}
          className="flex flex-row gap-2 items-center flex-1 py-2"
          activeOpacity={0.7}>
          <LucideIcons name="chatbubble-outline" size={18} color="#757575" />
          <Text className="text-body-medium font-medium text-text-secondary">
            {postStats.comments}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLike}
          disabled={liking}
          className="flex flex-row gap-2 items-center flex-1 py-2 justify-end"
          activeOpacity={0.7}>
          {liking ? (
            <ActivityIndicator size="small" color="#D32F2F" />
          ) : (
            <LucideIcons
              name={post.isLikedByUser ? 'heart' : 'heart-outline'}
              size={18}
              color={post.isLikedByUser ? '#D32F2F' : '#757575'}
            />
          )}
          <Text
            className={`text-body-medium font-medium ${
              post.isLikedByUser ? 'text-error' : 'text-text-secondary'
            }`}>
            {postStats.likes}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PostCard;
