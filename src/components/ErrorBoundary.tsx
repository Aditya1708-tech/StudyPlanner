import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import { logger } from '../utils/logger';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary to catch render-time exceptions,
 * preventing full-app crashes and allowing the user to retry/reload.
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-mesh flex items-center justify-center p-6 text-slate-800 dark:text-slate-100 transition-colors duration-300">
          <GlassCard hover={false} className="max-w-md w-full p-8 text-center space-y-6 border border-red-500/20 bg-gradient-to-tr from-red-500/5 to-transparent">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-650 dark:text-red-400 border border-red-500/20 mx-auto shadow-lg shadow-red-500/5">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h1 className="font-heading font-black text-2xl tracking-tight text-slate-900 dark:text-white">
                Something went wrong
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                An unexpected application rendering error occurred. Please try reloading.
              </p>
              {this.state.error && (
                <div className="mt-3 p-3.5 rounded-xl bg-black/5 dark:bg-black/35 text-left border border-slate-200/40 dark:border-slate-850/40">
                  <p className="text-[10px] font-mono text-slate-550 dark:text-slate-400 break-all">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={this.handleRetry}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-500 text-white font-extrabold text-xs shadow-lg shadow-red-500/25 hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer w-full focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              <span>Retry and Reload</span>
            </button>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
