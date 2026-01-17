-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create enum for diagnostic priority
CREATE TYPE public.diagnostic_priority AS ENUM ('critical', 'attention', 'preventive');

-- Create enum for diagnostic status
CREATE TYPE public.diagnostic_status AS ENUM ('pending', 'completed', 'resolved');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create vehicles table
CREATE TABLE public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    engine TEXT,
    fuel_type TEXT,
    license_plate TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create diagnostics table
CREATE TABLE public.diagnostics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status diagnostic_status NOT NULL DEFAULT 'pending',
    obd_raw_data JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create diagnostic_items table
CREATE TABLE public.diagnostic_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagnostic_id UUID REFERENCES public.diagnostics(id) ON DELETE CASCADE NOT NULL,
    dtc_code TEXT NOT NULL,
    description_human TEXT NOT NULL,
    priority diagnostic_priority NOT NULL DEFAULT 'attention',
    severity INTEGER NOT NULL DEFAULT 5 CHECK (severity >= 1 AND severity <= 10),
    can_diy BOOLEAN NOT NULL DEFAULT false,
    diy_difficulty INTEGER CHECK (diy_difficulty >= 1 AND diy_difficulty <= 5),
    solution_url TEXT,
    probable_causes TEXT[],
    status diagnostic_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_items ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, name, email)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'), NEW.email);
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at
    BEFORE UPDATE ON public.vehicles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_diagnostics_updated_at
    BEFORE UPDATE ON public.diagnostics
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_diagnostic_items_updated_at
    BEFORE UPDATE ON public.diagnostic_items
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for user_roles (read-only for users)
CREATE POLICY "Users can view own roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policies for vehicles
CREATE POLICY "Users can view own vehicles"
    ON public.vehicles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vehicles"
    ON public.vehicles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vehicles"
    ON public.vehicles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vehicles"
    ON public.vehicles FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for diagnostics
CREATE POLICY "Users can view own diagnostics"
    ON public.diagnostics FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diagnostics"
    ON public.diagnostics FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diagnostics"
    ON public.diagnostics FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diagnostics"
    ON public.diagnostics FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for diagnostic_items (via diagnostic ownership)
CREATE POLICY "Users can view own diagnostic items"
    ON public.diagnostic_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.diagnostics d
            WHERE d.id = diagnostic_id AND d.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert diagnostic items for own diagnostics"
    ON public.diagnostic_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.diagnostics d
            WHERE d.id = diagnostic_id AND d.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own diagnostic items"
    ON public.diagnostic_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.diagnostics d
            WHERE d.id = diagnostic_id AND d.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own diagnostic items"
    ON public.diagnostic_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.diagnostics d
            WHERE d.id = diagnostic_id AND d.user_id = auth.uid()
        )
    );

-- Indexes for performance
CREATE INDEX idx_vehicles_user_id ON public.vehicles(user_id);
CREATE INDEX idx_diagnostics_user_id ON public.diagnostics(user_id);
CREATE INDEX idx_diagnostics_vehicle_id ON public.diagnostics(vehicle_id);
CREATE INDEX idx_diagnostic_items_diagnostic_id ON public.diagnostic_items(diagnostic_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);