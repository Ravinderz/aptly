import { Colors } from "@/constants/Colors";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Swiper from "react-native-swiper";

const slides = [
  {
    key: "slide1",
    title: "Seamless access approval",
    text: "approve visitors, house help, delivery persons with ease",
    image: require("../assets/images/onboarding1.png"), // Ensure your image paths are correct
  },
  {
    key: "slide2",
    title: "Get instant help",
    text: "Need help with your apartment? Get instant help from our contact directory",
    image: require("../assets/images/onboarding2.png"),
  },
  {
    key: "slide3",
    title: "Build a happy community",
    text: "form connections, build friendships, and create a sense of belonging",
    image: require("../assets/images/onboarding3.png"),
  },
];

const initBiometricAuth = () => {
  LocalAuthentication.hasHardwareAsync().then((hasHardware) => {
    if (hasHardware) {
      LocalAuthentication.isEnrolledAsync().then(
        (isEnrolled) => {
          if (isEnrolled) {
            console.log("Biometric Auth is supported and enrolled");
          } else {
            console.log("Biometric Auth is supported but not enrolled");
          }
        },
        (error) => {
          console.log("Biometric Auth is not supported");
        }
      );
    } else {
      console.log("Biometric Auth is not supported");
    }
  });
};

const Onboarding = () => {
  const router = useRouter();

  const handleButtonPress = () => {
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <TouchableOpacity onPress={() => handleButtonPress()}>
          <Text style={styles.skipBtnText}>Skip</Text>
        </TouchableOpacity>
      </View>
      <Swiper loop={false} activeDotColor={Colors.primary}>
        <View key={slides[0].key} style={styles.slide}>
          <Image source={slides[0].image} style={styles.image2} />
          <Text style={styles.title}>{slides[0].title}</Text>
          <Text style={styles.text}>{slides[0].text}</Text>
        </View>
        <View key={slides[1].key} style={styles.slide}>
          <Image source={slides[1].image} style={styles.image} />
          <Text style={styles.title}>{slides[1].title}</Text>
          <Text style={styles.text}>{slides[1].text}</Text>
        </View>
        <View key={slides[2].key} style={styles.slide}>
          <Image source={slides[2].image} style={styles.image2} />
          <Text style={styles.title}>{slides[2].title}</Text>
          <Text style={styles.text}>{slides[2].text}</Text>
          <View>
            <TouchableOpacity
              style={styles.startBtn}
              onPress={() => handleButtonPress()}
            >
              <Text style={styles.startBtnText}>Start</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Swiper>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  slide: {
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 60,
  },
  image2: {
    width: 300,
    height: 300,
    marginBottom: 60,
    resizeMode: "contain",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
    textAlign: "center",
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#007aff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  skipBtnText: {
    color: Colors.secondary,
    fontSize: 14,
    marginTop: 20,
    marginRight: 20,
    fontWeight: "600",
    display: "flex",
    alignSelf: "flex-end",
  },
  startBtn: {
    marginTop: 80,
    backgroundColor: Colors.primary,
    paddingHorizontal: 80,
    paddingVertical: 10,
    borderRadius: 40,
  },
  startBtnText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Onboarding;
