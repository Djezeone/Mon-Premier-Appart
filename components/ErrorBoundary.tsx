import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Trash2 } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleHardReset = () => {
    if (window.confirm("Cela va effacer toutes vos données locales (Inventaire, Chat, etc.) pour réparer l'application. Cette action est irréversible. Continuer ?")) {
        localStorage.clear();
        window.location.reload();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-800 mb-2">Oups, l'application a planté.</h1>
              <p className="text-gray-500 text-sm mb-6">
                Une erreur inattendue s'est produite. Cela peut arriver lors d'une mise à jour ou d'un problème de données.
              </p>
              
              <div className="bg-gray-100 p-3 rounded-lg text-left mb-6 overflow-auto max-h-32">
                  <p className="text-xs text-gray-500 mb-1 font-bold">Détail technique :</p>
                  <code className="text-xs text-red-600 font-mono break-all">
                      {this.state.error?.toString()}
                  </code>
              </div>

              <div className="space-y-3">
                  <button 
                    onClick={this.handleReload}
                    className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                  >
                      <RefreshCcw size={18} /> Recharger la page
                  </button>
                  
                  <button 
                    onClick={this.handleHardReset}
                    className="w-full bg-white border border-gray-200 text-gray-600 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 hover:text-red-500 transition-colors"
                  >
                      <Trash2 size={18} /> Réinitialiser (Hard Reset)
                  </button>
              </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;