import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Veículos populares para escanear automaticamente
const POPULAR_VEHICLES = [
  // Honda
  { brand: "Honda", model: "Civic", years: ["2019", "2020", "2021", "2022", "2023"] },
  { brand: "Honda", model: "Accord", years: ["2018", "2019", "2020", "2021", "2022"] },
  { brand: "Honda", model: "CR-V", years: ["2019", "2020", "2021", "2022", "2023"] },
  { brand: "Honda", model: "HR-V", years: ["2019", "2020", "2021", "2022"] },
  { brand: "Honda", model: "Fit", years: ["2018", "2019", "2020"] },
  
  // Toyota
  { brand: "Toyota", model: "Corolla", years: ["2019", "2020", "2021", "2022", "2023"] },
  { brand: "Toyota", model: "Camry", years: ["2018", "2019", "2020", "2021", "2022"] },
  { brand: "Toyota", model: "RAV4", years: ["2019", "2020", "2021", "2022", "2023"] },
  { brand: "Toyota", model: "Hilux", years: ["2018", "2019", "2020", "2021", "2022"] },
  { brand: "Toyota", model: "Yaris", years: ["2018", "2019", "2020", "2021"] },
  
  // Ford
  { brand: "Ford", model: "F-150", years: ["2018", "2019", "2020", "2021", "2022"] },
  { brand: "Ford", model: "Mustang", years: ["2018", "2019", "2020", "2021", "2022"] },
  { brand: "Ford", model: "Explorer", years: ["2019", "2020", "2021", "2022"] },
  { brand: "Ford", model: "Escape", years: ["2019", "2020", "2021", "2022"] },
  
  // Chevrolet
  { brand: "Chevrolet", model: "Silverado 1500", years: ["2018", "2019", "2020", "2021", "2022"] },
  { brand: "Chevrolet", model: "Equinox", years: ["2018", "2019", "2020", "2021", "2022"] },
  { brand: "Chevrolet", model: "Malibu", years: ["2018", "2019", "2020", "2021"] },
  { brand: "Chevrolet", model: "Cruze", years: ["2017", "2018", "2019"] },
  
  // Volkswagen
  { brand: "Volkswagen", model: "Golf", years: ["2018", "2019", "2020", "2021"] },
  { brand: "Volkswagen", model: "Jetta", years: ["2018", "2019", "2020", "2021", "2022"] },
  { brand: "Volkswagen", model: "Tiguan", years: ["2018", "2019", "2020", "2021", "2022"] },
  { brand: "Volkswagen", model: "Passat", years: ["2018", "2019", "2020", "2021"] },
  
  // Hyundai
  { brand: "Hyundai", model: "Tucson", years: ["2018", "2019", "2020", "2021", "2022"] },
  { brand: "Hyundai", model: "Elantra", years: ["2018", "2019", "2020", "2021", "2022"] },
  { brand: "Hyundai", model: "Santa Fe", years: ["2018", "2019", "2020", "2021"] },
  { brand: "Hyundai", model: "Creta", years: ["2018", "2019", "2020", "2021", "2022"] },
  
  // Nissan
  { brand: "Nissan", model: "Sentra", years: ["2018", "2019", "2020", "2021", "2022"] },
  { brand: "Nissan", model: "Altima", years: ["2018", "2019", "2020", "2021"] },
  { brand: "Nissan", model: "Rogue", years: ["2018", "2019", "2020", "2021", "2022"] },
  { brand: "Nissan", model: "Kicks", years: ["2019", "2020", "2021", "2022"] },
  
  // Jeep
  { brand: "Jeep", model: "Wrangler", years: ["2018", "2019", "2020", "2021", "2022"] },
  { brand: "Jeep", model: "Cherokee", years: ["2018", "2019", "2020", "2021"] },
  { brand: "Jeep", model: "Grand Cherokee", years: ["2018", "2019", "2020", "2021", "2022"] },
  { brand: "Jeep", model: "Compass", years: ["2018", "2019", "2020", "2021", "2022"] },
  
  // BMW
  { brand: "BMW", model: "3 Series", years: ["2018", "2019", "2020", "2021"] },
  { brand: "BMW", model: "X3", years: ["2018", "2019", "2020", "2021"] },
  { brand: "BMW", model: "X5", years: ["2018", "2019", "2020", "2021"] },
  
  // Mercedes-Benz
  { brand: "Mercedes-Benz", model: "C-Class", years: ["2018", "2019", "2020", "2021"] },
  { brand: "Mercedes-Benz", model: "GLC", years: ["2018", "2019", "2020", "2021"] },
  
  // Kia
  { brand: "Kia", model: "Sportage", years: ["2018", "2019", "2020", "2021", "2022"] },
  { brand: "Kia", model: "Sorento", years: ["2018", "2019", "2020", "2021"] },
  { brand: "Kia", model: "Optima", years: ["2018", "2019", "2020"] },
];

function getSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseClient();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // Parse request body for optional parameters
    let maxScans = 5; // Default: scan 5 vehicles per run
    let forceRescan = false;
    
    try {
      const body = await req.json();
      maxScans = body.maxScans || 5;
      forceRescan = body.forceRescan || false;
    } catch {
      // Body is optional
    }
    
    console.log(`[ScheduledScan] Starting scheduled scan, max ${maxScans} vehicles...`);
    
    // Get vehicles that need scanning (not in cache or expired)
    const vehiclesToScan: Array<{ brand: string; model: string; year: string }> = [];
    
    for (const vehicle of POPULAR_VEHICLES) {
      for (const year of vehicle.years) {
        // Check if already cached and not expired
        const { data: cached } = await supabase
          .from("carcare_procedure_cache")
          .select("id")
          .eq("brand", vehicle.brand)
          .eq("model", vehicle.model)
          .eq("year", year)
          .gt("expires_at", new Date().toISOString())
          .limit(1);
        
        if (forceRescan || !cached || cached.length === 0) {
          vehiclesToScan.push({
            brand: vehicle.brand,
            model: vehicle.model,
            year: year,
          });
        }
        
        // Stop if we have enough vehicles to scan
        if (vehiclesToScan.length >= maxScans) break;
      }
      if (vehiclesToScan.length >= maxScans) break;
    }
    
    console.log(`[ScheduledScan] Found ${vehiclesToScan.length} vehicles to scan`);
    
    const results: Array<{
      brand: string;
      model: string;
      year: string;
      proceduresFound: number;
      success: boolean;
      error?: string;
    }> = [];
    
    // Scan each vehicle
    for (const vehicle of vehiclesToScan) {
      try {
        console.log(`[ScheduledScan] Scanning ${vehicle.year} ${vehicle.brand} ${vehicle.model}...`);
        
        // Call the main carcare-api function
        const response = await fetch(`${supabaseUrl}/functions/v1/carcare-api`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            action: "scan-and-cache",
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
          }),
        });
        
        const result = await response.json();
        
        results.push({
          ...vehicle,
          proceduresFound: result.proceduresFound || 0,
          success: result.success || false,
          error: result.error,
        });
        
        // Small delay between scans to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`[ScheduledScan] Error scanning ${vehicle.brand} ${vehicle.model}:`, error);
        results.push({
          ...vehicle,
          proceduresFound: 0,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
    
    const successful = results.filter(r => r.success).length;
    const totalProcedures = results.reduce((sum, r) => sum + r.proceduresFound, 0);
    
    console.log(`[ScheduledScan] Completed: ${successful}/${results.length} successful, ${totalProcedures} procedures cached`);
    
    // Log scan to system settings for tracking
    await supabase
      .from("system_settings")
      .upsert({
        key: "carcare_last_scheduled_scan",
        category: "carcare",
        value: {
          timestamp: new Date().toISOString(),
          vehiclesScanned: results.length,
          successful,
          totalProcedures,
        },
        description: "Last scheduled CarCare scan result",
      }, { onConflict: "key" });
    
    return new Response(
      JSON.stringify({
        success: true,
        vehiclesScanned: results.length,
        successful,
        totalProcedures,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[ScheduledScan] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
