// Fix for ResizeObserver loop completed with undelivered notifications
// This is a common issue in React applications with Material-UI

// Polyfill to suppress the ResizeObserver error
const resizeObserverErrorHandler = (e: ErrorEvent) => {
  if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
    e.stopImmediatePropagation();
    e.preventDefault();
    return false;
  }
  return true;
};

// More comprehensive fix for ResizeObserver
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const errorMessage = args[0];
  if (
    typeof errorMessage === 'string' &&
    errorMessage.includes('ResizeObserver loop completed with undelivered notifications')
  ) {
    // Suppress ResizeObserver errors
    return;
  }
  originalConsoleError.apply(console, args);
};

// Apply the window error fix
if (typeof window !== 'undefined') {
  window.addEventListener('error', resizeObserverErrorHandler);
  
  // Additional fix for unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('ResizeObserver')) {
      event.preventDefault();
    }
  });
}

export default resizeObserverErrorHandler;
