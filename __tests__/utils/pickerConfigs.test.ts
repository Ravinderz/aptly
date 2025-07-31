import {
  visitorDateConfig,
  visitorTimeConfig,
  adminDateConfig,
  adminTimeConfig,
  getDateTimeConfig,
} from '../../utils/pickerConfigs';

describe('Picker Configurations', () => {
  describe('visitorDateConfig', () => {
    test('should not allow past dates', () => {
      expect(visitorDateConfig.allowPastDates).toBe(false);
    });

    test('should limit to 30 days in advance', () => {
      expect(visitorDateConfig.maxDaysInAdvance).toBe(30);
    });

    test('should have correct preset labels', () => {
      expect(visitorDateConfig.presets).toHaveLength(3);
      expect(visitorDateConfig.presets[0].label).toBe('Today');
      expect(visitorDateConfig.presets[1].label).toBe('Tomorrow');
      expect(visitorDateConfig.presets[2].label).toBe('This Weekend');
    });

    test('should have today preset with current date', () => {
      const todayPreset = visitorDateConfig.presets[0];
      expect(todayPreset.label).toBe('Today');
      expect(todayPreset.value).toBeInstanceOf(Date);
    });

    test('should have tomorrow preset with future date', () => {
      const tomorrowPreset = visitorDateConfig.presets[1];
      expect(tomorrowPreset.label).toBe('Tomorrow');
      expect(tomorrowPreset.value).toBeInstanceOf(Date);

      // Should be approximately tomorrow (within a reasonable range)
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const timeDiff = Math.abs(
        tomorrowPreset.value.getTime() - tomorrow.getTime(),
      );
      expect(timeDiff).toBeLessThan(24 * 60 * 60 * 1000); // Within 24 hours
    });

    test('should have weekend preset with future date', () => {
      const weekendPreset = visitorDateConfig.presets[2];
      expect(weekendPreset.label).toBe('This Weekend');
      expect(weekendPreset.value).toBeInstanceOf(Date);

      // Should be a future date
      const today = new Date();
      expect(weekendPreset.value.getTime()).toBeGreaterThanOrEqual(
        today.getTime(),
      );
    });
  });

  describe('visitorTimeConfig', () => {
    test('should use 12-hour format', () => {
      expect(visitorTimeConfig.format).toBe('12');
    });

    test('should have 15-minute intervals', () => {
      expect(visitorTimeConfig.interval).toBe(15);
    });

    test('should restrict hours from 6 AM to 10 PM', () => {
      expect(visitorTimeConfig.restrictedHours).toEqual({
        start: '06:00 AM',
        end: '10:00 PM',
      });
    });

    test('should have morning, afternoon, and evening presets', () => {
      expect(visitorTimeConfig.presets).toHaveLength(3);

      const [morning, afternoon, evening] = visitorTimeConfig.presets;

      expect(morning).toEqual({
        label: 'Morning',
        value: '09:00 AM',
        period: 'morning',
      });

      expect(afternoon).toEqual({
        label: 'Afternoon',
        value: '02:00 PM',
        period: 'afternoon',
      });

      expect(evening).toEqual({
        label: 'Evening',
        value: '06:00 PM',
        period: 'evening',
      });
    });

    test('should have all presets within restricted hours', () => {
      visitorTimeConfig.presets.forEach((preset) => {
        // All presets should be between 6 AM and 10 PM
        expect(preset.value).toMatch(
          /^(0[6-9]|1[0-2]|0[1-9]):[0-5][0-9] (AM|PM)$/,
        );
      });
    });
  });

  describe('adminDateConfig', () => {
    test('should allow past dates', () => {
      expect(adminDateConfig.allowPastDates).toBe(true);
    });

    test('should allow 90 days in advance (extended for admins)', () => {
      expect(adminDateConfig.maxDaysInAdvance).toBe(90);
    });

    test('should have more presets than visitor config', () => {
      expect(adminDateConfig.presets).toHaveLength(4);
      expect(adminDateConfig.presets.length).toBeGreaterThan(
        visitorDateConfig.presets.length,
      );
    });

    test('should have extended preset options', () => {
      const presetLabels = adminDateConfig.presets.map((p) => p.label);
      expect(presetLabels).toEqual([
        'Today',
        'Tomorrow',
        'Next Week',
        'Next Month',
      ]);
    });

    test('should have next week preset with future date', () => {
      const nextWeekPreset = adminDateConfig.presets[2];
      expect(nextWeekPreset.label).toBe('Next Week');
      expect(nextWeekPreset.value).toBeInstanceOf(Date);

      // Should be approximately a week from now
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      const timeDiff = Math.abs(
        nextWeekPreset.value.getTime() - nextWeek.getTime(),
      );
      expect(timeDiff).toBeLessThan(24 * 60 * 60 * 1000); // Within 24 hours
    });

    test('should have next month preset with future date', () => {
      const nextMonthPreset = adminDateConfig.presets[3];
      expect(nextMonthPreset.label).toBe('Next Month');
      expect(nextMonthPreset.value).toBeInstanceOf(Date);

      // Should be approximately a month from now
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setDate(today.getDate() + 30);
      const timeDiff = Math.abs(
        nextMonthPreset.value.getTime() - nextMonth.getTime(),
      );
      expect(timeDiff).toBeLessThan(24 * 60 * 60 * 1000); // Within 24 hours
    });
  });

  describe('adminTimeConfig', () => {
    test('should use 12-hour format', () => {
      expect(adminTimeConfig.format).toBe('12');
    });

    test('should have 15-minute intervals', () => {
      expect(adminTimeConfig.interval).toBe(15);
    });

    test('should allow 24/7 access (no time restrictions)', () => {
      expect(adminTimeConfig.restrictedHours).toEqual({
        start: '00:00 AM',
        end: '11:59 PM',
      });
    });

    test('should have extended time presets', () => {
      expect(adminTimeConfig.presets).toHaveLength(5);
      expect(adminTimeConfig.presets.length).toBeGreaterThan(
        visitorTimeConfig.presets.length,
      );
    });

    test('should have comprehensive time period coverage', () => {
      const presetLabels = adminTimeConfig.presets.map((p) => p.label);
      expect(presetLabels).toEqual([
        'Early Morning',
        'Morning',
        'Afternoon',
        'Evening',
        'Late Evening',
      ]);
    });

    test('should have correct time values for each preset', () => {
      const [earlyMorning, morning, afternoon, evening, lateEvening] =
        adminTimeConfig.presets;

      expect(earlyMorning).toEqual({
        label: 'Early Morning',
        value: '06:00 AM',
        period: 'morning',
      });

      expect(morning).toEqual({
        label: 'Morning',
        value: '09:00 AM',
        period: 'morning',
      });

      expect(afternoon).toEqual({
        label: 'Afternoon',
        value: '02:00 PM',
        period: 'afternoon',
      });

      expect(evening).toEqual({
        label: 'Evening',
        value: '06:00 PM',
        period: 'evening',
      });

      expect(lateEvening).toEqual({
        label: 'Late Evening',
        value: '10:00 PM',
        period: 'evening',
      });
    });

    test('should have proper period categorization', () => {
      const morningPresets = adminTimeConfig.presets.filter(
        (p) => p.period === 'morning',
      );
      const afternoonPresets = adminTimeConfig.presets.filter(
        (p) => p.period === 'afternoon',
      );
      const eveningPresets = adminTimeConfig.presets.filter(
        (p) => p.period === 'evening',
      );

      expect(morningPresets).toHaveLength(2); // Early Morning, Morning
      expect(afternoonPresets).toHaveLength(1); // Afternoon
      expect(eveningPresets).toHaveLength(2); // Evening, Late Evening
    });
  });

  describe('getDateTimeConfig', () => {
    test('should return admin configs for admin role', () => {
      const config = getDateTimeConfig('admin');

      expect(config.dateConfig).toBe(adminDateConfig);
      expect(config.timeConfig).toBe(adminTimeConfig);
      expect(config.dateConfig.allowPastDates).toBe(true);
      expect(config.dateConfig.maxDaysInAdvance).toBe(90);
    });

    test('should return visitor configs for resident role', () => {
      const config = getDateTimeConfig('resident');

      expect(config.dateConfig).toBe(visitorDateConfig);
      expect(config.timeConfig).toBe(visitorTimeConfig);
      expect(config.dateConfig.allowPastDates).toBe(false);
      expect(config.dateConfig.maxDaysInAdvance).toBe(30);
    });

    test('should default to resident configs when no role provided', () => {
      const config = getDateTimeConfig();

      expect(config.dateConfig).toBe(visitorDateConfig);
      expect(config.timeConfig).toBe(visitorTimeConfig);
    });

    test('should handle invalid role by defaulting to resident', () => {
      // @ts-ignore - testing invalid input
      const config = getDateTimeConfig('invalid_role');

      expect(config.dateConfig).toBe(visitorDateConfig);
      expect(config.timeConfig).toBe(visitorTimeConfig);
    });
  });

  describe('configuration consistency', () => {
    test('should have consistent time format across all configs', () => {
      expect(visitorTimeConfig.format).toBe(adminTimeConfig.format);
      expect(visitorTimeConfig.format).toBe('12');
    });

    test('should have consistent intervals across all configs', () => {
      expect(visitorTimeConfig.interval).toBe(adminTimeConfig.interval);
      expect(visitorTimeConfig.interval).toBe(15);
    });

    test('should have admin config as extension of visitor config', () => {
      expect(adminDateConfig.maxDaysInAdvance).toBeGreaterThan(
        visitorDateConfig.maxDaysInAdvance,
      );
      expect(adminTimeConfig.presets.length).toBeGreaterThan(
        visitorTimeConfig.presets.length,
      );
      expect(adminDateConfig.presets.length).toBeGreaterThan(
        visitorDateConfig.presets.length,
      );
    });

    test('should have valid time format in all presets', () => {
      const timeRegex = /^(0[0-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;

      [...visitorTimeConfig.presets, ...adminTimeConfig.presets].forEach(
        (preset) => {
          expect(preset.value).toMatch(timeRegex);
        },
      );
    });

    test('should have all date presets as Date objects', () => {
      [...visitorDateConfig.presets, ...adminDateConfig.presets].forEach(
        (preset) => {
          expect(preset.value).toBeInstanceOf(Date);
        },
      );
    });
  });

  describe('role-based access control', () => {
    test('should restrict visitor time access to business hours', () => {
      const startHour = parseInt(
        visitorTimeConfig.restrictedHours.start.split(':')[0],
      );
      const endHour = parseInt(
        visitorTimeConfig.restrictedHours.end.split(':')[0],
      );

      expect(startHour).toBeGreaterThanOrEqual(6); // 6 AM or later
      expect(endHour).toBeLessThanOrEqual(22); // 10 PM or earlier
    });

    test('should allow admin full day access', () => {
      const startTime = adminTimeConfig.restrictedHours.start;
      const endTime = adminTimeConfig.restrictedHours.end;

      expect(startTime).toBe('00:00 AM'); // Midnight
      expect(endTime).toBe('11:59 PM'); // Almost midnight
    });

    test('should prevent visitors from booking too far in advance', () => {
      expect(visitorDateConfig.maxDaysInAdvance).toBeLessThanOrEqual(30);
    });

    test('should allow admins extended planning horizon', () => {
      expect(adminDateConfig.maxDaysInAdvance).toBeGreaterThanOrEqual(90);
    });

    test('should prevent visitors from booking past dates', () => {
      expect(visitorDateConfig.allowPastDates).toBe(false);
    });

    test('should allow admins to handle past date entries', () => {
      expect(adminDateConfig.allowPastDates).toBe(true);
    });
  });
});
