import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Play, Square, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
}

interface RecordingControlsProps {
  vehicles: Vehicle[];
  isRecording: boolean;
  recordingDuration: number;
  onStart: (vehicleId: string, name: string) => void;
  onStop: () => void;
  disabled?: boolean;
}

export function RecordingControls({
  vehicles,
  isRecording,
  recordingDuration,
  onStart,
  onStop,
  disabled,
}: RecordingControlsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [recordingName, setRecordingName] = useState("");

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    if (!selectedVehicle) return;
    
    const name = recordingName.trim() || 
      `Gravação ${format(new Date(), "yyyy-MM-dd HH-mm-ss", { locale: ptBR })}`;
    
    onStart(selectedVehicle, name);
    setDialogOpen(false);
    setRecordingName("");
  };

  if (isRecording) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Circle className="w-4 h-4 text-destructive fill-destructive animate-pulse" />
              </div>
              <div>
                <p className="font-medium">Gravando...</p>
                <p className="text-2xl font-mono font-bold text-destructive">
                  {formatDuration(recordingDuration)}
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              size="lg"
              onClick={onStop}
              className="gap-2"
            >
              <Square className="w-4 h-4" />
              Parar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="gap-2 w-full sm:w-auto"
          disabled={disabled || vehicles.length === 0}
        >
          <Play className="w-4 h-4" />
          Iniciar Gravação
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Gravação</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Veículo</Label>
            <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um veículo" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model} ({vehicle.year})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Nome da gravação (opcional)</Label>
            <Input
              value={recordingName}
              onChange={(e) => setRecordingName(e.target.value)}
              placeholder={`Gravação ${format(new Date(), "yyyy-MM-dd HH-mm-ss")}`}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleStart} disabled={!selectedVehicle}>
            <Play className="w-4 h-4 mr-2" />
            Iniciar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
