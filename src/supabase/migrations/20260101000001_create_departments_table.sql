-- ==========================================
-- Tabla de departamentos de Colombia
-- ==========================================

CREATE TABLE IF NOT EXISTS public.departments (
  id integer PRIMARY KEY,
  name text NOT NULL,
  iso_code text NOT NULL
);

-- Índices
CREATE INDEX idx_departments_name ON public.departments(name);

-- Datos de departamentos de Colombia
INSERT INTO public.departments (id, name, iso_code) VALUES
(1, 'Amazonas', 'AM'),
(2, 'Antioquia', 'AN'),
(3, 'Arauca', 'AR'),
(4, 'Atlántico', 'AT'),
(5, 'Bolívar', 'BL'),
(6, 'Boyacá', 'BY'),
(7, 'Caldas', 'CL'),
(8, 'Caquetá', 'CA'),
(9, 'Casanare', 'CS'),
(10, 'Cauca', 'CU'),
(11, 'Cesar', 'CE'),
(12, 'Chocó', 'CH'),
(13, 'Córdoba', 'CO'),
(14, 'Cundinamarca', 'CU'),
(15, 'Guainía', 'GU'),
(16, 'Guaviare', 'GV'),
(17, 'Huila', 'HU'),
(18, 'La Guajira', 'LG'),
(19, 'Magdalena', 'MA'),
(20, 'Meta', 'ME'),
(21, 'Nariño', 'NA'),
(22, 'Norte de Santander', 'NS'),
(23, 'Putumayo', 'PU'),
(24, 'Quindío', 'QU'),
(25, 'Risaralda', 'RI'),
(26, 'San Andrés y Providencia', 'SAP'),
(27, 'Santander', 'SA'),
(28, 'Sucre', 'SU'),
(29, 'Tolima', 'TO'),
(30, 'Valle del Cauca', 'VC'),
(31, 'Vaupés', 'VA'),
(32, 'Vichada', 'VI')
ON CONFLICT (id) DO NOTHING;
