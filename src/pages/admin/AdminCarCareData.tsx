import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Database, 
  Search, 
  RefreshCw, 
  Download, 
  Trash2, 
  Car, 
  Wrench,
  FolderTree,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Play,
  ExternalLink
} from "lucide-react";

interface CachedProcedure {
  id: string;
  brand: string;
  model: string;
  year: string | null;
  procedure_id: string;
  procedure_name: string;
  procedure_name_pt: string | null;
  category: string;
  video_url: string | null;
  thumbnail_url: string | null;
  source_url: string | null;
  discovered_at: string;
  updated_at: string;
  expires_at: string;
}

interface Category {
  id: string;
  category_id: string;
  name_en: string;
  name_pt: string;
  icon: string | null;
  keywords: string[] | null;
}

interface ScanResult {
  brand: string;
  model: string;
  year: string;
  proceduresFound: number;
  categoriesFound: number;
  success: boolean;
  error?: string;
  usedFallback?: boolean;
}

export default function AdminCarCareData() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanBrand, setScanBrand] = useState("");
  const [scanModel, setScanModel] = useState("");
  const [scanYear, setScanYear] = useState(new Date().getFullYear().toString());

  // Fetch cached procedures
  const { data: cachedProcedures, isLoading: loadingProcedures } = useQuery({
    queryKey: ["carcare-cached-procedures"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("carcare_procedure_cache")
        .select("*")
        .order("brand", { ascending: true })
        .order("model", { ascending: true })
        .order("category", { ascending: true });

      if (error) throw error;
      return data as CachedProcedure[];
    },
  });

  // Fetch categories
  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ["carcare-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("carcare_categories")
        .select("*")
        .order("name_en", { ascending: true });

      if (error) throw error;
      return data as Category[];
    },
  });

  // Scan vehicle mutation
  const scanVehicleMutation = useMutation({
    mutationFn: async ({ brand, model, year }: { brand: string; model: string; year: string }) => {
      const { data, error } = await supabase.functions.invoke("carcare-api", {
        body: { 
          action: "scan-and-cache",
          brand,
          model,
          year
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setScanResult({
        brand: scanBrand,
        model: scanModel,
        year: scanYear,
        proceduresFound: data?.proceduresFound || 0,
        categoriesFound: data?.categoriesFound || 0,
        success: true,
        usedFallback: data?.usedFallback || false,
      });
      queryClient.invalidateQueries({ queryKey: ["carcare-cached-procedures"] });
      const fallbackMsg = data?.usedFallback ? " (usando dados estáticos)" : "";
      toast.success(`Escaneados ${data?.proceduresFound || 0} procedimentos para ${scanBrand} ${scanModel}${fallbackMsg}`);
    },
    onError: (error) => {
      setScanResult({
        brand: scanBrand,
        model: scanModel,
        year: scanYear,
        proceduresFound: 0,
        categoriesFound: 0,
        success: false,
        error: error.message,
      });
      toast.error("Erro ao escanear veículo: " + error.message);
    },
  });

  // Scheduled scan mutation
  const scheduledScanMutation = useMutation({
    mutationFn: async ({ maxScans, forceRescan }: { maxScans?: number; forceRescan?: boolean }) => {
      const { data, error } = await supabase.functions.invoke("carcare-scheduled-scan", {
        body: { maxScans, forceRescan },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["carcare-cached-procedures"] });
      toast.success(`Scan agendado: ${data?.successful || 0}/${data?.vehiclesScanned || 0} veículos, ${data?.totalProcedures || 0} procedimentos`);
    },
    onError: (error) => {
      toast.error("Erro no scan agendado: " + error.message);
    },
  });

  // Clear cache mutation
  const clearCacheMutation = useMutation({
    mutationFn: async (vehicleFilter?: { brand?: string; model?: string }) => {
      let query = supabase.from("carcare_procedure_cache").delete();
      
      if (vehicleFilter?.brand) {
        query = query.eq("brand", vehicleFilter.brand);
      }
      if (vehicleFilter?.model) {
        query = query.eq("model", vehicleFilter.model);
      }
      if (!vehicleFilter?.brand && !vehicleFilter?.model) {
        // Delete all if no filter
        query = query.neq("id", "00000000-0000-0000-0000-000000000000");
      }

      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carcare-cached-procedures"] });
      toast.success("Cache limpo com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao limpar cache: " + error.message);
    },
  });

  // Group procedures by brand and model
  const groupedProcedures = cachedProcedures?.reduce((acc, proc) => {
    const brandKey = proc.brand;
    const modelKey = `${proc.brand}|${proc.model}|${proc.year || ""}`;
    
    if (!acc.brands[brandKey]) {
      acc.brands[brandKey] = {
        name: brandKey,
        models: {},
        totalProcedures: 0,
      };
    }
    
    if (!acc.brands[brandKey].models[modelKey]) {
      acc.brands[brandKey].models[modelKey] = {
        brand: proc.brand,
        model: proc.model,
        year: proc.year,
        procedures: [],
        categories: new Set(),
      };
    }
    
    acc.brands[brandKey].models[modelKey].procedures.push(proc);
    acc.brands[brandKey].models[modelKey].categories.add(proc.category);
    acc.brands[brandKey].totalProcedures++;
    
    return acc;
  }, { brands: {} as Record<string, any> }) || { brands: {} };

  // Filter procedures based on search
  const filteredProcedures = cachedProcedures?.filter(proc => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      proc.brand.toLowerCase().includes(term) ||
      proc.model.toLowerCase().includes(term) ||
      proc.procedure_name.toLowerCase().includes(term) ||
      proc.category.toLowerCase().includes(term) ||
      (proc.procedure_name_pt?.toLowerCase().includes(term))
    );
  }) || [];

  // Stats
  const stats = {
    totalProcedures: cachedProcedures?.length || 0,
    totalBrands: Object.keys(groupedProcedures.brands).length,
    totalModels: Object.values(groupedProcedures.brands).reduce(
      (sum: number, b: any) => sum + Object.keys(b.models).length, 
      0
    ),
    totalCategories: categories?.length || 0,
    expiredCount: cachedProcedures?.filter(p => new Date(p.expires_at) < new Date()).length || 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">CarCare Data Manager</h1>
            <p className="text-muted-foreground">
              Gerenciar categorias, procedimentos e cache do CarCareKiosk
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["carcare-cached-procedures"] })}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm("Limpar TODO o cache de procedimentos?")) {
                  clearCacheMutation.mutate({});
                }
              }}
              disabled={clearCacheMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Cache
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Procedimentos</CardDescription>
              <CardTitle className="text-2xl">{stats.totalProcedures}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Wrench className="h-3 w-3" />
                Em cache
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Marcas</CardDescription>
              <CardTitle className="text-2xl">{stats.totalBrands}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Car className="h-3 w-3" />
                Diferentes
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Modelos</CardDescription>
              <CardTitle className="text-2xl">{stats.totalModels}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Database className="h-3 w-3" />
                Com dados
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Categorias</CardDescription>
              <CardTitle className="text-2xl">{stats.totalCategories}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <FolderTree className="h-3 w-3" />
                Definidas
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Expirados</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{stats.expiredCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Precisam atualizar
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="scanner" className="space-y-4">
          <TabsList>
            <TabsTrigger value="scanner">Scanner</TabsTrigger>
            <TabsTrigger value="procedures">Procedimentos ({stats.totalProcedures})</TabsTrigger>
            <TabsTrigger value="categories">Categorias ({stats.totalCategories})</TabsTrigger>
            <TabsTrigger value="vehicles">Por Veículo</TabsTrigger>
          </TabsList>

          {/* Scanner Tab */}
          <TabsContent value="scanner" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Escanear Veículo
                </CardTitle>
                <CardDescription>
                  Buscar todos os procedimentos disponíveis para um veículo no CarCareKiosk e salvar no cache
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Marca</label>
                    <Input
                      placeholder="Ex: Honda"
                      value={scanBrand}
                      onChange={(e) => setScanBrand(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Modelo</label>
                    <Input
                      placeholder="Ex: Civic"
                      value={scanModel}
                      onChange={(e) => setScanModel(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Ano</label>
                    <Input
                      placeholder="Ex: 2019"
                      value={scanYear}
                      onChange={(e) => setScanYear(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => {
                        if (!scanBrand || !scanModel) {
                          toast.error("Informe marca e modelo");
                          return;
                        }
                        scanVehicleMutation.mutate({
                          brand: scanBrand,
                          model: scanModel,
                          year: scanYear,
                        });
                      }}
                      disabled={scanVehicleMutation.isPending}
                      className="w-full"
                    >
                      {scanVehicleMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Escaneando...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Escanear
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {scanResult && (
                  <div className={`p-4 rounded-lg border ${scanResult.success ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {scanResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className="font-medium">
                        {scanResult.success ? "Scan Concluído" : "Erro no Scan"}
                      </span>
                      {scanResult.usedFallback && (
                        <Badge variant="secondary" className="text-xs">Fallback</Badge>
                      )}
                    </div>
                    <p className="text-sm">
                      {scanResult.success ? (
                        <>
                          Encontrados <strong>{scanResult.proceduresFound}</strong> procedimentos em{" "}
                          <strong>{scanResult.categoriesFound}</strong> categorias para{" "}
                          <strong>{scanResult.brand} {scanResult.model} {scanResult.year}</strong>
                          {scanResult.usedFallback && (
                            <span className="text-muted-foreground"> (dados estáticos - Firecrawl indisponível)</span>
                          )}
                        </>
                      ) : (
                        scanResult.error
                      )}
                    </p>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Como funciona:</h4>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>O scanner acessa a página do modelo no CarCareKiosk via Firecrawl</li>
                      <li>Extrai todos os procedimentos disponíveis usando múltiplos padrões de regex</li>
                      <li>Categoriza automaticamente cada procedimento</li>
                      <li>Salva no cache local para acesso rápido (válido por 30 dias)</li>
                      <li className="text-primary font-medium">Se Firecrawl falhar, usa dados estáticos como fallback</li>
                    </ol>
                  </div>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Scan Automático em Lote
                      </CardTitle>
                      <CardDescription>
                        Escanear veículos populares automaticamente
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Escaneia até 5 veículos populares (Honda Civic, Toyota Corolla, Ford F-150, etc) que ainda não estão no cache.
                      </p>
                      <Button
                        onClick={() => scheduledScanMutation.mutate({ maxScans: 5 })}
                        disabled={scheduledScanMutation.isPending}
                        variant="secondary"
                        className="w-full"
                      >
                        {scheduledScanMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Escaneando veículos...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Executar Scan em Lote
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Procedures Tab */}
          <TabsContent value="procedures" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Procedimentos em Cache</CardTitle>
                  <div className="w-72">
                    <Input
                      placeholder="Buscar procedimento..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingProcedures ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Marca/Modelo</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Procedimento</TableHead>
                          <TableHead>PT-BR</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProcedures.slice(0, 100).map((proc) => (
                          <TableRow key={proc.id}>
                            <TableCell>
                              <div className="font-medium">{proc.brand}</div>
                              <div className="text-xs text-muted-foreground">
                                {proc.model} {proc.year}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{proc.category}</Badge>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {proc.procedure_name}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {proc.procedure_name_pt || "-"}
                            </TableCell>
                            <TableCell>
                              {new Date(proc.expires_at) < new Date() ? (
                                <Badge variant="destructive">Expirado</Badge>
                              ) : (
                                <Badge variant="secondary">Válido</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {proc.video_url && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => window.open(proc.video_url!, "_blank")}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {filteredProcedures.length > 100 && (
                      <div className="text-center py-4 text-sm text-muted-foreground">
                        Mostrando 100 de {filteredProcedures.length} procedimentos
                      </div>
                    )}
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Categorias Definidas</CardTitle>
                <CardDescription>
                  Categorias padrão para classificação automática de procedimentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingCategories ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {categories?.map((cat) => (
                      <div
                        key={cat.id}
                        className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-medium">{cat.name_pt}</div>
                            <div className="text-sm text-muted-foreground">{cat.name_en}</div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {cat.category_id}
                          </Badge>
                        </div>
                        {cat.keywords && cat.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {cat.keywords.slice(0, 4).map((kw, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {kw}
                              </Badge>
                            ))}
                            {cat.keywords.length > 4 && (
                              <Badge variant="secondary" className="text-xs">
                                +{cat.keywords.length - 4}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vehicles Tab */}
          <TabsContent value="vehicles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dados por Veículo</CardTitle>
                <CardDescription>
                  Visualizar procedimentos agrupados por marca e modelo
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingProcedures ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : Object.keys(groupedProcedures.brands).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum procedimento em cache</p>
                    <p className="text-sm">Use o scanner para buscar procedimentos de um veículo</p>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {Object.values(groupedProcedures.brands).map((brand: any) => (
                      <AccordionItem key={brand.name} value={brand.name}>
                        <AccordionTrigger>
                          <div className="flex items-center gap-3">
                            <Car className="h-4 w-4" />
                            <span className="font-medium">{brand.name}</span>
                            <Badge variant="secondary">{brand.totalProcedures} procedimentos</Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 pl-6">
                            {Object.values(brand.models).map((model: any) => (
                              <div
                                key={`${model.brand}-${model.model}-${model.year}`}
                                className="p-4 rounded-lg border"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <h4 className="font-medium">
                                      {model.model} {model.year}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      {model.procedures.length} procedimentos em {model.categories.size} categorias
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      if (confirm(`Limpar cache para ${model.brand} ${model.model}?`)) {
                                        clearCacheMutation.mutate({
                                          brand: model.brand,
                                          model: model.model,
                                        });
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {Array.from(model.categories as Set<string>).map((cat) => (
                                    <Badge key={cat} variant="outline" className="text-xs">
                                      {cat}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
