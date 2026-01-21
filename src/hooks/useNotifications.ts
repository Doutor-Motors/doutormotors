import { useNotification } from '@/contexts/NotificationContext';
import { isCacheAlmostFull, CACHE_WARNING_THRESHOLD } from '@/services/solutions/cache';

/**
 * Hook personalizado para notificações de usuário
 * Fornece métodos simples para diferentes tipos de notificações
 */
export const useNotifications = () => {
  const { 
    notifications, 
    addNotification, 
    removeNotification, 
    clearAllNotifications,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
  } = useNotification();

  // Notificações específicas do sistema
  const notifyConnectionError = () => {
    return addNotification({
      type: 'warning',
      title: 'Conexão Perdida',
      description: 'Verifique sua conexão com a internet',
      styleVariant: 'filled',
    });
  };

  const notifyUpdateAvailable = (version: string) => {
    return addNotification({
      type: 'info',
      title: 'Atualização Disponível',
      description: `Versão ${version} pronta para instalar`,
      styleVariant: 'filled',
    });
  };

  const notifyPaymentSuccess = (transactionId: string) => {
    return addNotification({
      type: 'success',
      title: 'Pagamento Processado',
      description: `ID da transação: ${transactionId}`,
      styleVariant: 'filled',
    });
  };

  const notifyGenericError = () => {
    return addNotification({
      type: 'error',
      title: 'Algo deu errado',
      description: 'Por favor, tente novamente mais tarde',
      styleVariant: 'filled',
    });
  };

  // Notificações de diagnóstico
  const notifyDiagnosticStarted = () => {
    return notifyInfo('Diagnóstico Iniciado', 'Processando dados do veículo...');
  };

  const notifyDiagnosticComplete = () => {
    return notifySuccess('Diagnóstico Concluído', 'Análise completa disponível!');
  };

  const notifyCriticalAlert = (code: string, description: string) => {
    return addNotification({
      type: 'error',
      title: `Alerta Crítico: ${code}`,
      description,
      styleVariant: 'filled',
      duration: 10000,
    });
  };

  const notifyAttentionAlert = (code: string, description: string) => {
    return addNotification({
      type: 'warning',
      title: `Atenção: ${code}`,
      description,
      styleVariant: 'filled',
      duration: 8000,
    });
  };

  // Notificações de veículo
  const notifyVehicleAdded = (vehicleName: string) => {
    return notifySuccess('Veículo Adicionado', `${vehicleName} foi registrado com sucesso!`);
  };

  const notifyVehicleRemoved = (vehicleName: string) => {
    return notifyInfo('Veículo Removido', `${vehicleName} foi removido da sua lista`);
  };

  // Notificação de cache quase cheio
  const checkAndNotifyCacheStatus = async () => {
    try {
      const { isFull, count } = await isCacheAlmostFull();
      if (isFull) {
        return addNotification({
          type: 'warning',
          title: 'Cache Quase Cheio',
          description: `Você tem ${count} soluções salvas (limite: ${CACHE_WARNING_THRESHOLD}). Considere limpar o cache nas configurações.`,
          styleVariant: 'filled',
          duration: 10000,
        });
      }
      return null;
    } catch (error) {
      console.error('Erro ao verificar status do cache:', error);
      return null;
    }
  };

  // Notificações de perfil
  const notifyProfileUpdated = () => {
    return notifySuccess('Perfil Atualizado', 'Suas informações foram salvas com sucesso!');
  };

  const notifyPasswordChanged = () => {
    return notifySuccess('Senha Alterada', 'Sua senha foi alterada com sucesso!');
  };

  return {
    // Estado
    notifications,
    
    // Métodos básicos
    addNotification,
    removeNotification,
    clearAllNotifications,
    
    // Helpers básicos
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    
    // Notificações do sistema
    notifyConnectionError,
    notifyUpdateAvailable,
    notifyPaymentSuccess,
    notifyGenericError,
    
    // Notificações de diagnóstico
    notifyDiagnosticStarted,
    notifyDiagnosticComplete,
    notifyCriticalAlert,
    notifyAttentionAlert,
    
    // Notificações de veículo
    notifyVehicleAdded,
    notifyVehicleRemoved,
    
    // Notificações de cache
    checkAndNotifyCacheStatus,
    
    // Notificações de perfil
    notifyProfileUpdated,
    notifyPasswordChanged,
  };
};

export default useNotifications;
