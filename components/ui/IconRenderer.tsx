import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const IconMapping = {
  home: "home-outline",
  community: "home-city-outline",
  services: "design-services",
  settings: "settings",
};

export function IconRenderer({
  name,
  size = 24,
  color,
  style,
  type,
}: {
  name: string;
  size?: number;
  color: string;
  style?: any;
  weight?: string;
  type?: string;
}) {
  switch (type) {
    case "material":
      return (
        <MaterialIcons
          color={color}
          size={size}
          name={IconMapping[name]}
          style={style}
        />
      );
    case "material-community":
      return (
        <MaterialCommunityIcons
          name={IconMapping[name]}
          size={size}
          color={color}
          style={style}
        />
      );
    default:
      return (
        <MaterialIcons
          color={color}
          size={size}
          name={IconMapping[name]}
          style={style}
        />
      );
  }
}
