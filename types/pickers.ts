export interface DatePickerConfig {
  allowPastDates: boolean;
  maxDaysInAdvance: number;
  restrictedDates?: Date[];
  presets: DatePreset[];
}

export interface TimePickerConfig {
  format: '12' | '24';
  interval: number;
  restrictedHours?: {
    start: string;
    end: string;
  };
  presets: TimePreset[];
}

export interface DatePreset {
  label: string;
  value: Date;
  icon?: React.ReactNode;
}

export interface TimePreset {
  label: string;
  value: string;
  period: 'morning' | 'afternoon' | 'evening';
}

export interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  selectedDate?: Date;
  minDate?: Date;
  maxDate?: Date;
  allowPastDates?: boolean;
  maxDaysInAdvance?: number;
  showPresets?: boolean;
  presetOptions?: DatePreset[];
  title?: string;
}

export interface TimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTime: (time: string) => void;
  selectedTime?: string;
  minTime?: string;
  maxTime?: string;
  timeInterval?: number; // minutes
  format?: '12' | '24';
  restrictedHours?: { start: string; end: string };
  showPresets?: boolean;
  title?: string;
}

export interface DateTimeInputProps {
  type: 'date' | 'time';
  value?: string;
  onPress: () => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  label?: string;
}
