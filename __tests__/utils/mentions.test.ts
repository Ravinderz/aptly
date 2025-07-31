import {
  extractMentions,
  formatTextWithMentions,
  getMentionSuggestions,
  insertMention,
  validateMentions,
  Mention,
} from '../../utils/mentions';
import { User } from '../../types/community';

// Mock users for testing
const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'resident',
    flatNumber: 'A-101',
    avatar: 'avatar1.jpg',
  },
  {
    id: 'user-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'committee',
    flatNumber: 'B-202',
    avatar: 'avatar2.jpg',
  },
  {
    id: 'user-3',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    role: 'resident',
    flatNumber: 'C-303',
    avatar: 'avatar3.jpg',
  },
  {
    id: 'user-4',
    name: 'Alice Brown',
    email: 'alice@example.com',
    role: 'admin',
    flatNumber: 'D-404',
    avatar: 'avatar4.jpg',
  },
];

describe('Mentions Utilities', () => {
  describe('extractMentions', () => {
    test('should extract single mention from text', () => {
      const text = 'Hello @john, how are you?';
      const mentions = extractMentions(text);

      expect(mentions).toHaveLength(1);
      expect(mentions[0]).toMatchObject({
        username: 'john',
        displayName: 'john',
        startIndex: 6,
        endIndex: 11,
      });
      expect(mentions[0].id).toBeDefined();
      expect(mentions[0].flatNumber).toBe('');
    });

    test('should extract multiple mentions from text', () => {
      const text = 'Hey @john and @jane, lets meet @bob';
      const mentions = extractMentions(text);

      expect(mentions).toHaveLength(3);
      expect(mentions[0].username).toBe('john');
      expect(mentions[0].startIndex).toBe(4);
      expect(mentions[0].endIndex).toBe(9);

      expect(mentions[1].username).toBe('jane');
      expect(mentions[1].startIndex).toBe(14);
      expect(mentions[1].endIndex).toBe(19);

      expect(mentions[2].username).toBe('bob');
      expect(mentions[2].startIndex).toBe(31);
      expect(mentions[2].endIndex).toBe(35);
    });

    test('should handle text with no mentions', () => {
      const text = 'Hello everyone, this is a regular message';
      const mentions = extractMentions(text);

      expect(mentions).toHaveLength(0);
    });

    test('should handle empty text', () => {
      const mentions = extractMentions('');
      expect(mentions).toHaveLength(0);
    });

    test('should handle @ symbol without username', () => {
      const text = 'Email me @ this address';
      const mentions = extractMentions(text);
      expect(mentions).toHaveLength(0);
    });

    test('should extract mentions with numbers and underscores', () => {
      const text = 'Contact @user123 and @admin_user for help';
      const mentions = extractMentions(text);

      expect(mentions).toHaveLength(2);
      expect(mentions[0].username).toBe('user123');
      expect(mentions[1].username).toBe('admin_user');
    });

    test('should not extract mentions with special characters', () => {
      const text = 'Check @user-name or @user.name';
      const mentions = extractMentions(text);

      expect(mentions).toHaveLength(2);
      expect(mentions[0].username).toBe('user'); // Stops at hyphen
      expect(mentions[1].username).toBe('user'); // Stops at dot
    });

    test('should handle mentions at start and end of text', () => {
      const text = '@start middle @end';
      const mentions = extractMentions(text);

      expect(mentions).toHaveLength(2);
      expect(mentions[0].username).toBe('start');
      expect(mentions[0].startIndex).toBe(0);
      expect(mentions[1].username).toBe('end');
      expect(mentions[1].endIndex).toBe(18);
    });
  });

  describe('formatTextWithMentions', () => {
    test('should format text with single mention', () => {
      const text = 'Hello @john, how are you?';
      const parts = formatTextWithMentions(text);

      expect(parts).toHaveLength(3);
      expect(parts[0]).toEqual({ text: 'Hello ', isMention: false });
      expect(parts[1]).toEqual({
        text: '@john',
        isMention: true,
        username: 'john',
      });
      expect(parts[2]).toEqual({ text: ', how are you?', isMention: false });
    });

    test('should format text with multiple mentions', () => {
      const text = 'Hey @john and @jane';
      const parts = formatTextWithMentions(text);

      expect(parts).toHaveLength(4); // No trailing empty string
      expect(parts[0]).toEqual({ text: 'Hey ', isMention: false });
      expect(parts[1]).toEqual({
        text: '@john',
        isMention: true,
        username: 'john',
      });
      expect(parts[2]).toEqual({ text: ' and ', isMention: false });
      expect(parts[3]).toEqual({
        text: '@jane',
        isMention: true,
        username: 'jane',
      });
    });

    test('should handle text with no mentions', () => {
      const text = 'Hello everyone';
      const parts = formatTextWithMentions(text);

      expect(parts).toHaveLength(1);
      expect(parts[0]).toEqual({ text: 'Hello everyone', isMention: false });
    });

    test('should handle empty text', () => {
      const parts = formatTextWithMentions('');
      expect(parts).toHaveLength(1);
      expect(parts[0]).toEqual({ text: '', isMention: false });
    });

    test('should handle text starting with mention', () => {
      const text = '@john hello';
      const parts = formatTextWithMentions(text);

      expect(parts).toHaveLength(2);
      expect(parts[0]).toEqual({
        text: '@john',
        isMention: true,
        username: 'john',
      });
      expect(parts[1]).toEqual({ text: ' hello', isMention: false });
    });

    test('should handle text ending with mention', () => {
      const text = 'Hello @john';
      const parts = formatTextWithMentions(text);

      expect(parts).toHaveLength(2);
      expect(parts[0]).toEqual({ text: 'Hello ', isMention: false });
      expect(parts[1]).toEqual({
        text: '@john',
        isMention: true,
        username: 'john',
      });
    });

    test('should handle consecutive mentions', () => {
      const text = '@john@jane';
      const parts = formatTextWithMentions(text);

      expect(parts).toHaveLength(2);
      expect(parts[0]).toEqual({
        text: '@john',
        isMention: true,
        username: 'john',
      });
      expect(parts[1]).toEqual({
        text: '@jane',
        isMention: true,
        username: 'jane',
      });
    });
  });

  describe('getMentionSuggestions', () => {
    test('should return suggestions based on name', async () => {
      const suggestions = await getMentionSuggestions('john', mockUsers);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].name).toBe('John Doe');
    });

    test('should return suggestions based on flat number', async () => {
      const suggestions = await getMentionSuggestions('A-101', mockUsers);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].flatNumber).toBe('A-101');
    });

    test('should be case insensitive', async () => {
      const suggestions = await getMentionSuggestions('JANE', mockUsers);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].name).toBe('Jane Smith');
    });

    test('should return multiple matches', async () => {
      const suggestions = await getMentionSuggestions('o', mockUsers); // Matches John, Bob, Brown

      expect(suggestions.length).toBeGreaterThan(1);
      const names = suggestions.map((u) => u.name);
      expect(names).toContain('John Doe');
      expect(names).toContain('Bob Wilson');
      expect(names).toContain('Alice Brown');
    });

    test('should limit results to 5', async () => {
      // Create more users to test limit
      const manyUsers = Array.from({ length: 10 }, (_, i) => ({
        id: `user-${i}`,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        role: 'resident' as const,
        flatNumber: `A-${i}`,
        avatar: `avatar${i}.jpg`,
      }));

      const suggestions = await getMentionSuggestions('user', manyUsers);
      expect(suggestions).toHaveLength(5);
    });

    test('should return empty array for empty query', async () => {
      const suggestions = await getMentionSuggestions('', mockUsers);
      expect(suggestions).toHaveLength(0);
    });

    test('should return empty array for short query', async () => {
      const suggestions = await getMentionSuggestions('', mockUsers);
      expect(suggestions).toHaveLength(0);
    });

    test('should return empty array for no matches', async () => {
      const suggestions = await getMentionSuggestions('xyz123', mockUsers);
      expect(suggestions).toHaveLength(0);
    });

    test('should handle partial matches in flat numbers', async () => {
      const suggestions = await getMentionSuggestions('202', mockUsers);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].flatNumber).toBe('B-202');
    });
  });

  describe('insertMention', () => {
    test('should insert mention after @ symbol', () => {
      const text = 'Hello @j world';
      const result = insertMention(text, 8, 'john');

      expect(result.newText).toBe('Hello @john  world');
      expect(result.newCursorPosition).toBe(12);
    });

    test('should replace partial mention after @', () => {
      const text = 'Hello @jo world';
      const result = insertMention(text, 9, 'john');

      expect(result.newText).toBe('Hello @john  world');
      expect(result.newCursorPosition).toBe(12);
    });

    test('should insert mention at cursor when no @ found', () => {
      const text = 'Hello world';
      const result = insertMention(text, 5, 'john');

      expect(result.newText).toBe('Hello@john  world');
      expect(result.newCursorPosition).toBe(11);
    });

    test('should handle insertion at start of text', () => {
      const text = '@j rest of text';
      const result = insertMention(text, 2, 'john');

      expect(result.newText).toBe('@john  rest of text');
      expect(result.newCursorPosition).toBe(6);
    });

    test('should handle insertion at end of text', () => {
      const text = 'Text ends with @j';
      const result = insertMention(text, 17, 'john');

      expect(result.newText).toBe('Text ends with @john ');
      expect(result.newCursorPosition).toBe(21);
    });

    test('should handle empty text', () => {
      const result = insertMention('', 0, 'john');

      expect(result.newText).toBe('@john ');
      expect(result.newCursorPosition).toBe(6);
    });

    test('should handle multiple @ symbols', () => {
      const text = 'Hello @jane and @j world';
      const result = insertMention(text, 18, 'john');

      expect(result.newText).toBe('Hello @jane and @john  world');
      expect(result.newCursorPosition).toBe(22);
    });

    test('should handle @ at the very beginning', () => {
      const text = '@';
      const result = insertMention(text, 1, 'john');

      expect(result.newText).toBe('@john ');
      expect(result.newCursorPosition).toBe(6);
    });

    test('should not find @ when cursor is before it', () => {
      const text = 'Hello @john';
      const result = insertMention(text, 3, 'jane'); // Cursor before @

      expect(result.newText).toBe('Hel@jane lo @john');
      expect(result.newCursorPosition).toBe(9);
    });
  });

  describe('validateMentions', () => {
    test('should validate mentions against user database', async () => {
      const text = 'Hello @johndoe and @janesmith';
      const result = await validateMentions(text, mockUsers);

      expect(result.validMentions).toHaveLength(2); // Both names match when spaces removed
      expect(result.invalidMentions).toHaveLength(0);
      expect(result.validMentions[0].displayName).toBe('John Doe');
      expect(result.validMentions[1].displayName).toBe('Jane Smith');
    });

    test('should identify valid and invalid mentions', async () => {
      const text = 'Hello @johndoe and @unknown';
      const result = await validateMentions(text, mockUsers);

      expect(result.validMentions).toHaveLength(1);
      expect(result.invalidMentions).toHaveLength(1);
      expect(result.validMentions[0].displayName).toBe('John Doe');
      expect(result.invalidMentions[0].username).toBe('unknown');
    });

    test('should match by name (spaces removed)', async () => {
      const text = 'Hello @johndoe';
      const result = await validateMentions(text, mockUsers);

      expect(result.validMentions).toHaveLength(1);
      expect(result.validMentions[0].displayName).toBe('John Doe');
      expect(result.validMentions[0].flatNumber).toBe('A-101');
    });

    test('should match by flat number (special chars removed)', async () => {
      const text = 'Hello @a101';
      const result = await validateMentions(text, mockUsers);

      expect(result.validMentions).toHaveLength(1);
      expect(result.validMentions[0].displayName).toBe('John Doe');
      expect(result.validMentions[0].flatNumber).toBe('A-101');
    });

    test('should be case insensitive', async () => {
      const text = 'Hello @JOHNDOE and @B202';
      const result = await validateMentions(text, mockUsers);

      expect(result.validMentions).toHaveLength(2);
      expect(result.validMentions[0].displayName).toBe('John Doe');
      expect(result.validMentions[1].displayName).toBe('Jane Smith');
    });

    test('should handle text with no mentions', async () => {
      const text = 'Hello everyone';
      const result = await validateMentions(text, mockUsers);

      expect(result.validMentions).toHaveLength(0);
      expect(result.invalidMentions).toHaveLength(0);
    });

    test('should handle all invalid mentions', async () => {
      const text = 'Hello @unknown and @invalid';
      const result = await validateMentions(text, mockUsers);

      expect(result.validMentions).toHaveLength(0);
      expect(result.invalidMentions).toHaveLength(2);
      expect(result.invalidMentions[0].username).toBe('unknown');
      expect(result.invalidMentions[1].username).toBe('invalid');
    });

    test('should handle all valid mentions', async () => {
      const text = 'Hello @johndoe and @a101';
      const result = await validateMentions(text, mockUsers);

      expect(result.validMentions).toHaveLength(2);
      expect(result.invalidMentions).toHaveLength(0);
      // Both should match John Doe - once by name, once by flat
      expect(result.validMentions[0].displayName).toBe('John Doe');
      expect(result.validMentions[1].displayName).toBe('John Doe');
    });

    test('should handle empty user list', async () => {
      const text = 'Hello @john';
      const result = await validateMentions(text, []);

      expect(result.validMentions).toHaveLength(0);
      expect(result.invalidMentions).toHaveLength(1);
      expect(result.invalidMentions[0].username).toBe('john');
    });

    test('should handle complex flat number matching', async () => {
      const text = 'Contact @c303 and @d404';
      const result = await validateMentions(text, mockUsers);

      expect(result.validMentions).toHaveLength(2);
      expect(result.validMentions[0].displayName).toBe('Bob Wilson');
      expect(result.validMentions[1].displayName).toBe('Alice Brown');
    });
  });
});
