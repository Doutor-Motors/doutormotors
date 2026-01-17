import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Vehicle {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  year: number;
  engine: string | null;
  fuel_type: string | null;
  license_plate: string | null;
  created_at: string;
  updated_at: string;
}

export interface DiagnosticItem {
  id: string;
  diagnostic_id: string;
  dtc_code: string;
  description_human: string;
  priority: 'critical' | 'attention' | 'preventive';
  severity: number;
  can_diy: boolean;
  diy_difficulty: number | null;
  solution_url: string | null;
  probable_causes: string[] | null;
  status: 'pending' | 'completed' | 'resolved';
  created_at: string;
  updated_at: string;
}

export interface Diagnostic {
  id: string;
  vehicle_id: string;
  user_id: string;
  status: 'pending' | 'completed' | 'resolved';
  obd_raw_data: unknown;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: DiagnosticItem[];
  vehicle?: Vehicle;
}

interface AppState {
  // Active vehicle
  activeVehicleId: string | null;
  setActiveVehicleId: (id: string | null) => void;
  
  // Vehicles cache
  vehicles: Vehicle[];
  setVehicles: (vehicles: Vehicle[]) => void;
  addVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (vehicle: Vehicle) => void;
  removeVehicle: (id: string) => void;
  
  // Diagnostics cache
  diagnostics: Diagnostic[];
  setDiagnostics: (diagnostics: Diagnostic[]) => void;
  addDiagnostic: (diagnostic: Diagnostic) => void;
  
  // OBD Connection
  obdConnectionStatus: 'disconnected' | 'connecting' | 'connected';
  setObdConnectionStatus: (status: 'disconnected' | 'connecting' | 'connected') => void;
  
  // Current diagnostic session
  currentDiagnosticId: string | null;
  setCurrentDiagnosticId: (id: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Active vehicle
      activeVehicleId: null,
      setActiveVehicleId: (id) => set({ activeVehicleId: id }),
      
      // Vehicles
      vehicles: [],
      setVehicles: (vehicles) => set({ vehicles }),
      addVehicle: (vehicle) => set((state) => ({ 
        vehicles: [...state.vehicles, vehicle] 
      })),
      updateVehicle: (vehicle) => set((state) => ({
        vehicles: state.vehicles.map((v) => 
          v.id === vehicle.id ? vehicle : v
        ),
      })),
      removeVehicle: (id) => set((state) => ({
        vehicles: state.vehicles.filter((v) => v.id !== id),
        activeVehicleId: state.activeVehicleId === id ? null : state.activeVehicleId,
      })),
      
      // Diagnostics
      diagnostics: [],
      setDiagnostics: (diagnostics) => set({ diagnostics }),
      addDiagnostic: (diagnostic) => set((state) => ({
        diagnostics: [diagnostic, ...state.diagnostics],
      })),
      
      // OBD Connection
      obdConnectionStatus: 'disconnected',
      setObdConnectionStatus: (status) => set({ obdConnectionStatus: status }),
      
      // Current diagnostic
      currentDiagnosticId: null,
      setCurrentDiagnosticId: (id) => set({ currentDiagnosticId: id }),
    }),
    {
      name: 'doutor-motors-storage',
      partialize: (state) => ({ 
        activeVehicleId: state.activeVehicleId,
      }),
    }
  )
);
