import { Skeleton } from "@/components/ui/skeleton";

interface TutorialSkeletonProps {
  count?: number;
}

const TutorialSkeleton = ({ count = 4 }: TutorialSkeletonProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {[...Array(count)].map((_, i) => (
        <div 
          key={i} 
          className="p-2 rounded-lg bg-card border border-border animate-pulse"
        >
          <Skeleton className="w-full h-12 rounded mb-1.5" />
          <Skeleton className="h-3 w-full mb-1" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
};

export default TutorialSkeleton;
