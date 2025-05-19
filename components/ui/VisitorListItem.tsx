import { CircleArrowRight } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface VisitorListItemProps {
  name: string;
  date: string;
  time: string;
  status: string;
  handleClick?: any;
}

const VisitorListItem: React.FC<VisitorListItemProps> = ({
  name,
  date,
  time,
  status,
  handleClick,
}) => {
  const getLetters = (str: string) => {
    const parts = str.split(" ");
    if (parts.length > 1) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return `${str.charAt(0)}${str.charAt(0)}`.toUpperCase();
  };

  return (
    <View
      className="flex flex-row justify-between gap-4 bg-white rounded-lg p-4"
      style={{ elevation: 2 }}
    >
      <View className="flex gap-2">
        <View className="flex flex-row gap-2 items-center">
          {/* <IconRenderer name="visitor" size={40} color="black" /> */}
          <Text className="text-2xl font-bold bg-sky-900 text-white rounded-full flex items-center justify-center p-3">
            {getLetters(name)}
          </Text>
          <Text className="text-xl font-semibold">{name}</Text>
        </View>
        <View className="flex">
          <Text className="text-sm font-medium text-zinc-500">
            Time: {time}
          </Text>
          <Text className="text-sm font-medium text-zinc-500">
            Date: {date}
          </Text>
        </View>
      </View>
      <View className="flex  gap-4 items-end">
        <Text
          className={`text-md font-medium rounded-lg ${
            status === "Rejected" ? "bg-[#df493d] text-white" : "bg-[#fed0b5]"
          } p-4 w-36 text-center`}
        >
          {status}
        </Text>
        <TouchableOpacity onPress={handleClick}>
          <CircleArrowRight color="#0c4a6e" strokeWidth={1.5} size={30} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default VisitorListItem;
