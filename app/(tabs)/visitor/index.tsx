import Header from "@/components/ui/Header";
import { IconRenderer } from "@/components/ui/IconRenderer";
import SectionHeading from "@/components/ui/SectionHeading";
import VisitorListItem from "@/components/ui/VisitorListItem";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { CircleX, Download, Share2 } from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const visitor = () => {
  const router = useRouter();

  const [selectedVisitor, setSelectedVisitor] = useState<{
    name: string;
    date: string;
    time: string;
    status: string;
  } | null>(null);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const getLetters = (str: string) => {
    const parts = str ? str.split(" ") : "A A";
    if (parts?.length > 1) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return `${str.charAt(0)}${str.charAt(0)}`.toUpperCase();
  };

  const handlePresentModalPress = useCallback(
    (name: any, date: any, time: any, status: any) => {
      console.log("handlePresentModalPress", name, date, time, status);
      setSelectedVisitor({ name, date, time, status });
      bottomSheetModalRef.current?.present();
    },
    []
  );
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const handleAddVisitor = () => {
    console.log("handleAddVisitor");
    // Navigate to the add visitor screen
    // navigation.navigate("addVisitor");
    router.push("/(tabs)/visitor/addVisitor");
  };

  return (
    <Header>
      <View className="my-6">
        <TouchableOpacity
          className="flex flex-row gap-4 justify-center items-center bg-primary h-20 rounded-xl p-4 border-2 border-primary-dark"
          onPress={() => handleAddVisitor()}
        >
          <IconRenderer name="add" size={32} color="black" />
          <Text className="text-lg font-bold">Add Visitor</Text>
        </TouchableOpacity>
      </View>
      <GestureHandlerRootView>
        <BottomSheetModalProvider>
          <BottomSheetModal
            ref={bottomSheetModalRef}
            onChange={handleSheetChanges}
            stackBehavior="push"
            containerStyle={{ zIndex: 2 }}
            snapPoints={["90%"]}
          >
            <BottomSheetView style={styles.contentContainer}>
              <View className="w-full px-4">
                <View className="flex flex-row justify-between items-center pb-3 ">
                  <View className="flex flex-row gap-2 items-center ">
                    <Text className="text-2xl font-bold bg-accent_secondary text-white rounded-full flex items-center justify-center p-3">
                      {getLetters(selectedVisitor?.name as string)}
                    </Text>
                    <Text className="text-xl font-semibold">
                      {selectedVisitor?.name}
                    </Text>
                  </View>
                  <CircleX
                    size={24}
                    color="black"
                    strokeWidth={1.5}
                    onPress={() => bottomSheetModalRef.current?.dismiss()}
                  />
                </View>
                <View className="flex items-center justify-center">
                  <Image
                    style={{ width: 250, height: 250 }}
                    source={require("../../../assets/images/QR_Code.png")}
                    contentFit="cover"
                    transition={1000}
                  />
                </View>
                <View className="flex items-center gap-2">
                  <View className="flex flex-row gap-2">
                    <Text className="text-xl font-medium text-zinc-500">
                      {selectedVisitor?.date}
                    </Text>
                    <Text className="text-xl font-medium text-zinc-500">
                      {selectedVisitor?.time}
                    </Text>
                  </View>
                  <Text className="text-lg font-medium text-zinc-500">
                    {selectedVisitor?.status}
                  </Text>
                </View>
                <View className="flex flex-row justify-around my-6">
                  <TouchableOpacity className="flex flex-row gap-2 justify-center items-center bg-neutral h-16 w-36  rounded-lg">
                    <Share2 size={24} color="white" strokeWidth={1.5} />
                    <Text className="text-white text-md font-semibold">
                      Share
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex flex-row gap-2 justify-center items-center bg-neutral h-16 w-36 rounded-lg">
                    <Download size={24} color="white" strokeWidth={1.5} />
                    <Text className="text-white text-md font-semibold">
                      Download
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BottomSheetView>
          </BottomSheetModal>
        </BottomSheetModalProvider>
        <View>
          <SectionHeading heading="Upcoming Visitors" />
          <ScrollView
            contentContainerStyle={{
              gap: 8,
              padding: 2,
            }}
            scrollEventThrottle={16}
          >
            <VisitorListItem
              name="Nishant"
              date="Today"
              time="10:00 AM"
              status="Pre-approved"
              handleClick={(name: any, date: any, time: any, status: any) =>
                handlePresentModalPress(
                  "Nishant",
                  "Today",
                  "10:00 AM",
                  "Pre-approved"
                )
              }
            />
            <VisitorListItem
              name="Amazon Delivery"
              date="Today"
              time="11:00 AM"
              status="Approved"
              handleClick={(name: any, date: any, time: any, status: any) =>
                handlePresentModalPress(
                  "Amazon Delivery",
                  "Today",
                  "10:00 AM",
                  "Approved"
                )
              }
            />
          </ScrollView>
        </View>
        <View className="mt-6">
          <SectionHeading heading="Past Visitors" />
          <ScrollView
            contentContainerStyle={{
              gap: 8,
              padding: 2,
            }}
            scrollEventThrottle={16}
          >
            <VisitorListItem
              name="Nishant"
              date="Today"
              time="10:00 AM"
              status="Pre-approved"
              handleClick={(name: any, date: any, time: any, status: any) =>
                handlePresentModalPress(
                  "Nishant",
                  "Today",
                  "10:00 AM",
                  "Pre-approved"
                )
              }
            />
            <VisitorListItem
              name="Blinkit Delivery"
              date="Today"
              time="09:00 AM"
              status="Rejected"
              handleClick={(name: any, date: any, time: any, status: any) =>
                handlePresentModalPress(
                  "Blibkit Delivery",
                  "Today",
                  "10:00 AM",
                  "Rejected"
                )
              }
            />
          </ScrollView>
        </View>
      </GestureHandlerRootView>
    </Header>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    width: "100%",
    zIndex: 1,
  },
});

export default visitor;
