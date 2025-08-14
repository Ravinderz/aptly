import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Send } from 'lucide-react-native';
import { validatePostContent } from '@/utils/community';
import { MAX_COMMENT_LENGTH, User } from '@/types/community';
import MentionInput from '@/components/ui/MentionInput';
import { showErrorAlert } from '@/utils/alert';

interface CommentInputProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
}

const CommentInput: React.FC<CommentInputProps> = ({
  onSubmit,
  placeholder = 'Add a comment...',
  disabled = false,
}) => {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const mockUsers: User[] = [
        {
          id: 'user1',
          name: 'Ravinder Singh',
          flatNumber: 'A-201',
          role: 'resident',
        },
        {
          id: 'user2',
          name: 'Priya Sharma',
          flatNumber: 'B-305',
          role: 'committee',
        },
        {
          id: 'user3',
          name: 'Amit Kumar',
          flatNumber: 'C-102',
          role: 'resident',
        },
        {
          id: 'user4',
          name: 'Neha Gupta',
          flatNumber: 'A-401',
          role: 'resident',
        },
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleSubmit = async () => {
    if (submitting || disabled) return;

    const validation = validatePostContent(content, MAX_COMMENT_LENGTH);
    if (!validation.isValid) {
      showErrorAlert('Invalid Comment', validation.error);
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(content);
      setContent('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      showErrorAlert('Error', 'Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const characterCount = content.length;
  const isNearLimit = characterCount > MAX_COMMENT_LENGTH * 0.8;
  const canSubmit =
    content.trim().length >= 3 && characterCount <= MAX_COMMENT_LENGTH;

  return (
    <View className="border-t border-divider bg-surface px-4 py-3">
      <View className="flex-row items-end gap-3">
        <View className="flex-1">
          <MentionInput
            value={content}
            onChangeText={setContent}
            users={users}
            placeholder={placeholder}
            maxLength={MAX_COMMENT_LENGTH}
            disabled={disabled || submitting}
            multiline
            className="bg-background border border-divider rounded-2xl px-4 py-3 text-text-primary max-h-24"
            textAlignVertical="top"
          />
          {content.length > 0 && (
            <Text
              className={`text-xs mt-1 text-right ${isNearLimit ? 'text-warning' : 'text-text-secondary'}`}>
              {characterCount}/{MAX_COMMENT_LENGTH}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit || submitting || disabled}
          className={`rounded-full w-12 h-12 items-center justify-center ${
            canSubmit && !submitting && !disabled
              ? 'bg-primary'
              : 'bg-text-secondary/20'
          }`}
          activeOpacity={0.7}>
          {submitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Send
              size={18}
              color={canSubmit && !disabled ? 'white' : '#757575'}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CommentInput;
