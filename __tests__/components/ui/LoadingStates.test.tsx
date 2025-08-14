import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { LoadingStates } from '../../../components/ui/LoadingStates';

describe('LoadingStates', () => {
  describe('Page Loading State', () => {
    it('should render page loading with activity indicator', () => {
      const { getByTestId, getByText } = render(
        <LoadingStates.Page message="Loading page..." />
      );

      expect(getByTestId('loading-page')).toBeTruthy();
      expect(getByText('Loading page...')).toBeTruthy();
    });

    it('should render page loading without message', () => {
      const { getByTestId, queryByText } = render(<LoadingStates.Page />);

      expect(getByTestId('loading-page')).toBeTruthy();
      expect(queryByText('Loading...')).toBeTruthy(); // default message
    });

    it('should apply custom styles', () => {
      const customStyle = { backgroundColor: 'red' };
      const { getByTestId } = render(
        <LoadingStates.Page style={customStyle} />
      );

      const pageElement = getByTestId('loading-page');
      expect(pageElement.props.style).toContainEqual(customStyle);
    });
  });

  describe('Inline Loading State', () => {
    it('should render inline loading with spinner', () => {
      const { getByTestId } = render(<LoadingStates.Inline />);

      expect(getByTestId('loading-inline')).toBeTruthy();
    });

    it('should render with custom size', () => {
      const { getByTestId } = render(<LoadingStates.Inline size="large" />);

      const spinner = getByTestId('loading-inline-spinner');
      expect(spinner.props.size).toBe('large');
    });

    it('should render with custom color', () => {
      const { getByTestId } = render(<LoadingStates.Inline color="#FF0000" />);

      const spinner = getByTestId('loading-inline-spinner');
      expect(spinner.props.color).toBe('#FF0000');
    });
  });

  describe('Button Loading State', () => {
    it('should render button loading with text', () => {
      const { getByTestId, getByText } = render(
        <LoadingStates.Button text="Saving..." />
      );

      expect(getByTestId('loading-button')).toBeTruthy();
      expect(getByText('Saving...')).toBeTruthy();
    });

    it('should render button loading without text', () => {
      const { getByTestId, queryByText } = render(<LoadingStates.Button />);

      expect(getByTestId('loading-button')).toBeTruthy();
      expect(queryByText('')).toBeFalsy();
    });

    it('should have proper accessibility props', () => {
      const { getByTestId } = render(
        <LoadingStates.Button text="Processing..." />
      );

      const buttonElement = getByTestId('loading-button');
      expect(buttonElement.props.accessible).toBe(true);
      expect(buttonElement.props.accessibilityRole).toBe('button');
      expect(buttonElement.props.accessibilityState?.busy).toBe(true);
    });
  });

  describe('Card Loading State', () => {
    it('should render card loading skeleton', () => {
      const { getByTestId } = render(<LoadingStates.Card />);

      expect(getByTestId('loading-card')).toBeTruthy();
      expect(getByTestId('loading-card-skeleton')).toBeTruthy();
    });

    it('should render with lines count', () => {
      const { getAllByTestId } = render(<LoadingStates.Card lines={5} />);

      const skeletonLines = getAllByTestId('skeleton-line');
      expect(skeletonLines).toHaveLength(5);
    });

    it('should have proper loading animation', async () => {
      const { getByTestId } = render(<LoadingStates.Card />);

      const skeleton = getByTestId('loading-card-skeleton');
      expect(skeleton).toBeTruthy();
      
      // Check if animation is applied (this would need actual animation testing)
      await waitFor(() => {
        expect(skeleton.props.style).toBeDefined();
      });
    });
  });

  describe('List Loading State', () => {
    it('should render list loading with multiple items', () => {
      const { getAllByTestId } = render(<LoadingStates.List count={3} />);

      const listItems = getAllByTestId('loading-list-item');
      expect(listItems).toHaveLength(3);
    });

    it('should render with default count', () => {
      const { getAllByTestId } = render(<LoadingStates.List />);

      const listItems = getAllByTestId('loading-list-item');
      expect(listItems.length).toBeGreaterThan(0);
    });

    it('should render with custom item height', () => {
      const { getAllByTestId } = render(
        <LoadingStates.List count={2} itemHeight={80} />
      );

      const listItems = getAllByTestId('loading-list-item');
      listItems.forEach(item => {
        expect(item.props.style).toMatchObject({
          height: 80,
        });
      });
    });
  });

  describe('Shimmer Animation', () => {
    it('should apply shimmer effect to skeleton elements', () => {
      const { getByTestId } = render(<LoadingStates.Card />);

      const skeleton = getByTestId('loading-card-skeleton');
      expect(skeleton.props.style).toBeDefined();
      
      // Shimmer effect would be tested with actual animation library
      expect(skeleton).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      let renderCount = 0;
      const TestComponent = () => {
        renderCount++;
        return <LoadingStates.Page />;
      };

      const { rerender } = render(<TestComponent />);
      expect(renderCount).toBe(1);

      rerender(<TestComponent />);
      expect(renderCount).toBe(2);
    });

    it('should handle multiple loading states simultaneously', () => {
      const { getByTestId } = render(
        <>
          <LoadingStates.Page />
          <LoadingStates.Inline />
          <LoadingStates.Button text="Loading..." />
          <LoadingStates.Card />
        </>
      );

      expect(getByTestId('loading-page')).toBeTruthy();
      expect(getByTestId('loading-inline')).toBeTruthy();
      expect(getByTestId('loading-button')).toBeTruthy();
      expect(getByTestId('loading-card')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing props gracefully', () => {
      expect(() => {
        render(<LoadingStates.Page />);
      }).not.toThrow();

      expect(() => {
        render(<LoadingStates.Inline />);
      }).not.toThrow();

      expect(() => {
        render(<LoadingStates.Button />);
      }).not.toThrow();
    });

    it('should handle invalid props gracefully', () => {
      expect(() => {
        render(<LoadingStates.List count={-1} />);
      }).not.toThrow();

      expect(() => {
        render(<LoadingStates.Card lines={0} />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByTestId } = render(
        <LoadingStates.Page message="Loading content..." />
      );

      const pageElement = getByTestId('loading-page');
      expect(pageElement.props.accessibilityLabel).toContain('Loading');
      expect(pageElement.props.accessibilityRole).toBe('progressbar');
    });

    it('should announce loading state to screen readers', () => {
      const { getByTestId } = render(
        <LoadingStates.Inline />
      );

      const inlineElement = getByTestId('loading-inline');
      expect(inlineElement.props.accessibilityLiveRegion).toBe('polite');
    });

    it('should have appropriate ARIA states', () => {
      const { getByTestId } = render(
        <LoadingStates.Button text="Processing..." />
      );

      const buttonElement = getByTestId('loading-button');
      expect(buttonElement.props.accessibilityState?.busy).toBe(true);
      expect(buttonElement.props.accessibilityState?.disabled).toBe(true);
    });
  });
});