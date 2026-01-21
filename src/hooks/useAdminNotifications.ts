import { useAdminNotification } from '@/contexts/AdminNotificationContext';
import { MessageSquare, Users, Car, AlertTriangle, Settings, Bell, CheckCircle, XCircle } from 'lucide-react';

/**
 * Hook personalizado para notificações de administrador
 * Fornece métodos simples para diferentes tipos de notificações administrativas
 */
export const useAdminNotifications = () => {
  const { 
    notifications, 
    addNotification, 
    removeNotification, 
    clearAllNotifications,
    unreadCount,
    notifyNewMessage,
    notifyNewUser,
    notifyNewVehicle,
    notifyCriticalDiagnostic,
    notifySystemAlert,
  } = useAdminNotification();

  // Notificações de ações administrativas
  const notifyUserBlocked = (userName: string) => {
    return addNotification({
      type: 'user_activity',
      title: 'Usuário Bloqueado',
      subtitle: 'Moderação',
      message: `O usuário foi bloqueado:`,
      highlight: userName,
      secondaryMessage: 'O acesso do usuário foi revogado com sucesso.',
    });
  };

  const notifyUserUnblocked = (userName: string) => {
    return addNotification({
      type: 'user_activity',
      title: 'Usuário Desbloqueado',
      subtitle: 'Moderação',
      message: `O acesso foi restaurado para:`,
      highlight: userName,
    });
  };

  const notifyMessageReplied = (recipientName: string) => {
    return addNotification({
      type: 'new_message',
      title: 'Resposta Enviada',
      subtitle: 'Mensagens',
      message: `Sua resposta foi enviada para:`,
      highlight: recipientName,
    });
  };

  const notifyDiagnosticResolved = (vehicleName: string, code: string) => {
    return addNotification({
      type: 'system_alert',
      title: 'Diagnóstico Resolvido',
      subtitle: 'Manutenção',
      message: `O problema ${code} foi marcado como resolvido em:`,
      highlight: vehicleName,
    });
  };

  const notifyExportComplete = (fileName: string) => {
    return addNotification({
      type: 'system_alert',
      title: 'Exportação Concluída',
      subtitle: 'Relatórios',
      message: `O arquivo foi gerado com sucesso:`,
      highlight: fileName,
      secondaryMessage: 'O download deve iniciar automaticamente.',
    });
  };

  const notifySettingsSaved = () => {
    return addNotification({
      type: 'system_alert',
      title: 'Configurações Salvas',
      subtitle: 'Sistema',
      message: 'As configurações do sistema foram atualizadas com sucesso.',
    });
  };

  const notifyError = (title: string, message: string) => {
    return addNotification({
      type: 'system_alert',
      title,
      subtitle: 'Erro',
      message,
      duration: 10000,
    });
  };

  const notifySuccess = (title: string, message: string) => {
    return addNotification({
      type: 'system_alert',
      title,
      subtitle: 'Sucesso',
      message,
    });
  };

  // Notificação para enviar alerta aos usuários
  const notifyUserAlertSent = (targetCount: number, alertType: string) => {
    return addNotification({
      type: 'system_alert',
      title: 'Alerta Enviado',
      subtitle: 'Broadcast',
      message: `Alerta "${alertType}" enviado para`,
      highlight: `${targetCount} usuário(s)`,
      secondaryMessage: 'Os usuários receberão a notificação em tempo real.',
    });
  };

  return {
    // Estado
    notifications,
    unreadCount,
    
    // Métodos básicos
    addNotification,
    removeNotification,
    clearAllNotifications,
    
    // Notificações de eventos em tempo real
    notifyNewMessage,
    notifyNewUser,
    notifyNewVehicle,
    notifyCriticalDiagnostic,
    notifySystemAlert,
    
    // Notificações de ações
    notifyUserBlocked,
    notifyUserUnblocked,
    notifyMessageReplied,
    notifyDiagnosticResolved,
    notifyExportComplete,
    notifySettingsSaved,
    notifyError,
    notifySuccess,
    notifyUserAlertSent,
  };
};

export default useAdminNotifications;
