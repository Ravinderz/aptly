import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import { Post, MAX_POST_LENGTH } from '@/types/community';
import { communityApi } from '@/services/communityApi';
import { validatePostContent, canEditPost } from '@/utils/community';
import ImagePicker from '@/components/ui/ImagePicker';
import { showErrorAlert, showSuccessAlert } from '@/utils/alert';

export default function EditPost() {
  const router = useRouter();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  
  const [post, setPost] = useState<Post | null>(null);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId, loadPost]);

  const loadPost = useCallback(async () => {
    try {
      setLoading(true);
      const posts = await communityApi.getPosts();
      const foundPost = posts.find(p => p.id === postId);
      
      if (!foundPost) {
        showErrorAlert('Error', 'Post not found', () => router.back());
        return;
      }

      const currentUser = await communityApi.getCurrentUser();
      if (!canEditPost(foundPost, currentUser.id)) {
        showErrorAlert('Error', 'You can only edit your own posts within 30 minutes of posting', () => router.back());
        return;
      }

      setPost(foundPost);
      setContent(foundPost.content);
      setImageUrl(foundPost.imageUrl);
    } catch (error) {
      console.error('Error loading post:', error);
      showErrorAlert('Error', 'Failed to load post. Please try again.', () => router.back());
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const handleSave = async () => {
    if (saving || !post) return;

    const validation = validatePostContent(content, MAX_POST_LENGTH);
    if (!validation.isValid) {
      showErrorAlert('Invalid Post', validation.error);
      return;
    }

    try {
      setSaving(true);
      
      // In a real app, this would be an API call to update the post
      // For now, we'll simulate the update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showSuccessAlert('Success', 'Post updated successfully!', () => router.back());
    } catch (error) {
      console.error('Error updating post:', error);
      showErrorAlert('Error', 'Failed to update post. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelected = (uri: string) => {
    setImageUrl(uri);
  };

  const handleImageRemoved = () => {
    setImageUrl(undefined);
  };

  const hasChanges = content !== post?.content || imageUrl !== post?.imageUrl;
  const characterCount = content.length;
  const isNearLimit = characterCount > MAX_POST_LENGTH * 0.8;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-row items-center px-6 py-4 border-b border-divider">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color="#212121" />
          </TouchableOpacity>
          <Text className="text-headline-large font-bold text-text-primary">Edit Post</Text>
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
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color="#212121" />
          </TouchableOpacity>
          <Text className="text-headline-large font-bold text-text-primary">Edit Post</Text>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-headline-large font-semibold text-text-primary mb-2">Cannot Edit Post</Text>
          <Text className="text-text-secondary text-center">
            This post cannot be edited or may no longer be available.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-divider">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color="#212121" />
          </TouchableOpacity>
          <Text className="text-headline-large font-bold text-text-primary">Edit Post</Text>
        </View>
        
        <TouchableOpacity
          onPress={handleSave}
          disabled={!hasChanges || saving || characterCount > MAX_POST_LENGTH || !content.trim()}
          className={`flex-row items-center px-4 py-2 rounded-xl ${
            hasChanges && !saving && characterCount <= MAX_POST_LENGTH && content.trim()
              ? 'bg-primary' 
              : 'bg-text-secondary/20'
          }`}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Check size={16} color={hasChanges && characterCount <= MAX_POST_LENGTH && content.trim() ? "white" : "#757575"} />
          )}
          <Text className={`ml-2 font-semibold ${
            hasChanges && !saving && characterCount <= MAX_POST_LENGTH && content.trim()
              ? 'text-white' 
              : 'text-text-secondary'
          }`}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          className="flex-1 px-6 py-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 50 }}
        >
          {/* Edit Notice */}
          <View className="bg-warning/10 border border-warning/20 rounded-2xl p-4 mb-6">
            <Text className="text-warning font-semibold mb-2">Editing Post</Text>
            <Text className="text-text-secondary text-body-medium">
              You can edit your post within 30 minutes of posting. After that, the edit option will no longer be available.
            </Text>
          </View>

          {/* Post Content Editor */}
          <View className="bg-surface border border-divider rounded-2xl p-5">
            <TextInput
              placeholder="What do you want to share with your community?"
              cursorColor="#6366f1"
              className="w-full min-h-[100px] p-0 text-text-primary text-base leading-6"
              placeholderTextColor="#757575"
              multiline={true}
              textAlignVertical="top"
              value={content}
              onChangeText={setContent}
              maxLength={MAX_POST_LENGTH}
              editable={!saving}
            />
            
            {/* Image Upload */}
            <ImagePicker
              onImageSelected={handleImageSelected}
              onImageRemoved={handleImageRemoved}
              selectedImage={imageUrl}
              disabled={saving}
            />
            
            {/* Character count */}
            <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-divider">
              <Text className={`text-body-medium ${isNearLimit ? 'text-warning' : 'text-text-secondary'}`}>
                {characterCount}/{MAX_POST_LENGTH}
              </Text>
              
              {hasChanges && (
                <Text className="text-success text-body-medium font-medium">
                  • Unsaved changes
                </Text>
              )}
            </View>
          </View>

          {/* Post Preview */}
          <View className="mt-6">
            <Text className="text-headline-medium font-semibold text-text-primary mb-4">Preview</Text>
            <View className="bg-surface rounded-2xl p-5 border border-divider">
              <View className="flex-row items-center mb-4">
                <View className="bg-primary/10 rounded-full w-10 h-10 items-center justify-center mr-3">
                  <Text className="text-primary font-bold text-body-medium">
                    {post.userName.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <View>
                  <Text className="font-semibold text-text-primary">{post.userName}</Text>
                  <Text className="text-text-secondary text-body-medium">Flat {post.flatNumber}</Text>
                </View>
              </View>
              
              {content.trim() ? (
                <Text className="text-text-primary leading-6 mb-3">{content}</Text>
              ) : (
                <Text className="text-text-secondary italic leading-6 mb-3">
                  Your post content will appear here...
                </Text>
              )}
              
              {imageUrl && (
                <View className="rounded-xl overflow-hidden mb-3">
                  <View className="bg-primary/5 h-32 items-center justify-center">
                    <Text className="text-text-secondary">Image Preview</Text>
                  </View>
                </View>
              )}
              
              <View className="flex-row items-center justify-between pt-3 border-t border-divider">
                <Text className="text-text-secondary text-body-medium">0 comments</Text>
                <Text className="text-text-secondary text-body-medium">{post.likesCount} likes</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}