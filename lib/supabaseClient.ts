
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../env';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const getSupabase = () => supabase;

export const SQL_SETUP_SCRIPT = `
-- 1. Habilitar extensión para generación de UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Crear Tabla de Perfiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'plant', 'store')),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Crear Tabla de Productos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Crear Tabla de Pedidos (Cabecera)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Pendiente',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MIGRACIÓN CRÍTICA: Agregar columnas de despacho y confirmación
-- Ejecuta esto si ves el error "column orders.received_at does not exist"
ALTER TABLE orders ADD COLUMN IF NOT EXISTS dispatched_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS received_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS novedades TEXT;

-- 6. Crear Tabla de Detalle de Pedidos (Items)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Crear Tabla de Configuración
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. DESHABILITAR RLS (Para prototipado rápido)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- 9. HABILITAR TIEMPO REAL
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
COMMIT;

-- 10. INSERTAR DATOS INICIALES
INSERT INTO profiles (username, password, role, name) 
VALUES 
('admi', '123', 'admin', 'Administrador Principal'),
('planta', '123', 'plant', 'Planta Milhojas Villa de Leyva'),
('tienda1', '123', 'store', 'Punto de Venta Centro')
ON CONFLICT (username) DO NOTHING;
`;
