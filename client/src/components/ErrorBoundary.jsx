import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Nexus UI ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#0c0d12] text-zinc-100 font-sans select-none">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-white/10 shadow-2xl flex flex-col items-center text-center backdrop-blur-xl">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 shadow-lg">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white mb-2">Workspace Encountered an Error</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mb-6">
              Nexus AI encountered a rendering exception. Your chat data and session remain safely preserved.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Workspace</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
