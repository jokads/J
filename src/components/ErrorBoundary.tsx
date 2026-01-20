
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturou erro:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // ✅ Gravar erro para auditoria (opcional)
    try {
      const errorLog = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('last_ui_error', JSON.stringify(errorLog));
    } catch (e) {
      console.error('Falha ao gravar erro:', e);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-red-100 text-red-600 rounded-full">
              <i className="ri-error-warning-line text-4xl"></i>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Oops! Algo correu mal
            </h1>
            
            <p className="text-gray-600 mb-8">
              Pedimos desculpa pelo inconveniente. Ocorreu um erro inesperado ao carregar esta página.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                <p className="text-sm font-mono text-red-800 mb-2">
                  <strong>Erro:</strong> {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <pre className="text-xs text-red-700 overflow-auto max-h-40">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={this.handleReload}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap cursor-pointer"
              >
                <i className="ri-refresh-line mr-2"></i>
                Recarregar Página
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all duration-300 whitespace-nowrap cursor-pointer"
              >
                <i className="ri-home-line mr-2"></i>
                Voltar ao Início
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Se o problema persistir, contacte-nos em{' '}
                <a 
                  href="mailto:jokadamas616@gmail.com" 
                  className="text-amber-600 hover:text-amber-700 font-medium cursor-pointer"
                >
                  jokadamas616@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
