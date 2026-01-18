import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// Interface para progresso do tutorial
export interface TutorialProgress {
  id: string;
  user_id: string;
  tutorial_id: string;
  completed_steps: number[];
  last_step: number;
  watch_time_seconds: number;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface UseTutorialProgressReturn {
  progress: TutorialProgress | null;
  isLoading: boolean;
  completedSteps: Set<number>;
  lastStep: number;
  watchTime: number;
  isCompleted: boolean;
  progressPercent: number;
  loadProgress: (tutorialId: string) => Promise<void>;
  markStepComplete: (stepIndex: number) => Promise<void>;
  markStepIncomplete: (stepIndex: number) => Promise<void>;
  toggleStepComplete: (stepIndex: number) => Promise<void>;
  updateLastStep: (stepIndex: number) => Promise<void>;
  addWatchTime: (seconds: number) => Promise<void>;
  markTutorialComplete: () => Promise<void>;
  resetProgress: () => Promise<void>;
}

export function useTutorialProgress(
  tutorialId?: string,
  totalSteps: number = 0
): UseTutorialProgressReturn {
  const { user } = useAuth();
  const [progress, setProgress] = useState<TutorialProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [lastStep, setLastStep] = useState(0);
  const [watchTime, setWatchTime] = useState(0);

  // Carregar progresso do banco
  const loadProgress = useCallback(async (tid: string) => {
    if (!user || !tid) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tutorial_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('tutorial_id', tid)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProgress(data as TutorialProgress);
        setCompletedSteps(new Set(data.completed_steps || []));
        setLastStep(data.last_step || 0);
        setWatchTime(data.watch_time_seconds || 0);
      } else {
        // Reset state if no progress found
        setProgress(null);
        setCompletedSteps(new Set());
        setLastStep(0);
        setWatchTime(0);
      }
    } catch (error) {
      console.error('[useTutorialProgress] Error loading progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Carregar progresso ao montar ou quando tutorialId mudar
  useEffect(() => {
    if (tutorialId) {
      loadProgress(tutorialId);
    }
  }, [tutorialId, loadProgress]);

  // Criar ou atualizar progresso
  const upsertProgress = useCallback(async (updates: Partial<TutorialProgress>) => {
    if (!user || !tutorialId) return;

    try {
      const { error } = await supabase
        .from('tutorial_progress')
        .upsert({
          user_id: user.id,
          tutorial_id: tutorialId,
          ...updates,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,tutorial_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('[useTutorialProgress] Error updating progress:', error);
    }
  }, [user, tutorialId]);

  // Marcar passo como completo
  const markStepComplete = useCallback(async (stepIndex: number) => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(stepIndex);
    setCompletedSteps(newCompleted);

    await upsertProgress({
      completed_steps: Array.from(newCompleted),
      last_step: Math.max(lastStep, stepIndex),
    });
  }, [completedSteps, lastStep, upsertProgress]);

  // Marcar passo como incompleto
  const markStepIncomplete = useCallback(async (stepIndex: number) => {
    const newCompleted = new Set(completedSteps);
    newCompleted.delete(stepIndex);
    setCompletedSteps(newCompleted);

    await upsertProgress({
      completed_steps: Array.from(newCompleted),
      completed_at: null, // Remove completed status if unchecking
    });
  }, [completedSteps, upsertProgress]);

  // Toggle passo
  const toggleStepComplete = useCallback(async (stepIndex: number) => {
    if (completedSteps.has(stepIndex)) {
      await markStepIncomplete(stepIndex);
    } else {
      await markStepComplete(stepIndex);
    }
  }, [completedSteps, markStepComplete, markStepIncomplete]);

  // Atualizar último passo visualizado
  const updateLastStep = useCallback(async (stepIndex: number) => {
    if (stepIndex > lastStep) {
      setLastStep(stepIndex);
      await upsertProgress({
        last_step: stepIndex,
      });
    }
  }, [lastStep, upsertProgress]);

  // Adicionar tempo de visualização
  const addWatchTime = useCallback(async (seconds: number) => {
    const newWatchTime = watchTime + seconds;
    setWatchTime(newWatchTime);

    await upsertProgress({
      watch_time_seconds: newWatchTime,
    });
  }, [watchTime, upsertProgress]);

  // Marcar tutorial como completo
  const markTutorialComplete = useCallback(async () => {
    await upsertProgress({
      completed_at: new Date().toISOString(),
    });

    toast.success('Parabéns! Tutorial concluído!', {
      description: 'Seu progresso foi salvo',
    });
  }, [upsertProgress]);

  // Resetar progresso
  const resetProgress = useCallback(async () => {
    if (!user || !tutorialId) return;

    try {
      const { error } = await supabase
        .from('tutorial_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('tutorial_id', tutorialId);

      if (error) throw error;

      setProgress(null);
      setCompletedSteps(new Set());
      setLastStep(0);
      setWatchTime(0);

      toast.success('Progresso resetado');
    } catch (error) {
      console.error('[useTutorialProgress] Error resetting progress:', error);
      toast.error('Erro ao resetar progresso');
    }
  }, [user, tutorialId]);

  // Calcular porcentagem de progresso
  const progressPercent = totalSteps > 0 
    ? (completedSteps.size / totalSteps) * 100 
    : 0;

  const isCompleted = progress?.completed_at !== null && progress?.completed_at !== undefined;

  return {
    progress,
    isLoading,
    completedSteps,
    lastStep,
    watchTime,
    isCompleted,
    progressPercent,
    loadProgress,
    markStepComplete,
    markStepIncomplete,
    toggleStepComplete,
    updateLastStep,
    addWatchTime,
    markTutorialComplete,
    resetProgress,
  };
}

export default useTutorialProgress;
