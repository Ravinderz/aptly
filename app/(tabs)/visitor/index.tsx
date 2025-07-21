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
      <View style={{ zIndex: 1, position: "absolute", right: 24, bottom: 24 }}>
        <TouchableOpacity
          className="bg-primary rounded-full w-14 h-14 items-center justify-center shadow-lg shadow-primary/25"
          onPress={() => handleAddVisitor()}
        >
          <Plus size={20} color="white" strokeWidth={2} />
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
                <View className="w-full px-6">
                  <View className="flex-row justify-between items-center pb-6">
                    <View className="flex-row items-center">
                      <View className="bg-primary rounded-full w-12 h-12 items-center justify-center mr-3">
                        <Text className="text-white font-bold text-body-medium">
                          {getLetters(selectedVisitor?.name as string)}
                        </Text>
                      </View>
                      <Text className="text-headline-large font-semibold text-text-primary">
                        {selectedVisitor?.name}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => bottomSheetModalRef.current?.dismiss()}
                      className="p-2"
                    >
                      <CircleX size={20} color="#757575" strokeWidth={1.5} />
                    </TouchableOpacity>
                  </View>
                  <View className="items-center justify-center mb-6">
                    <Image
                      style={{ width: 200, height: 200 }}
                      source={require("../../../assets/images/QR_Code.png")}
                      contentFit="cover"
                      transition={1000}
                    />
                  </View>
                  <View className="items-center mb-8">
                    <View className="flex-row items-center mb-2">
                      <Text className="text-body-large font-medium text-text-secondary mr-2">
                        {selectedVisitor?.date}
                      </Text>
                      <Text className="text-body-large font-medium text-text-secondary">
                        {selectedVisitor?.time}
                      </Text>
                    </View>
                    <View className={`px-3 py-1 rounded-full ${
                      selectedVisitor?.status === 'Pre-approved' ? 'bg-success/10' : 'bg-primary/10'
                    }`}>
                      <Text className={`text-body-medium font-medium ${
                        selectedVisitor?.status === 'Pre-approved' ? 'text-success' : 'text-primary'
                      }`}>
                        {selectedVisitor?.status}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row justify-between gap-4">
                    <TouchableOpacity className="flex-1 flex-row items-center justify-center bg-primary py-4 rounded-xl">
                      <Share2 size={16} color="white" strokeWidth={1.5} />
                      <Text className="text-white text-body-medium font-semibold ml-2">
                        Share QR
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 flex-row items-center justify-center bg-surface border border-divider py-4 rounded-xl">
                      <Download size={16} color="#6366f1" strokeWidth={1.5} />
                      <Text className="text-primary text-body-medium font-semibold ml-2">
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
