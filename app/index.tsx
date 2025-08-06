import { Text, View } from 'react-native';

function Index() {
  // return <Welcome />;
  return (
    <View>
      <Text>Welcome to Aptly</Text>
    </View>
  );
}

// Add proper named export with displayName for React DevTools
Index.displayName = 'Index';

export default Index;
