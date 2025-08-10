import AptlySearchBar from '@/components/ui/AptlySearchBar';
import Header from '@/components/ui/Header';
import ImagePicker from '@/components/ui/ImagePicker';
import MentionInput from '@/components/ui/MentionInput';
import PillFilter from '@/components/ui/PillFilter';
import PostCard from '@/components/ui/PostCard';
import { communityApi } from '@/services/communityApi';
import {
    CATEGORY_FILTERS,
    CategoryType,
    MAX_POST_LENGTH,
    Post,
    User,
} from '@/types/community';
import { showErrorAlert, showSuccessAlert } from '@/utils/alert';
import { filterPosts, validatePostContent } from '@/utils/community';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState<string | undefined>();
  // const [postCategory, setPostCategory] = useState<CategoryType>('feedback');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Load initial data
  useEffect(() => {
    loadCommunityData();
  }, []);

  // Filter posts when dependencies change
  useEffect(() => {
    const filtered = filterPosts(
      posts,
      selectedFilter,
      searchQuery,
      currentUser?.id,
    );
    setFilteredPosts(filtered);
  }, [posts, selectedFilter, searchQuery, currentUser]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!loading) {
        refreshPosts();
      }
    }, [loading]),
  );

  const loadCommunityData = async () => {
    try {
      setLoading(true);
      const [user, postsData] = await Promise.all([
        communityApi.getCurrentUser(),
        communityApi.getPosts(),
      ]);
      setCurrentUser(user);
      setPosts(postsData);

      // Load all users for mentions (you could also create a getAllUsers method in the API)
      const allUserIds = ['user1', 'user2', 'user3', 'user4', 'user5'];
      const allUsers = await Promise.all(
        allUserIds.map((id) => communityApi.getUser(id)),
      );
      setAllUsers(allUsers.filter((u) => u !== null) as User[]);
    } catch (error) {
      console.error('Error loading community data:', error);
      showErrorAlert(
        'Error',
        'Failed to load community posts. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshPosts = async () => {
    try {
      setRefreshing(true);
      const postsData = await communityApi.getPosts();
      setPosts(postsData);
    } catch (error) {
      console.error('Error refreshing posts:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubmitPost = async () => {
    if (isSubmittingPost) return;

    const validation = validatePostContent(postContent, MAX_POST_LENGTH);
    if (!validation.isValid) {
      showErrorAlert('Invalid Post', validation.error);
      return;
    }

    try {
      setIsSubmittingPost(true);
      const newPost = await communityApi.createPost({
        content: postContent,
        category: 'feedback',
        imageUrl: postImage,
      });

      setPosts((prev) => [newPost, ...prev]);
      setPostContent('');
      setPostImage(undefined);
      showSuccessAlert(
        'Success',
        'Your post has been shared with the community!',
      );
    } catch (error) {
      console.error('Error creating post:', error);
      showErrorAlert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleLike = (postId: string, liked: boolean, likesCount: number) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, isLikedByUser: liked, likesCount }
          : post,
      ),
    );
  };

  const handleComment = (postId: string) => {
    router.push(`/(tabs)/community/${postId}`);
  };

  const handleDelete = (postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
    showSuccessAlert('Success', 'Post deleted successfully.');
  };

  const handleFilterSelect = (category: CategoryType) => {
    setSelectedFilter(category);
  };

  const handleSearch = () => {
    // Search is handled automatically through useEffect
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const getFilterCounts = () => {
    const counts: Record<CategoryType, number> = {} as Record<
      CategoryType,
      number
    >;

    CATEGORY_FILTERS.forEach((filter) => {
      if (filter.key === 'all') {
        counts[filter.key] = posts.length;
      } else if (filter.key === 'my_posts') {
        counts[filter.key] = posts.filter(
          (p) => p.userId === currentUser?.id,
        ).length;
      } else {
        counts[filter.key] = posts.filter(
          (p) => p.category === filter.key,
        ).length;
      }
    });

    return counts;
  };

  const characterCount = postContent.length;
  const isNearLimit = characterCount > MAX_POST_LENGTH * 0.8;
  const filterCounts = getFilterCounts();

  const handleImageSelected = (uri: string) => {
    setPostImage(uri);
  };

  const handleImageRemoved = () => {
    setPostImage(undefined);
  };
  if (loading) {
    return (
      <Header>
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="text-text-secondary mt-4">
            Loading community posts...
          </Text>
        </View>
      </Header>
    );
  }

  return (
    <Header testID="community.screen">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        testID="community.keyboard-view">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshPosts}
              colors={['#6366f1']}
              tintColor={'#6366f1'}
            />
          }
          contentContainerStyle={{ paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
          overScrollMode="always"
          nestedScrollEnabled={false}
          testID="community.scroll">
          {/* Post Creation Section */}
          <View className="mb-6" testID="community.post-creation">
            <View className="bg-surface border border-divider rounded-2xl p-5" testID="community.post-creation.container">
              <MentionInput
                placeholder="What do you want to share with your community?"
                className="w-full min-h-[80px] p-0 text-text-primary text-base leading-6"
                multiline={true}
                textAlignVertical="top"
                value={postContent}
                onChangeText={setPostContent}
                maxLength={MAX_POST_LENGTH}
                users={allUsers}
                disabled={isSubmittingPost}
                testID="community.post-creation.input"
              />

              {/* Image Upload */}
              <ImagePicker
                onImageSelected={handleImageSelected}
                onImageRemoved={handleImageRemoved}
                selectedImage={postImage}
                disabled={isSubmittingPost}
              />

              {/* Character count */}
              <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-divider">
                <Text
                  className={`text-sm ${isNearLimit ? 'text-warning' : 'text-text-secondary'}`}>
                  {characterCount}/{MAX_POST_LENGTH}
                </Text>

                <TouchableOpacity
                  onPress={handleSubmitPost}
                  disabled={
                    (!postContent.trim() && !postImage) ||
                    isSubmittingPost ||
                    characterCount > MAX_POST_LENGTH
                  }
                  className={`px-6 py-2 rounded-xl flex-row items-center gap-2 ${
                    (!postContent.trim() && !postImage) ||
                    isSubmittingPost ||
                    characterCount > MAX_POST_LENGTH
                      ? 'bg-text-secondary/20'
                      : 'bg-primary'
                  }`}
                  testID="community.post-creation.share-button">
                  {isSubmittingPost ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : null}
                  <Text
                    className={`font-semibold ${
                      (!postContent.trim() && !postImage) ||
                      isSubmittingPost ||
                      characterCount > MAX_POST_LENGTH
                        ? 'text-text-secondary'
                        : 'text-white'
                    }`}>
                    {isSubmittingPost ? 'Posting...' : 'Share'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Search and Filters */}
          <View className="mb-4" testID="community.search-filters">
            <AptlySearchBar
              placeholder="Search community posts..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSearch={handleSearch}
              onClear={handleClearSearch}
              testID="community.search-bar"
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-4"
              contentContainerStyle={{ paddingHorizontal: 4, gap: 8 }}
              nestedScrollEnabled={false}
              scrollEventThrottle={1}
              testID="community.filters">
              {CATEGORY_FILTERS.map((filter) => (
                <PillFilter
                  key={filter.key}
                  label={filter.label}
                  category={filter.key}
                  isActive={selectedFilter === filter.key}
                  count={filterCounts[filter.key]}
                  onPress={handleFilterSelect}
                  testID={`community.filter.${filter.key}`}
                />
              ))}
            </ScrollView>
          </View>

          {/* Posts List */}
          <FlatList
            data={filteredPosts}
            keyExtractor={(item) => item.id}
            renderItem={({ item: post }) => (
              <PostCard
                post={post}
                onLike={handleLike}
                onComment={handleComment}
                onDelete={handleDelete}
                testID={`community.post.${post.id}`}
              />
            )}
            scrollEnabled={false}
            testID="community.posts-list"
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-16 min-h-[200px]" testID="community.empty-state">
                <Text className="text-xl font-semibold text-text-primary mb-2">
                  {searchQuery
                    ? 'No posts found'
                    : selectedFilter === 'my_posts'
                      ? 'No posts yet'
                      : 'No community posts'}
                </Text>
                <Text className="text-text-secondary text-center leading-6 px-8">
                  {searchQuery
                    ? 'Try adjusting your search terms or browse all posts.'
                    : selectedFilter === 'my_posts'
                      ? 'Start sharing with your community by creating your first post above.'
                      : 'Be the first to start a conversation in your community!'}
                </Text>
              </View>
            }
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Header>
  );
}
