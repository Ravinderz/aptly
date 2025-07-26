import {
  formatDate,
  formatTime,
  addDays,
  addMonths,
  getNextWeekend,
  isToday,
  isTomorrow,
  isPastDate,
  isDateInRange,
  generateTimeSlots,
  parseTime,
  formatTimeToDisplay
} from '../../utils/dateUtils';

describe('Date Utilities', () => {
  describe('formatDate', () => {
    test('should format date as DD/MM/YYYY', () => {
      const date = new Date('2024-03-15');
      expect(formatDate(date)).toBe('15/03/2024');
    });

    test('should pad single digit day and month', () => {
      const date = new Date('2024-01-05');
      expect(formatDate(date)).toBe('05/01/2024');
    });
  });

  describe('formatTime', () => {
    test('should convert 24-hour to 12-hour format', () => {
      expect(formatTime('14:30')).toBe('2:30 PM');
      expect(formatTime('09:15')).toBe('9:15 AM');
      expect(formatTime('00:00')).toBe('12:00 AM');
      expect(formatTime('12:00')).toBe('12:00 PM');
    });

    test('should handle edge cases', () => {
      expect(formatTime('23:59')).toBe('11:59 PM');
      expect(formatTime('01:00')).toBe('1:00 AM');
    });
  });

  describe('addDays', () => {
    test('should add days to date', () => {
      const date = new Date('2024-01-01');
      const result = addDays(date, 5);
      expect(result.getDate()).toBe(6);
      expect(result.getMonth()).toBe(0); // January
    });

    test('should handle month overflow', () => {
      const date = new Date('2024-01-30');
      const result = addDays(date, 5);
      expect(result.getDate()).toBe(4);
      expect(result.getMonth()).toBe(1); // February
    });

    test('should not modify original date', () => {
      const originalDate = new Date('2024-01-01');
      const originalTime = originalDate.getTime();
      addDays(originalDate, 5);
      expect(originalDate.getTime()).toBe(originalTime);
    });
  });

  describe('addMonths', () => {
    test('should add months to date', () => {
      const date = new Date('2024-01-15');
      const result = addMonths(date, 3);
      expect(result.getMonth()).toBe(3); // April
      expect(result.getFullYear()).toBe(2024);
    });

    test('should handle year overflow', () => {
      const date = new Date('2024-10-15');
      const result = addMonths(date, 5);
      expect(result.getMonth()).toBe(2); // March
      expect(result.getFullYear()).toBe(2025);
    });

    test('should handle negative months', () => {
      const date = new Date('2024-03-15');
      const result = addMonths(date, -2);
      expect(result.getMonth()).toBe(0); // January
    });
  });

  describe('getNextWeekend', () => {
    test('should return a Saturday', () => {
      const weekend = getNextWeekend();
      expect(weekend.getDay()).toBe(6); // Saturday
    });

    test('should return a future date', () => {
      const today = new Date();
      const weekend = getNextWeekend();
      expect(weekend.getTime()).toBeGreaterThanOrEqual(today.getTime());
    });

    test('should return a date within the next 7 days', () => {
      const today = new Date();
      const weekend = getNextWeekend();
      const daysDiff = Math.floor((weekend.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBeLessThanOrEqual(7);
      expect(daysDiff).toBeGreaterThanOrEqual(0);
    });
  });

  describe('isToday', () => {
    test('should return true for today', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    test('should return false for other dates', () => {
      const yesterday = addDays(new Date(), -1);
      const tomorrow = addDays(new Date(), 1);
      expect(isToday(yesterday)).toBe(false);
      expect(isToday(tomorrow)).toBe(false);
    });
  });

  describe('isTomorrow', () => {
    test('should return true for tomorrow', () => {
      const tomorrow = addDays(new Date(), 1);
      expect(isTomorrow(tomorrow)).toBe(true);
    });

    test('should return false for other dates', () => {
      const today = new Date();
      const dayAfterTomorrow = addDays(new Date(), 2);
      expect(isTomorrow(today)).toBe(false);
      expect(isTomorrow(dayAfterTomorrow)).toBe(false);
    });
  });

  describe('isPastDate', () => {
    test('should return true for past dates', () => {
      const yesterday = addDays(new Date(), -1);
      expect(isPastDate(yesterday)).toBe(true);
    });

    test('should return false for today and future dates', () => {
      const today = new Date();
      const tomorrow = addDays(new Date(), 1);
      expect(isPastDate(today)).toBe(false);
      expect(isPastDate(tomorrow)).toBe(false);
    });
  });

  describe('isDateInRange', () => {
    const baseDate = new Date('2024-01-15');
    const minDate = new Date('2024-01-10');
    const maxDate = new Date('2024-01-20');

    test('should return true when date is in range', () => {
      expect(isDateInRange(baseDate, minDate, maxDate)).toBe(true);
    });

    test('should return false when date is before min', () => {
      const earlyDate = new Date('2024-01-05');
      expect(isDateInRange(earlyDate, minDate, maxDate)).toBe(false);
    });

    test('should return false when date is after max', () => {
      const lateDate = new Date('2024-01-25');
      expect(isDateInRange(lateDate, minDate, maxDate)).toBe(false);
    });

    test('should handle undefined min/max dates', () => {
      expect(isDateInRange(baseDate)).toBe(true);
      expect(isDateInRange(baseDate, minDate)).toBe(true);
      expect(isDateInRange(baseDate, undefined, maxDate)).toBe(true);
    });
  });

  describe('generateTimeSlots', () => {
    test('should generate time slots with default parameters', () => {
      const slots = generateTimeSlots();
      expect(slots[0]).toBe('06:00');
      expect(slots[1]).toBe('06:15');
      expect(slots[2]).toBe('06:30');
      expect(slots[slots.length - 1]).toBe('22:00');
    });

    test('should generate time slots with custom parameters', () => {
      const slots = generateTimeSlots('09:00', '10:00', 30);
      expect(slots).toEqual(['09:00', '09:30', '10:00']);
    });

    test('should handle hourly intervals', () => {
      const slots = generateTimeSlots('09:00', '11:00', 60);
      expect(slots).toEqual(['09:00', '10:00', '11:00']);
    });
  });

  describe('parseTime', () => {
    test('should parse 12-hour time format', () => {
      expect(parseTime('2:30 PM')).toEqual({
        hours: 2,
        minutes: 30,
        period: 'PM'
      });

      expect(parseTime('11:45 AM')).toEqual({
        hours: 11,
        minutes: 45,
        period: 'AM'
      });
    });

    test('should handle single digit hours', () => {
      expect(parseTime('9:15 AM')).toEqual({
        hours: 9,
        minutes: 15,
        period: 'AM'
      });
    });
  });

  describe('formatTimeToDisplay', () => {
    test('should format time components to display string', () => {
      expect(formatTimeToDisplay(9, 30, 'AM')).toBe('09:30 AM');
      expect(formatTimeToDisplay(14, 45, 'PM')).toBe('14:45 PM');
    });

    test('should pad single digit values', () => {
      expect(formatTimeToDisplay(5, 5, 'AM')).toBe('05:05 AM');
    });
  });
});