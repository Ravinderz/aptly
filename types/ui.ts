// UI component type definitions

import { ReactNode } from 'react';
import { StyleProp, ViewStyle, TextStyle, ImageStyle } from 'react-native';

// Base component props
export interface BaseComponentProps {
  testID?: string;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
}

// Button component types
export interface ButtonProps extends BaseComponentProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

// Input component types
export interface InputProps extends BaseComponentProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  helper?: string;
  required?: boolean;
  disabled?: boolean;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

// Card component types
export interface CardProps extends BaseComponentProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

// Modal component types
export interface ModalProps extends BaseComponentProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  position?: 'center' | 'bottom';
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
  animationType?: 'slide' | 'fade';
  style?: StyleProp<ViewStyle>;
}

// Alert component types
export interface AlertProps extends BaseComponentProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  visible: boolean;
  onClose?: () => void;
  actions?: AlertAction[];
  autoClose?: boolean;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}

export interface AlertAction {
  title: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

// Loading component types
export interface LoadingProps extends BaseComponentProps {
  size?: 'small' | 'large';
  color?: string;
  overlay?: boolean;
  text?: string;
  style?: StyleProp<ViewStyle>;
}

// Avatar component types
export interface AvatarProps extends BaseComponentProps {
  source?: { uri: string } | number;
  name?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  shape?: 'circle' | 'square';
  onPress?: () => void;
  style?: StyleProp<ImageStyle>;
}

// Badge component types
export interface BadgeProps extends BaseComponentProps {
  count?: number;
  text?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium';
  showZero?: boolean;
  max?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

// Tab component types
export interface TabItem {
  key: string;
  title: string;
  icon?: string;
  badge?: number;
  disabled?: boolean;
}

export interface TabsProps extends BaseComponentProps {
  items: TabItem[];
  activeKey: string;
  onTabPress: (key: string) => void;
  variant?: 'default' | 'segmented';
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
}

// List component types
export interface ListItemProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
  description?: string;
  leftIcon?: string;
  rightIcon?: string;
  avatar?: AvatarProps;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  selected?: boolean;
  divider?: boolean;
  style?: StyleProp<ViewStyle>;
}

export interface SectionListData<T> {
  title: string;
  data: T[];
  key?: string;
}

// Picker component types
export interface PickerItem {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface PickerProps extends BaseComponentProps {
  items: PickerItem[];
  selectedValue?: string | number;
  onValueChange: (value: string | number) => void;
  placeholder?: string;
  searchable?: boolean;
  multiple?: boolean;
  error?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

// Switch component types
export interface SwitchProps extends BaseComponentProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  trackColor?: { false?: string; true?: string };
  thumbColor?: string;
  style?: StyleProp<ViewStyle>;
}

// Checkbox component types
export interface CheckboxProps extends BaseComponentProps {
  checked: boolean;
  onPress: () => void;
  label?: string;
  disabled?: boolean;
  indeterminate?: boolean;
  color?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

// Radio button component types
export interface RadioOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface RadioGroupProps extends BaseComponentProps {
  options: RadioOption[];
  selectedValue?: string | number;
  onValueChange: (value: string | number) => void;
  direction?: 'vertical' | 'horizontal';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

// Toast component types
export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top' | 'bottom';
  action?: {
    label: string;
    onPress: () => void;
  };
}

// Navigation types
export interface NavigationItem {
  key: string;
  title: string;
  icon?: string;
  badge?: number;
  onPress: () => void;
  disabled?: boolean;
}

export interface BottomNavigationProps extends BaseComponentProps {
  items: NavigationItem[];
  activeKey: string;
  style?: StyleProp<ViewStyle>;
}

// Form component types
export interface FormFieldProps extends BaseComponentProps {
  name: string;
  label?: string;
  required?: boolean;
  error?: string;
  helper?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export interface FormProps extends BaseComponentProps {
  children: ReactNode;
  onSubmit: (data: any) => void;
  validationSchema?: any;
  initialValues?: any;
  style?: StyleProp<ViewStyle>;
}

// Search component types
export interface SearchProps extends BaseComponentProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSearch: (query: string) => void;
  onClear?: () => void;
  showSuggestions?: boolean;
  suggestions?: string[];
  onSuggestionPress?: (suggestion: string) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

// Calendar component types
export interface CalendarDay {
  date: string;
  disabled?: boolean;
  marked?: boolean;
  selected?: boolean;
  events?: CalendarEvent[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  time?: string;
  color?: string;
}

export interface CalendarProps extends BaseComponentProps {
  selectedDate?: string;
  onDateSelect: (date: string) => void;
  markedDates?: { [date: string]: CalendarDay };
  minDate?: string;
  maxDate?: string;
  showEvents?: boolean;
  theme?: 'light' | 'dark';
  style?: StyleProp<ViewStyle>;
}

// Progress component types
export interface ProgressProps extends BaseComponentProps {
  progress: number; // 0 to 1
  color?: string;
  backgroundColor?: string;
  height?: number;
  animated?: boolean;
  showPercentage?: boolean;
  style?: StyleProp<ViewStyle>;
}

// Divider component types
export interface DividerProps extends BaseComponentProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
  color?: string;
  margin?: number;
  style?: StyleProp<ViewStyle>;
}

// Image component types
export interface ImageProps extends BaseComponentProps {
  source: { uri: string } | number;
  width?: number;
  height?: number;
  aspectRatio?: number;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  borderRadius?: number;
  placeholder?: ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  style?: StyleProp<ImageStyle>;
}

// Stepper component types
export interface StepperStep {
  title: string;
  description?: string;
  completed?: boolean;
  active?: boolean;
  disabled?: boolean;
}

export interface StepperProps extends BaseComponentProps {
  steps: StepperStep[];
  currentStep: number;
  onStepPress?: (step: number) => void;
  orientation?: 'horizontal' | 'vertical';
  style?: StyleProp<ViewStyle>;
}

// Theme types
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

export interface Typography {
  displayLarge: TextStyle;
  displayMedium: TextStyle;
  displaySmall: TextStyle;
  headlineLarge: TextStyle;
  headlineMedium: TextStyle;
  headlineSmall: TextStyle;
  bodyLarge: TextStyle;
  bodyMedium: TextStyle;
  bodySmall: TextStyle;
  labelLarge: TextStyle;
  labelMedium: TextStyle;
  labelSmall: TextStyle;
}

export interface Theme {
  colors: ThemeColors;
  typography: Typography;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  shadows: {
    sm: ViewStyle;
    md: ViewStyle;
    lg: ViewStyle;
  };
}

// Animation types
export interface AnimationProps {
  duration?: number;
  delay?: number;
  easing?: 'linear' | 'ease' | 'easeIn' | 'easeOut' | 'easeInOut';
  loop?: boolean;
  autoplay?: boolean;
}

// Gesture types
export interface GestureConfig {
  swipeThreshold?: number;
  velocityThreshold?: number;
  directionalOffsetThreshold?: number;
  gestureIsClickThreshold?: number;
}
