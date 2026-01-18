import { DataPoint } from "@/hooks/useDataRecording";

export interface ExportOptions {
  format: "csv" | "brc";
  filename: string;
  parameters?: string[];
}

export function exportToCSV(
  dataPoints: DataPoint[],
  filename: string,
  selectedParameters?: string[]
): void {
  if (dataPoints.length === 0) {
    throw new Error("Nenhum dado para exportar");
  }

  // Get all unique parameter keys
  const allParams = new Set<string>();
  dataPoints.forEach((point) => {
    Object.keys(point.parameters).forEach((key) => allParams.add(key));
  });

  // Filter parameters if specified
  const params = selectedParameters?.length
    ? selectedParameters.filter((p) => allParams.has(p))
    : Array.from(allParams);

  // Create CSV header
  const header = ["timestamp", ...params].join(",");

  // Create CSV rows
  const rows = dataPoints.map((point) => {
    const timestamp = new Date(point.timestamp).toISOString();
    const values = params.map((param) => {
      const value = point.parameters[param];
      return value !== undefined ? String(value) : "";
    });
    return [timestamp, ...values].join(",");
  });

  const csvContent = [header, ...rows].join("\n");
  downloadFile(csvContent, `${filename}.csv`, "text/csv");
}

export function exportToBRC(
  dataPoints: DataPoint[],
  filename: string,
  metadata?: Record<string, unknown>
): void {
  if (dataPoints.length === 0) {
    throw new Error("Nenhum dado para exportar");
  }

  // BRC is a proprietary format - we'll create a JSON-based version
  const brcData = {
    version: "1.0",
    format: "BRC",
    exportedAt: new Date().toISOString(),
    metadata: metadata || {},
    dataPointsCount: dataPoints.length,
    parameters: Array.from(
      new Set(dataPoints.flatMap((p) => Object.keys(p.parameters)))
    ),
    data: dataPoints.map((point) => ({
      t: new Date(point.timestamp).getTime(),
      p: point.parameters,
    })),
  };

  const jsonContent = JSON.stringify(brcData, null, 2);
  downloadFile(jsonContent, `${filename}.brc`, "application/json");
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseCSV(content: string): DataPoint[] {
  const lines = content.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",");
  const timestampIndex = headers.findIndex((h) => h.toLowerCase() === "timestamp");
  const paramHeaders = headers.filter((_, i) => i !== timestampIndex);

  return lines.slice(1).map((line, index) => {
    const values = line.split(",");
    const timestamp = timestampIndex >= 0 ? values[timestampIndex] : new Date().toISOString();
    
    const parameters: Record<string, number | string> = {};
    paramHeaders.forEach((param, i) => {
      const valueIndex = i >= timestampIndex ? i + 1 : i;
      const value = values[valueIndex];
      if (value !== undefined && value !== "") {
        const numValue = parseFloat(value);
        parameters[param] = isNaN(numValue) ? value : numValue;
      }
    });

    return {
      id: crypto.randomUUID(),
      recording_id: "",
      timestamp,
      parameters,
      created_at: new Date().toISOString(),
    };
  });
}

export function parseBRC(content: string): DataPoint[] {
  try {
    const brcData = JSON.parse(content);
    
    if (brcData.format !== "BRC" || !Array.isArray(brcData.data)) {
      throw new Error("Formato BRC inválido");
    }

    return brcData.data.map((item: { t: number; p: Record<string, unknown> }) => ({
      id: crypto.randomUUID(),
      recording_id: "",
      timestamp: new Date(item.t).toISOString(),
      parameters: item.p as Record<string, number | string>,
      created_at: new Date().toISOString(),
    }));
  } catch {
    throw new Error("Erro ao parsear arquivo BRC");
  }
}
