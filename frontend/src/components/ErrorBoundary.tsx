'use client';

import React from 'react';

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="card-case-file rounded-xl p-8 text-center max-w-md mx-auto my-12">
          <div className="w-16 h-16 rounded-full border-2 border-crimson-500/30 bg-crimson-900/20 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-crimson-400">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-crimson-400 mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            Expediente Corrupto
          </h3>
          <p className="text-sm text-fog-400 mb-5">
            Ha ocurrido un error inesperado. El expediente no se puede mostrar en este momento.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-6 py-2.5 rounded-lg btn-detective text-sm"
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
