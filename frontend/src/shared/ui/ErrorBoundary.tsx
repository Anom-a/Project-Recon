import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gradient-to-b from-white via-slate-50 to-slate-100">
          <div className="w-20 h-20 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mb-6 shadow-sm">
            <svg className="w-9 h-9 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--brand-ink)] mb-2">Unexpected error</h1>
          <p className="text-sm text-[var(--brand-muted)] max-w-sm mb-3">
            Something went wrong. Try reloading the page.
          </p>
          {this.state.error && (
            <p className="text-xs font-mono text-[var(--brand-muted-dark)] bg-white border border-[var(--brand-border,#e5e7eb)] rounded-lg px-4 py-2.5 max-w-md w-full mb-8 text-left overflow-x-auto">
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="inline-flex items-center gap-2 bg-[var(--brand-blue)] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all shadow-sm active:scale-[0.98]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Reload application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
