import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Json } from '@/integrations/supabase/types';

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE_VEHICLE'
  | 'UPDATE_VEHICLE'
  | 'DELETE_VEHICLE'
  | 'CREATE_DIAGNOSTIC'
  | 'UPDATE_DIAGNOSTIC'
  | 'DELETE_DIAGNOSTIC'
  | 'RESOLVE_DTC'
  | 'CREATE_TICKET'
  | 'UPDATE_TICKET'
  | 'CLOSE_TICKET'
  | 'UPDATE_PROFILE'
  | 'CHANGE_PASSWORD'
  | 'UPDATE_SUBSCRIPTION'
  | 'CANCEL_SUBSCRIPTION'
  | 'EXECUTE_CODING'
  | 'START_RECORDING'
  | 'STOP_RECORDING'
  | 'DELETE_RECORDING'
  | 'EXPORT_DATA'
  | 'ACCEPT_TERMS'
  | 'UPDATE_SETTINGS'
  | 'ADMIN_UPDATE_USER'
  | 'ADMIN_UPDATE_SUBSCRIPTION'
  | 'ADMIN_DELETE_USER'
  | 'ADMIN_SEND_ALERT'
  | 'ADMIN_UPDATE_SETTINGS';

export type EntityType =
  | 'user'
  | 'vehicle'
  | 'diagnostic'
  | 'diagnostic_item'
  | 'ticket'
  | 'subscription'
  | 'coding_execution'
  | 'recording'
  | 'profile'
  | 'settings'
  | 'alert'
  | 'consent';

interface AuditLogEntry {
  action: AuditAction;
  entityType: EntityType;
  entityId?: string;
  oldValue?: Json;
  newValue?: Json;
  metadata?: Json;
}

interface UseAuditLogReturn {
  logAction: (entry: AuditLogEntry) => Promise<void>;
  logLogin: () => Promise<void>;
  logLogout: () => Promise<void>;
}

export function useAuditLog(): UseAuditLogReturn {
  const { user } = useAuth();

  const logAction = useCallback(
    async (entry: AuditLogEntry) => {
      if (!user?.id) {
        console.warn('Cannot log audit action: user not authenticated');
        return;
      }

      try {
        const { error } = await supabase.from('audit_logs').insert([
          {
            user_id: user.id,
            action: entry.action,
            entity_type: entry.entityType,
            entity_id: entry.entityId || null,
            old_value: entry.oldValue || null,
            new_value: entry.newValue || null,
            metadata: entry.metadata || {},
            user_agent: navigator.userAgent,
          },
        ]);

        if (error) {
          console.error('Error logging audit action:', error);
        }
      } catch (err) {
        console.error('Failed to log audit action:', err);
      }
    },
    [user?.id]
  );

  const logLogin = useCallback(async () => {
    await logAction({
      action: 'LOGIN',
      entityType: 'user',
      entityId: user?.id,
      metadata: {
        timestamp: new Date().toISOString(),
        platform: navigator.platform,
      } as Json,
    });
  }, [logAction, user?.id]);

  const logLogout = useCallback(async () => {
    await logAction({
      action: 'LOGOUT',
      entityType: 'user',
      entityId: user?.id,
      metadata: {
        timestamp: new Date().toISOString(),
      } as Json,
    });
  }, [logAction, user?.id]);

  return {
    logAction,
    logLogin,
    logLogout,
  };
}

/**
 * Utility function to create audit log entries for admin operations
 */
export function createAdminAuditEntry(
  action: AuditAction,
  entityType: EntityType,
  entityId: string,
  details?: {
    oldValue?: Json;
    newValue?: Json;
    metadata?: Record<string, unknown>;
  }
): AuditLogEntry {
  return {
    action,
    entityType,
    entityId,
    oldValue: details?.oldValue,
    newValue: details?.newValue,
    metadata: {
      ...details?.metadata,
      isAdminAction: true,
    } as Json,
  };
}
