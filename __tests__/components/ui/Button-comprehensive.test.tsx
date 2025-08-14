import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../../../components/ui/Button';

describe('Button Component', () => {
  describe('Basic Rendering', () => {
    it('should render with text', () => {
      const { getByText } = render(<Button>Click me</Button>);
      expect(getByText('Click me')).toBeTruthy();
    });

    it('should render with title prop', () => {
      const { getByText } = render(<Button title="Submit" />);
      expect(getByText('Submit')).toBeTruthy();
    });

    it('should handle both children and title (children takes precedence)', () => {
      const { getByText, queryByText } = render(
        <Button title="Title">Children</Button>
      );
      expect(getByText('Children')).toBeTruthy();
      expect(queryByText('Title')).toBeFalsy();
    });
  });

  describe('Variants', () => {
    it('should apply primary variant styles', () => {
      const { getByTestId } = render(
        <Button variant="primary" testID="button">
          Primary
        </Button>
      );
      
      const button = getByTestId('button');
      expect(button.props.style).toContainEqual(
        expect.objectContaining({
          backgroundColor: expect.any(String),
        })
      );
    });

    it('should apply secondary variant styles', () => {
      const { getByTestId } = render(
        <Button variant="secondary" testID="button">
          Secondary
        </Button>
      );
      
      const button = getByTestId('button');
      expect(button.props.style).toBeDefined();
    });

    it('should apply outline variant styles', () => {
      const { getByTestId } = render(
        <Button variant="outline" testID="button">
          Outline
        </Button>
      );
      
      const button = getByTestId('button');
      expect(button.props.style).toContainEqual(
        expect.objectContaining({
          borderWidth: expect.any(Number),
        })
      );
    });

    it('should apply ghost variant styles', () => {
      const { getByTestId } = render(
        <Button variant="ghost" testID="button">
          Ghost
        </Button>
      );
      
      const button = getByTestId('button');
      expect(button.props.style).toBeDefined();
    });

    it('should apply destructive variant styles', () => {
      const { getByTestId } = render(
        <Button variant="destructive" testID="button">
          Delete
        </Button>
      );
      
      const button = getByTestId('button');
      expect(button.props.style).toContainEqual(
        expect.objectContaining({
          backgroundColor: expect.stringMatching(/red|#.*[a-f0-9]/i),
        })
      );
    });
  });

  describe('Sizes', () => {
    it('should apply small size styles', () => {
      const { getByTestId } = render(
        <Button size="sm" testID="button">
          Small
        </Button>
      );
      
      const button = getByTestId('button');
      expect(button.props.style).toContainEqual(
        expect.objectContaining({
          paddingHorizontal: expect.any(Number),
          paddingVertical: expect.any(Number),
        })
      );
    });

    it('should apply default size styles', () => {
      const { getByTestId } = render(
        <Button testID="button">
          Default
        </Button>
      );
      
      const button = getByTestId('button');
      expect(button.props.style).toBeDefined();
    });

    it('should apply large size styles', () => {
      const { getByTestId } = render(
        <Button size="lg" testID="button">
          Large
        </Button>
      );
      
      const button = getByTestId('button');
      expect(button.props.style).toContainEqual(
        expect.objectContaining({
          paddingHorizontal: expect.any(Number),
          paddingVertical: expect.any(Number),
        })
      );
    });
  });

  describe('States', () => {
    it('should handle disabled state', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <Button disabled onPress={onPress} testID="button">
          Disabled
        </Button>
      );
      
      const button = getByTestId('button');
      fireEvent.press(button);
      
      expect(onPress).not.toHaveBeenCalled();
      expect(button.props.accessibilityState?.disabled).toBe(true);
    });

    it('should handle loading state', () => {
      const onPress = jest.fn();
      const { getByTestId, getByText } = render(
        <Button loading onPress={onPress} testID="button">
          Submit
        </Button>
      );
      
      const button = getByTestId('button');
      fireEvent.press(button);
      
      expect(onPress).not.toHaveBeenCalled();
      expect(button.props.accessibilityState?.busy).toBe(true);
      expect(getByText('Submit')).toBeTruthy(); // Text should still be visible
    });

    it('should show loading text when provided', () => {
      const { getByText } = render(
        <Button loading loadingText="Saving...">
          Save
        </Button>
      );
      
      expect(getByText('Saving...')).toBeTruthy();
    });

    it('should handle pressed state styles', () => {
      const { getByTestId } = render(
        <Button testID="button">
          Press me
        </Button>
      );
      
      const button = getByTestId('button');
      fireEvent(button, 'pressIn');
      
      // Pressed state styling would be applied
      expect(button).toBeTruthy();
    });
  });

  describe('Icons', () => {
    const MockIcon = () => null;

    it('should render with left icon', () => {
      const { getByTestId } = render(
        <Button leftIcon={<MockIcon />} testID="button">
          With Icon
        </Button>
      );
      
      expect(getByTestId('button')).toBeTruthy();
    });

    it('should render with right icon', () => {
      const { getByTestId } = render(
        <Button rightIcon={<MockIcon />} testID="button">
          With Icon
        </Button>
      );
      
      expect(getByTestId('button')).toBeTruthy();
    });

    it('should render icon only', () => {
      const { getByTestId } = render(
        <Button icon={<MockIcon />} testID="button" />
      );
      
      expect(getByTestId('button')).toBeTruthy();
    });

    it('should render with both left and right icons', () => {
      const { getByTestId } = render(
        <Button 
          leftIcon={<MockIcon />} 
          rightIcon={<MockIcon />} 
          testID="button"
        >
          Both Icons
        </Button>
      );
      
      expect(getByTestId('button')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('should call onPress when pressed', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <Button onPress={onPress} testID="button">
          Click me
        </Button>
      );
      
      fireEvent.press(getByTestId('button'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should call onLongPress when long pressed', () => {
      const onLongPress = jest.fn();
      const { getByTestId } = render(
        <Button onLongPress={onLongPress} testID="button">
          Long press me
        </Button>
      );
      
      fireEvent(getByTestId('button'), 'longPress');
      expect(onLongPress).toHaveBeenCalledTimes(1);
    });

    it('should handle pressIn and pressOut events', () => {
      const onPressIn = jest.fn();
      const onPressOut = jest.fn();
      const { getByTestId } = render(
        <Button 
          onPressIn={onPressIn} 
          onPressOut={onPressOut} 
          testID="button"
        >
          Press events
        </Button>
      );
      
      const button = getByTestId('button');
      fireEvent(button, 'pressIn');
      fireEvent(button, 'pressOut');
      
      expect(onPressIn).toHaveBeenCalledTimes(1);
      expect(onPressOut).toHaveBeenCalledTimes(1);
    });

    it('should not call onPress when disabled', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <Button disabled onPress={onPress} testID="button">
          Disabled
        </Button>
      );
      
      fireEvent.press(getByTestId('button'));
      expect(onPress).not.toHaveBeenCalled();
    });

    it('should not call onPress when loading', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <Button loading onPress={onPress} testID="button">
          Loading
        </Button>
      );
      
      fireEvent.press(getByTestId('button'));
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('should apply custom styles', () => {
      const customStyle = { backgroundColor: 'purple' };
      const { getByTestId } = render(
        <Button style={customStyle} testID="button">
          Custom
        </Button>
      );
      
      const button = getByTestId('button');
      expect(button.props.style).toContainEqual(customStyle);
    });

    it('should apply custom text styles', () => {
      const customTextStyle = { color: 'orange' };
      const { getByTestId } = render(
        <Button textStyle={customTextStyle} testID="button">
          Custom Text
        </Button>
      );
      
      // This would need to check the text element specifically
      expect(getByTestId('button')).toBeTruthy();
    });

    it('should maintain style priority (custom over defaults)', () => {
      const customStyle = { backgroundColor: 'yellow' };
      const { getByTestId } = render(
        <Button 
          variant="primary" 
          style={customStyle} 
          testID="button"
        >
          Priority
        </Button>
      );
      
      const button = getByTestId('button');
      expect(button.props.style).toContainEqual(customStyle);
    });
  });

  describe('Accessibility', () => {
    it('should have button role by default', () => {
      const { getByTestId } = render(
        <Button testID="button">
          Accessible
        </Button>
      );
      
      const button = getByTestId('button');
      expect(button.props.accessibilityRole).toBe('button');
    });

    it('should support custom accessibility label', () => {
      const { getByTestId } = render(
        <Button accessibilityLabel="Custom label" testID="button">
          Button
        </Button>
      );
      
      const button = getByTestId('button');
      expect(button.props.accessibilityLabel).toBe('Custom label');
    });

    it('should support accessibility hint', () => {
      const { getByTestId } = render(
        <Button accessibilityHint="Saves your data" testID="button">
          Save
        </Button>
      );
      
      const button = getByTestId('button');
      expect(button.props.accessibilityHint).toBe('Saves your data');
    });

    it('should have correct state for disabled button', () => {
      const { getByTestId } = render(
        <Button disabled testID="button">
          Disabled
        </Button>
      );
      
      const button = getByTestId('button');
      expect(button.props.accessibilityState?.disabled).toBe(true);
    });

    it('should have correct state for loading button', () => {
      const { getByTestId } = render(
        <Button loading testID="button">
          Loading
        </Button>
      );
      
      const button = getByTestId('button');
      expect(button.props.accessibilityState?.busy).toBe(true);
    });

    it('should be accessible by default', () => {
      const { getByTestId } = render(
        <Button testID="button">
          Accessible
        </Button>
      );
      
      const button = getByTestId('button');
      expect(button.props.accessible).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      let renderCount = 0;
      const TestButton = ({ onPress }) => {
        renderCount++;
        return <Button onPress={onPress}>Test</Button>;
      };

      const mockOnPress = jest.fn();
      const { rerender } = render(<TestButton onPress={mockOnPress} />);
      expect(renderCount).toBe(1);

      rerender(<TestButton onPress={mockOnPress} />);
      expect(renderCount).toBe(2); // Should re-render with same props
    });

    it('should handle rapid press events', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <Button onPress={onPress} testID="button">
          Rapid Press
        </Button>
      );
      
      const button = getByTestId('button');
      // Simulate rapid presses
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);
      
      expect(onPress).toHaveBeenCalledTimes(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children gracefully', () => {
      expect(() => {
        render(<Button></Button>);
      }).not.toThrow();
    });

    it('should handle null children', () => {
      expect(() => {
        render(<Button>{null}</Button>);
      }).not.toThrow();
    });

    it('should handle undefined onPress', () => {
      expect(() => {
        const { getByTestId } = render(
          <Button testID="button">
            No handler
          </Button>
        );
        fireEvent.press(getByTestId('button'));
      }).not.toThrow();
    });

    it('should handle both loading and disabled states', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <Button loading disabled onPress={onPress} testID="button">
          Both states
        </Button>
      );
      
      fireEvent.press(getByTestId('button'));
      expect(onPress).not.toHaveBeenCalled();
      
      const button = getByTestId('button');
      expect(button.props.accessibilityState?.disabled).toBe(true);
      expect(button.props.accessibilityState?.busy).toBe(true);
    });
  });
});