import {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { CircleX, Download, Share2 } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

interface AptlyBottomSheetModalProps {
  ref: React.RefObject<BottomSheetModal>;
}

const AptlyBottomSheetModal = ({ ref }: AptlyBottomSheetModalProps) => {
  // ref
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  // renders
  return (
    <GestureHandlerRootView style={styles.container} testID="modal.bottom-sheet.container">
      <BottomSheetModalProvider>
        <BottomSheetModal
          ref={bottomSheetModalRef}
          onChange={handleSheetChanges}
          stackBehavior="push"
          containerStyle={{ zIndex: 2 }}
          snapPoints={['90%']}>
          <BottomSheetView style={styles.contentContainer} testID="modal.bottom-sheet.content">
            <View className="w-full px-4" testID="modal.bottom-sheet.wrapper">
              <View className="flex flex-row justify-between items-center pb-3" testID="modal.bottom-sheet.header">
                <View className="flex flex-row gap-2 items-center" testID="modal.bottom-sheet.visitor-info">
                  <Text className="text-2xl font-bold bg-accent_secondary text-white rounded-full flex items-center justify-center p-3" testID="modal.bottom-sheet.avatar">
                    {getLetters(selectedVisitor?.name as string)}
                  </Text>
                  <Text className="text-xl font-semibold" testID="modal.bottom-sheet.visitor-name">
                    {selectedVisitor?.name}
                  </Text>
                </View>
                <CircleX
                  size={24}
                  color="black"
                  strokeWidth={1.5}
                  onPress={() => bottomSheetModalRef.current?.dismiss()}
                  testID="modal.bottom-sheet.close-button"
                />
              </View>
              <View className="flex items-center justify-center">
                <Image
                  style={{ width: 250, height: 250 }}
                  source={require('../../../assets/images/QR_Code.png')}
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
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: 'grey',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
});

export default AptlyBottomSheetModal;
