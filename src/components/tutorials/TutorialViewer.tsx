import { useState } from "react";
import { ArrowLeft, Clock, Wrench, AlertTriangle, CheckCircle, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { TutorialContent, getDifficultyColor } from "@/services/tutorials/api";

interface TutorialViewerProps {
  content: TutorialContent;
  onClose: () => void;
}

const TutorialViewer = ({ content, onClose }: TutorialViewerProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const totalSteps = content.steps.length;
  const progress = (completedSteps.size / totalSteps) * 100;

  const handlePrevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(currentStep + 1);
    }
  };

  const handleMarkComplete = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
  };

  const currentStepData = content.steps[currentStep];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-chakra text-2xl md:text-3xl font-bold uppercase text-foreground">
            {content.title}
          </h1>
          <p className="text-muted-foreground">{content.description}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Passo {currentStep + 1} de {totalSteps}
            </span>
            <span className="text-sm text-muted-foreground">
              {completedSteps.size} concluídos
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Tempo</p>
            <p className="font-bold text-sm">{content.estimatedTime}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className={`w-6 h-6 rounded-full ${getDifficultyColor(content.difficulty)} mx-auto mb-2`} />
            <p className="text-xs text-muted-foreground">Dificuldade</p>
            <p className="font-bold text-sm capitalize">{content.difficulty}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Wrench className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Ferramentas</p>
            <p className="font-bold text-sm">{content.tools.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Passos</p>
            <p className="font-bold text-sm">{totalSteps}</p>
          </CardContent>
        </Card>
      </div>

      {/* Warnings */}
      {content.warnings.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="font-chakra text-lg flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-5 h-5" />
              Avisos de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {content.warnings.map((warning, idx) => (
                <li key={idx} className="text-sm text-orange-700 dark:text-orange-400 flex items-start gap-2">
                  <span>•</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Current Step */}
      <Card className="border-primary">
        <CardHeader className="bg-primary/5">
          <div className="flex items-center justify-between">
            <CardTitle className="font-chakra uppercase">
              Passo {currentStepData.number}: {currentStepData.title}
            </CardTitle>
            {completedSteps.has(currentStep) && (
              <Badge className="bg-green-500">
                <CheckCircle className="w-3 h-3 mr-1" />
                Concluído
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-foreground leading-relaxed mb-4">{currentStepData.content}</p>
          
          {currentStepData.tips && currentStepData.tips.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
              <h4 className="font-bold text-blue-700 dark:text-blue-400 mb-2">💡 Dicas</h4>
              <ul className="space-y-1">
                {currentStepData.tips.map((tip, idx) => (
                  <li key={idx} className="text-sm text-blue-600 dark:text-blue-300">• {tip}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button 
          variant="outline" 
          onClick={handlePrevStep}
          disabled={currentStep === 0}
          className="flex-1"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>
        
        {!completedSteps.has(currentStep) && (
          <Button variant="secondary" onClick={handleMarkComplete}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Marcar
          </Button>
        )}
        
        <Button 
          onClick={handleNextStep}
          disabled={currentStep === totalSteps - 1}
          className="flex-1"
        >
          Próximo
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Tools & Parts */}
      <div className="grid md:grid-cols-2 gap-6">
        {content.tools.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-chakra uppercase text-lg flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Ferramentas Necessárias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {content.tools.map((tool, idx) => (
                  <Badge key={idx} variant="secondary" className="capitalize">{tool}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {content.parts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-chakra uppercase text-lg flex items-center gap-2">
                🔩 Peças Necessárias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {content.parts.map((part, idx) => (
                  <Badge key={idx} variant="outline" className="capitalize">{part}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Source Link */}
      <div className="text-center">
        <a 
          href={content.sourceUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
        >
          Ver fonte original
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

export default TutorialViewer;
