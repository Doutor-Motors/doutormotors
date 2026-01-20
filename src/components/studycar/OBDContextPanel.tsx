import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Plug,
  RefreshCw,
  Wifi,
  WifiOff,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/store/useAppStore";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface DiagnosticCode {
  code: string;
  description: string;
  priority: "critical" | "attention" | "preventive";
  severity: number;
}

interface OBDContextPanelProps {
  onCodesSelected: (codes: DiagnosticCode[]) => void;
  selectedCodes: DiagnosticCode[];
}

const OBDContextPanel = ({ onCodesSelected, selectedCodes }: OBDContextPanelProps) => {
  const { user } = useAuth();
  const { obdConnectionStatus } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [diagnosticCodes, setDiagnosticCodes] = useState<DiagnosticCode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastDiagnosticDate, setLastDiagnosticDate] = useState<string | null>(null);
  
  // Fetch user's latest diagnostic codes
  const fetchDiagnosticCodes = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get user's vehicles
      const { data: vehicles } = await supabase
        .from("vehicles")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);
      
      if (!vehicles || vehicles.length === 0) {
        setIsLoading(false);
        return;
      }
      
      // Get latest diagnostic for user's vehicle
      const { data: diagnostics } = await supabase
        .from("diagnostics")
        .select(`
          id,
          created_at,
          diagnostic_items (
            dtc_code,
            description_human,
            priority,
            severity
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);
      
      if (diagnostics && diagnostics.length > 0) {
        const items = diagnostics[0].diagnostic_items || [];
        const codes: DiagnosticCode[] = items.map((item: any) => ({
          code: item.dtc_code,
          description: item.description_human,
          priority: item.priority,
          severity: item.severity,
        }));
        setDiagnosticCodes(codes);
        setLastDiagnosticDate(diagnostics[0].created_at);
      }
    } catch (error) {
      console.error("Error fetching diagnostic codes:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDiagnosticCodes();
  }, [user]);
  
  const toggleCode = (code: DiagnosticCode) => {
    const isSelected = selectedCodes.some(c => c.code === code.code);
    if (isSelected) {
      onCodesSelected(selectedCodes.filter(c => c.code !== code.code));
    } else {
      onCodesSelected([...selectedCodes, code]);
    }
  };
  
  const selectAllCodes = () => {
    onCodesSelected([...diagnosticCodes]);
  };
  
  const clearSelection = () => {
    onCodesSelected([]);
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-destructive text-destructive-foreground";
      case "attention": return "bg-amber-500 text-white";
      case "preventive": return "bg-green-500 text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };
  
  const isConnected = obdConnectionStatus === "connected";
  
  return (
    <Card className="bg-muted/30 border-dashed">
      <CardContent className="p-3">
        {/* Header */}
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-full ${isConnected ? "bg-green-500/20" : "bg-muted"}`}>
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium flex items-center gap-2">
                Dados OBD
                {selectedCodes.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedCodes.length} código(s)
                  </Badge>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {diagnosticCodes.length > 0 
                  ? `${diagnosticCodes.length} código(s) detectados`
                  : "Nenhum diagnóstico encontrado"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {diagnosticCodes.length > 0 && (
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  diagnosticCodes.some(c => c.priority === "critical") 
                    ? "border-destructive text-destructive" 
                    : ""
                }`}
              >
                {diagnosticCodes.some(c => c.priority === "critical") && (
                  <AlertTriangle className="w-3 h-3 mr-1" />
                )}
                {diagnosticCodes.filter(c => c.priority === "critical").length} crítico(s)
              </Badge>
            )}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>
        
        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-3 mt-3 border-t border-border">
                {/* Actions */}
                <div className="flex items-center gap-2 mb-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchDiagnosticCodes}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? "animate-spin" : ""}`} />
                    Atualizar
                  </Button>
                  
                  {diagnosticCodes.length > 0 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectAllCodes}
                        className="text-xs"
                      >
                        <Activity className="w-3 h-3 mr-1" />
                        Selecionar Todos
                      </Button>
                      
                      {selectedCodes.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearSelection}
                          className="text-xs"
                        >
                          Limpar
                        </Button>
                      )}
                    </>
                  )}
                </div>
                
                {/* Codes list */}
                {diagnosticCodes.length > 0 ? (
                  <ScrollArea className="max-h-40">
                    <div className="space-y-1.5">
                      {diagnosticCodes.map((code) => {
                        const isSelected = selectedCodes.some(c => c.code === code.code);
                        return (
                          <motion.div
                            key={code.code}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => toggleCode(code)}
                            className={`p-2 rounded-md cursor-pointer border transition-colors ${
                              isSelected 
                                ? "border-primary bg-primary/10" 
                                : "border-transparent bg-muted/50 hover:bg-muted"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded flex items-center justify-center ${
                                isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                              }`}>
                                {isSelected && <CheckCircle className="w-3 h-3" />}
                              </div>
                              <Badge 
                                className={`text-xs font-mono ${getPriorityColor(code.priority)}`}
                              >
                                {code.code}
                              </Badge>
                              <span className="text-xs text-muted-foreground truncate flex-1">
                                {code.description.length > 40 
                                  ? code.description.substring(0, 40) + "..." 
                                  : code.description}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-4">
                    <Plug className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Conecte o scanner OBD para detectar códigos de erro
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ou realize um diagnóstico no Centro de Diagnóstico
                    </p>
                  </div>
                )}
                
                {/* Last diagnostic info */}
                {lastDiagnosticDate && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Último diagnóstico: {new Date(lastDiagnosticDate).toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default OBDContextPanel;
