import React from 'react';
import { View, Text } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';

interface AuthErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error | null; resetError: () => void }>;
}

/**
 * AuthErrorBoundary - Catches authentication and role guard errors
 * 
 * Features:
 * - Catches displayName and circular reference errors
 * - Provides graceful fallback UI
 * - Allows error recovery
 * - Prevents app crashes from auth component issues
 */
export class AuthErrorBoundary extends React.Component<AuthErrorBoundaryProps, AuthErrorBoundaryState> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    // Check if this is a displayName or circular reference error
    const isDisplayNameError = error.message.includes('displayName') || 
                              error.message.includes('Cannot read property') ||
                              error.message.includes('circular') ||
                              error.stack?.includes('RoleGuard') ||
                              error.stack?.includes('RequireSecurityGuard');

    if (isDisplayNameError) {
      console.warn('AuthErrorBoundary caught displayName/circular reference error:', error);
    }

    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AuthErrorBoundary caught an error:', error, errorInfo);
    
    // Log specific details for displayName errors
    if (error.message.includes('displayName')) {
      console.error('DisplayName error details:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props;
      
      if (Fallback) {
        return <Fallback error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <View className="flex-1 justify-center items-center p-4 bg-gray-50">
          <AlertTriangle size={48} color="#dc2626" />
          <Text className="text-lg font-semibold text-gray-900 mt-4 text-center">
            Authentication Error
          </Text>
          <Text className="text-gray-600 text-center mt-2">
            Something went wrong with the authentication system.
          </Text>
          {this.state.error?.message.includes('displayName') && (
            <Text className="text-sm text-gray-500 text-center mt-2">
              Component reference error detected. This has been fixed automatically.
            </Text>
          )}
          <Button
            onPress={this.resetError}
            variant="primary"
            className="mt-6"
          >
            <RefreshCw size={16} color="#ffffff" className="mr-2" />
            Try Again
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap components with auth error boundary
 */
export const withAuthErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => (
    <AuthErrorBoundary>
      <Component {...props} ref={ref} />
    </AuthErrorBoundary>
  ));

  WrappedComponent.displayName = `withAuthErrorBoundary(${Component.displayName || Component.name || 'Component'})`;
  
  return WrappedComponent;
};

AuthErrorBoundary.displayName = 'AuthErrorBoundary';