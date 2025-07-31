import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  TextInputProps,
} from 'react-native';
import { User } from '@/types/community';
import { getMentionSuggestions, insertMention } from '@/utils/mentions';
import UserAvatar from './UserAvatar';

interface MentionInputProps extends Omit<TextInputProps, 'onChangeText'> {
  value: string;
  onChangeText: (text: string) => void;
  users: User[];
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
}

const MentionInput: React.FC<MentionInputProps> = ({
  value,
  onChangeText,
  users,
  placeholder,
  maxLength,
  disabled,
  ...textInputProps
}) => {
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [mentionQuery, setMentionQuery] = useState('');
  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (mentionQuery.length > 0) {
      loadSuggestions(mentionQuery);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [mentionQuery]);

  const loadSuggestions = async (query: string) => {
    try {
      const userSuggestions = await getMentionSuggestions(query, users);
      setSuggestions(userSuggestions);
      setShowSuggestions(userSuggestions.length > 0);
    } catch (error) {
      console.error('Error loading mention suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleTextChange = (text: string) => {
    onChangeText(text);

    // Check if user is typing a mention
    const beforeCursor = text.substring(0, cursorPosition);
    const atIndex = beforeCursor.lastIndexOf('@');

    if (atIndex !== -1 && atIndex === beforeCursor.length - 1) {
      // Just typed @
      setMentionQuery('');
      setShowSuggestions(false);
    } else if (atIndex !== -1) {
      const afterAt = beforeCursor.substring(atIndex + 1);
      // Check if there's no space after @
      if (!afterAt.includes(' ') && afterAt.length <= 20) {
        setMentionQuery(afterAt);
      } else {
        setMentionQuery('');
        setShowSuggestions(false);
      }
    } else {
      setMentionQuery('');
      setShowSuggestions(false);
    }
  };

  const handleSelectionChange = (event: any) => {
    setCursorPosition(event.nativeEvent.selection.start);
  };

  const selectMention = (user: User) => {
    const username = user.name.replace(/\s/g, '');
    const result = insertMention(value, cursorPosition, username);

    onChangeText(result.newText);
    setShowSuggestions(false);
    setMentionQuery('');

    // Focus and set cursor position
    setTimeout(() => {
      textInputRef.current?.focus();
      textInputRef.current?.setNativeProps({
        selection: {
          start: result.newCursorPosition,
          end: result.newCursorPosition,
        },
      });
    }, 100);
  };

  const renderSuggestion = ({ item: user }: { item: User }) => (
    <TouchableOpacity
      onPress={() => selectMention(user)}
      className="flex-row items-center px-4 py-3 bg-surface border-b border-divider"
      activeOpacity={0.7}>
      <UserAvatar name={user.name} size="sm" />
      <View className="ml-3 flex-1">
        <Text className="text-text-primary font-semibold">{user.name}</Text>
        <Text className="text-text-secondary text-sm">
          Flat {user.flatNumber}
        </Text>
      </View>
      <Text className="text-primary text-sm font-medium">
        @{user.name.replace(/\s/g, '')}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="relative">
      <TextInput
        ref={textInputRef}
        value={value}
        onChangeText={handleTextChange}
        onSelectionChange={handleSelectionChange}
        placeholder={placeholder}
        placeholderTextColor="#757575"
        maxLength={maxLength}
        editable={!disabled}
        {...textInputProps}
      />

      {showSuggestions && suggestions.length > 0 && (
        <View className="absolute bottom-full left-0 right-0 bg-background border border-divider rounded-xl shadow-lg max-h-48 z-50">
          <View className="px-4 py-2 border-b border-divider">
            <Text className="text-text-secondary text-sm font-medium">
              Mention someone
            </Text>
          </View>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(user) => user.id}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
};

export default MentionInput;
