import { useState, useEffect } from "react";
import { format, isPast, isWithinInterval, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Bell,
  Plus,
  Check,
  AlertTriangle,
  Clock,
  Wrench,
  Droplets,
  Disc,
  Filter,
  Zap,
  Car,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2,
  Calendar,
  List,
  History,
  Search,
  FileText,
  CalendarPlus,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { MaintenanceRemindersPanel } from "@/components/dashboard/MaintenanceRemindersPanel";
import { useMaintenanceReminders, MaintenanceReminder, MAINTENANCE_TYPES } from "@/hooks/useMaintenanceReminders";
import { useCalendarIntegration } from "@/hooks/useCalendarIntegration";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { generateMaintenanceReport } from "@/services/pdf/maintenanceReportGenerator";
import { cn } from "@/lib/utils";

const PRIORITY_CONFIG = {
  critical: { color: "bg-red-500", textColor: "text-red-500", label: "Crítico", icon: AlertTriangle },
  attention: { color: "bg-orange-500", textColor: "text-orange-500", label: "Atenção", icon: Clock },
  preventive: { color: "bg-yellow-500", textColor: "text-yellow-500", label: "Preventivo", icon: Bell },
};

const MaintenanceManagerPage = () => {
  const { user } = useAuth();
  const { activeVehicleId } = useAppStore();
  const { 
    reminders, 
    upcomingReminders,
    overdueReminders,
    isLoading, 
    completeReminder, 
    deleteReminder 
  } = useMaintenanceReminders();
  
  const calendar = useCalendarIntegration();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [activeVehicle, setActiveVehicle] = useState<{
    id: string;
    brand: string;
    model: string;
    year: number;
    plate?: string;
    current_mileage?: number;
  } | null>(null);

  // Fetch active vehicle info
  useEffect(() => {
    const fetchVehicle = async () => {
      if (!activeVehicleId) return;
      
      const { data } = await supabase
        .from('vehicles')
        .select('id, brand, model, year, license_plate')
        .eq('id', activeVehicleId)
        .single();
      
      if (data) {
        setActiveVehicle({
          id: data.id,
          brand: data.brand,
          model: data.model,
          year: data.year,
          plate: data.license_plate || undefined,
        });
      }
    };
    
    fetchVehicle();
  }, [activeVehicleId]);

  // Generate PDF report
  const handleExportPDF = () => {
    if (!activeVehicle) return;
    
    generateMaintenanceReport({
      vehicle: activeVehicle,
      reminders,
      userName: user?.email || undefined,
    });
  };

  // Get vehicle name for calendar events
  const getVehicleName = () => {
    if (!activeVehicle) return undefined;
    return `${activeVehicle.brand} ${activeVehicle.model} ${activeVehicle.year}`;
  };

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // Get days for calendar
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get reminders for a specific day
  const getRemindersForDay = (day: Date) => {
    return reminders.filter(r => 
      !r.is_completed && isSameDay(new Date(r.due_date), day)
    );
  };

  // Filter reminders
  const filteredReminders = reminders.filter(r => {
    const matchesSearch = searchQuery === "" || 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      MAINTENANCE_TYPES[r.reminder_type as keyof typeof MAINTENANCE_TYPES]?.label.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = filterPriority === "all" || r.priority === filterPriority;
    
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "completed" && r.is_completed) ||
      (filterStatus === "pending" && !r.is_completed) ||
      (filterStatus === "overdue" && !r.is_completed && isPast(new Date(r.due_date)));
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const getStatusBadge = (reminder: MaintenanceReminder) => {
    if (reminder.is_completed) {
      return <Badge className="bg-green-500 text-white text-xs">Concluído</Badge>;
    }
    
    const dueDate = new Date(reminder.due_date);
    const today = new Date();
    
    if (isPast(dueDate)) {
      return <Badge className="bg-red-500 text-white text-xs">Atrasado</Badge>;
    }
    
    if (isWithinInterval(dueDate, { start: today, end: addDays(today, 7) })) {
      return <Badge className="bg-orange-500 text-white text-xs">Próximo</Badge>;
    }
    
    return <Badge variant="outline" className="text-xs">Agendado</Badge>;
  };

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'oil_change': return Droplets;
      case 'tire_rotation':
      case 'brake_inspection': return Disc;
      case 'air_filter': return Filter;
      case 'spark_plugs': return Zap;
      default: return Wrench;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-chakra text-2xl md:text-3xl font-bold uppercase text-foreground flex items-center gap-2">
              <Bell className="w-7 h-7 text-primary" />
              Manutenções
            </h1>
            <p className="text-muted-foreground">
              Gerencie os lembretes de manutenção dos seus veículos
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            {/* Export PDF */}
            <Button 
              variant="outline" 
              onClick={handleExportPDF}
              disabled={!activeVehicle || reminders.length === 0}
              className="font-chakra uppercase"
            >
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>
            
            {/* Add to Calendar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline"
                  disabled={upcomingReminders.length === 0}
                  className="font-chakra uppercase"
                >
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Agenda
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => calendar.addMultipleToCalendar(upcomingReminders, getVehicleName(), 'google')}
                >
                  <img src="https://www.google.com/favicon.ico" alt="" className="w-4 h-4 mr-2" />
                  Google Calendar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => calendar.addMultipleToCalendar(upcomingReminders, getVehicleName(), 'outlook')}
                >
                  <img src="https://outlook.live.com/favicon.ico" alt="" className="w-4 h-4 mr-2" />
                  Outlook Calendar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => calendar.addMultipleToCalendar(upcomingReminders, getVehicleName(), 'ics')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar ICS (Apple/Outros)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-chakra font-bold text-foreground">
                  {overdueReminders.length}
                </p>
                <p className="text-xs text-muted-foreground">Atrasados</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-orange-100 p-3 rounded-full">
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-chakra font-bold text-foreground">
                  {upcomingReminders.filter(r => 
                    isWithinInterval(new Date(r.due_date), { 
                      start: new Date(), 
                      end: addDays(new Date(), 7) 
                    })
                  ).length}
                </p>
                <p className="text-xs text-muted-foreground">Próximos 7 dias</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-chakra font-bold text-foreground">
                  {upcomingReminders.length}
                </p>
                <p className="text-xs text-muted-foreground">Agendados</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-chakra font-bold text-foreground">
                  {reminders.filter(r => r.is_completed).length}
                </p>
                <p className="text-xs text-muted-foreground">Concluídos</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="list" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list" className="font-chakra uppercase">
              <List className="w-4 h-4 mr-2" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="calendar" className="font-chakra uppercase">
              <Calendar className="w-4 h-4 mr-2" />
              Calendário
            </TabsTrigger>
            <TabsTrigger value="history" className="font-chakra uppercase">
              <History className="w-4 h-4 mr-2" />
              Histórico
            </TabsTrigger>
          </TabsList>

          {/* List View */}
          <TabsContent value="list" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar manutenção..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                  <SelectItem value="attention">Atenção</SelectItem>
                  <SelectItem value="preventive">Preventivo</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="overdue">Atrasados</SelectItem>
                  <SelectItem value="completed">Concluídos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Reminders Panel */}
            <MaintenanceRemindersPanel />

            {/* Filtered List */}
            {filteredReminders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-chakra text-lg uppercase">
                    Resultados ({filteredReminders.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {filteredReminders.map((reminder) => {
                    const Icon = getReminderIcon(reminder.reminder_type);
                    return (
                      <div
                        key={reminder.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg transition-colors",
                          reminder.is_completed ? "bg-muted/30 opacity-60" : "bg-muted/50 hover:bg-muted"
                        )}
                      >
                        <div className={cn(
                          "p-2 rounded-full text-white",
                          PRIORITY_CONFIG[reminder.priority].color
                        )}>
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={cn(
                              "font-medium text-sm truncate",
                              reminder.is_completed && "line-through"
                            )}>
                              {reminder.title}
                            </span>
                            {getStatusBadge(reminder)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(reminder.due_date), "dd/MM/yyyy", { locale: ptBR })}
                            {reminder.due_mileage && ` • ${reminder.due_mileage.toLocaleString()} km`}
                          </p>
                        </div>

                        {!reminder.is_completed && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
                              onClick={() => completeReminder(reminder.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => deleteReminder(reminder.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Calendar View */}
          <TabsContent value="calendar">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <CardTitle className="font-chakra text-lg uppercase">
                  {format(currentDate, "MMMM yyyy", { locale: ptBR })}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </CardHeader>
              <CardContent>
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-medium text-muted-foreground py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells for days before month start */}
                  {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}

                  {/* Calendar days */}
                  {calendarDays.map((day) => {
                    const dayReminders = getRemindersForDay(day);
                    const isToday = isSameDay(day, new Date());
                    const hasReminders = dayReminders.length > 0;
                    const hasCritical = dayReminders.some(r => r.priority === 'critical');
                    const hasAttention = dayReminders.some(r => r.priority === 'attention');

                    return (
                      <div
                        key={day.toISOString()}
                        className={cn(
                          "aspect-square p-1 rounded-lg border text-center relative",
                          isToday && "ring-2 ring-primary",
                          hasReminders && "bg-muted/50",
                          hasCritical && "border-red-500",
                          hasAttention && !hasCritical && "border-orange-500"
                        )}
                      >
                        <span className={cn(
                          "text-sm",
                          isToday && "font-bold text-primary"
                        )}>
                          {format(day, "d")}
                        </span>
                        
                        {hasReminders && (
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                            {dayReminders.slice(0, 3).map((r, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  PRIORITY_CONFIG[r.priority].color
                                )}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-4 mt-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span>Crítico</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span>Atenção</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span>Preventivo</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History View */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="font-chakra text-lg uppercase flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Histórico de Manutenções
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reminders.filter(r => r.is_completed).length === 0 ? (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Nenhuma manutenção concluída ainda
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {reminders
                      .filter(r => r.is_completed)
                      .sort((a, b) => new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime())
                      .map((reminder) => {
                        const Icon = getReminderIcon(reminder.reminder_type);
                        return (
                          <div
                            key={reminder.id}
                            className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                          >
                            <div className="p-2 rounded-full bg-green-100 text-green-600">
                              <Check className="w-4 h-4" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-sm line-through opacity-60">
                                {reminder.title}
                              </span>
                              <p className="text-xs text-muted-foreground">
                                Concluído em {reminder.completed_at 
                                  ? format(new Date(reminder.completed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                                  : "N/A"
                                }
                              </p>
                            </div>

                            <Icon className="w-4 h-4 text-muted-foreground" />
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default MaintenanceManagerPage;
