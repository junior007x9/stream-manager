'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './lib/supabase';
import { Play, Lock, Mail, CheckSquare, Square, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // --- 1. CARREGAR DADOS SALVOS AO ABRIR ---
  useEffect(() => {
    const savedData = localStorage.getItem('stream_remember_me');
    if (savedData) {
      const { savedEmail, savedPassword } = JSON.parse(savedData);
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // --- VERIFICAÇÃO DE ADMIN ---
      if (email.toLowerCase() === 'junior@stream.com' && password === '1234') {
        const adminUser = { 
          id: 'admin', 
          name: 'Junior Admin', 
          email: 'junior@stream.com', 
          avatar_color: 'bg-blue-600',
          services: [] 
        };
        saveLoginSession(adminUser);
        return;
      }

      // --- VERIFICAÇÃO DE USUÁRIO COMUM ---
      // Busca usuário pelo email
      const { data: user, error: dbError } = await supabase
        .from('subscribers')
        .select('*')
        .ilike('email', email) // ilike ignora maiusculas/minusculas
        .single();

      if (dbError || !user) {
        throw new Error('E-mail não encontrado.');
      }

      // Verifica a senha (password_key)
      if (user.password_key !== password) {
        throw new Error('Senha incorreta.');
      }

      // Login Sucesso
      saveLoginSession(user);

    } catch (err: any) {
      setError(err.message || 'Erro ao entrar.');
      setLoading(false);
    }
  };

  const saveLoginSession = (userData: any) => {
    // 1. Salva a sessão do usuário (para ele navegar no dashboard)
    localStorage.setItem('stream_user', JSON.stringify(userData));

    // 2. Lógica do "Lembrar de Mim"
    if (rememberMe) {
      localStorage.setItem('stream_remember_me', JSON.stringify({ savedEmail: email, savedPassword: password }));
    } else {
      localStorage.removeItem('stream_remember_me');
    }

    // 3. Redireciona
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black">
      {/* Background Animado */}
      <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[128px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[128px] animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl mb-4 transform rotate-12 hover:rotate-0 transition-all duration-500">
            <Play fill="white" className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Stream Manager</h1>
          <p className="text-gray-400 mt-2">Acesse suas contas e faturas</p>
        </div>

        <div className="glass-card p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl bg-white/5">
          <form onSubmit={handleLogin} className="space-y-5">
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300 ml-1">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300 ml-1">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={20} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                  placeholder="••••"
                />
              </div>
            </div>

            {/* BOTÃO LEMBRAR DE MIM */}
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => setRememberMe(!rememberMe)}
            >
              <div className={`transition-colors ${rememberMe ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`}>
                {rememberMe ? <CheckSquare size={20} /> : <Square size={20} />}
              </div>
              <span className={`text-sm select-none transition-colors ${rememberMe ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>
                Lembrar de mim
              </span>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-sm text-center animate-shake">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-900/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Entrar na Conta'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          Esqueceu a senha? <a href="#" onClick={() => alert('Fale com o Junior no WhatsApp!')} className="text-blue-400 hover:underline">Fale com o Admin</a>
        </p>
      </div>
    </div>
  );
}