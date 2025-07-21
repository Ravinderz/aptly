import Header from "@/components/ui/Header";
import SectionHeading from "@/components/ui/SectionHeading";
import VisitorListItem from "@/components/ui/VisitorListItem";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { CircleX, Download, Plus, Share2 } from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Visitor = () => {
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

  const handleViewAll = (title: string) => {
    console.log("handleViewAll", title);
    router.push({
      pathname: "/(tabs)/visitor/visitorList",
      params: { title: title },
    });
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
    router.push("/(tabs)/visitor/addVisitor");
  };

  return (
    <>
      <View style={{ zIndex: 1, position: "absolute", right: 20, bottom: 20 }}>
        <TouchableOpacity
          className="bg-primary rounded-full p-4 shadow-lg shadow-primary/25"
          onPress={() => handleAddVisitor()}
        >
          <Plus size={24} color="white" strokeWidth={2} />
        </TouchableOpacity>
      </View>
      <Header>
        <GestureHandlerRootView style={{ flex: 1, zIndex: 0 }}>
          <BottomSheetModalProvider>
            <BottomSheetModal
              ref={bottomSheetModalRef}
              onChange={handleSheetChanges}
              stackBehavior="push"
              containerStyle={{ zIndex: 3, height: "100%" }}
              enablePanDownToClose={false}
              // snapPoints={["90%"]}
            >
              <BottomSheetView style={styles.contentContainer}>
                <View className="w-full px-4">
                  <View className="flex flex-row justify-between items-center pb-3 ">
                    <View className="flex flex-row gap-2 items-center ">
                      <Text className="text-2xl font-bold bg-primary text-white rounded-full flex items-center justify-center p-3">
                        {getLetters(selectedVisitor?.name as string)}
                      </Text>
                      <Text className="text-headline-large font-semibold text-text-primary">
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
                      <Text className="text-body-large font-medium text-text-secondary">
                        {selectedVisitor?.date}
                      </Text>
                      <Text className="text-body-large font-medium text-text-secondary">
                        {selectedVisitor?.time}
                      </Text>
                    </View>
                    <Text className="text-headline-medium font-medium text-text-secondary">
                      {selectedVisitor?.status}
                    </Text>
                  </View>
                  <View className="flex flex-row justify-around my-6">
                    <TouchableOpacity className="flex flex-row gap-2 justify-center items-center bg-primary h-16 w-36 rounded-lg">
                      <Share2 size={24} color="white" strokeWidth={1.5} />
                      <Text className="text-white text-body-large font-semibold">
                        Share
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex flex-row gap-2 justify-center items-center bg-surface border border-divider h-16 w-36 rounded-lg">
                      <Download size={24} color="#6366f1" strokeWidth={1.5} />
                      <Text className="text-primary text-body-large font-semibold">
                        Download
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </BottomSheetView>
            </BottomSheetModal>
          </BottomSheetModalProvider>
          <View>
            <SectionHeading
              heading="Upcoming Visitors"
              handleViewAll={() => handleViewAll("Upcoming Visitors")}
            />
            <ScrollView
              contentContainerStyle={{
                padding: 2,
              }}
              scrollEventThrottle={16}
            >
              <VisitorListItem
                name="Nishant"
                date="Today"
                time="10:00 AM"
                type="upcoming"
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
                type="upcoming"
                handleClick={(name: any, date: any, time: any, status: any) =>
                  handlePresentModalPress(
                    "Amazon Delivery",
                    "Today",
                    "10:00 AM",
                    "Approved"
                  )
                }
              />
              <VisitorListItem
                name="Blinkit Delivery"
                date="Today"
                time="11:00 AM"
                status="Pending"
                type="upcoming"
                handleClick={(name: any, date: any, time: any, status: any) =>
                  handlePresentModalPress(
                    "Blinkit Delivery",
                    "Today",
                    "10:00 AM",
                    "Pending"
                  )
                }
              />
            </ScrollView>
          </View>
          <View className="mt-2">
            <SectionHeading
              heading="Past Visitors"
              handleViewAll={() => handleViewAll("Past Visitors")}
            />
            <ScrollView
              contentContainerStyle={{
                padding: 2,
              }}
              scrollEventThrottle={16}
            >
              <VisitorListItem
                name="Nishant"
                date="Today"
                time="10:00 AM"
                status="Pre-approved"
                type="past"
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
                type="past"
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
    </>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    width: "100%",
    zIndex: 1,
  },
});

export default Visitor;
