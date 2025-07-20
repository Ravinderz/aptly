import { Heart, MessageSquareText } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";
import UserAvatar from "./UserAvatar";

const PostCard = () => {
  return (
    <View
      id="post-card-main-container"
      className="bg-white border border-border-color rounded-lg p-4 mb-2"
    >
      <View
        id="post-card-header"
        className="flex flex-row justify-between gap-4"
      >
        <View
          id="post-card-header-left"
          className="flex flex-row gap-3 items-center"
        >
          <UserAvatar name="John Doe" />
          <View id="post-card-header-left-text" className="flex flex-col gap-1">
            <Text className="text-md font-semibold">John Doe</Text>
            <Text className="text-sm text-gray-400">
              Flat #401 | Announcement
            </Text>
          </View>
        </View>
        <View id="post-card-header-right">
          <Text className="text-sm text-gray-400">2h ago</Text>
        </View>
      </View>
      <View
        id="post-card-content"
        className="flex flex-col gap-2 mt-2 border-b border-border-color pb-4"
        style={{ maxHeight: 200 }}
      >
        <Text className="text-sm font-normal text-gray-700">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
          facilisi. Vestibulum ante ipsum primis in faucibus orci luctus et
          ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet
          aliquam vel, ullamcorper sit amet ligula.
        </Text>
      </View>
      <View
        id="post-card-footer"
        className="flex flex-row justify-between items-center mt-2"
      >
        <View className="flex flex-row gap-2 items-center">
          <MessageSquareText size={16} color="#6b7280" strokeWidth={2} />
          <Text className="text-sm font-medium text-gray-500">2 comments</Text>
        </View>
        <View className="flex flex-row gap-2 items-center">
          <Heart size={16} color="#6b7280" strokeWidth={2} />
          <Text className="text-sm font-medium text-gray-500">2 likes</Text>
        </View>
      </View>
    </View>
  );
};

export default PostCard;
