import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  id: string;
  name: string;
  icon: string;
  description: string;
  isSelected?: boolean;
  onClick: (id: string) => void;
}

const CategoryCard = ({ id, name, icon, description, isSelected, onClick }: CategoryCardProps) => {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105",
        "border-2",
        isSelected 
          ? "border-primary bg-primary/10" 
          : "border-transparent hover:border-primary/50"
      )}
      onClick={() => onClick(id)}
    >
      <CardContent className="p-4 text-center">
        <div className="text-4xl mb-2">{icon}</div>
        <h3 className="font-chakra font-bold uppercase text-foreground">{name}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
