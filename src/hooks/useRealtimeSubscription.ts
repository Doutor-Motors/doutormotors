import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type TableName = 
  | 'profiles'
  | 'vehicles'
  | 'diagnostics'
  | 'diagnostic_items'
  | 'user_subscriptions'
  | 'support_tickets'
  | 'ticket_messages'
  | 'data_recordings'
  | 'usage_tracking'
  | 'coding_executions'
  | 'contact_messages'
  | 'system_alerts'
  | 'audit_logs';

type ChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface SubscriptionConfig {
  table: TableName;
  event?: ChangeEvent;
  filter?: string;
}

interface UseRealtimeSubscriptionOptions {
  tables: SubscriptionConfig[];
  onDataChange: (payload: {
    table: TableName;
    eventType: string;
    new: any;
    old: any;
  }) => void;
  enabled?: boolean;
}

/**
 * Hook para Supabase Realtime subscriptions
 * Permite ouvir mudanças em tempo real em múltiplas tabelas
 */
export function useRealtimeSubscription({
  tables,
  onDataChange,
  enabled = true,
}: UseRealtimeSubscriptionOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const callbackRef = useRef(onDataChange);

  // Manter callback atualizado
  useEffect(() => {
    callbackRef.current = onDataChange;
  }, [onDataChange]);

  useEffect(() => {
    if (!enabled) {
      // Limpar canal se desabilitado
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    // Criar canal único para todas as tabelas
    const channelId = `realtime-${tables.map(t => t.table).join('-')}-${Date.now()}`;
    let channel = supabase.channel(channelId);

    // Adicionar listeners para cada tabela
    tables.forEach(({ table, event = '*', filter }) => {
      const config: any = {
        event,
        schema: 'public',
        table,
      };

      if (filter) {
        config.filter = filter;
      }

      channel = channel.on(
        'postgres_changes',
        config,
        (payload: RealtimePostgresChangesPayload<any>) => {
          callbackRef.current({
            table: table as TableName,
            eventType: payload.eventType,
            new: payload.new,
            old: payload.old,
          });
        }
      );
    });

    // Subscrever ao canal
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`[Realtime] Subscribed to: ${tables.map(t => t.table).join(', ')}`);
      } else if (status === 'CHANNEL_ERROR') {
        console.error('[Realtime] Channel error');
      }
    });

    channelRef.current = channel;

    // Cleanup
    return () => {
      if (channelRef.current) {
        console.log(`[Realtime] Unsubscribing from: ${tables.map(t => t.table).join(', ')}`);
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [enabled, JSON.stringify(tables)]);

  // Função para forçar reconexão
  const reconnect = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  return { reconnect };
}

/**
 * Hook simplificado para uma única tabela
 */
export function useRealtimeTable<T = any>(
  table: TableName,
  onInsert?: (record: T) => void,
  onUpdate?: (record: T, oldRecord: T) => void,
  onDelete?: (oldRecord: T) => void,
  enabled = true
) {
  return useRealtimeSubscription({
    tables: [{ table, event: '*' }],
    onDataChange: ({ eventType, new: newRecord, old: oldRecord }) => {
      switch (eventType) {
        case 'INSERT':
          onInsert?.(newRecord as T);
          break;
        case 'UPDATE':
          onUpdate?.(newRecord as T, oldRecord as T);
          break;
        case 'DELETE':
          onDelete?.(oldRecord as T);
          break;
      }
    },
    enabled,
  });
}
