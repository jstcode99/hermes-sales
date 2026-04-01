-- ==========================================
-- Tabla de perfiles de usuario
-- ==========================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Datos personales
  full_name text NOT NULL,
  phone text NOT NULL UNIQUE,
  document_id text NOT NULL UNIQUE, -- Cédula
  document_type text DEFAULT 'cc' NOT NULL, -- cc, ce, ti, rc, pa
  
  -- Ubicación
  department_id integer NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
  municipality_id integer NOT NULL REFERENCES public.municipalities(id) ON DELETE RESTRICT,
  
  -- Referidos
  referral_code text NOT NULL UNIQUE, -- Código único del usuario
  referred_by_code text, -- Código del referido que lo registró
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_phone_length CHECK (char_length(phone) >= 10),
  CONSTRAINT valid_document_id CHECK (char_length(document_id) >= 5)
);

-- Índice para búsquedas por código de referido
CREATE INDEX idx_profiles_referral_code ON public.profiles(referral_code);

-- Índice para búsquedas por código de referido entrante
CREATE INDEX idx_profiles_referred_by_code ON public.profiles(referred_by_code);

-- Índice para búsquedas por teléfono
CREATE INDEX idx_profiles_phone ON public.profiles(phone);

-- Índice para búsquedas por documento
CREATE INDEX idx_profiles_document_id ON public.profiles(document_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
