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
      className="bg-surface border border-divider rounded-xl p-4 mb-4 shadow-sm shadow-black/5"
    >
      <View className="flex flex-row justify-between gap-4">
        <View className="flex gap-3">
          <View className="flex flex-row gap-3 items-center">
            {/* <IconRenderer name="visitor" size={40} color="black" /> */}
            <UserAvatar name={name} />
            <Text className="text-headline-medium font-semibold text-text-primary">{name}</Text>
          </View>
          <View className="flex mt-1">
            <View className="flex flex-row gap-2 items-center px-1">
              <Clock size={16} color="#757575" strokeWidth={1.5} />
              <Text className="text-body-medium text-text-secondary">
                {date}, {time}
              </Text>
            </View>
          </View>
        </View>
        <View className="flex gap-4 items-end">
          <Text
            className={`text-label-large font-medium rounded-full ${
              status === "Rejected"
                ? "bg-error/10 text-error"
                : status === "Approved" || status === "Pre-Approved" || status === "Pre-approved"
                ? "bg-secondary/10 text-secondary"
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
        <View className="flex flex-row space-x-2 gap-4 mt-4">
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

              <Text className="text-label-large font-semibold text-white text-center">
                {status === "Approved" || status === "Pre-approved"
                  ? "Reschedule"
                  : "Approve"}
              </Text>
            </TouchableOpacity>
          </View>
          <View className="flex-1">
            <TouchableOpacity
              className="py-3 rounded-lg border border-divider w-full flex flex-row items-center justify-center gap-2"
              onPress={handleClick}
            >
              {status === "Approved" || status === "Pre-approved" ? (
                <List size={16} color="#757575" strokeWidth={2} />
              ) : (
                <X size={16} color="#757575" strokeWidth={2} />
              )}
              <Text className="text-label-large font-semibold text-text-secondary text-center">
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
