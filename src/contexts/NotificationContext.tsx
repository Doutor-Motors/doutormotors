import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type NotificationType = 'success' | 'warning' | 'info' | 'error';
export type NotificationStyle = 'default' | 'filled';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  styleVariant?: NotificationStyle;
  duration?: number;
  createdAt: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  // Helper functions for common notifications
  notifySuccess: (title: string, description: string) => string;
  notifyError: (title: string, description: string) => string;
  notifyWarning: (title: string, description: string) => string;
  notifyInfo: (title: string, description: string) => string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  const generateId = () => `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const id = generateId();
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date(),
      duration: notification.duration ?? 5000,
      styleVariant: notification.styleVariant ?? 'filled',
    };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto-remove after duration (if not 0 which means persistent)
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Helper functions
  const notifySuccess = useCallback((title: string, description: string) => {
    return addNotification({ type: 'success', title, description });
  }, [addNotification]);

  const notifyError = useCallback((title: string, description: string) => {
    return addNotification({ type: 'error', title, description, duration: 8000 });
  }, [addNotification]);

  const notifyWarning = useCallback((title: string, description: string) => {
    return addNotification({ type: 'warning', title, description, duration: 6000 });
  }, [addNotification]);

  const notifyInfo = useCallback((title: string, description: string) => {
    return addNotification({ type: 'info', title, description });
  }, [addNotification]);

  // Real-time subscription for user-specific notifications
  useEffect(() => {
    if (!user) return;

    // Subscribe to diagnostic_items changes for critical alerts
    const diagnosticSubscription = supabase
      .channel('user-diagnostic-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'diagnostic_items',
          filter: `priority=eq.critical`,
        },
        (payload) => {
          const item = payload.new as any;
          addNotification({
            type: 'error',
            title: 'Alerta Crítico Detectado!',
            description: `Código ${item.dtc_code}: ${item.description_human}`,
            duration: 10000,
          });
        }
      )
      .subscribe();

    // Subscribe to diagnostics status changes
    const statusSubscription = supabase
      .channel('user-diagnostic-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'diagnostics',
        },
        (payload) => {
          const diagnostic = payload.new as any;
          if (diagnostic.user_id === user.id) {
            if (diagnostic.status === 'completed') {
              addNotification({
                type: 'success',
                title: 'Diagnóstico Concluído',
                description: 'Seu diagnóstico foi processado com sucesso!',
              });
            } else if (diagnostic.status === 'resolved') {
              addNotification({
                type: 'info',
                title: 'Problema Resolvido',
                description: 'O diagnóstico foi marcado como resolvido.',
              });
            }
          }
        }
      )
      .subscribe();

    // Subscribe to vehicles table for new vehicle additions
    const vehicleSubscription = supabase
      .channel('user-vehicle-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'vehicles',
        },
        (payload) => {
          const vehicle = payload.new as any;
          if (vehicle.user_id === user.id) {
            addNotification({
              type: 'success',
              title: 'Veículo Adicionado',
              description: `${vehicle.brand} ${vehicle.model} foi registrado com sucesso!`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(diagnosticSubscription);
      supabase.removeChannel(statusSubscription);
      supabase.removeChannel(vehicleSubscription);
    };
  }, [user, addNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications,
        notifySuccess,
        notifyError,
        notifyWarning,
        notifyInfo,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
