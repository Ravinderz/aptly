import { Clock } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface VisitorListItemProps {
  name: string;
  date: string;
  time: string;
  status: string;
  type?: "past" | "upcoming";
  handleClick?: any;
}

const VisitorListItem: React.FC<VisitorListItemProps> = ({
  name,
  date,
  time,
  status,
  type,
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
      className=" bg-white border border-border-color rounded-lg p-4"
      style={{ elevation: 0.25 }}
    >
      <View className="flex flex-row justify-between gap-4">
        <View className="flex gap-2">
          <View className="flex flex-row gap-3 items-center">
            {/* <IconRenderer name="visitor" size={40} color="black" /> */}
            <Text className="text-xl font-bold bg-primary/10 text-primary rounded-full flex items-center justify-center p-3">
              {getLetters(name)}
            </Text>
            <Text className="text-lg font-medium">{name}</Text>
          </View>
          <View className="flex mt-1">
            <Text className="text-sm font-medium text-zinc-500">
              <View className="flex flex-row gap-2 items-center px-1">
                <Clock size={20} color="#6b7280" strokeWidth={1.5} />
                <Text className="text-md text-gray-500">
                  {date} {time}
                </Text>
              </View>
            </Text>
          </View>
        </View>
        <View className="flex gap-4 items-end">
          <Text
            className={`text-md font-medium rounded-lg ${
              status === "Rejected"
                ? "bg-[#df493d]/10 text-[#df493d]"
                : status === "Approved" || status === "Pre-Approved"
                ? "bg-[#4caf50]/10 text-[#4caf50]"
                : "bg-primary/10 text-primary"
            } px-3 py-2 text-center`}
          >
            {status}
          </Text>
          {/* {type === "past" && (
            <TouchableOpacity onPress={handleClick}>
              <CircleArrowRight color="#0c4a6e" strokeWidth={1.5} size={30} />
            </TouchableOpacity>
          )} */}
        </View>
      </View>
      {type !== "past" && (
        <View className="flex flex-row space-x-2 gap-4 mt-3">
          <TouchableOpacity
            className="py-3 bg-primary rounded-lg w-48"
            onPress={handleClick}
          >
            <Text className="text-md font-semibold text-white text-center">
              {status === "Approved" || status === "Pre-approved"
                ? "Reschedule"
                : "Approve"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="py-3 rounded-lg border border-border-color w-48"
            onPress={handleClick}
          >
            <Text className="text-md font-semibold text-grey-500 text-center">
              {status === "Approved" || status === "Pre-approved"
                ? "View Details"
                : "Deny"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default VisitorListItem;
