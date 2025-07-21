import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { formatTextWithMentions } from '@/utils/mentions';
import { showSuccessAlert } from '@/utils/alert';

interface MentionTextProps {
  children: string;
  style?: any;
  onMentionPress?: (username: string) => void;
}

const MentionText: React.FC<MentionTextProps> = ({ 
  children, 
  style, 
  onMentionPress 
}) => {
  const textParts = formatTextWithMentions(children);

  const handleMentionPress = (username: string) => {
    if (onMentionPress) {
      onMentionPress(username);
    } else {
      showSuccessAlert('User Profile', `View profile for @${username}`);
    }
  };

  return (
    <Text style={style}>
      {textParts.map((part, index) => {
        if (part.isMention && part.username) {
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleMentionPress(part.username!)}
              style={{ flexDirection: 'row' }}
            >
              <Text className="text-primary font-semibold">
                {part.text}
              </Text>
            </TouchableOpacity>
          );
        }
        return (
          <Text key={index}>
            {part.text}
          </Text>
        );
      })}
    </Text>
  );
};

export default MentionText;