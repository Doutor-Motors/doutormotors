import { motion } from "framer-motion";
import { TrendingUp, Users, HelpCircle, Car, Wrench, AlertTriangle, Activity, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { PopularQuestion } from "../hooks/useFavoriteQuestions";

// Icon mapping
const ICON_MAP: Record<string, typeof Car> = {
  AlertTriangle,
  Wrench,
  Car,
  HelpCircle,
  Activity,
  Sparkles,
};

interface PopularQuestionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  popularQuestions: PopularQuestion[];
  isLoading: boolean;
  onSelectQuestion: (question: PopularQuestion) => void;
}

const PopularQuestionsSheet = ({
  isOpen,
  onClose,
  popularQuestions,
  isLoading,
  onSelectQuestion,
}: PopularQuestionsSheetProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <SheetHeader className="p-4 border-b bg-gradient-to-r from-amber-500/10 to-orange-500/5">
          <SheetTitle className="flex items-center gap-2 text-amber-500">
            <TrendingUp className="w-5 h-5" />
            Perguntas Mais Populares
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            Veja as perguntas mais feitas por todos os usuários
          </p>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-10rem)]">
          <div className="p-4 space-y-3">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))
            ) : popularQuestions.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  Nenhuma pergunta popular ainda
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  As perguntas mais frequentes aparecerão aqui
                </p>
              </div>
            ) : (
              popularQuestions.map((question, index) => {
                const IconComponent = ICON_MAP[question.question_icon] || HelpCircle;
                const isTop3 = index < 3;
                
                return (
                  <motion.div
                    key={question.question_text}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all group relative overflow-hidden ${
                        isTop3 
                          ? "border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/5" 
                          : "hover:border-primary/30"
                      }`}
                      onClick={() => onSelectQuestion(question)}
                    >
                      {/* Rank badge */}
                      <div className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? "bg-amber-500 text-white" :
                        index === 1 ? "bg-gray-400 text-white" :
                        index === 2 ? "bg-amber-700 text-white" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        #{index + 1}
                      </div>
                      
                      <CardContent className="p-4 pr-12">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${question.question_color} bg-background/50`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                              {question.question_text}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                <Activity className="w-3 h-3 mr-1" />
                                {question.total_usage} usos
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <Users className="w-3 h-3 mr-1" />
                                {question.unique_users} usuários
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default PopularQuestionsSheet;
