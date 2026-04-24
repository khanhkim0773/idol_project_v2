import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
          <h2 className="text-red-500 font-bold text-xs mb-1">Đã có lỗi xảy ra</h2>
          <p className="text-[10px] text-red-400/70">{this.state.error?.message || "Vui lòng tải lại trang"}</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-3 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 text-[10px] rounded-lg transition-colors"
          >
            Thử lại
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
