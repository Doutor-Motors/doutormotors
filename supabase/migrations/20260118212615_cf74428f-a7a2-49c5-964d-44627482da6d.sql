-- Create table to cache discovered procedures per car model
CREATE TABLE public.carcare_procedure_cache (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year TEXT,
    procedure_id TEXT NOT NULL,
    procedure_name TEXT NOT NULL,
    procedure_name_pt TEXT,
    category TEXT NOT NULL,
    video_url TEXT,
    thumbnail_url TEXT,
    source_url TEXT,
    discovered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 days'),
    UNIQUE(brand, model, year, procedure_id)
);

-- Create indexes for efficient queries
CREATE INDEX idx_carcare_procedure_brand_model ON public.carcare_procedure_cache(brand, model);
CREATE INDEX idx_carcare_procedure_category ON public.carcare_procedure_cache(category);
CREATE INDEX idx_carcare_procedure_expires ON public.carcare_procedure_cache(expires_at);

-- Enable RLS
ALTER TABLE public.carcare_procedure_cache ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (procedures are public data)
CREATE POLICY "Anyone can view procedure cache" 
ON public.carcare_procedure_cache 
FOR SELECT 
USING (true);

-- Create policy for admin insert/update/delete
CREATE POLICY "Service role can manage procedure cache" 
ON public.carcare_procedure_cache 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_carcare_procedure_cache_updated_at
BEFORE UPDATE ON public.carcare_procedure_cache
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create table to store static categories
CREATE TABLE public.carcare_categories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id TEXT NOT NULL UNIQUE,
    name_en TEXT NOT NULL,
    name_pt TEXT NOT NULL,
    icon TEXT,
    keywords TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for categories
ALTER TABLE public.carcare_categories ENABLE ROW LEVEL SECURITY;

-- Policy for public read
CREATE POLICY "Anyone can view categories" 
ON public.carcare_categories 
FOR SELECT 
USING (true);

-- Policy for service role management
CREATE POLICY "Service role can manage categories" 
ON public.carcare_categories 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Insert default categories
INSERT INTO public.carcare_categories (category_id, name_en, name_pt, icon, keywords) VALUES
('air_conditioner', 'Air Conditioner', 'Ar Condicionado', 'Snowflake', ARRAY['ac', 'air conditioning', 'freon', 'r134a', 'refrigerant']),
('air_filter_engine', 'Engine Air Filter', 'Filtro de Ar do Motor', 'Wind', ARRAY['air filter', 'engine filter', 'intake']),
('air_filter_cabin', 'Cabin Air Filter', 'Filtro de Ar Cabine', 'Fan', ARRAY['cabin filter', 'pollen filter', 'interior filter']),
('battery', 'Battery', 'Bateria', 'Battery', ARRAY['battery', 'dead battery', 'jump start', 'charging']),
('brakes', 'Brakes', 'Freios', 'Disc', ARRAY['brake', 'brake pad', 'brake disc', 'brake fluid']),
('coolant', 'Coolant', 'Líquido de Arrefecimento', 'Droplet', ARRAY['coolant', 'antifreeze', 'radiator', 'cooling']),
('headlight', 'Headlight', 'Farol', 'Lightbulb', ARRAY['headlight', 'low beam', 'headlamp']),
('highbeam', 'High Beam', 'Farol Alto', 'Sun', ARRAY['high beam', 'bright light']),
('brake_light', 'Brake Light', 'Luz de Freio', 'Circle', ARRAY['brake light', 'stop light', 'third brake light']),
('tail_light', 'Tail Light', 'Luz Traseira', 'Lightbulb', ARRAY['tail light', 'rear light', 'taillight']),
('oil', 'Oil Change', 'Troca de Óleo', 'Droplet', ARRAY['oil', 'oil change', 'engine oil', 'motor oil', 'oil filter']),
('power_steering', 'Power Steering', 'Direção Hidráulica', 'Gauge', ARRAY['power steering', 'steering fluid', 'ps fluid']),
('transmission_fluid', 'Transmission Fluid', 'Fluido de Transmissão', 'Settings', ARRAY['transmission', 'atf', 'gear oil', 'cvt']),
('washer_fluid', 'Washer Fluid', 'Fluido Limpador', 'Droplet', ARRAY['washer', 'windshield washer', 'wiper fluid']),
('wipers', 'Wipers', 'Palhetas', 'CloudRain', ARRAY['wiper', 'windshield wiper', 'wiper blade']),
('tires_wheels', 'Tires & Wheels', 'Pneus e Rodas', 'Circle', ARRAY['tire', 'wheel', 'flat tire', 'tire rotation']),
('fuse', 'Fuses', 'Fusíveis', 'Zap', ARRAY['fuse', 'fuse box', 'blown fuse']),
('spark_plug', 'Spark Plugs', 'Velas de Ignição', 'Flame', ARRAY['spark plug', 'ignition', 'misfire']),
('timing_belt', 'Timing Belt', 'Correia Dentada', 'Timer', ARRAY['timing belt', 'timing chain', 'cam belt']),
('serpentine_belt', 'Serpentine Belt', 'Correia Serpentina', 'RotateCcw', ARRAY['serpentine', 'drive belt', 'alternator belt']),
('thermostat', 'Thermostat', 'Termostato', 'Thermometer', ARRAY['thermostat', 'overheating']),
('water_pump', 'Water Pump', 'Bomba dÁgua', 'Droplet', ARRAY['water pump', 'cooling pump']),
('alternator', 'Alternator', 'Alternador', 'Zap', ARRAY['alternator', 'charging system']),
('starter_motor', 'Starter Motor', 'Motor de Arranque', 'Play', ARRAY['starter', 'starter motor', 'wont start']),
('wheel_bearing', 'Wheel Bearing', 'Rolamento de Roda', 'Circle', ARRAY['wheel bearing', 'hub bearing']),
('brake_rotors', 'Brake Rotors', 'Discos de Freio', 'Disc', ARRAY['rotor', 'brake rotor', 'brake disc']),
('cv_axle', 'CV Axle', 'Semieixo Homocinético', 'Settings', ARRAY['cv axle', 'cv joint', 'drive axle']),
('control_arm', 'Control Arm', 'Braço de Controle', 'ArrowLeftRight', ARRAY['control arm', 'lower arm', 'upper arm']),
('ball_joint', 'Ball Joint', 'Pivô de Suspensão', 'Circle', ARRAY['ball joint', 'suspension joint']),
('tie_rod', 'Tie Rod', 'Barra de Direção', 'ArrowLeftRight', ARRAY['tie rod', 'tie rod end', 'steering linkage']),
('sway_bar_link', 'Sway Bar Link', 'Bieleta Estabilizadora', 'Link', ARRAY['sway bar', 'stabilizer', 'anti roll']),
('shock_absorber', 'Shock Absorber', 'Amortecedor', 'ArrowDown', ARRAY['shock', 'absorber', 'damper']),
('strut', 'Strut', 'Amortecedor Dianteiro', 'ArrowUp', ARRAY['strut', 'strut assembly', 'macpherson']),
('fuel_pump', 'Fuel Pump', 'Bomba de Combustível', 'Fuel', ARRAY['fuel pump', 'fuel filter', 'fuel system']),
('oxygen_sensor', 'Oxygen Sensor', 'Sensor de Oxigênio', 'Activity', ARRAY['o2 sensor', 'oxygen sensor', 'lambda']),
('catalytic_converter', 'Catalytic Converter', 'Catalisador', 'Filter', ARRAY['catalytic', 'cat converter', 'emission']),
('exhaust_system', 'Exhaust System', 'Sistema de Escape', 'Wind', ARRAY['exhaust', 'muffler', 'exhaust pipe']);
