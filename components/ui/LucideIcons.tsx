import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Archive,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  // Analytics & Charts
  BarChart3,
  // Communication
  Bell,
  // Business & Services
  BookUser,
  BriefcaseBusiness,
  Building,
  // Time & Calendar
  Calendar,
  Camera,
  Car,
  Check,
  CheckCircle,
  ChevronDown,
  // Navigation & Actions
  ChevronRight,
  ChevronUp,
  Clock,
  CreditCard,
  Download,
  Eye,
  File,
  // Documents & Files
  FileText,
  Filter,
  Fingerprint,
  Fuel,
  Gavel,
  Gear,
  Heart,
  HelpCircle,
  Home,
  Image,
  Info,
  Key,
  KeyRound,
  Lock,
  Mail,
  // Location & Transport
  MapPin,
  Megaphone,
  MessageCircle,
  PhoneCall,
  PieChart,
  Plus,
  PlusCircle,
  Receipt,
  Refresh,
  // Additional icons needed
  RefreshCw,
  // Utilities
  Search,
  // System & Settings
  Settings,
  Shield,
  ShieldCheck,
  Smartphone,
  Star,
  Timer,
  Trash2,
  TrendingDown,
  TrendingUp,
  Upload,
  // Users & People
  User,
  UserPlus,
  Users,
  // Voting & Governance
  Vote,
  Wifi,
  Wrench,
  X,
  XCircle,
  Zap,
} from 'lucide-react-native';

// Comprehensive icon mapping from Ionicons to Lucide equivalents
export type IconName =
  // Navigation
  | 'chevron-forward'
  | 'chevron-down-outline'
  | 'chevron-up-outline'
  | 'arrow-up-circle-outline'
  | 'arrow-down-circle-outline'
  | 'arrow-left'

  // Actions
  | 'add-circle'
  | 'close'
  | 'checkmark-circle'
  | 'checkmark-circle-outline'
  | 'close-circle'
  | 'alert-circle'
  | 'warning'
  | 'warning-outline'
  | 'information-circle'
  | 'download-outline'
  | 'cloud-upload-outline'

  // Business
  | 'person-outline'
  | 'people-outline'
  | 'person-add-outline'
  | 'business-outline'
  | 'call-outline'
  | 'build'
  | 'receipt-outline'
  | 'card-outline'
  | 'storefront-outline'
  | 'shield-outline'
  | 'key-outline'
  | 'bookUser'
  | 'wrench'
  | 'briefcaseBusiness'
  | 'phoneCall'

  // Analytics
  | 'analytics-outline'
  | 'trending-up'
  | 'trending-down'
  | 'pie-chart-outline'
  | 'pulse-outline'
  | 'eye-outline'

  // Time
  | 'calendar-outline'
  | 'time-outline'
  | 'timer-outline'

  // Communication
  | 'notifications-outline'
  | 'chatbubble-outline'
  | 'megaphone-outline'
  | 'heart'

  // Documents
  | 'document-outline'
  | 'document-text-outline'
  | 'folder-outline'
  | 'archive-outline'

  // Users
  | 'person'
  | 'people'
  | 'star'
  | 'star-outline'

  // System
  | 'settings-outline'
  | 'cog-outline'
  | 'refresh'
  | 'lock-closed-outline'

  // Location
  | 'location-outline'
  | 'car-outline'
  | 'home-outline'

  // Voting
  | 'ballot-outline'
  | 'hammer-outline'

  // Utilities
  | 'search-outline'
  | 'filter-outline'
  | 'camera-outline'
  | 'image-outline'
  | 'trash-outline'
  | 'refresh-cw'
  | 'plus-circle'
  | 'shield-check'

  // Help & Support
  | 'help-circle-outline'
  | 'mail-outline'
  | 'logo-whatsapp'
  | 'build-outline'

  // Common icons
  | 'smartphone'
  | 'building'
  | 'zap'
  | 'fingerprint'
  | 'fuel'
  | 'wifi'
  | 'heart-outline'
  | 'userPlus'
  | 'users'
  | 'check'
  | 'shield'
  | 'key-round'
  | 'chevron-right'
  | 'search';

interface IconProps {
  name: IconName;
  color?: string;
  size?: number;
}

const LucideIcons = ({ name, color = '#000', size = 24 }: IconProps) => {
  const iconMap: Record<IconName, any> = {
    // Navigation
    'chevron-forward': ChevronRight,
    'chevron-down-outline': ChevronDown,
    'chevron-up-outline': ChevronUp,
    'arrow-up-circle-outline': ArrowUp,
    'arrow-down-circle-outline': ArrowDown,
    'arrow-left': ArrowLeft,

    // Actions
    'add-circle': Plus,
    close: X,
    'checkmark-circle': CheckCircle,
    'checkmark-circle-outline': CheckCircle,
    'close-circle': XCircle,
    'alert-circle': AlertCircle,
    warning: AlertTriangle,
    'warning-outline': AlertTriangle,
    'information-circle': Info,
    'download-outline': Download,
    'cloud-upload-outline': Upload,

    // Business
    'person-outline': User,
    'people-outline': Users,
    'person-add-outline': UserPlus,
    'business-outline': BriefcaseBusiness,
    'call-outline': PhoneCall,
    build: Wrench,
    'receipt-outline': Receipt,
    'card-outline': CreditCard,
    'storefront-outline': Building,
    'shield-outline': Shield,
    'key-outline': Key,
    bookUser: BookUser,
    wrench: Wrench,
    briefcaseBusiness: BriefcaseBusiness,
    phoneCall: PhoneCall,

    // Analytics
    'analytics-outline': BarChart3,
    'trending-up': TrendingUp,
    'trending-down': TrendingDown,
    'pie-chart-outline': PieChart,
    'pulse-outline': Activity,
    'eye-outline': Eye,

    // Time
    'calendar-outline': Calendar,
    'time-outline': Clock,
    'timer-outline': Timer,

    // Communication
    'notifications-outline': Bell,
    'chatbubble-outline': MessageCircle,
    'megaphone-outline': Megaphone,
    heart: Heart,

    // Documents
    'document-outline': File,
    'document-text-outline': FileText,
    'folder-outline': Archive,
    'archive-outline': Archive,

    // Users
    person: User,
    people: Users,
    star: Star,
    'star-outline': Star,
    users: Users,

    // System
    'settings-outline': Settings,
    'cog-outline': Gear,
    refresh: Refresh,
    'lock-closed-outline': Lock,

    // Location
    'location-outline': MapPin,
    'car-outline': Car,
    'home-outline': Home,

    // Voting
    'ballot-outline': Vote,
    'hammer-outline': Gavel,

    // Utilities
    'search-outline': Search,
    'filter-outline': Filter,
    'camera-outline': Camera,
    'image-outline': Image,
    'trash-outline': Trash2,
    'refresh-cw': RefreshCw,
    'plus-circle': PlusCircle,
    'shield-check': ShieldCheck,

    // Help & Support
    'help-circle-outline': HelpCircle,
    'mail-outline': Mail,
    'logo-whatsapp': MessageCircle, // WhatsApp not available in Lucide, using MessageCircle as fallback
    'build-outline': Wrench,

    // Common icons
    smartphone: Smartphone,
    building: Building,
    zap: Zap,
    fingerprint: Fingerprint,
    fuel: Fuel,
    wifi: Wifi,
    check: Check,
    'heart-outline': Heart,
    userPlus: UserPlus,
    shield: Shield,
    'key-round': KeyRound, // Using Key as a fallback for key-round
    'chevron-right': ChevronRight,
    search: Search, // Using Search as a fallback for search-outline
  };

  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in LucideIcons mapping`);
    return <Info color={color} size={size} />; // Fallback icon
  }

  return <IconComponent color={color} size={size} />;
};

export default LucideIcons;
