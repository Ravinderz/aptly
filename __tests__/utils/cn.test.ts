import { cn } from '../../utils/cn';

describe('cn utility function', () => {
  test('should combine class names', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  test('should handle conditional classes', () => {
    expect(cn('base', true && 'conditional', false && 'excluded')).toBe(
      'base conditional',
    );
  });

  test('should handle arrays', () => {
    expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
  });

  test('should handle objects', () => {
    expect(
      cn({
        active: true,
        disabled: false,
        primary: true,
      }),
    ).toBe('active primary');
  });

  test('should filter out falsy values', () => {
    expect(cn('base', null, undefined, '', 'valid')).toBe('base valid');
  });

  test('should handle empty input', () => {
    expect(cn()).toBe('');
  });

  test('should handle nested arrays and objects', () => {
    expect(
      cn('base', ['nested', { conditional: true }], {
        object: true,
        false: false,
      }),
    ).toBe('base nested conditional object');
  });

  test('should handle complex real-world scenario', () => {
    const isActive = true;
    const isDisabled = false;
    const variant = 'primary';

    expect(
      cn(
        'btn',
        `btn-${variant}`,
        {
          'btn-active': isActive,
          'btn-disabled': isDisabled,
        },
        'rounded-md',
      ),
    ).toBe('btn btn-primary btn-active rounded-md');
  });
});
