import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../../../components/ui/Button';

describe('Button Component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  test('renders correctly with title', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} />
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  test('calls onPress when pressed', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} />
    );

    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  test('does not call onPress when disabled', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} disabled />
    );

    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  test('renders with different variants', () => {
    const { rerender, getByTestId } = render(
      <Button title="Primary" onPress={mockOnPress} variant="primary" testID="button" />
    );
    expect(getByTestId('button')).toBeTruthy();

    rerender(
      <Button title="Secondary" onPress={mockOnPress} variant="secondary" testID="button" />
    );
    expect(getByTestId('button')).toBeTruthy();

    rerender(
      <Button title="Outline" onPress={mockOnPress} variant="outline" testID="button" />
    );
    expect(getByTestId('button')).toBeTruthy();
  });

  test('renders with different sizes', () => {
    const { rerender, getByTestId } = render(
      <Button title="Small" onPress={mockOnPress} size="small" testID="button" />
    );
    expect(getByTestId('button')).toBeTruthy();

    rerender(
      <Button title="Medium" onPress={mockOnPress} size="medium" testID="button" />
    );
    expect(getByTestId('button')).toBeTruthy();

    rerender(
      <Button title="Large" onPress={mockOnPress} size="large" testID="button" />
    );
    expect(getByTestId('button')).toBeTruthy();
  });

  test('renders loading state', () => {
    const { getByTestId, queryByText } = render(
      <Button title="Loading" onPress={mockOnPress} loading testID="button" />
    );

    expect(getByTestId('button')).toBeTruthy();
    expect(queryByText('Loading')).toBeTruthy();
  });

  test('is accessible', () => {
    const { getByTestId } = render(
      <Button 
        title="Accessible Button" 
        onPress={mockOnPress} 
        testID="button"
        accessible={true}
        accessibilityLabel="Test button for accessibility"
        accessibilityHint="Double tap to perform action"
      />
    );

    const button = getByTestId('button');
    expect(button.props.accessible).toBe(true);
    expect(button.props.accessibilityLabel).toBe('Test button for accessibility');
    expect(button.props.accessibilityHint).toBe('Double tap to perform action');
  });

  test('renders with fullWidth style', () => {
    const { getByTestId } = render(
      <Button title="Full Width" onPress={mockOnPress} fullWidth testID="button" />
    );

    expect(getByTestId('button')).toBeTruthy();
  });

  test('renders with icon', () => {
    const { getByTestId } = render(
      <Button 
        title="With Icon" 
        onPress={mockOnPress} 
        icon="plus"
        iconPosition="left"
        testID="button" 
      />
    );

    expect(getByTestId('button')).toBeTruthy();
  });
});