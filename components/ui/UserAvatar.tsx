import React from "react";
import { Text } from "react-native";

const UserAvatar = ({ name }: { name: string }) => {
  const getLetters = (name: string) => {
    const names = name.split(" ");
    if (names.length > 1) {
      return names[0][0] + names[1][0];
    }
    return names[0][0];
  };

  return (
    <Text className="text-headline-medium font-bold bg-primary/10 text-primary rounded-full flex items-center justify-center p-3">
      {getLetters(name)}
    </Text>
  );
};

export default UserAvatar;
