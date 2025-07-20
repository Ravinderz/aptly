import { CalendarDays, Check, Clock, List, X } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import UserAvatar from "./UserAvatar";

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
      className=" bg-white border border-border-color rounded-lg p-4 mb-2"
      style={{ elevation: 0.25 }}
    >
      <View className="flex flex-row justify-between gap-4">
        <View className="flex gap-2">
          <View className="flex flex-row gap-3 items-center">
            {/* <IconRenderer name="visitor" size={40} color="black" /> */}
            <UserAvatar name={name} />
            <Text className="text-md font-medium">{name}</Text>
          </View>
          <View className="flex mt-1">
            <Text className="text-sm font-medium text-zinc-500">
              <View className="flex flex-row gap-2 items-center px-1">
                <Clock size={16} color="#6b7280" strokeWidth={1.5} />
                <Text className="text-sm text-gray-500">
                  {date}, {time}
                </Text>
              </View>
            </Text>
          </View>
        </View>
        <View className="flex gap-4 items-end">
          <Text
            className={`text-sm font-medium rounded-full ${
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
          <View className="flex-1">
            <TouchableOpacity
              className="py-3 bg-primary rounded-lg flex flex-row w-full items-center justify-center gap-2"
              onPress={handleClick}
            >
              {status === "Approved" || status === "Pre-approved" ? (
                <CalendarDays size={16} color="#fff" strokeWidth={2} />
              ) : (
                <Check size={16} color="#fff" strokeWidth={2} />
              )}

              <Text className="text-sm font-semibold text-white text-center">
                {status === "Approved" || status === "Pre-approved"
                  ? "Reschedule"
                  : "Approve"}
              </Text>
            </TouchableOpacity>
          </View>
          <View className="flex-1">
            <TouchableOpacity
              className="py-3 rounded-lg border border-border-color w-full flex flex-row items-center justify-center gap-2"
              onPress={handleClick}
            >
              {status === "Approved" || status === "Pre-approved" ? (
                <List size={16} color="#6b7280" strokeWidth={2} />
              ) : (
                <X size={16} color="#6b7280" strokeWidth={2} />
              )}
              <Text className="text-sm font-semibold text-grey-500 text-center">
                {status === "Approved" || status === "Pre-approved"
                  ? "View Details"
                  : "Deny"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default VisitorListItem;
