import { User } from '@/types/community';

export interface Mention {
  id: string;
  username: string;
  displayName: string;
  flatNumber: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Extract mentions from text content
 * Matches @username patterns
 */
export const extractMentions = (text: string): Mention[] => {
  const mentions: Mention[] = [];
  const mentionRegex = /@(\w+)/g;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push({
      id: `mention-${Date.now()}-${Math.random()}`,
      username: match[1],
      displayName: match[1], // In real app, this would be resolved from user data
      flatNumber: '', // Would be fetched from user data
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return mentions;
};

/**
 * Replace mentions in text with styled components (for display)
 */
export const formatTextWithMentions = (
  text: string,
): Array<{ text: string; isMention: boolean; username?: string }> => {
  const mentions = extractMentions(text);
  if (mentions.length === 0) {
    return [{ text, isMention: false }];
  }

  const parts: Array<{ text: string; isMention: boolean; username?: string }> =
    [];
  let lastIndex = 0;

  mentions.forEach((mention) => {
    // Add text before mention
    if (mention.startIndex > lastIndex) {
      parts.push({
        text: text.substring(lastIndex, mention.startIndex),
        isMention: false,
      });
    }

    // Add mention
    parts.push({
      text: `@${mention.username}`,
      isMention: true,
      username: mention.username,
    });

    lastIndex = mention.endIndex;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      text: text.substring(lastIndex),
      isMention: false,
    });
  }

  return parts;
};

/**
 * Get mention suggestions based on input
 */
export const getMentionSuggestions = async (
  query: string,
  allUsers: User[],
): Promise<User[]> => {
  if (!query || query.length < 1) return [];

  const queryLower = query.toLowerCase();
  return allUsers
    .filter(
      (user) =>
        user.name.toLowerCase().includes(queryLower) ||
        user.flatNumber.toLowerCase().includes(queryLower),
    )
    .slice(0, 5); // Limit to 5 suggestions
};

/**
 * Insert mention at cursor position
 */
export const insertMention = (
  currentText: string,
  cursorPosition: number,
  username: string,
): { newText: string; newCursorPosition: number } => {
  // Find the @ symbol before the cursor
  let atIndex = cursorPosition - 1;
  while (atIndex >= 0 && currentText[atIndex] !== '@') {
    atIndex--;
  }

  if (atIndex >= 0 && currentText[atIndex] === '@') {
    // Replace from @ to cursor with the mention
    const beforeAt = currentText.substring(0, atIndex);
    const afterCursor = currentText.substring(cursorPosition);
    const mention = `@${username} `;

    const newText = beforeAt + mention + afterCursor;
    const newCursorPosition = atIndex + mention.length;

    return { newText, newCursorPosition };
  }

  // If no @ found, just insert at cursor
  const beforeCursor = currentText.substring(0, cursorPosition);
  const afterCursor = currentText.substring(cursorPosition);
  const mention = `@${username} `;

  const newText = beforeCursor + mention + afterCursor;
  const newCursorPosition = cursorPosition + mention.length;

  return { newText, newCursorPosition };
};

/**
 * Validate mentions in text (check if mentioned users exist)
 */
export const validateMentions = async (
  text: string,
  allUsers: User[],
): Promise<{
  validMentions: Mention[];
  invalidMentions: Mention[];
}> => {
  const mentions = extractMentions(text);
  const validMentions: Mention[] = [];
  const invalidMentions: Mention[] = [];

  mentions.forEach((mention) => {
    const user = allUsers.find(
      (u) =>
        u.name.toLowerCase().replace(/\s/g, '') ===
          mention.username.toLowerCase() ||
        u.flatNumber.toLowerCase().replace(/[^a-z0-9]/g, '') ===
          mention.username.toLowerCase(),
    );

    if (user) {
      validMentions.push({
        ...mention,
        displayName: user.name,
        flatNumber: user.flatNumber,
      });
    } else {
      invalidMentions.push(mention);
    }
  });

  return { validMentions, invalidMentions };
};
