import { useState, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface DataRecording {
  id: string;
  user_id: string;
  vehicle_id: string;
  name: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  parameters_count: number;
  data_points_count: number;
  status: "recording" | "completed" | "cancelled";
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DataPoint {
  id: string;
  recording_id: string;
  timestamp: string;
  parameters: Record<string, number | string>;
  created_at: string;
}

export interface RecordingParameter {
  id: string;
  name: string;
  unit: string;
  value: number;
  min?: number;
  max?: number;
}

export function useDataRecording(vehicleId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isRecording, setIsRecording] = useState(false);
  const [currentRecordingId, setCurrentRecordingId] = useState<string | null>(null);
  const [dataBuffer, setDataBuffer] = useState<DataPoint[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch all recordings for user
  const { data: recordings, isLoading: isLoadingRecordings } = useQuery({
    queryKey: ["data-recordings", user?.id, vehicleId],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from("data_recordings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (vehicleId) {
        query = query.eq("vehicle_id", vehicleId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DataRecording[];
    },
    enabled: !!user?.id,
  });

  // Fetch data points for a specific recording
  const fetchDataPoints = async (recordingId: string): Promise<DataPoint[]> => {
    const { data, error } = await supabase
      .from("recording_data_points")
      .select("*")
      .eq("recording_id", recordingId)
      .order("timestamp", { ascending: true });

    if (error) throw error;
    return data as DataPoint[];
  };

  // Start recording
  const startRecording = useMutation({
    mutationFn: async ({ vehicleId, name }: { vehicleId: string; name: string }) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("data_recordings")
        .insert({
          user_id: user.id,
          vehicle_id: vehicleId,
          name,
          status: "recording",
        })
        .select()
        .single();

      if (error) throw error;
      return data as DataRecording;
    },
    onSuccess: (data) => {
      setCurrentRecordingId(data.id);
      setIsRecording(true);
      setDataBuffer([]);
      queryClient.invalidateQueries({ queryKey: ["data-recordings"] });
      toast.success("Gravação iniciada");
    },
    onError: (error) => {
      toast.error("Erro ao iniciar gravação: " + error.message);
    },
  });

  // Add data point
  const addDataPoint = useCallback(
    async (parameters: Record<string, number | string>) => {
      if (!currentRecordingId) return;

      const newPoint: DataPoint = {
        id: crypto.randomUUID(),
        recording_id: currentRecordingId,
        timestamp: new Date().toISOString(),
        parameters,
        created_at: new Date().toISOString(),
      };

      // Add to local buffer first
      setDataBuffer((prev) => [...prev, newPoint]);

      // Batch insert every 10 points
      if (dataBuffer.length >= 9) {
        const pointsToInsert = [...dataBuffer, newPoint].map((p) => ({
          recording_id: p.recording_id,
          timestamp: p.timestamp,
          parameters: p.parameters,
        }));

        const { error } = await supabase
          .from("recording_data_points")
          .insert(pointsToInsert);

        if (error) {
          console.error("Erro ao salvar pontos:", error);
        } else {
          setDataBuffer([]);
        }
      }
    },
    [currentRecordingId, dataBuffer]
  );

  // Stop recording
  const stopRecording = useMutation({
    mutationFn: async () => {
      if (!currentRecordingId) throw new Error("Nenhuma gravação ativa");

      // Save remaining buffer
      if (dataBuffer.length > 0) {
        const pointsToInsert = dataBuffer.map((p) => ({
          recording_id: p.recording_id,
          timestamp: p.timestamp,
          parameters: p.parameters,
        }));

        await supabase.from("recording_data_points").insert(pointsToInsert);
      }

      // Get final count
      const { count } = await supabase
        .from("recording_data_points")
        .select("*", { count: "exact", head: true })
        .eq("recording_id", currentRecordingId);

      // Update recording status
      const { data, error } = await supabase
        .from("data_recordings")
        .update({
          status: "completed",
          ended_at: new Date().toISOString(),
          data_points_count: count || 0,
        })
        .eq("id", currentRecordingId)
        .select()
        .single();

      if (error) throw error;
      return data as DataRecording;
    },
    onSuccess: () => {
      setIsRecording(false);
      setCurrentRecordingId(null);
      setDataBuffer([]);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      queryClient.invalidateQueries({ queryKey: ["data-recordings"] });
      toast.success("Gravação finalizada");
    },
    onError: (error) => {
      toast.error("Erro ao parar gravação: " + error.message);
    },
  });

  // Delete recording
  const deleteRecording = useMutation({
    mutationFn: async (recordingId: string) => {
      const { error } = await supabase
        .from("data_recordings")
        .delete()
        .eq("id", recordingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-recordings"] });
      toast.success("Gravação excluída");
    },
    onError: (error) => {
      toast.error("Erro ao excluir gravação: " + error.message);
    },
  });

  // Rename recording
  const renameRecording = useMutation({
    mutationFn: async ({ recordingId, name }: { recordingId: string; name: string }) => {
      const { error } = await supabase
        .from("data_recordings")
        .update({ name })
        .eq("id", recordingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-recordings"] });
      toast.success("Gravação renomeada");
    },
  });

  return {
    recordings,
    isLoadingRecordings,
    isRecording,
    currentRecordingId,
    dataBuffer,
    startRecording,
    stopRecording,
    addDataPoint,
    deleteRecording,
    renameRecording,
    fetchDataPoints,
  };
}
