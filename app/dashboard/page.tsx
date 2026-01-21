'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import StatusBadge from '@/components/StatusBadge';
import { 
  LogOut, 
  Copy, 
  CreditCard, 
  Wallet, 
  TrendingUp, 
  AlertTriangle,
  LayoutGrid,
  ShieldCheck
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Chave PIX Estática (Exemplo)
  const PIX_KEY = "000.000.000-00"; 

  useEffect(() => {
    const storedUser = localStorage.getItem('stream_user');
    if (!storedUser) {
      router.push('/');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchInvoices(parsedUser.id);
  }, []);

  const fetchInvoices = async (userId: string) => {
    // Busca faturas. Se quiser ver histórico, remova o filtro de mês ou ajuste.
    const { data } = await supabase
      .from('invoices')
      .select('*')
      .eq('subscriber_id', userId)
      .order('due_date', { ascending: false });
    
    if (data) setInvoices(data);
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Chave PIX copiada!');
  };

  const handleLogout = () => {
    localStorage.removeItem('stream_user');
    router.push('/');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Carregando Dashboard...</div>;

  // Cálculos para os Cards de Topo (Simulação baseada no usuário atual)
  const totalPendente = invoices.filter(i => i.status === 'pending').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalGasto = invoices.reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <div className="min-h-screen pb-20 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full ${user.avatar_color} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Olá, {user.name}</h1>
            <p className="text-gray-400 text-sm">Bem-vindo ao Stream Manager</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
        >
          <LogOut className="text-gray-300 w-5 h-5" />
        </button>
      </header>

      {/* DASHBOARD TOP BAR - Resumo Executivo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {/* Card 1 */}
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Wallet size={60} />
          </div>
          <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Mensalidade Atual</p>
            <p className="text-2xl font-bold text-white">R$ {Number(user.plan_total).toFixed(2)}</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <AlertTriangle size={60} />
          </div>
          <div className="p-3 bg-orange-500/20 rounded-xl text-orange-400">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Pendente</p>
            <p className="text-2xl font-bold text-white">R$ {totalPendente.toFixed(2)}</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <LayoutGrid size={60} />
          </div>
          <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
            <LayoutGrid size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Serviços Ativos</p>
            <p className="text-2xl font-bold text-white">{user.services.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUNA ESQUERDA: Faturas e Pagamento */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-green-400" /> Faturas Recentes
          </h2>

          {/* Lista de Cards Flutuantes (Substituindo Tabela) */}
          <div className="space-y-4">
            {invoices.map((inv) => (
              <div 
                key={inv.id} 
                className="glass-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/20 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center
                    ${inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}
                  `}>
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{inv.month_ref}</h3>
                    <p className="text-gray-400 text-sm">Vencimento: {new Date(inv.due_date).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                  <div className="text-right">
                    <p className="text-gray-400 text-xs uppercase tracking-wider">Valor</p>
                    <p className="text-xl font-bold text-white">R$ {Number(inv.amount).toFixed(2)}</p>
                  </div>
                  
                  <StatusBadge status={inv.status} />
                </div>
              </div>
            ))}
          </div>
          
          {/* Card de Pagamento PIX */}
          <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-emerald-900/20 to-green-900/10 border-emerald-500/20 mt-8">
             <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Pagamento via PIX</h3>
                  <p className="text-gray-400 text-sm max-w-md">
                    Utilize a chave abaixo para regularizar suas faturas pendentes. Envie o comprovante no WhatsApp do Junior.
                  </p>
                </div>
                <div className="w-full md:w-auto">
                   <div className="flex items-center gap-2 bg-black/30 p-3 rounded-xl border border-white/5">
                      <code className="text-emerald-400 font-mono text-sm">{PIX_KEY}</code>
                      <button 
                        onClick={() => copyToClipboard(PIX_KEY)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300"
                        title="Copiar Chave"
                      >
                        <Copy size={18} />
                      </button>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* COLUNA DIREITA: Credenciais e Avisos */}
        <div className="space-y-6">
           {/* Card de Credenciais Compartilhadas */}
           <div className="glass-card p-6 rounded-2xl border-yellow-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 bg-yellow-500 blur-2xl w-32 h-32 rounded-full"></div>
              
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="text-yellow-400" /> Acesso Compartilhado
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Conta Google (Netflix)</p>
                  <p className="text-white font-mono select-all">familia_stream@gmail.com</p>
                </div>
                
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                   <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Senha Padrão</p>
                   <div className="flex justify-between items-center">
                     <p className="text-white font-mono">********</p>
                     <button className="text-xs text-blue-400 hover:text-blue-300 underline">Ver Senha</button>
                   </div>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-3 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/10">
                <AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-yellow-200/80 leading-relaxed">
                  Atenção: Não compartilhe essas senhas com terceiros. O uso é exclusivo para os membros do grupo.
                </p>
              </div>
           </div>

           {/* Lista de Apps do Usuário */}
           <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Seus Serviços</h3>
              <div className="flex flex-wrap gap-2">
                {user.services.map((service: string, idx: number) => (
                  <span 
                    key={idx} 
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-colors cursor-default"
                  >
                    {service}
                  </span>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}