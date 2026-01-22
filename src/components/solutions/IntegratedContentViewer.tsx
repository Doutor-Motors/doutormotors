import { useState } from "react";
import { ArrowLeft, ExternalLink, Play, Pause, Maximize2, Minimize2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface IntegratedContentViewerProps {
  sourceUrl: string;
  title: string;
  onClose: () => void;
  breadcrumb?: string;
}

const IntegratedContentViewer = ({
  sourceUrl,
  title,
  onClose,
  breadcrumb = "Loveble / Soluções"
}: IntegratedContentViewerProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      {/* Loveble Overlay Controls */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-md border-b z-10 transition-all duration-300">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>

            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <span>{breadcrumb}</span>
              <span>/</span>
              <span className="text-foreground font-medium truncate max-w-[200px]">{title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Fonte Externa
            </Badge>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>

            {isFullscreen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsFullscreen(false);
                  onClose();
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Iframe Container */}
      <div className={`relative ${isFullscreen ? 'h-[calc(100vh-57px)]' : 'h-[70vh] rounded-xl overflow-hidden border shadow-lg'}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Carregando conteúdo integrado...</span>
            </div>
          </div>
        )}

        <iframe
          src={sourceUrl}
          className="w-full h-full border-0"
          title={title}
          onLoad={handleIframeLoad}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          loading="lazy"
        />
      </div>

      {/* Progress Tracker */}
      {!isFullscreen && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>Fonte: Externa</span>
          <Button variant="link" size="sm" asChild className="text-primary">
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
              Abrir em nova aba
            </a>
          </Button>
        </div>
      )}
    </div>
  );
};

export default IntegratedContentViewer;
