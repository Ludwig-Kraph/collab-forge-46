import { Component, ReactNode, ComponentType, lazy } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  retryCount: number;
}

class LazyLoadErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // Check if it's a chunk loading error
    if (error.message.includes('Failed to fetch dynamically imported module')) {
      const { retryCount } = this.state;
      
      if (retryCount < 3) {
        // Wait a bit and retry
        setTimeout(() => {
          this.setState({ hasError: false, retryCount: retryCount + 1 });
          window.location.reload();
        }, 1000);
      } else {
        // After 3 retries, hard reload to get fresh version
        window.location.href = window.location.href;
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4 p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading updated version...</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Helper to create lazy components with retry logic
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return lazy(() =>
    componentImport().catch(() => {
      // If chunk loading fails, wait and retry
      return new Promise<{ default: T }>((resolve, reject) => {
        setTimeout(() => {
          componentImport().then(resolve).catch(() => {
            // Force reload if retry fails
            window.location.href = window.location.href;
            reject();
          });
        }, 1500);
      });
    })
  );
}

export default LazyLoadErrorBoundary;

