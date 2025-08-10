import { Text, TouchableOpacity } from 'react-native';

const LinkButton = ({
  label,
  handleViewAll,
  testID,
}: {
  label: string;
  handleViewAll: () => void;
  testID?: string;
}) => {
  return (
    <TouchableOpacity onPress={handleViewAll} testID={testID}>
      <Text className="text-label-large font-semibold text-primary">
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default LinkButton;
