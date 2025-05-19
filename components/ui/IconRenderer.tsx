import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const IconMapping = {
  home: "home-outline",
  community: "home-city-outline",
  services: "design-services",
  settings: "settings",
  notifications: "bell-ring-outline",
  messages: "message-processing-outline",
  visitor: "people-alt",
  add: "add-circle-outline",
  "visitor-add": "person-add-alt-1",
  "service-add": "build-circle",
  "maintenance-add": "home-repair-service",
  "compliant-add": "phone-in-talk",
  alert_icons: {
    general: "add-alert",
    alert_circle: "alert-circle-outline",
    garbage: "delete-alert",
    fire: "fire-alert",
    electricity: "flash-alert",
    security: "shield-alert",
    water: "water-alert",
  },
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
  const getName = (name: string) => {
    if (name.split(".")[0] === "alert_icons") {
      return IconMapping[name.split(".")[0]][name.split(".")[1]];
    }
    return IconMapping[name];
  };

  switch (type) {
    case "material":
      return (
        <MaterialIcons
          color={color}
          size={size}
          name={getName(name)}
          style={style}
        />
      );
    case "material-community":
      return (
        <MaterialCommunityIcons
          name={getName(name)}
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
          name={getName(name)}
          style={style}
        />
      );
  }
}
