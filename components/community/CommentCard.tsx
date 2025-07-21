import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Trash2, MessageCircle } from 'lucide-react-native';
import UserAvatar from '@/components/ui/UserAvatar';
import MentionText from '@/components/ui/MentionText';
import { Comment } from '@/types/community';
import { formatTimeAgo } from '@/utils/community';
import { showDeleteConfirmAlert } from '@/utils/alert';

interface CommentCardProps {
  comment: Comment;
  onDelete: (commentId: string) => Promise<void>;
  onReply?: (commentId: string) => void;
  isNested?: boolean;
}

const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  onDelete,
  onReply,
  isNested = false
}) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = () => {
    showDeleteConfirmAlert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      async () => {
        try {
          setDeleting(true);
          await onDelete(comment.id);
        } catch (error) {
          console.error('Error deleting comment:', error);
          setDeleting(false);
        }
      }
    );
  };

  const handleReply = () => {
    onReply?.(comment.id);
  };

  return (
    <View className={`mb-4 ${isNested ? 'ml-8 border-l-2 border-divider pl-4' : ''}`}>
      <View className="bg-surface rounded-2xl p-4 border border-divider">
        {/* Comment Header */}
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <UserAvatar name={comment.userName} size="sm" />
            <View className="ml-3 flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="font-semibold text-text-primary">{comment.userName}</Text>
                <Text className="text-xs text-text-secondary">Flat {comment.flatNumber}</Text>
              </View>
              <Text className="text-xs text-text-secondary mt-1">
                {formatTimeAgo(comment.createdAt)}
              </Text>
            </View>
          </View>
          
          {comment.canDelete && (
            <TouchableOpacity
              onPress={handleDelete}
              disabled={deleting}
              className="p-1 ml-2"
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#D32F2F" />
              ) : (
                <Trash2 size={14} color="#757575" />
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Comment Content */}
        <MentionText style={{ fontSize: 14, lineHeight: 20, color: '#212121' }}>
          {comment.content}
        </MentionText>
        <View className="mb-3" />

        {/* Comment Actions */}
        {!isNested && onReply && (
          <TouchableOpacity
            onPress={handleReply}
            className="flex-row items-center self-start py-1"
            activeOpacity={0.7}
          >
            <MessageCircle size={14} color="#757575" />
            <Text className="text-text-secondary text-sm ml-2 font-medium">Reply</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Nested replies would go here in a full implementation */}
      {comment.parentId && (
        <View className="mt-2 ml-4">
          <Text className="text-xs text-text-secondary italic">
            Reply to another comment
          </Text>
        </View>
      )}
    </View>
  );
};

export default CommentCard;