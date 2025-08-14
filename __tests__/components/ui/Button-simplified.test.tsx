/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Import Button component
const Button = require('../../../components/ui/Button').default;

describe('Button Component (Simplified)', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  test('renders correctly with children', () => {
    const { getByText } = render(
      React.createElement(Button, { onPress: mockOnPress }, 'Test Button'),
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  test('calls onPress when pressed', () => {
    const { getByText } = render(
      React.createElement(Button, { onPress: mockOnPress }, 'Test Button'),
    );

    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  test('does not call onPress when disabled', () => {
    const { getByText } = render(
      React.createElement(
        Button,
        { onPress: mockOnPress, disabled: true },
        'Test Button',
      ),
    );

    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  test('renders with different variants', () => {
    const { rerender, getByTestId } = render(
      React.createElement(
        Button,
        {
          onPress: mockOnPress,
          variant: 'primary',
          testID: 'button',
        },
        'Primary',
      ),
    );
    expect(getByTestId('button')).toBeTruthy();

    rerender(
      React.createElement(
        Button,
        {
          onPress: mockOnPress,
          variant: 'secondary',
          testID: 'button',
        },
        'Secondary',
      ),
    );
    expect(getByTestId('button')).toBeTruthy();
  });

  test('renders loading state', () => {
    const { getByTestId } = render(
      React.createElement(
        Button,
        {
          onPress: mockOnPress,
          loading: true,
          testID: 'button',
        },
        'Loading',
      ),
    );

    expect(getByTestId('button')).toBeTruthy();
  });

  test('renders with fullWidth style', () => {
    const { getByTestId } = render(
      React.createElement(
        Button,
        {
          onPress: mockOnPress,
          fullWidth: true,
          testID: 'button',
        },
        'Full Width',
      ),
    );

    expect(getByTestId('button')).toBeTruthy();
  });
});
