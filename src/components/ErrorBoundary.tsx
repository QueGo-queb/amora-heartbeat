import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Home, MessageCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  eventId?: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary caught an error:', error, errorInfo);
    
    // Envoyer à Sentry avec contexte riche
    const eventId = Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      tags: {
        section: 'error_boundary',
      },
      level: 'error',
    });

    this.setState({
      error,
      errorInfo,
      eventId,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportFeedback = () => {
    if (this.state.eventId) {
      Sentry.showReportDialog({ eventId: this.state.eventId });
    }
  };

  render() {
    if (this.state.hasError) {
      // Interface d'erreur personnalisée pour AMORA
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-xl text-red-900">
                Oups ! Une erreur est survenue
              </CardTitle>
              <CardDescription>
                Nous sommes désolés, quelque chose s'est mal passé. Notre équipe a été notifiée.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {import.meta.env.MODE === 'development' && (
                <details className="bg-gray-50 rounded p-3 text-sm">
                  <summary className="cursor-pointer font-medium">
                    Détails techniques (dev)
                  </summary>
                  <pre className="mt-2 text-xs overflow-auto">
                    {this.state.error?.stack}
                  </pre>
                </details>
              )}
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  💡 <strong>En attendant :</strong> Essayez de recharger la page ou retournez à l'accueil.
                </p>
              </div>
            </CardContent>
            
            <CardFooter className="flex gap-2">
              <Button 
                onClick={this.handleReload}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Recharger
              </Button>
              
              <Button 
                onClick={this.handleGoHome}
                className="flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                Accueil
              </Button>
            </CardFooter>
            
            {this.state.eventId && (
              <div className="px-6 pb-6">
                <Button 
                  onClick={this.handleReportFeedback}
                  variant="ghost"
                  size="sm"
                  className="w-full text-gray-600"
                >
                  Signaler ce problème
                </Button>
              </div>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
