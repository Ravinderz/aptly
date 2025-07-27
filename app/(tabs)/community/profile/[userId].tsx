import React, { useState, useEffect } from 'react';
import { ScrollView, SafeAreaView, View, Text, RefreshControl, ActivityIndicator } from 'react-native';
import { ArrowLeft, MessageSquare, Users, Calendar, MapPin } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '../../../../components/ui/Button';
import PostCard from '../../../../components/ui/PostCard';
import UserAvatar from '../../../../components/ui/UserAvatar';
import { Card } from '../../../../components/ui/Card';
import { Post, User } from '../../../../types/community';
import { communityApi } from '../../../../services/communityApi';
import { showErrorAlert } from '../../../../utils/alert';
import { formatTimeAgo } from '../../../../utils/community';

export default function UserProfile() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (userId) {
      loadUserProfile();
    }
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const [userData, postsData, currentUserData] = await Promise.all([
        communityApi.getUser(userId!),
        communityApi.getUserPosts(userId!),
        communityApi.getCurrentUser()
      ]);
      
      setUser(userData);
      setUserPosts(postsData);
      setCurrentUser(currentUserData);
    } catch (error) {
      console.error('Error loading user profile:', error);
      showErrorAlert('Error', 'Failed to load user profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserProfile();
    setRefreshing(false);
  };

  const handleLike = (postId: string, liked: boolean, likesCount: number) => {
    setUserPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isLikedByUser: liked, likesCount }
        : post
    ));
  };

  const handleComment = (postId: string) => {
    router.push(`/(tabs)/community/${postId}`);
  };

  const handleDeletePost = (postId: string) => {
    setUserPosts(prev => prev.filter(post => post.id !== postId));
  };

  const handleMentionPress = (mentionUserId: string) => {
    if (mentionUserId !== userId) {
      router.push(`/(tabs)/community/profile/${mentionUserId}`);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="text-text-secondary mt-4">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-row items-center p-4 border-b border-divider bg-surface">
          <Button
            variant="ghost"
            size="sm"
            onPress={() => router.back()}
            className="mr-2 p-2"
          >
            <ArrowLeft size={20} color="#6366f1" />
          </Button>
          <Text className="text-text-primary text-headline-large font-semibold">
            User Not Found
          </Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-text-secondary">This user profile could not be found.</Text>
          <Button onPress={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-divider bg-surface">
        <Button
          variant="ghost"
          size="sm"
          onPress={() => router.back()}
          className="mr-2 p-2"
        >
          <ArrowLeft size={20} color="#6366f1" />
        </Button>
        <Text className="text-text-primary text-headline-large font-semibold">
          Profile
        </Text>
      </View>

      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <Card className="m-4">
          <View className="items-center py-6">
            <UserAvatar name={user.name} size={80} />
            <Text className="text-text-primary text-display-small font-bold mt-4">
              {user.name}
            </Text>
            <View className="flex-row items-center mt-2">
              <MapPin size={16} color="#757575" />
              <Text className="text-text-secondary text-body-medium ml-1">
                Flat {user.flatNumber}
              </Text>
            </View>
            {user.joinedDate && (
              <View className="flex-row items-center mt-1">
                <Calendar size={16} color="#757575" />
                <Text className="text-text-secondary text-body-small ml-1">
                  Member since {formatTimeAgo(user.joinedDate)}
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Stats Cards */}
        <View className="flex-row mx-4 mb-4 gap-3">
          <Card className="flex-1 items-center p-4">
            <MessageSquare size={24} color="#6366f1" />
            <Text className="text-display-small font-bold text-text-primary mt-2">
              {userPosts.length}
            </Text>
            <Text className="text-text-secondary text-label-medium">
              Posts
            </Text>
          </Card>

          <Card className="flex-1 items-center p-4">
            <Users size={24} color="#4CAF50" />
            <Text className="text-display-small font-bold text-text-primary mt-2">
              {user.connectionsCount || 0}
            </Text>
            <Text className="text-text-secondary text-label-medium">
              Connections
            </Text>
          </Card>
        </View>

        {/* User&apos;s Posts */}
        <View className="px-4">
          <Text className="text-text-primary text-headline-small font-semibold mb-4">
            Recent Posts ({userPosts.length})
          </Text>

          {userPosts.length > 0 ? (
            userPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onComment={handleComment}
                onDelete={handleDeletePost}
                onMentionPress={handleMentionPress}
                showReadMore={true}
              />
            ))
          ) : (
            <Card className="items-center py-12">
              <MessageSquare size={48} color="#757575" />
              <Text className="text-text-primary text-headline-small font-semibold mt-4 mb-2">
                No Posts Yet
              </Text>
              <Text className="text-text-secondary text-center px-4">
                {user.name} hasn&apos;t shared any posts in the community yet.
              </Text>
            </Card>
          )}
        </View>

        {/* Additional Info */}
        {user.bio && (
          <Card className="m-4">
            <Text className="text-text-primary text-body-large font-semibold mb-2">
              About
            </Text>
            <Text className="text-text-secondary text-body-medium leading-5">
              {user.bio}
            </Text>
          </Card>
        )}

        {/* Contact Info (if available and user has permissions) */}
        {currentUser?.id === user.id && user.email && (
          <Card className="m-4">
            <Text className="text-text-primary text-body-large font-semibold mb-2">
              Contact Information
            </Text>
            <Text className="text-text-secondary text-body-medium">
              Email: {user.email}
            </Text>
            {user.phone && (
              <Text className="text-text-secondary text-body-medium">
                Phone: {user.phone}
              </Text>
            )}
          </Card>
        )}

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}