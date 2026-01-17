import { supabase } from '@/integrations/supabase/client';
import { getDTCInfo, generateMockDTCCodes } from './dtcDatabase';
import { DiagnosticItem } from '@/store/useAppStore';

export interface DiagnosticResult {
  success: boolean;
  diagnosticId?: string;
  items: Omit<DiagnosticItem, 'id' | 'diagnostic_id' | 'created_at' | 'updated_at'>[];
  error?: string;
}

export interface VehicleInfo {
  brand: string;
  model: string;
  year: number;
}

// Process raw DTC codes and get AI-enhanced analysis
export async function analyzeDTCCodes(
  dtcCodes: string[],
  vehicle: VehicleInfo
): Promise<DiagnosticResult> {
  try {
    // Call the edge function for AI analysis
    const { data, error } = await supabase.functions.invoke('diagnose', {
      body: {
        dtcCodes,
        vehicleBrand: vehicle.brand,
        vehicleModel: vehicle.model,
        vehicleYear: vehicle.year,
      },
    });

    if (error) {
      console.error('Edge function error:', error);
      // Fallback to local database
      return fallbackToLocalDatabase(dtcCodes);
    }

    if (data?.diagnostics) {
      return {
        success: true,
        items: data.diagnostics.map((item: any) => ({
          dtc_code: item.dtc_code,
          description_human: item.description_human,
          priority: item.priority,
          severity: item.severity,
          can_diy: item.can_diy,
          diy_difficulty: item.diy_difficulty || null,
          solution_url: null,
          probable_causes: item.probable_causes || [],
          status: 'pending' as const,
        })),
      };
    }

    return fallbackToLocalDatabase(dtcCodes);
  } catch (error) {
    console.error('Analysis error:', error);
    return fallbackToLocalDatabase(dtcCodes);
  }
}

// Fallback to local DTC database when AI is unavailable
function fallbackToLocalDatabase(dtcCodes: string[]): DiagnosticResult {
  const items = dtcCodes.map(code => {
    const dtcInfo = getDTCInfo(code);
    
    if (dtcInfo) {
      return {
        dtc_code: dtcInfo.code,
        description_human: dtcInfo.defaultDescription,
        priority: dtcInfo.defaultPriority,
        severity: dtcInfo.defaultSeverity,
        can_diy: dtcInfo.canDiy,
        diy_difficulty: dtcInfo.diyDifficulty,
        solution_url: null,
        probable_causes: dtcInfo.defaultCauses,
        status: 'pending' as const,
      };
    }
    
    // Unknown code fallback
    return {
      dtc_code: code,
      description_human: `Código ${code} detectado. Consulte um mecânico para diagnóstico completo.`,
      priority: 'attention' as const,
      severity: 5,
      can_diy: false,
      diy_difficulty: null,
      solution_url: null,
      probable_causes: ['Diagnóstico adicional necessário'],
      status: 'pending' as const,
    };
  });

  return {
    success: true,
    items,
  };
}

// Save diagnostic to database
export async function saveDiagnostic(
  vehicleId: string,
  userId: string,
  items: DiagnosticResult['items'],
  rawData?: Record<string, unknown>
): Promise<{ diagnosticId: string | null; error: string | null }> {
  try {
    // Create diagnostic record
    const { data: diagnostic, error: diagError } = await supabase
      .from('diagnostics')
      .insert([{
        vehicle_id: vehicleId,
        user_id: userId,
        status: 'completed' as const,
        obd_raw_data: rawData ? JSON.parse(JSON.stringify(rawData)) : null,
      }])
      .select()
      .single();

    if (diagError) {
      console.error('Error creating diagnostic:', diagError);
      return { diagnosticId: null, error: 'Erro ao salvar diagnóstico' };
    }

    // Insert diagnostic items
    const itemsToInsert = items.map(item => ({
      diagnostic_id: diagnostic.id,
      dtc_code: item.dtc_code,
      description_human: item.description_human,
      priority: item.priority,
      severity: item.severity,
      can_diy: item.can_diy,
      diy_difficulty: item.diy_difficulty,
      solution_url: item.solution_url,
      probable_causes: item.probable_causes,
      status: item.status,
    }));

    const { error: itemsError } = await supabase
      .from('diagnostic_items')
      .insert(itemsToInsert);

    if (itemsError) {
      console.error('Error creating diagnostic items:', itemsError);
      return { diagnosticId: diagnostic.id, error: 'Erro ao salvar itens do diagnóstico' };
    }

    return { diagnosticId: diagnostic.id, error: null };
  } catch (error) {
    console.error('Save diagnostic error:', error);
    return { diagnosticId: null, error: 'Erro inesperado ao salvar diagnóstico' };
  }
}

// Run demo diagnostic with mock data
export async function runDemoDiagnostic(
  vehicleId: string,
  userId: string,
  vehicle: VehicleInfo
): Promise<DiagnosticResult & { diagnosticId?: string }> {
  // Generate random DTC codes for demo
  const mockCodes = generateMockDTCCodes();
  
  // Analyze the codes
  const result = await analyzeDTCCodes(mockCodes, vehicle);
  
  if (result.success && result.items.length > 0) {
    // Save to database
    const { diagnosticId, error } = await saveDiagnostic(
      vehicleId,
      userId,
      result.items,
      { demo: true, codes: mockCodes }
    );
    
    if (error) {
      return { ...result, error };
    }
    
    return { ...result, diagnosticId: diagnosticId || undefined };
  }
  
  return result;
}
