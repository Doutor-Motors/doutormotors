import { useState, useCallback } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  RotateCcw,
  Target,
  Settings2,
  Zap,
  Camera,
  AlertTriangle,
  Play,
  Check,
  X,
  Loader2,
  Lock,
  Info,
  Bluetooth,
  Crown,
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { 
  getOBDCodingManager, 
  CodingFunction, 
  CodingCategory,
  CATEGORY_LABELS,
  RISK_LEVEL_CONFIG,
  CodingFunctionResult,
} from '@/services/obd/codingFunctions';
import { getOBDConnectionManager } from '@/services/obd/OBDConnectionManager';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';

const CATEGORY_ICONS = {
  adaptation_reset: RotateCcw,
  calibration: Target,
  module_config: Settings2,
  output_test: Zap,
  freeze_frame: Camera,
};

export default function CodingFunctionsPage() {
  const { currentPlan } = useSubscription();
  const isPro = currentPlan === 'pro';
  
  const [selectedCategory, setSelectedCategory] = useState<CodingCategory>('adaptation_reset');
  const [selectedFunction, setSelectedFunction] = useState<CodingFunction | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [progress, setProgress] = useState({ step: 0, total: 0, message: '' });
  const [result, setResult] = useState<CodingFunctionResult | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const codingManager = getOBDCodingManager();
  const connectionManager = getOBDConnectionManager();
  const connectionInfo = connectionManager.getConnectionInfo();
  const isConnected = connectionInfo.state === 'connected';

  const categories = Object.entries(CATEGORY_LABELS) as [CodingCategory, typeof CATEGORY_LABELS[CodingCategory]][];

  const handleSelectFunction = useCallback((func: CodingFunction) => {
    setSelectedFunction(func);
    setResult(null);
    
    const { canExecute, reason } = codingManager.canExecuteFunction(func, isPro);
    
    if (!canExecute && reason?.includes('Pro')) {
      return; // Will show upgrade prompt
    }
  }, [codingManager, isPro]);

  const handleExecute = useCallback(async () => {
    if (!selectedFunction) return;
    
    setShowConfirmDialog(false);
    setIsExecuting(true);
    setProgress({ step: 0, total: selectedFunction.commands.length, message: 'Iniciando...' });
    
    try {
      const executionResult = await codingManager.executeFunction(
        selectedFunction,
        (step, total, message) => {
          setProgress({ step, total, message });
        }
      );
      
      setResult(executionResult);
      
      if (executionResult.success) {
        toast.success('Função executada com sucesso!');
      } else {
        toast.error(`Falha: ${executionResult.message}`);
      }
    } catch (error: any) {
      toast.error('Erro durante execução');
      setResult({
        success: false,
        functionId: selectedFunction.id,
        message: 'Erro inesperado',
        details: error.message,
        rawResponses: [],
        timestamp: new Date(),
        duration: 0,
      });
    } finally {
      setIsExecuting(false);
      setProgress({ step: 0, total: 0, message: '' });
    }
  }, [selectedFunction, codingManager]);

  const handleStartExecution = useCallback(() => {
    if (!selectedFunction) return;
    
    if (selectedFunction.confirmationRequired) {
      setShowConfirmDialog(true);
    } else {
      handleExecute();
    }
  }, [selectedFunction, handleExecute]);

  const functionsForCategory = codingManager.getFunctionsByCategory(selectedCategory);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Settings2 className="h-6 w-6 text-primary" />
              Funções de Coding
            </h1>
            <p className="text-muted-foreground">
              Funções avançadas de configuração e programação do veículo
            </p>
          </div>
          
          {!isPro && (
            <Badge variant="secondary" className="gap-1">
              <Lock className="h-3 w-3" />
              Algumas funções requerem Pro
            </Badge>
          )}
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Não Conectado</AlertTitle>
            <AlertDescription>
              Conecte-se a um adaptador OBD-II para executar funções de coding.
              {connectionInfo.isSimulated && ' (Modo de simulação disponível para demonstração)'}
            </AlertDescription>
          </Alert>
        )}

        {isConnected && connectionInfo.isSimulated && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Modo Simulação</AlertTitle>
            <AlertDescription>
              Conectado em modo de demonstração. As funções serão simuladas sem efeito real.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories & Functions */}
          <div className="lg:col-span-2 space-y-4">
            <Tabs 
              value={selectedCategory} 
              onValueChange={(v) => {
                setSelectedCategory(v as CodingCategory);
                setSelectedFunction(null);
                setResult(null);
              }}
            >
              <TabsList className="grid w-full grid-cols-5">
                {categories.map(([key, config]) => {
                  const Icon = CATEGORY_ICONS[key];
                  return (
                    <TabsTrigger key={key} value={key} className="flex items-center gap-1 text-xs">
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{config.name.split(' ')[0]}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {categories.map(([key, config]) => (
                <TabsContent key={key} value={key} className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {(() => {
                      const Icon = CATEGORY_ICONS[key];
                      return <Icon className="h-4 w-4" />;
                    })()}
                    {config.description}
                  </div>

                  <div className="grid gap-3">
                    {functionsForCategory.map((func) => {
                      const riskConfig = RISK_LEVEL_CONFIG[func.riskLevel];
                      const isLocked = func.requiresPro && !isPro;
                      const isSelected = selectedFunction?.id === func.id;
                      
                      return (
                        <Card 
                          key={func.id}
                          className={`cursor-pointer transition-all ${
                            isSelected 
                              ? 'ring-2 ring-primary border-primary' 
                              : 'hover:border-primary/50'
                          } ${isLocked ? 'opacity-60' : ''}`}
                          onClick={() => handleSelectFunction(func)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium text-foreground truncate">
                                    {func.name}
                                  </h3>
                                  {isLocked && (
                                    <Badge variant="secondary" className="gap-1 shrink-0">
                                      <Crown className="h-3 w-3" />
                                      Pro
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {func.description}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge 
                                    variant="outline" 
                                    className={`${riskConfig.bgColor} ${riskConfig.color} border-0`}
                                  >
                                    Risco: {riskConfig.label}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    ~{func.estimatedDuration}s
                                  </span>
                                </div>
                              </div>
                              
                              {isSelected && !isLocked && (
                                <Check className="h-5 w-5 text-primary shrink-0" />
                              )}
                              {isLocked && (
                                <Lock className="h-5 w-5 text-muted-foreground shrink-0" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Execution Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Execução
                </CardTitle>
                <CardDescription>
                  Selecione uma função para executar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedFunction ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Selecione uma função ao lado</p>
                  </div>
                ) : selectedFunction.requiresPro && !isPro ? (
                  <UpgradePrompt 
                    feature="funções avançadas de coding"
                    compact
                  />
                ) : (
                  <>
                    <div className="space-y-2">
                      <h4 className="font-medium">{selectedFunction.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedFunction.description}
                      </p>
                    </div>

                    {/* Requirements */}
                    <div className="space-y-1 text-sm">
                      {selectedFunction.requiresIgnitionOn && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Check className="h-4 w-4 text-green-500" />
                          Ignição ligada
                        </div>
                      )}
                      {selectedFunction.requiresEngineOff && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          Motor desligado
                        </div>
                      )}
                    </div>

                    {/* Progress */}
                    {isExecuting && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>{progress.message}</span>
                          <span>{progress.step}/{progress.total}</span>
                        </div>
                        <Progress 
                          value={(progress.step / progress.total) * 100} 
                        />
                      </div>
                    )}

                    {/* Result */}
                    {result && !isExecuting && (
                      <Alert variant={result.success ? 'default' : 'destructive'}>
                        {result.success ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                        <AlertTitle>
                          {result.success ? 'Sucesso' : 'Falha'}
                        </AlertTitle>
                        <AlertDescription>
                          {result.message}
                          {result.details && (
                            <p className="text-xs mt-1 opacity-70">{result.details}</p>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Execute Button */}
                    <Button 
                      className="w-full"
                      onClick={handleStartExecution}
                      disabled={isExecuting || !isConnected}
                    >
                      {isExecuting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Executando...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Executar Função
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Connection Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bluetooth className="h-4 w-4" />
                  Conexão OBD
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={isConnected ? 'default' : 'secondary'}>
                      {isConnected ? 'Conectado' : 'Desconectado'}
                    </Badge>
                  </div>
                  {isConnected && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Modo:</span>
                        <span>{connectionInfo.isSimulated ? 'Simulação' : 'Real'}</span>
                      </div>
                      {connectionInfo.protocol && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Protocolo:</span>
                          <span className="text-xs truncate max-w-[120px]">{connectionInfo.protocol}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Confirmation Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Confirmar Execução
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  Você está prestes a executar: <strong>{selectedFunction?.name}</strong>
                </p>
                {selectedFunction && (
                  <div className={`p-3 rounded-lg ${RISK_LEVEL_CONFIG[selectedFunction.riskLevel].bgColor}`}>
                    <p className={`text-sm ${RISK_LEVEL_CONFIG[selectedFunction.riskLevel].color}`}>
                      ⚠️ Nível de risco: <strong>{RISK_LEVEL_CONFIG[selectedFunction.riskLevel].label}</strong>
                    </p>
                  </div>
                )}
                <p className="text-sm">
                  {selectedFunction?.requiresEngineOff && 
                    '⚠️ Certifique-se de que o motor está DESLIGADO. '
                  }
                  {selectedFunction?.requiresIgnitionOn && 
                    'A ignição deve estar LIGADA (posição ON). '
                  }
                </p>
                <p className="text-sm font-medium">
                  Deseja continuar?
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleExecute}>
                Executar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
