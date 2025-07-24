import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../../../components/ui/Button';

describe('Button Component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  test('renders correctly with children', () => {
    const { getByText } = render(
      <Button onPress={mockOnPress}>Test Button</Button>
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  test('calls onPress when pressed', () => {
    const { getByText } = render(
      <Button onPress={mockOnPress}>Test Button</Button>
    );

    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  test('does not call onPress when disabled', () => {
    const { getByText } = render(
      <Button onPress={mockOnPress} disabled>Test Button</Button>
    );

    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  test('renders with different variants', () => {
    const { rerender, getByTestId } = render(
      <Button onPress={mockOnPress} variant="primary" testID="button">Primary</Button>
    );
    expect(getByTestId('button')).toBeTruthy();

    rerender(
      <Button onPress={mockOnPress} variant="secondary" testID="button">Secondary</Button>
    );
    expect(getByTestId('button')).toBeTruthy();

    rerender(
      <Button onPress={mockOnPress} variant="outline" testID="button">Outline</Button>
    );
    expect(getByTestId('button')).toBeTruthy();
  });

  test('renders with different sizes', () => {
    const { rerender, getByTestId } = render(
      <Button onPress={mockOnPress} size="sm" testID="button">Small</Button>
    );
    expect(getByTestId('button')).toBeTruthy();

    rerender(
      <Button onPress={mockOnPress} size="md" testID="button">Medium</Button>
    );
    expect(getByTestId('button')).toBeTruthy();

    rerender(
      <Button onPress={mockOnPress} size="lg" testID="button">Large</Button>
    );
    expect(getByTestId('button')).toBeTruthy();
  });

  test('renders loading state', () => {
    const { getByTestId, queryByText } = render(
      <Button onPress={mockOnPress} loading testID="button">Loading</Button>
    );

    expect(getByTestId('button')).toBeTruthy();
    expect(queryByText('Loading')).toBeTruthy();
  });

  test('is accessible', () => {
    const { getByTestId } = render(
      <Button 
        onPress={mockOnPress} 
        testID="button"
        accessible={true}
        accessibilityLabel="Test button for accessibility"
        accessibilityHint="Double tap to perform action"
      >
        Accessible Button
      </Button>
    );

    const button = getByTestId('button');
    expect(button.props.accessible).toBe(true);
    expect(button.props.accessibilityLabel).toBe('Test button for accessibility');
    expect(button.props.accessibilityHint).toBe('Double tap to perform action');
  });

  test('renders with fullWidth style', () => {
    const { getByTestId } = render(
      <Button onPress={mockOnPress} fullWidth testID="button">Full Width</Button>
    );

    expect(getByTestId('button')).toBeTruthy();
  });

  test('renders without icon prop (icon prop removed)', () => {
    const { getByTestId } = render(
      <Button 
        onPress={mockOnPress} 
        testID="button" 
      >
        Without Icon
      </Button>
    );

    expect(getByTestId('button')).toBeTruthy();
  });
});