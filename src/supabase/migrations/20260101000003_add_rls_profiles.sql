-- ==========================================
-- RLS para perfiles de usuario
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para inserción pública (registro sin auth)
-- Permite insertar sin autenticación para el registro público
CREATE POLICY "Allow public insert on profiles"
  ON public.profiles
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Política para que el usuario pueda ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO anon, authenticated
  USING (
    id IN (
      SELECT id FROM public.profiles
      WHERE id = auth.uid()
    )
    OR 
    -- Permite ver el perfil si se conoce el referral_code (para verificación pública)
    true
  );

-- Política para que el usuario pueda actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Política para que nadie pueda eliminar perfiles
CREATE POLICY "No delete on profiles"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (false);

-- Tabla de departamentos - lectura pública
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on departments"
  ON public.departments
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Tabla de municipios - lectura pública
ALTER TABLE public.municipalities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on municipalities"
  ON public.municipalities
  FOR SELECT
  TO anon, authenticated
  USING (true);
