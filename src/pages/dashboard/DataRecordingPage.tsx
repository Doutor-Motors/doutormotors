import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, FileText } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDataRecording, DataRecording, DataPoint } from "@/hooks/useDataRecording";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/subscription/UpgradePrompt";
import { RecordingList } from "@/components/dataRecording/RecordingList";
import { RecordingChart } from "@/components/dataRecording/RecordingChart";
import { RecordingControls } from "@/components/dataRecording/RecordingControls";
import { exportToCSV, exportToBRC } from "@/services/dataRecording/export";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
}

export default function DataRecordingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canRecordData, canExportCSV, isPro } = useSubscription();
  const {
    recordings,
    isLoadingRecordings,
    isRecording,
    startRecording,
    stopRecording,
    deleteRecording,
    renameRecording,
    fetchDataPoints,
  } = useDataRecording();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<DataRecording | null>(null);
  const [selectedDataPoints, setSelectedDataPoints] = useState<DataPoint[]>([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isLoadingDataPoints, setIsLoadingDataPoints] = useState(false);

  // Fetch vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from("vehicles")
        .select("id, brand, model, year")
        .eq("user_id", user.id);
      if (data) setVehicles(data);
    };
    fetchVehicles();
  }, [user?.id]);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // View recording details
  const handleViewRecording = useCallback(async (recording: DataRecording) => {
    setSelectedRecording(recording);
    setIsLoadingDataPoints(true);
    try {
      const points = await fetchDataPoints(recording.id);
      setSelectedDataPoints(points);
    } catch (error) {
      toast.error("Erro ao carregar dados da gravação");
    } finally {
      setIsLoadingDataPoints(false);
    }
  }, [fetchDataPoints]);

  // Export handlers
  const handleExportCSV = useCallback(async (recording: DataRecording) => {
    if (!canExportCSV) {
      toast.error("Upgrade para Pro para exportar em CSV");
      return;
    }
    try {
      const points = await fetchDataPoints(recording.id);
      exportToCSV(points, recording.name);
      toast.success("Arquivo CSV exportado");
    } catch (error) {
      toast.error("Erro ao exportar CSV");
    }
  }, [canExportCSV, fetchDataPoints]);

  const handleExportBRC = useCallback(async (recording: DataRecording) => {
    if (!canExportCSV) {
      toast.error("Upgrade para Pro para exportar em BRC");
      return;
    }
    try {
      const points = await fetchDataPoints(recording.id);
      exportToBRC(points, recording.name, { vehicleId: recording.vehicle_id });
      toast.success("Arquivo BRC exportado");
    } catch (error) {
      toast.error("Erro ao exportar BRC");
    }
  }, [canExportCSV, fetchDataPoints]);

  // Start recording handler
  const handleStartRecording = useCallback((vehicleId: string, name: string) => {
    startRecording.mutate({ vehicleId, name });
  }, [startRecording]);

  // If user doesn't have access to data recording
  if (!canRecordData) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">Gravação de Dados</h1>
          </div>
          
          <UpgradePrompt
            feature="Gravação de Dados"
            description="Com o plano Pro, você pode gravar dados do seu veículo em tempo real, visualizar gráficos detalhados e exportar em CSV ou BRC."
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Gravação de Dados</h1>
              <p className="text-muted-foreground">
                Grave e analise dados do seu veículo
              </p>
            </div>
          </div>
          
          <RecordingControls
            vehicles={vehicles}
            isRecording={isRecording}
            recordingDuration={recordingDuration}
            onStart={handleStartRecording}
            onStop={() => stopRecording.mutate()}
            disabled={vehicles.length === 0}
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="recordings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="recordings">Gravações</TabsTrigger>
            {selectedRecording && (
              <TabsTrigger value="view">
                Visualizar: {selectedRecording.name}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="recordings">
            <RecordingList
              recordings={recordings || []}
              onView={handleViewRecording}
              onDelete={(id) => deleteRecording.mutate(id)}
              onRename={(id, name) => renameRecording.mutate({ recordingId: id, name })}
              onExportCSV={handleExportCSV}
              onExportBRC={handleExportBRC}
              isLoading={isLoadingRecordings}
            />
          </TabsContent>

          {selectedRecording && (
            <TabsContent value="view" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{selectedRecording.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedRecording.data_points_count} pontos de dados
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportCSV(selectedRecording)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportBRC(selectedRecording)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    BRC
                  </Button>
                </div>
              </div>

              {isLoadingDataPoints ? (
                <Card className="animate-pulse h-96" />
              ) : (
                <RecordingChart
                  dataPoints={selectedDataPoints}
                  title={selectedRecording.name}
                />
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
