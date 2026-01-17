import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ContentSource = 'loveble' | 'carcarekiosk';

interface SourceSelectorProps {
  activeSource: ContentSource;
  onSourceChange: (source: ContentSource) => void;
  hasExternalContent: boolean;
  isLoadingExternal?: boolean;
}

const SourceSelector = ({
  activeSource,
  onSourceChange,
  hasExternalContent,
  isLoadingExternal = false,
}: SourceSelectorProps) => {
  if (!hasExternalContent) return null;

  return (
    <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
      <button
        onClick={() => onSourceChange('loveble')}
        className={cn(
          "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
          activeSource === 'loveble'
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Versão Loveble
      </button>
      
      <button
        onClick={() => onSourceChange('carcarekiosk')}
        disabled={isLoadingExternal}
        className={cn(
          "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
          activeSource === 'carcarekiosk'
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
          isLoadingExternal && "opacity-50 cursor-not-allowed"
        )}
      >
        <span>Tutorial Completo</span>
        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
          CarCareKiosk
        </Badge>
      </button>
    </div>
  );
};

export default SourceSelector;
