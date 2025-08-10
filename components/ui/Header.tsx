import { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { TabHeader } from './headers';

interface HeaderProps {
  children: ReactNode;
  onNotificationPress?: () => void;
  onHelpPress?: () => void;
  notificationCount?: number;
  testID?: string;
}

const Header = ({
  children,
  onNotificationPress,
  onHelpPress,
  notificationCount = 3, // Mock notification count - replace with real data
  testID,
}: HeaderProps) => {
  return (
    <View className="flex flex-1" testID={testID}>
      <TabHeader
        onNotificationPress={onNotificationPress}
        onHelpPress={onHelpPress}
        notificationCount={notificationCount}
        testID={testID ? `${testID}.header` : undefined}
      />
      <ScrollView
        className="flex flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        testID={testID ? `${testID}.scroll` : undefined}>
        <View className="flex h-full px-4 py-4 mb-8 bg-background" testID={testID ? `${testID}.content` : undefined}>
          {children}
        </View>
      </ScrollView>
    </View>
  );
};

export default Header;
