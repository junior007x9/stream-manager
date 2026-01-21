'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Lock, User, ArrowRight, Tv } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Busca o usuário na nossa tabela personalizada 'subscribers'
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('email', email)
        .eq('password_key', password)
        .single();

      if (error || !data) {
        throw new Error('Credenciais inválidas. Tente novamente.');
      }

      // Salva o usuário no localStorage para persistência simples (sessão rápida)
      localStorage.setItem('stream_user', JSON.stringify(data));
      
      // Redireciona
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Elementos de fundo decorativos (Glow) */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-purple-600/30 rounded-full blur-[128px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-blue-600/30 rounded-full blur-[128px]" />

      <div className="glass-card w-full max-w-md p-8 rounded-3xl relative z-10 animate-float">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-600 mb-4 shadow-lg shadow-purple-500/20">
            <Tv className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Stream Manager</h1>
          <p className="text-gray-400">Acesse seu painel de assinaturas</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input w-full pl-12 pr-4 py-3 rounded-xl transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Senha de Acesso</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type="password"
                placeholder="••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input w-full pl-12 pr-4 py-3 rounded-xl transition-all"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-900/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? 'Entrando...' : (
              <>
                Acessar Painel <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}