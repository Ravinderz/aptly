/**
 * TestID utility functions for consistent naming conventions
 * Following hierarchical pattern: screen.component.element
 */

export interface TestIdOptions {
  screen?: string;
  component?: string;
  element?: string;
}

/**
 * Generate a testID following the hierarchical naming convention
 * @param options - Object containing screen, component, and element identifiers
 * @returns Formatted testID string
 */
export const generateTestId = (options: TestIdOptions): string => {
  const parts = [options.screen, options.component, options.element].filter(Boolean);
  return parts.join('.');
};

/**
 * Generate a testID for a specific screen
 * @param screen - Screen identifier
 * @param element - Optional element identifier
 * @returns Formatted testID string
 */
export const screenTestId = (screen: string, element?: string): string => {
  return generateTestId({ screen, element });
};

/**
 * Generate a testID for a component within a screen
 * @param screen - Screen identifier
 * @param component - Component identifier
 * @param element - Optional element identifier
 * @returns Formatted testID string
 */
export const componentTestId = (screen: string, component: string, element?: string): string => {
  return generateTestId({ screen, component, element });
};

/**
 * Common testID patterns for reusable components
 */
export const commonTestIds = {
  button: {
    primary: 'button.primary',
    secondary: 'button.secondary',
    submit: 'button.submit',
    cancel: 'button.cancel',
    close: 'button.close',
  },
  input: {
    text: 'input.text',
    email: 'input.email',
    phone: 'input.phone',
    password: 'input.password',
    search: 'input.search',
  },
  card: {
    container: 'card.container',
    header: 'card.header',
    content: 'card.content',
    footer: 'card.footer',
  },
  navigation: {
    tab: 'nav.tab',
    back: 'nav.back',
    menu: 'nav.menu',
    close: 'nav.close',
  },
  modal: {
    container: 'modal.container',
    backdrop: 'modal.backdrop',
    close: 'modal.close',
  },
} as const;

/**
 * Generate testID with prefix for better organization
 * @param prefix - Prefix to add to the testID
 * @param testId - Base testID
 * @returns Prefixed testID string
 */
export const prefixTestId = (prefix: string, testId: string): string => {
  return `${prefix}.${testId}`;
};

/**
 * Validate testID format (optional utility for development)
 * @param testId - TestID to validate
 * @returns Boolean indicating if testID follows convention
 */
export const isValidTestId = (testId: string): boolean => {
  // Check if testID follows the hierarchical pattern (at least one dot)
  const parts = testId.split('.');
  return parts.length >= 2 && parts.every(part => part.length > 0);
};