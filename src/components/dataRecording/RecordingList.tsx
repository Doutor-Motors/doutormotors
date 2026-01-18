import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Play,
  Square,
  Trash2,
  Download,
  FileText,
  MoreVertical,
  Clock,
  Database,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataRecording } from "@/hooks/useDataRecording";

interface RecordingListProps {
  recordings: DataRecording[];
  onView: (recording: DataRecording) => void;
  onDelete: (recordingId: string) => void;
  onRename: (recordingId: string, name: string) => void;
  onExportCSV: (recording: DataRecording) => void;
  onExportBRC: (recording: DataRecording) => void;
  isLoading?: boolean;
}

export function RecordingList({
  recordings,
  onView,
  onDelete,
  onRename,
  onExportCSV,
  onExportBRC,
  isLoading,
}: RecordingListProps) {
  const [renameDialog, setRenameDialog] = useState<{
    open: boolean;
    recording: DataRecording | null;
    name: string;
  }>({ open: false, recording: null, name: "" });

  const handleRename = () => {
    if (renameDialog.recording && renameDialog.name.trim()) {
      onRename(renameDialog.recording.id, renameDialog.name.trim());
      setRenameDialog({ open: false, recording: null, name: "" });
    }
  };

  const getStatusBadge = (status: DataRecording["status"]) => {
    switch (status) {
      case "recording":
        return <Badge variant="destructive" className="animate-pulse">Gravando</Badge>;
      case "completed":
        return <Badge variant="secondary">Concluído</Badge>;
      case "cancelled":
        return <Badge variant="outline">Cancelado</Badge>;
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-20" />
          </Card>
        ))}
      </div>
    );
  }

  if (recordings.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Database className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg mb-2">Nenhuma gravação</h3>
          <p className="text-muted-foreground text-sm">
            Inicie uma gravação para capturar dados do seu veículo
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {recordings.map((recording) => (
          <Card
            key={recording.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onView(recording)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{recording.name}</h4>
                    {getStatusBadge(recording.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(recording.started_at), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                    <span>{formatDuration(recording.duration_seconds)}</span>
                    <span>{recording.data_points_count} pontos</span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setRenameDialog({
                          open: true,
                          recording,
                          name: recording.name,
                        });
                      }}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Renomear
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onExportCSV(recording);
                      }}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Exportar CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onExportBRC(recording);
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar BRC
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(recording.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rename Dialog */}
      <Dialog
        open={renameDialog.open}
        onOpenChange={(open) =>
          setRenameDialog({ open, recording: null, name: "" })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear Gravação</DialogTitle>
          </DialogHeader>
          <Input
            value={renameDialog.name}
            onChange={(e) =>
              setRenameDialog((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Nome da gravação"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialog({ open: false, recording: null, name: "" })}
            >
              Cancelar
            </Button>
            <Button onClick={handleRename}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
