import {
  BookUser,
  BriefcaseBusiness,
  PhoneCall,
  UserPlus,
  Wrench,
} from "lucide-react-native";

interface IconProps {
  name: "userPlus" | "bookUser" | "wrench" | "phoneCall" | "briefcaseBusiness";
  color?: string;
  size?: number;
}

const LucideIcons = ({ name, color, size }: IconProps) => {
  const icons = {
    userPlus: UserPlus,
    bookUser: BookUser,
    wrench: Wrench,
    phoneCall: PhoneCall,
    briefcaseBusiness: BriefcaseBusiness,
  };

  const LucideIcon = icons[name];

  return <LucideIcon color={color} size={size} />;
};

export default LucideIcons;
