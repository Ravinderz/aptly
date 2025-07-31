import {
  DatePickerConfig,
  TimePickerConfig,
  DatePreset,
  TimePreset,
} from '@/types/pickers';
import { addDays, getNextWeekend } from './dateUtils';
import { Calendar, Clock, Sun, Sunset, Moon } from 'lucide-react-native';

// Visitor form configuration (restricted for residents)
export const visitorDateConfig: DatePickerConfig = {
  allowPastDates: false,
  maxDaysInAdvance: 30,
  presets: [
    {
      label: 'Today',
      value: new Date(),
    },
    {
      label: 'Tomorrow',
      value: addDays(new Date(), 1),
    },
    {
      label: 'This Weekend',
      value: getNextWeekend(),
    },
  ],
};

export const visitorTimeConfig: TimePickerConfig = {
  format: '12',
  interval: 15,
  restrictedHours: {
    start: '06:00 AM',
    end: '10:00 PM',
  },
  presets: [
    {
      label: 'Morning',
      value: '09:00 AM',
      period: 'morning',
    },
    {
      label: 'Afternoon',
      value: '02:00 PM',
      period: 'afternoon',
    },
    {
      label: 'Evening',
      value: '06:00 PM',
      period: 'evening',
    },
  ],
};

// Admin configuration (extended permissions)
export const adminDateConfig: DatePickerConfig = {
  allowPastDates: true,
  maxDaysInAdvance: 90, // Extended range for admins
  presets: [
    {
      label: 'Today',
      value: new Date(),
    },
    {
      label: 'Tomorrow',
      value: addDays(new Date(), 1),
    },
    {
      label: 'Next Week',
      value: addDays(new Date(), 7),
    },
    {
      label: 'Next Month',
      value: addDays(new Date(), 30),
    },
  ],
};

export const adminTimeConfig: TimePickerConfig = {
  format: '12',
  interval: 15,
  restrictedHours: {
    start: '00:00 AM',
    end: '11:59 PM',
  }, // 24/7 access for admins
  presets: [
    {
      label: 'Early Morning',
      value: '06:00 AM',
      period: 'morning',
    },
    {
      label: 'Morning',
      value: '09:00 AM',
      period: 'morning',
    },
    {
      label: 'Afternoon',
      value: '02:00 PM',
      period: 'afternoon',
    },
    {
      label: 'Evening',
      value: '06:00 PM',
      period: 'evening',
    },
    {
      label: 'Late Evening',
      value: '10:00 PM',
      period: 'evening',
    },
  ],
};

// Utility function to get configuration based on user role
export const getDateTimeConfig = (
  userRole: 'resident' | 'admin' = 'resident',
) => {
  if (userRole === 'admin') {
    return {
      dateConfig: adminDateConfig,
      timeConfig: adminTimeConfig,
    };
  }

  return {
    dateConfig: visitorDateConfig,
    timeConfig: visitorTimeConfig,
  };
};
