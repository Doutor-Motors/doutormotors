import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, Wrench } from "lucide-react";
import { Tutorial, getDifficultyColor, getDifficultyLabel } from "@/services/tutorials/api";

interface TutorialCardProps {
  tutorial: Tutorial;
  onClick: (tutorial: Tutorial) => void;
}

const TutorialCard = ({ tutorial, onClick }: TutorialCardProps) => {
  return (
    <Card 
      className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] overflow-hidden group"
      onClick={() => onClick(tutorial)}
    >
      {/* Thumbnail */}
      <div className="relative h-40 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
        {tutorial.thumbnail ? (
          <img 
            src={tutorial.thumbnail} 
            alt={tutorial.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Wrench className="w-16 h-16 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Difficulty Badge */}
        <div className="absolute top-2 right-2">
          <Badge className={`${getDifficultyColor(tutorial.difficulty)} text-white text-xs`}>
            {getDifficultyLabel(tutorial.difficulty)}
          </Badge>
        </div>

        {/* Duration Overlay */}
        {tutorial.duration && (
          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {tutorial.duration}
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-chakra font-bold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {tutorial.title}
        </h3>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {tutorial.description || "Clique para ver o tutorial completo"}
        </p>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            <span>{tutorial.steps || 5} passos</span>
          </div>
          <Badge variant="outline" className="text-xs capitalize">
            {tutorial.category}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default TutorialCard;
