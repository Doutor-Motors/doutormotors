import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { Bell, MessageSquare, Users, Car, AlertTriangle, Settings } from 'lucide-react';

export type AdminNotificationType = 
  | 'new_message' 
  | 'new_user' 
  | 'new_vehicle' 
  | 'critical_diagnostic' 
  | 'system_alert'
  | 'user_activity';

export interface AdminNotification {
  id: string;
  type: AdminNotificationType;
  title: string;
  subtitle?: string;
  message: string;
  highlight?: string;
  secondaryMessage?: string;
  icon?: React.ReactNode;
  duration?: number;
  createdAt: Date;
}

interface AdminNotificationContextType {
  notifications: AdminNotification[];
  addNotification: (notification: Omit<AdminNotification, 'id' | 'createdAt'>) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  unreadCount: number;
  // Helper functions
  notifyNewMessage: (senderName: string, subject: string) => string;
  notifyNewUser: (userName: string, email: string) => string;
  notifyNewVehicle: (userName: string, vehicleName: string) => string;
  notifyCriticalDiagnostic: (vehicleName: string, code: string, description: string) => string;
  notifySystemAlert: (title: string, message: string) => string;
}

const AdminNotificationContext = createContext<AdminNotificationContextType | undefined>(undefined);

export const useAdminNotification = () => {
  const context = useContext(AdminNotificationContext);
  // Return safe defaults when used outside provider (e.g., during initial mount)
  if (!context) {
    return {
      notifications: [],
      addNotification: () => "",
      removeNotification: () => {},
      clearAllNotifications: () => {},
      unreadCount: 0,
      notifyNewMessage: () => "",
      notifyNewUser: () => "",
      notifyNewVehicle: () => "",
      notifyCriticalDiagnostic: () => "",
      notifySystemAlert: () => "",
    } as AdminNotificationContextType;
  }
  return context;
};

interface AdminNotificationProviderProps {
  children: React.ReactNode;
}

export const AdminNotificationProvider: React.FC<AdminNotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const { user } = useAuth();
  const { isAdmin } = useAdmin();

  const generateId = () => `admin-notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addNotification = useCallback((notification: Omit<AdminNotification, 'id' | 'createdAt'>) => {
    const id = generateId();
    const newNotification: AdminNotification = {
      ...notification,
      id,
      createdAt: new Date(),
      duration: notification.duration ?? 8000,
    };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto-remove after duration
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

  // Helper functions for admin notifications
  const notifyNewMessage = useCallback((senderName: string, subject: string) => {
    return addNotification({
      type: 'new_message',
      title: 'Nova Mensagem',
      subtitle: 'Contato',
      message: `${senderName} enviou uma mensagem:`,
      highlight: subject,
      secondaryMessage: 'Acesse a caixa de mensagens para visualizar e responder.',
      icon: <MessageSquare className="w-4 h-4" />,
      duration: 10000,
    });
  }, [addNotification]);

  const notifyNewUser = useCallback((userName: string, email: string) => {
    return addNotification({
      type: 'new_user',
      title: 'Novo Usuário',
      subtitle: 'Cadastro',
      message: `Novo usuário cadastrado:`,
      highlight: userName,
      secondaryMessage: `Email: ${email}. Acesse o painel de usuários para mais detalhes.`,
      icon: <Users className="w-4 h-4" />,
    });
  }, [addNotification]);

  const notifyNewVehicle = useCallback((userName: string, vehicleName: string) => {
    return addNotification({
      type: 'new_vehicle',
      title: 'Novo Veículo',
      subtitle: 'Registro',
      message: `${userName} registrou um novo veículo:`,
      highlight: vehicleName,
      icon: <Car className="w-4 h-4" />,
    });
  }, [addNotification]);

  const notifyCriticalDiagnostic = useCallback((vehicleName: string, code: string, description: string) => {
    return addNotification({
      type: 'critical_diagnostic',
      title: 'Alerta Crítico',
      subtitle: 'Diagnóstico',
      message: `Problema crítico detectado em ${vehicleName}:`,
      highlight: code,
      secondaryMessage: description,
      icon: <AlertTriangle className="w-4 h-4" />,
      duration: 15000,
    });
  }, [addNotification]);

  const notifySystemAlert = useCallback((title: string, message: string) => {
    return addNotification({
      type: 'system_alert',
      title,
      subtitle: 'Sistema',
      message,
      icon: <Settings className="w-4 h-4" />,
    });
  }, [addNotification]);

  // Real-time subscriptions for admin
  useEffect(() => {
    if (!user || !isAdmin) return;

    // Subscribe to new contact messages
    const messagesSubscription = supabase
      .channel('admin-contact-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'contact_messages',
        },
        (payload) => {
          const message = payload.new as any;
          notifyNewMessage(message.name, message.subject);
        }
      )
      .subscribe();

    // Subscribe to new user profiles
    const profilesSubscription = supabase
      .channel('admin-new-profiles')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          const profile = payload.new as any;
          notifyNewUser(profile.name, profile.email);
        }
      )
      .subscribe();

    // Subscribe to new vehicles
    const vehiclesSubscription = supabase
      .channel('admin-new-vehicles')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'vehicles',
        },
        async (payload) => {
          const vehicle = payload.new as any;
          // Get user name
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('user_id', vehicle.user_id)
            .single();
          
          notifyNewVehicle(
            profile?.name || 'Usuário',
            `${vehicle.brand} ${vehicle.model} ${vehicle.year}`
          );
        }
      )
      .subscribe();

    // Subscribe to critical diagnostics
    const diagnosticsSubscription = supabase
      .channel('admin-critical-diagnostics')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'diagnostic_items',
          filter: 'priority=eq.critical',
        },
        async (payload) => {
          const item = payload.new as any;
          // Get diagnostic and vehicle info
          const { data: diagnostic } = await supabase
            .from('diagnostics')
            .select('vehicle_id, vehicles(brand, model, year)')
            .eq('id', item.diagnostic_id)
            .single();
          
          const vehicle = (diagnostic as any)?.vehicles;
          const vehicleName = vehicle 
            ? `${vehicle.brand} ${vehicle.model}` 
            : 'Veículo';
          
          notifyCriticalDiagnostic(
            vehicleName,
            item.dtc_code,
            item.description_human
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSubscription);
      supabase.removeChannel(profilesSubscription);
      supabase.removeChannel(vehiclesSubscription);
      supabase.removeChannel(diagnosticsSubscription);
    };
  }, [user, isAdmin, notifyNewMessage, notifyNewUser, notifyNewVehicle, notifyCriticalDiagnostic]);

  return (
    <AdminNotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications,
        unreadCount: notifications.length,
        notifyNewMessage,
        notifyNewUser,
        notifyNewVehicle,
        notifyCriticalDiagnostic,
        notifySystemAlert,
      }}
    >
      {children}
    </AdminNotificationContext.Provider>
  );
};
