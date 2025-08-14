/**
 * Date utility functions for date/time pickers
 */

export const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatTime = (time: string): string => {
  // Convert 24-hour to 12-hour format if needed
  const [hours, minutes] = time.split(':');
  const hour24 = parseInt(hours);
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  const period = hour24 >= 12 ? 'PM' : 'AM';

  return `${hour12}:${minutes} ${period}`;
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const getNextWeekend = (): Date => {
  const today = new Date();
  const daysUntilSaturday = 6 - today.getDay(); // 6 is Saturday
  return addDays(today, daysUntilSaturday === 0 ? 6 : daysUntilSaturday);
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const isTomorrow = (date: Date): boolean => {
  const tomorrow = addDays(new Date(), 1);
  return date.toDateString() === tomorrow.toDateString();
};

export const isPastDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate < today;
};

export const isDateInRange = (
  date: Date,
  minDate?: Date,
  maxDate?: Date,
): boolean => {
  if (minDate && date < minDate) return false;
  if (maxDate && date > maxDate) return false;
  return true;
};

export const generateTimeSlots = (
  startTime = '06:00',
  endTime = '22:00',
  intervalMinutes = 15,
): string[] => {
  const slots: string[] = [];
  const start = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);

  const current = new Date(start);

  while (current <= end) {
    const hours = current.getHours().toString().padStart(2, '0');
    const minutes = current.getMinutes().toString().padStart(2, '0');
    slots.push(`${hours}:${minutes}`);
    current.setMinutes(current.getMinutes() + intervalMinutes);
  }

  return slots;
};

export const parseTime = (
  timeString: string,
): { hours: number; minutes: number; period: 'AM' | 'PM' } => {
  const [time, period] = timeString.split(' ');
  const [hours, minutes] = time.split(':').map(Number);

  return {
    hours,
    minutes,
    period: period as 'AM' | 'PM',
  };
};

export const formatTimeToDisplay = (
  hours: number,
  minutes: number,
  period: 'AM' | 'PM',
): string => {
  const displayHours = hours.toString().padStart(2, '0');
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${period}`;
};
