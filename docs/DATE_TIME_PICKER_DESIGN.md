# Date & Time Picker Components Design

## Overview
Comprehensive date and time picker components for the Aptly app, following the design system and supporting both resident and admin personas with configurable restrictions.

## Components Architecture

### 1. DatePickerModal Component
**File:** `components/ui/pickers/DatePickerModal.tsx`

**Features:**
- Full calendar view with month/year navigation
- Configurable date restrictions (past dates, future limits)
- Quick preset buttons (Today, Tomorrow, Next Week)
- Professional modal overlay with animations
- Design system compliant styling

**Props Interface:**
```typescript
interface DatePickerModalProps {
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
```

### 2. TimePickerModal Component
**File:** `components/ui/pickers/TimePickerModal.tsx`

**Features:**
- 12-hour format with AM/PM selection
- 15-minute increments
- Scroll wheel interface for time selection
- Configurable visiting hours restrictions
- Quick preset times (Morning, Afternoon, Evening)

**Props Interface:**
```typescript
interface TimePickerModalProps {
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
```

### 3. DateTimeInput Component
**File:** `components/ui/pickers/DateTimeInput.tsx`

**Features:**
- Touchable input field matching existing form inputs
- Icon integration (Calendar, Clock)
- Formatted value display
- Error state styling
- Integration with React Hook Form

**Props Interface:**
```typescript
interface DateTimeInputProps {
  type: 'date' | 'time';
  value?: string;
  onPress: () => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  label?: string;
}
```

### 4. Configuration Types
**File:** `types/pickers.ts`

```typescript
interface DatePickerConfig {
  allowPastDates: boolean;
  maxDaysInAdvance: number;
  restrictedDates?: Date[];
  presets: DatePreset[];
}

interface TimePickerConfig {
  format: '12' | '24';
  interval: number;
  restrictedHours?: {
    start: string;
    end: string;
  };
  presets: TimePreset[];
}

interface DatePreset {
  label: string;
  value: Date;
  icon?: React.ReactNode;
}

interface TimePreset {
  label: string;
  value: string;
  period: 'morning' | 'afternoon' | 'evening';
}
```

## Design System Integration

### Colors
- Primary: `#6366f1` (Indigo)
- Secondary: `#4CAF50` (India Green)
- Background: `bg-surface`
- Border: `border-divider`
- Text: `text-text-primary`, `text-text-secondary`
- Selected: `bg-primary/10`, `text-primary`

### Typography
- Modal Title: `text-headline-large font-semibold`
- Calendar Days: `text-body-medium`
- Selected Date: `text-body-large font-semibold`
- Preset Buttons: `text-label-large font-medium`

### Spacing & Layout
- Modal Padding: `p-6`
- Button Spacing: `gap-3`
- Calendar Grid: `8pt` spacing system
- Input Height: `min-h-14` (56px)

## User Experience Flow

### Date Selection Flow
1. User taps on date input field
2. DatePickerModal slides up from bottom with fade animation
3. Current date highlighted, calendar shows current month
4. User can:
   - Navigate months with arrow buttons
   - Tap quick presets (Today, Tomorrow)
   - Select specific date from calendar
5. Selected date shows preview format
6. User confirms selection or cancels
7. Modal slides down with selected value

### Time Selection Flow
1. User taps on time input field
2. TimePickerModal appears with current time selected
3. User can:
   - Scroll hour and minute wheels
   - Toggle AM/PM
   - Select preset times
4. Real-time preview of selected time
5. User confirms or cancels
6. Modal dismisses with formatted time

## Configuration Examples

### Visitor Form Configuration
```typescript
const visitorDateConfig: DatePickerConfig = {
  allowPastDates: false,
  maxDaysInAdvance: 30,
  presets: [
    { label: 'Today', value: new Date() },
    { label: 'Tomorrow', value: addDays(new Date(), 1) },
    { label: 'This Weekend', value: getNextWeekend() }
  ]
};

const visitorTimeConfig: TimePickerConfig = {
  format: '12',
  interval: 15,
  restrictedHours: {
    start: '06:00 AM',
    end: '10:00 PM'
  },
  presets: [
    { label: 'Morning', value: '09:00 AM', period: 'morning' },
    { label: 'Afternoon', value: '02:00 PM', period: 'afternoon' },
    { label: 'Evening', value: '06:00 PM', period: 'evening' }
  ]
};
```

### Admin Configuration
```typescript
const adminDateConfig: DatePickerConfig = {
  allowPastDates: true,
  maxDaysInAdvance: 90, // Extended range for admins
  presets: [
    { label: 'Today', value: new Date() },
    { label: 'Tomorrow', value: addDays(new Date(), 1) },
    { label: 'Next Month', value: addMonths(new Date(), 1) }
  ]
};
```

## Animation & Interactions

### Modal Animations
- **Entry**: Slide up from bottom + fade in (400ms)
- **Exit**: Slide down + fade out (300ms)
- **Backdrop**: Fade overlay (200ms)

### Selection Feedback
- **Date Tap**: Scale animation (150ms)
- **Preset Button**: Background color transition (200ms)
- **Navigation**: Smooth month transition (300ms)

### Micro-interactions
- **Haptic Feedback**: Light impact on selection
- **Visual Feedback**: Pressed states with opacity changes
- **Loading States**: Subtle shimmer for async operations

## Accessibility Features

### Screen Reader Support
- Semantic labels for all interactive elements
- Role definitions for calendar grid
- State announcements for selections

### Keyboard Navigation
- Tab order for modal elements
- Enter/Space for selections
- Escape to close modals

### High Contrast Support
- Sufficient color contrast ratios
- Alternative visual indicators
- Focus indicators

## Implementation Priority

### Phase 1: Core Components
1. ✅ DateTimeInput component
2. ✅ DatePickerModal basic functionality
3. ✅ TimePickerModal basic functionality
4. ✅ Integration with visitor form

### Phase 2: Enhanced Features
1. 🔄 Quick presets implementation
2. 🔄 Advanced animations
3. 🔄 Configuration system
4. 🔄 Admin vs resident differentiation

### Phase 3: Polish & Optimization
1. ⏳ Accessibility enhancements
2. ⏳ Performance optimizations
3. ⏳ Edge case handling
4. ⏳ Comprehensive testing

## File Structure
```
components/ui/pickers/
├── DatePickerModal.tsx
├── TimePickerModal.tsx
├── DateTimeInput.tsx
├── CalendarGrid.tsx
├── TimeWheel.tsx
└── index.ts

types/
└── pickers.ts

utils/
├── dateUtils.ts
└── timeUtils.ts
```

## Integration Example
```typescript
// In visitor form
const [showDatePicker, setShowDatePicker] = useState(false);
const [showTimePicker, setShowTimePicker] = useState(false);

<DateTimeInput
  type="date"
  value={selectedDate}
  onPress={() => setShowDatePicker(true)}
  placeholder="Select visit date"
  icon={<Calendar size={20} className="text-primary" />}
  label="Visit Date"
/>

<DatePickerModal
  visible={showDatePicker}
  onClose={() => setShowDatePicker(false)}
  onSelectDate={(date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  }}
  {...visitorDateConfig}
/>
```

## Next Steps
1. Begin implementation with core DateTimeInput component
2. Build DatePickerModal with calendar functionality  
3. Implement TimePickerModal with wheel interface
4. Integrate with existing visitor form
5. Add configuration system for different use cases
6. Polish animations and accessibility features

This design ensures a professional, accessible, and highly configurable date/time picking experience that scales across different user personas and use cases.