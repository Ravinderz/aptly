/**
 * Design System Components
 * 
 * Standardized UI components for consistent design across the application.
 * Following KISS and DRY principles with mobile-first approach.
 */

// Navigation Components
export { StandardHeader } from './StandardHeader';
export type { StandardHeaderProps } from './StandardHeader';

// Loading States
export {
  LoadingSpinner,
  Skeleton,
  LoadingCard,
  LoadingList,
  LoadingGrid,
  PageLoading,
  InlineLoading,
  LoadingButton,
  PulsingDot,
  LoadingOverlay,
} from './LoadingStates';

// Error States
export {
  ErrorBanner,
  ErrorCard,
  ErrorPage,
  InlineError,
  NetworkError,
  ServerError,
  UnauthorizedError,
  TimeoutError,
  MaintenanceError,
  RateLimitError,
} from './ErrorStates';
export type { ErrorAction } from './ErrorStates';

// Empty States
export {
  EmptyState,
  EmptyStateCard,
  EmptyStatePage,
  NoSearchResults,
  NoDataYet,
  NoNotifications,
  NoMessages,
  NoMembers,
  NoSocieties,
  NoVehicles,
  NoEvents,
  NoDocuments,
  ComingSoon,
  UnderConstruction,
  NoConnection,
  PermissionDenied,
  ArchivedContent,
} from './EmptyStates';
export type { EmptyStateAction } from './EmptyStates';

// Default exports for convenience
import LoadingStates from './LoadingStates';
import ErrorStates from './ErrorStates';
import EmptyStates from './EmptyStates';

export const DesignSystem = {
  Loading: LoadingStates,
  Error: ErrorStates,
  Empty: EmptyStates,
};

export default DesignSystem;