import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataPoint } from "@/hooks/useDataRecording";

interface RecordingChartProps {
  dataPoints: DataPoint[];
  title?: string;
}

const CHART_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#22c55e", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
];

export function RecordingChart({ dataPoints, title }: RecordingChartProps) {
  const [selectedParams, setSelectedParams] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"combined" | "separate">("combined");

  // Extract all unique parameters
  const allParameters = useMemo(() => {
    const params = new Set<string>();
    dataPoints.forEach((point) => {
      Object.keys(point.parameters).forEach((key) => params.add(key));
    });
    return Array.from(params);
  }, [dataPoints]);

  // Initialize with first 3 parameters
  useMemo(() => {
    if (selectedParams.length === 0 && allParameters.length > 0) {
      setSelectedParams(allParameters.slice(0, Math.min(3, allParameters.length)));
    }
  }, [allParameters, selectedParams.length]);

  // Transform data for recharts
  const chartData = useMemo(() => {
    return dataPoints.map((point, index) => {
      const time = new Date(point.timestamp).getTime();
      const formattedTime = format(new Date(point.timestamp), "HH:mm:ss");
      
      return {
        index,
        time,
        formattedTime,
        ...point.parameters,
      };
    });
  }, [dataPoints]);

  const toggleParameter = (param: string) => {
    setSelectedParams((prev) =>
      prev.includes(param)
        ? prev.filter((p) => p !== param)
        : [...prev, param]
    );
  };

  if (dataPoints.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Nenhum dado para exibir</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title || "Visualização de Dados"}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{dataPoints.length} pontos</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Parameter Selection */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-2">
            Parâmetros:
          </span>
          {allParameters.map((param, index) => (
            <label
              key={param}
              className="flex items-center gap-1.5 text-sm cursor-pointer"
            >
              <Checkbox
                checked={selectedParams.includes(param)}
                onCheckedChange={() => toggleParameter(param)}
              />
              <span
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{
                  backgroundColor: `${CHART_COLORS[index % CHART_COLORS.length]}20`,
                  color: CHART_COLORS[index % CHART_COLORS.length],
                }}
              >
                {param}
              </span>
            </label>
          ))}
        </div>

        {/* View Mode Tabs */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "combined" | "separate")}>
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="combined">Combinado</TabsTrigger>
            <TabsTrigger value="separate">Separado</TabsTrigger>
          </TabsList>

          <TabsContent value="combined" className="mt-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="formattedTime"
                    tick={{ fontSize: 11 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  {selectedParams.map((param, index) => (
                    <Line
                      key={param}
                      type="monotone"
                      dataKey={param}
                      stroke={CHART_COLORS[index % CHART_COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="separate" className="mt-4">
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {selectedParams.map((param, index) => (
                  <div key={param} className="h-48">
                    <h4
                      className="text-sm font-medium mb-2"
                      style={{ color: CHART_COLORS[index % CHART_COLORS.length] }}
                    >
                      {param}
                    </h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="formattedTime"
                          tick={{ fontSize: 10 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey={param}
                          stroke={CHART_COLORS[index % CHART_COLORS.length]}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
