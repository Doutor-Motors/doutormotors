import { useCallback } from 'react';
import { format, addHours } from 'date-fns';
import { toast } from 'sonner';
import type { MaintenanceReminder } from './useMaintenanceReminders';

interface CalendarEvent {
  title: string;
  description: string;
  location?: string;
  startDate: Date;
  endDate: Date;
}

interface UseCalendarIntegrationReturn {
  addToGoogleCalendar: (reminder: MaintenanceReminder, vehicleName?: string) => void;
  addToOutlookCalendar: (reminder: MaintenanceReminder, vehicleName?: string) => void;
  addToAppleCalendar: (reminder: MaintenanceReminder, vehicleName?: string) => void;
  downloadICS: (reminder: MaintenanceReminder, vehicleName?: string) => void;
  addMultipleToCalendar: (reminders: MaintenanceReminder[], vehicleName?: string, provider?: 'google' | 'outlook' | 'apple' | 'ics') => void;
}

const REMINDER_TYPE_LABELS: Record<string, string> = {
  oil_change: "Troca de Óleo",
  tire_rotation: "Rodízio de Pneus",
  brake_inspection: "Inspeção de Freios",
  air_filter: "Filtro de Ar",
  coolant: "Fluido de Arrefecimento",
  transmission: "Óleo de Câmbio",
  battery: "Bateria",
  spark_plugs: "Velas de Ignição",
  timing_belt: "Correia Dentada",
  custom: "Personalizado",
};

function createCalendarEvent(reminder: MaintenanceReminder, vehicleName?: string): CalendarEvent {
  const startDate = new Date(reminder.due_date);
  // Set to 9 AM
  startDate.setHours(9, 0, 0, 0);
  
  const endDate = addHours(startDate, 2);
  
  const typeLabel = REMINDER_TYPE_LABELS[reminder.reminder_type] || reminder.reminder_type;
  const vehicleText = vehicleName ? ` - ${vehicleName}` : '';
  
  let description = `Manutenção: ${reminder.title}\n`;
  description += `Tipo: ${typeLabel}\n`;
  if (reminder.description) {
    description += `Descrição: ${reminder.description}\n`;
  }
  if (reminder.due_mileage) {
    description += `Km Previsto: ${reminder.due_mileage.toLocaleString('pt-BR')} km\n`;
  }
  description += `\nGerado por Doutor Motors`;

  return {
    title: `🔧 ${reminder.title}${vehicleText}`,
    description,
    location: 'Oficina mecânica',
    startDate,
    endDate,
  };
}

function formatDateForGoogle(date: Date): string {
  return format(date, "yyyyMMdd'T'HHmmss");
}

function formatDateForICS(date: Date): string {
  return format(date, "yyyyMMdd'T'HHmmss'Z'");
}

function encodeForUrl(text: string): string {
  return encodeURIComponent(text);
}

export function useCalendarIntegration(): UseCalendarIntegrationReturn {
  const addToGoogleCalendar = useCallback((reminder: MaintenanceReminder, vehicleName?: string) => {
    try {
      const event = createCalendarEvent(reminder, vehicleName);
      
      const googleUrl = new URL('https://calendar.google.com/calendar/render');
      googleUrl.searchParams.set('action', 'TEMPLATE');
      googleUrl.searchParams.set('text', event.title);
      googleUrl.searchParams.set('details', event.description);
      googleUrl.searchParams.set('location', event.location || '');
      googleUrl.searchParams.set('dates', `${formatDateForGoogle(event.startDate)}/${formatDateForGoogle(event.endDate)}`);
      
      window.open(googleUrl.toString(), '_blank');
      toast.success('Abrindo Google Calendar...');
    } catch (error) {
      console.error('[Calendar] Error adding to Google Calendar:', error);
      toast.error('Erro ao adicionar ao Google Calendar');
    }
  }, []);

  const addToOutlookCalendar = useCallback((reminder: MaintenanceReminder, vehicleName?: string) => {
    try {
      const event = createCalendarEvent(reminder, vehicleName);
      
      const outlookUrl = new URL('https://outlook.live.com/calendar/0/deeplink/compose');
      outlookUrl.searchParams.set('subject', event.title);
      outlookUrl.searchParams.set('body', event.description);
      outlookUrl.searchParams.set('location', event.location || '');
      outlookUrl.searchParams.set('startdt', event.startDate.toISOString());
      outlookUrl.searchParams.set('enddt', event.endDate.toISOString());
      outlookUrl.searchParams.set('path', '/calendar/action/compose');
      
      window.open(outlookUrl.toString(), '_blank');
      toast.success('Abrindo Outlook Calendar...');
    } catch (error) {
      console.error('[Calendar] Error adding to Outlook Calendar:', error);
      toast.error('Erro ao adicionar ao Outlook Calendar');
    }
  }, []);

  const addToAppleCalendar = useCallback((reminder: MaintenanceReminder, vehicleName?: string) => {
    // Apple Calendar uses ICS files
    downloadICS(reminder, vehicleName);
  }, []);

  const downloadICS = useCallback((reminder: MaintenanceReminder, vehicleName?: string) => {
    try {
      const event = createCalendarEvent(reminder, vehicleName);
      
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Doutor Motors//Maintenance Reminder//PT',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `DTSTART:${formatDateForICS(event.startDate)}`,
        `DTEND:${formatDateForICS(event.endDate)}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
        `LOCATION:${event.location || ''}`,
        `UID:${reminder.id}@doutormotors.app`,
        `DTSTAMP:${formatDateForICS(new Date())}`,
        'BEGIN:VALARM',
        'TRIGGER:-P1D',
        'ACTION:DISPLAY',
        `DESCRIPTION:Lembrete: ${event.title}`,
        'END:VALARM',
        'BEGIN:VALARM',
        'TRIGGER:-P3D',
        'ACTION:DISPLAY',
        `DESCRIPTION:Em 3 dias: ${event.title}`,
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `manutencao-${reminder.id}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Arquivo ICS baixado! Abra para adicionar ao calendário.');
    } catch (error) {
      console.error('[Calendar] Error downloading ICS:', error);
      toast.error('Erro ao gerar arquivo do calendário');
    }
  }, []);

  const addMultipleToCalendar = useCallback((
    reminders: MaintenanceReminder[], 
    vehicleName?: string,
    provider: 'google' | 'outlook' | 'apple' | 'ics' = 'ics'
  ) => {
    if (reminders.length === 0) {
      toast.error('Nenhum lembrete selecionado');
      return;
    }

    if (provider === 'ics') {
      // Generate single ICS file with all events
      try {
        const events = reminders.map(r => createCalendarEvent(r, vehicleName));
        
        let icsContent = [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//Doutor Motors//Maintenance Reminder//PT',
          'CALSCALE:GREGORIAN',
          'METHOD:PUBLISH',
        ].join('\r\n');

        for (const event of events) {
          const reminder = reminders.find(r => r.title === event.title.replace('🔧 ', '').split(' - ')[0]);
          icsContent += '\r\n' + [
            'BEGIN:VEVENT',
            `DTSTART:${formatDateForICS(event.startDate)}`,
            `DTEND:${formatDateForICS(event.endDate)}`,
            `SUMMARY:${event.title}`,
            `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
            `LOCATION:${event.location || ''}`,
            `UID:${reminder?.id || Math.random().toString(36)}@doutormotors.app`,
            `DTSTAMP:${formatDateForICS(new Date())}`,
            'BEGIN:VALARM',
            'TRIGGER:-P1D',
            'ACTION:DISPLAY',
            `DESCRIPTION:Lembrete: ${event.title}`,
            'END:VALARM',
            'END:VEVENT',
          ].join('\r\n');
        }

        icsContent += '\r\nEND:VCALENDAR';

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `manutencoes-${format(new Date(), 'yyyy-MM-dd')}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success(`${reminders.length} lembretes exportados para o calendário!`);
      } catch (error) {
        console.error('[Calendar] Error exporting multiple events:', error);
        toast.error('Erro ao exportar eventos');
      }
    } else {
      // For other providers, open one at a time (limitation of web APIs)
      for (const reminder of reminders) {
        if (provider === 'google') {
          addToGoogleCalendar(reminder, vehicleName);
        } else if (provider === 'outlook') {
          addToOutlookCalendar(reminder, vehicleName);
        } else {
          addToAppleCalendar(reminder, vehicleName);
        }
      }
    }
  }, [addToGoogleCalendar, addToOutlookCalendar, addToAppleCalendar]);

  return {
    addToGoogleCalendar,
    addToOutlookCalendar,
    addToAppleCalendar,
    downloadICS,
    addMultipleToCalendar,
  };
}

export default useCalendarIntegration;
