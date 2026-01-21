import { createClient } from '@supabase/supabase-js';

// Essas variáveis vêm do seu arquivo .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cria a conexão para ser usada no projeto todo
export const supabase = createClient(supabaseUrl, supabaseKey);