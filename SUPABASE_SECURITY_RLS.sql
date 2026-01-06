-- 🛡️ SUPABASE QUANTUM SECURITY PROTOCOL (RLS)
-- Corre estas sentencias en el SQL Editor de tu Dashboard de Supabase.
-- 1. Habilitar RLS en las tablas principales
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- 2. POLÍTICAS PARA LISTINGS (AUTOS)
-- Cualquiera puede ver los autos publicados
CREATE POLICY "Public listings are viewable by everyone" ON listings FOR
SELECT USING (true);
-- Solo usuarios autenticados pueden crear anuncios
CREATE POLICY "Authenticated users can create listings" ON listings FOR
INSERT WITH CHECK (auth.role() = 'authenticated');
-- Solo el dueño del anuncio puede editarlo o borrarlo
CREATE POLICY "Users can update their own listings" ON listings FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own listings" ON listings FOR DELETE USING (auth.uid() = user_id);
-- 3. POLÍTICAS PARA USERS (PERFILES)
-- Los perfiles son públicos para ver el vendedor
CREATE POLICY "Public profiles are viewable by everyone" ON users FOR
SELECT USING (true);
-- Solo el dueño puede editar su propio perfil
CREATE POLICY "Users can update own profile" ON users FOR
UPDATE USING (auth.uid() = id);
-- 4. POLÍTICAS PARA TRANSACCIONES (OPCIONAL)
-- Si tienes una tabla de transacciones/pagos:
-- ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
console.log(
    "✅ Protocolo de Seguridad RLS Generado. Copia y pega en Supabase."
);