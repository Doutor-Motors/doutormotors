import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ExpertCardProps {
  onClick: () => void;
}

const ExpertCard = ({ onClick }: ExpertCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className="cursor-pointer border-2 border-primary/30 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all group overflow-hidden bg-gradient-to-br from-primary/5 to-transparent"
        onClick={onClick}
      >
        <CardContent className="p-6 flex flex-col items-center text-center relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Icon */}
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors relative">
            <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            <div className="absolute -top-1 -right-1">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                IA
              </Badge>
            </div>
          </div>
          
          {/* Title */}
          <h3 className="font-chakra font-bold text-lg md:text-xl uppercase group-hover:text-primary transition-colors mb-2">
            Especialista Automotivo
          </h3>
          
          {/* Description */}
          <p className="text-muted-foreground text-sm leading-relaxed">
            Tire dúvidas com nosso especialista IA sobre mecânica, manutenção e diagnósticos
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ExpertCard;
