'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import StatusBadge from '@/components/StatusBadge';
import { 
  LogOut, Copy, CreditCard, Wallet, AlertTriangle, 
  Users, MessageCircle, Calendar, Plus, Trash2, Edit, X, 
  Key, Eye, EyeOff, UserCheck, CheckSquare, Square, ClipboardCopy,
  CheckCircle, Lock, Mail, ExternalLink, TrendingUp, DollarSign, CalendarClock
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  // Dados
  const [invoices, setInvoices] = useState<any[]>([]);
  const [subscribersList, setSubscribersList] = useState<any[]>([]); 
  const [credentialsList, setCredentialsList] = useState<any[]>([]);

  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Modais
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isCredModalOpen, setIsCredModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Modal Visualizar Senha
  const [viewingCred, setViewingCred] = useState<any>(null);

  // Forms
  const [formData, setFormData] = useState({ 
    name: '', email: '', password_key: '', phone: '', plan_total: '', services: [] as string[] 
  });
  const [credData, setCredData] = useState({ 
    service_name: '', login_email: '', login_password: '', subscriber_id: 'global' 
  });

  const [showPassword, setShowPassword] = useState<{[key: string]: boolean}>({});

  // --- CONFIGURAÇÕES ---
  const ADMIN_EMAIL = 'junior@stream.com';
  const PIX_KEY = "99981242031"; 
  const PIX_BANK = "PagSeguro";
  const PIX_NAME = "Francisco de Sousa dos Santos Junior";
  const APP_URL = "https://stream-manager-junior.vercel.app"; 

  // --- SEUS CUSTOS (ADMIN) ---
  const ADMIN_EXPENSES = [
    { name: 'Netflix', value: 57.80, day: '03', method: 'Cartão' },
    { name: 'Premiere', value: 29.90, day: '01', method: 'Cartão' },
    { name: 'Globo Play', value: 14.90, day: '01', method: 'Cartão' },
    { name: 'HBO Max (ML)', value: 31.43, day: '01', method: 'Cartão' },
    { name: 'Disney (ML)', value: 19.90, day: '03', method: 'Cartão' },
    { name: 'Disney (Avulso)', value: 27.99, day: '03', method: 'Cartão' },
    { name: 'Prime Video', value: 19.90, day: '01', method: 'Cartão' },
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem('stream_user');
    if (!storedUser) {
      router.push('/');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    
    if (parsedUser.email === ADMIN_EMAIL || parsedUser.name === 'Junior Admin') {
      fetchAdminData();
    } else {
      fetchUserData(parsedUser.id);
    }
  }, []);

  const isAdmin = user?.email === ADMIN_EMAIL || user?.name === 'Junior Admin';

  // --- CÁLCULOS FINANCEIROS ---
  const calculateFinance = () => {
    const totalRevenue = subscribersList
      .filter(sub => sub.name !== 'Junior Admin')
      .reduce((acc, sub) => acc + Number(sub.plan_total), 0);
    const totalCost = ADMIN_EXPENSES.reduce((acc, item) => acc + item.value, 0);
    const monthlyProfit = totalRevenue - totalCost;
    const yearlyProfit = monthlyProfit * 12;
    const margin = totalRevenue > 0 ? (monthlyProfit / totalRevenue) * 100 : 0;
    return { totalRevenue, totalCost, monthlyProfit, yearlyProfit, margin };
  };

  const finance = calculateFinance();

  // --- BUSCAS ---
  const fetchUserData = async (userId: string) => {
    const { data: invData } = await supabase.from('invoices').select('*').eq('subscriber_id', userId).order('due_date', { ascending: false });
    if (invData) setInvoices(invData);
    
    const { data: credData } = await supabase.from('credentials').select('*').or(`subscriber_id.is.null,subscriber_id.eq.${userId}`);
    if (credData) setCredentialsList(credData);
    setLoading(false);
  };

  const fetchAdminData = async () => {
    try {
      const { data: invData } = await supabase.from('invoices').select('*, subscribers(name, avatar_color, phone)').order('due_date', { ascending: false });
      if (invData) {
        setInvoices(invData.sort((a, b) => (a.status === 'pending' && b.status !== 'pending') ? -1 : 0));
      }

      const { data: subData } = await supabase.from('subscribers').select('*').order('name');
      if (subData) setSubscribersList(subData.filter((u: any) => u.name !== 'Junior Admin'));

      const { data: credData } = await supabase.from('credentials').select('*, subscribers(name)').order('service_name');
      if (credData) setCredentialsList(credData);

    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  // --- HELPERS ---
  const getUniqueServices = () => Array.from(new Set(credentialsList.map(c => c.service_name)));

  const getUserDisplayCredentials = () => {
    if (isAdmin) return credentialsList; 
    const userServicesLower = user?.services?.map((s: string) => s.toLowerCase().trim()) || [];
    const relevantCreds = credentialsList.filter(cred => userServicesLower.includes(cred.service_name.toLowerCase().trim()));
    const finalCreds: any[] = [];
    relevantCreds.forEach(cred => {
      const existingIndex = finalCreds.findIndex(c => c.service_name.toLowerCase() === cred.service_name.toLowerCase());
      if (existingIndex !== -1) {
        if (cred.subscriber_id === user.id) finalCreds[existingIndex] = cred;
      } else {
        finalCreds.push(cred);
      }
    });
    return finalCreds;
  };

  const displayCredentials = getUserDisplayCredentials();
  const availableServices = getUniqueServices();

  const handleServiceClick = (serviceName: string) => {
    const foundCred = displayCredentials.find(c => c.service_name.toLowerCase().trim() === serviceName.toLowerCase().trim());
    if (foundCred) setViewingCred(foundCred);
    else alert(`As credenciais para ${serviceName} ainda não foram cadastradas pelo Admin.`);
  };

  // --- AÇÕES ADMIN ---
  const handleGenerateInvoices = async () => {
    if (!confirm("Gerar faturas do mês?")) return;
    setProcessing(true);
    try {
      const { data: subscribers } = await supabase.from('subscribers').select('*').gt('plan_total', 0);
      if (!subscribers?.length) return alert("Ninguém para cobrar.");

      const mesAtual = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
      const mesFormatado = mesAtual.charAt(0).toUpperCase() + mesAtual.slice(1);
      const dataVencimento = new Date();
      dataVencimento.setDate(1); 
      if (dataVencimento < new Date()) dataVencimento.setMonth(dataVencimento.getMonth() + 1);

      const newInvoices = subscribers.map(sub => ({
        subscriber_id: sub.id, amount: sub.plan_total, status: 'pending', due_date: dataVencimento, month_ref: mesFormatado
      }));

      const { error } = await supabase.from('invoices').insert(newInvoices);
      if (error) throw error;
      alert("Faturas geradas!");
      fetchAdminData();
    } catch (err) { alert("Erro ou faturas já existem."); } 
    finally { setProcessing(false); }
  };

  const handleMarkAsPaid = async (id: string) => {
    if (!confirm("Confirmar pagamento?")) return;
    await supabase.from('invoices').update({ status: 'paid', paid_at: new Date() }).eq('id', id);
    fetchAdminData();
  };

  const handleCopyGeneralReport = () => {
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending');
    if (pendingInvoices.length === 0) return alert("Ninguém deve nada!");

    const mes = pendingInvoices[0].month_ref;
    let text = `📢 *RESUMO DE FATURAS - ${mes.toUpperCase()}* 📢\n\n`;
    pendingInvoices.forEach(inv => text += `👤 *${inv.subscribers.name}*: R$ ${Number(inv.amount).toFixed(2)}\n`);
    text += `\n📲 *Acesso ao Sistema:*\n${APP_URL}\n\n💳 *PIX:* ${PIX_KEY}\n🏦 ${PIX_BANK}\n👤 ${PIX_NAME}`;

    navigator.clipboard.writeText(text);
    alert("Relatório copiado!");
  };

  const handleWhatsapp = (inv: any) => {
    const phone = inv.subscribers?.phone?.replace(/\D/g, '');
    if (!phone) return alert("Telefone não cadastrado.");
    const text = `Fala ${inv.subscribers.name}! 👋%0A%0AFatura *${inv.month_ref}* disponível.%0AValor: *R$ ${Number(inv.amount).toFixed(2)}*%0A%0A🔑 PIX: ${PIX_KEY}%0AApp: ${APP_URL}`;
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  // --- CRUDS ---
  const openUserModal = (userToEdit: any = null) => {
    if (userToEdit) {
      setEditingId(userToEdit.id);
      setFormData({
        name: userToEdit.name, email: userToEdit.email, password_key: userToEdit.password_key || '1234', 
        phone: userToEdit.phone || '', plan_total: userToEdit.plan_total, services: userToEdit.services || []
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', email: '', password_key: '', phone: '', plan_total: '', services: [] });
    }
    setIsUserModalOpen(true);
  };

  const toggleServiceInForm = (serviceName: string) => {
    setFormData(prev => {
      const exists = prev.services.includes(serviceName);
      return exists ? { ...prev, services: prev.services.filter(s => s !== serviceName) } : { ...prev, services: [...prev.services, serviceName] };
    });
  };

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    const finalEmail = formData.email || formData.name.toLowerCase().replace(/\s/g,'')+'@stream.com';
    const finalPass = formData.password_key || '1234';
    const payload = {
      name: formData.name, email: finalEmail, phone: formData.phone, plan_total: parseFloat(formData.plan_total), 
      services: formData.services, password_key: finalPass, avatar_color: editingId ? undefined : 'bg-blue-500'
    };
    if (editingId) delete payload.avatar_color;
    if (editingId) await supabase.from('subscribers').update(payload).eq('id', editingId);
    else await supabase.from('subscribers').insert({...payload, avatar_color: 'bg-blue-500'});
    setProcessing(false); setIsUserModalOpen(false); fetchAdminData();
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Excluir usuário?")) return;
    await supabase.from('invoices').delete().eq('subscriber_id', id);
    await supabase.from('credentials').delete().eq('subscriber_id', id);
    await supabase.from('subscribers').delete().eq('id', id);
    fetchAdminData();
  };

  const saveCred = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    const payload = { ...credData, subscriber_id: credData.subscriber_id === 'global' ? null : credData.subscriber_id };
    if (editingId) await supabase.from('credentials').update(payload).eq('id', editingId);
    else await supabase.from('credentials').insert(payload);
    setProcessing(false); setIsCredModalOpen(false); fetchAdminData();
  };

  const deleteCred = async (id: string) => {
    if(!confirm("Apagar credencial?")) return;
    await supabase.from('credentials').delete().eq('id', id);
    fetchAdminData();
  }

  // UTILS
  const togglePass = (id: string) => setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  const copy = (t: string) => { navigator.clipboard.writeText(t); alert("Copiado!"); };
  const logout = () => { localStorage.removeItem('stream_user'); router.push('/'); };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Carregando...</div>;

  const totalPendente = invoices.filter(i => i.status === 'pending').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalRecebido = invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <div className="min-h-screen pb-20 p-4 md:p-8 max-w-7xl mx-auto relative">
      <header className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full ${user.avatar_color || 'bg-blue-600'} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{isAdmin ? 'Painel Admin 👑' : `Olá, ${user.name}`}</h1>
            <p className="text-gray-400 text-sm">{isAdmin ? 'Controle Total' : 'Seus Serviços'}</p>
          </div>
        </div>
        <button onClick={logout} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"><LogOut className="text-gray-300 w-5 h-5" /></button>
      </header>

      {/* DASHBOARD INFO - LÓGICA DE EXIBIÇÃO SIMPLIFICADA PARA USUÁRIO */}
      <div className={`grid grid-cols-1 ${isAdmin ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4 mb-10`}>
        {/* CARD 1: FINANCEIRO TOTAL (SÓ ADMIN VÊ) */}
        {isAdmin && (
          <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400"><Wallet size={24} /></div>
            <div><p className="text-gray-400 text-sm">Recebido</p><p className="text-2xl font-bold text-white">R$ {totalRecebido.toFixed(2)}</p></div>
          </div>
        )}

        {/* CARD 2: PENDENTE (TODOS VEEM) */}
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-orange-500/20 rounded-xl text-orange-400"><AlertTriangle size={24} /></div>
          <div><p className="text-gray-400 text-sm">{isAdmin ? 'A Receber' : 'Pendente'}</p><p className="text-2xl font-bold text-white">R$ {totalPendente.toFixed(2)}</p></div>
        </div>

        {/* CARD 3: SERVIÇOS/ASSINANTES (TODOS VEEM) */}
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400"><Users size={24} /></div>
          <div><p className="text-gray-400 text-sm">{isAdmin ? 'Assinantes' : 'Serviços'}</p><p className="text-2xl font-bold text-white">{isAdmin ? subscribersList.length : user.services.length}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* NOVA SEÇÃO DE FINANCEIRO (SÓ ADMIN) */}
          {isAdmin && (
            <div className="space-y-6">
               <h2 className="text-xl font-bold text-white flex items-center gap-2"><DollarSign className="text-green-400" /> Financeiro & Lucratividade</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* CARD DE CUSTOS */}
                  <div className="glass-card p-6 rounded-2xl border border-white/10">
                     <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><TrendingUp className="text-red-400" size={18}/> Seus Custos (Fixo)</h3>
                     <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scroll">
                        {ADMIN_EXPENSES.map((exp, idx) => (
                           <div key={idx} className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                              <div>
                                 <p className="text-white font-medium">{exp.name}</p>
                                 <p className="text-xs text-gray-500">Dia {exp.day} • {exp.method}</p>
                              </div>
                              <p className="text-red-300 font-mono">- R$ {exp.value.toFixed(2)}</p>
                           </div>
                        ))}
                     </div>
                     <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
                        <p className="text-gray-400 text-sm">Total Despesas</p>
                        <p className="text-xl font-bold text-red-400">R$ {finance.totalCost.toFixed(2)}</p>
                     </div>
                  </div>

                  {/* CARD DE LUCRO */}
                  <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-green-900/20 to-emerald-900/10 border border-emerald-500/20">
                     <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><CalendarClock className="text-green-400" size={18}/> Resumo de Lucro</h3>
                     
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <p className="text-gray-300 text-sm">Faturamento Total</p>
                           <p className="text-green-300 font-mono font-bold">+ R$ {finance.totalRevenue.toFixed(2)}</p>
                        </div>
                        <div className="flex justify-between items-center">
                           <p className="text-gray-300 text-sm">Total Despesas</p>
                           <p className="text-red-300 font-mono font-bold">- R$ {finance.totalCost.toFixed(2)}</p>
                        </div>
                        <div className="h-px bg-white/10 my-2"></div>
                        <div className="flex justify-between items-center">
                           <p className="text-white font-bold">LUCRO MENSAL</p>
                           <p className="text-2xl font-bold text-emerald-400">R$ {finance.monthlyProfit.toFixed(2)}</p>
                        </div>
                        <div className="bg-black/20 p-3 rounded-xl flex justify-between items-center">
                           <div>
                              <p className="text-xs text-gray-400 uppercase">Projeção Anual</p>
                              <p className="text-lg font-bold text-white">R$ {finance.yearlyProfit.toFixed(2)}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-xs text-gray-400 uppercase">Margem</p>
                              <p className="text-lg font-bold text-blue-400">{finance.margin.toFixed(0)}%</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* SECÃO CREDENCIAIS */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Key className="text-yellow-400" /> {isAdmin ? 'Gerenciar Senhas' : 'Suas Credenciais'}</h2>
              {isAdmin && <button onClick={() => { setEditingId(null); setIsCredModalOpen(true); }} className="text-sm bg-yellow-600/80 hover:bg-yellow-600 px-3 py-1.5 rounded-lg text-white">Adicionar Senha</button>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayCredentials.map((cred) => (
                <div key={cred.id} className={`glass-card p-4 rounded-xl border border-white/10 relative group ${cred.subscriber_id ? 'border-l-4 border-l-yellow-500' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-white text-lg">{cred.service_name}</h3>
                      {cred.subscriber_id ? <span className="text-[10px] text-yellow-400 flex items-center gap-1 font-bold mt-1 bg-yellow-400/10 w-fit px-2 py-0.5 rounded-full"><UserCheck size={10} /> {isAdmin ? `Pessoal de ${cred.subscribers?.name}` : 'Conta Pessoal'}</span> : (isAdmin && <span className="text-[10px] text-gray-400 mt-1">Global</span>)}
                    </div>
                    {isAdmin && (<div className="flex gap-1"><button onClick={() => { setEditingId(cred.id); setCredData({service_name: cred.service_name, login_email: cred.login_email, login_password: cred.login_password, subscriber_id: cred.subscriber_id || 'global'}); setIsCredModalOpen(true); }} className="text-xs text-blue-400 bg-white/5 px-2 py-1 rounded">Edit</button><button onClick={() => deleteCred(cred.id)} className="text-xs text-red-400 bg-white/5 px-2 py-1 rounded">X</button></div>)}
                  </div>
                  <div className="space-y-2 mt-3">
                    <div className="bg-black/20 p-2 rounded-lg flex justify-between items-center"><div className="overflow-hidden"><p className="text-[10px] text-gray-400 uppercase">Login</p><p className="text-sm text-white truncate font-mono select-all">{cred.login_email}</p></div><button onClick={() => copy(cred.login_email)} className="text-gray-400 hover:text-white"><Copy size={14} /></button></div>
                    <div className="bg-black/20 p-2 rounded-lg flex justify-between items-center"><div className="overflow-hidden w-full"><p className="text-[10px] text-gray-400 uppercase">Senha</p><p className="text-sm text-white truncate font-mono">{cred.login_password.includes(' ') || showPassword[cred.id] ? cred.login_password : '••••••••'}</p></div><div className="flex gap-2"><button onClick={() => togglePass(cred.id)} className="text-gray-400 hover:text-white">{showPassword[cred.id] ? <EyeOff size={14} /> : <Eye size={14} />}</button><button onClick={() => copy(cred.login_password)} className="text-gray-400 hover:text-white"><Copy size={14} /></button></div></div>
                  </div>
                </div>
              ))}
              {displayCredentials.length === 0 && <div className="col-span-2 text-center py-6 text-gray-500 bg-white/5 rounded-xl">Sem credenciais.</div>}
            </div>
          </div>

          {/* SECÃO FATURAS */}
          <div className="space-y-6 pt-6 border-t border-white/10">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Calendar className="text-blue-400" /> {isAdmin ? 'Faturas' : 'Suas Faturas'}</h2>
              {isAdmin && (
                <div className="flex gap-2">
                  <button onClick={handleCopyGeneralReport} className="bg-green-600 hover:bg-green-500 text-white text-xs md:text-sm px-3 py-2 rounded-full shadow-lg flex items-center gap-2"><ClipboardCopy size={16}/> Cobrar Todos</button>
                  <button onClick={handleGenerateInvoices} disabled={processing} className="bg-blue-600 hover:bg-blue-500 text-white text-xs md:text-sm px-3 py-2 rounded-full shadow-lg">{processing ? '...' : 'Gerar Mês'}</button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {invoices.map((inv) => (
                <div key={inv.id} className={`glass-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${isAdmin && inv.status === 'pending' ? 'border-l-4 border-l-orange-500 bg-orange-500/5' : ''}`}>
                  <div className="flex items-center gap-4">
                    {isAdmin && inv.subscribers ? (
                       <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${inv.subscribers.avatar_color || 'bg-gray-600'}`}>{inv.subscribers.name.charAt(0)}</div>
                    ) : (
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}><CreditCard size={24} /></div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-white">{isAdmin ? inv.subscribers?.name : inv.month_ref}</h3>
                      <p className="text-gray-400 text-sm">{isAdmin ? inv.month_ref : `Vencimento: ${new Date(inv.due_date).toLocaleDateString('pt-BR')}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                    <div className="text-right"><p className="text-gray-400 text-xs uppercase">Valor</p><p className="text-xl font-bold text-white">R$ {Number(inv.amount).toFixed(2)}</p></div>
                    {isAdmin && inv.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button onClick={() => handleWhatsapp(inv)} className="bg-[#25D366]/20 text-[#25D366] p-3 rounded-xl hover:bg-[#25D366]/30"><MessageCircle size={20} /></button>
                        <button onClick={() => handleMarkAsPaid(inv.id)} className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl hover:bg-emerald-500/30 flex gap-2 items-center"><CheckCircle size={18} /> Baixar</button>
                      </div>
                    ) : (
                      <StatusBadge status={inv.status} />
                    )}
                  </div>
                </div>
              ))}
              {invoices.length === 0 && <div className="text-center py-6 text-gray-500">Nenhuma fatura encontrada.</div>}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA */}
        <div className="space-y-6">
           {isAdmin && (
            <div className="glass-card p-6 rounded-2xl border-purple-500/20">
              <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-white flex gap-2"><Users className="text-purple-400" /> Assinantes</h3><button onClick={() => openUserModal()} className="text-xs bg-purple-600 px-2 py-1 rounded text-white">Novo</button></div>
              <div className="space-y-2">
                {subscribersList.map(sub => (
                  <div key={sub.id} className="flex justify-between items-center p-2 hover:bg-white/5 rounded-lg group"><div className="flex gap-2 items-center"><div className={`w-8 h-8 rounded-full ${sub.avatar_color || 'bg-gray-600'} flex items-center justify-center text-xs font-bold`}>{sub.name.charAt(0)}</div><div className="flex flex-col"><span className="text-sm text-gray-200">{sub.name}</span><span className="text-[10px] text-gray-500">{sub.services?.length || 0} Serviços</span></div></div><div className="flex gap-1 opacity-0 group-hover:opacity-100"><button onClick={() => openUserModal(sub)} className="p-1 text-blue-400"><Edit size={14}/></button><button onClick={() => deleteUser(sub.id)} className="p-1 text-red-400"><Trash2 size={14}/></button></div></div>
                ))}
              </div>
            </div>
           )}

           {!isAdmin && (
            <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-emerald-900/20 to-green-900/10 border-emerald-500/20">
               <div className="flex flex-col gap-4"><h3 className="text-lg font-bold text-white">Pagamento via PIX</h3><div className="flex flex-col gap-1"><p className="text-[10px] text-gray-400 uppercase tracking-wide">Chave PIX (Celular)</p><div className="flex items-center gap-2 bg-black/30 p-2.5 rounded-xl border border-white/5 mb-2"><code className="text-emerald-400 font-mono text-sm flex-1">{PIX_KEY}</code><button onClick={() => copy(PIX_KEY)} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-300"><Copy size={16} /></button></div><div className="flex flex-col text-xs text-gray-300 px-1 gap-0.5"><p>🏦 {PIX_BANK}</p><p>👤 {PIX_NAME}</p></div></div></div>
            </div>
           )}

           <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-4">{isAdmin ? 'Todos Serviços' : 'Seus Serviços'}</h3>
              <div className="flex flex-wrap gap-2">
                {(isAdmin ? ['Netflix', 'HBO', 'Prime', 'Disney+', 'Globo', 'Premiere'] : user.services).map((service: string, idx: number) => (
                  <button key={idx} onClick={() => isAdmin ? null : handleServiceClick(service)} className={`px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 ${!isAdmin && 'hover:bg-blue-600 hover:text-white hover:border-blue-500 cursor-pointer transition-all'}`} title={!isAdmin ? "Clique para ver a senha" : ""}>
                    {service}
                  </button>
                ))}
              </div>
           </div>
        </div>
      </div>

      {/* POPUP DE SENHA RÁPIDA (USUÁRIO CLICOU NO SERVIÇO) */}
      {viewingCred && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
           <div className="glass-card w-full max-w-md p-6 rounded-3xl animate-float border border-blue-500/30 shadow-2xl shadow-blue-900/20">
              <div className="flex justify-between items-start mb-6">
                <div><h3 className="text-2xl font-bold text-white">{viewingCred.service_name}</h3><p className="text-sm text-gray-400">Credenciais de Acesso</p></div>
                <button onClick={() => setViewingCred(null)} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-xs text-blue-300 uppercase font-bold tracking-wider">Login / E-mail</label>
                    <div className="flex items-center gap-2 bg-black/40 p-3 rounded-xl border border-white/10"><Mail className="text-gray-400" size={18} /><code className="flex-1 text-white font-mono select-all text-sm">{viewingCred.login_email}</code><button onClick={() => copy(viewingCred.login_email)}><Copy size={16} className="text-gray-400 hover:text-white"/></button></div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs text-blue-300 uppercase font-bold tracking-wider">Senha</label>
                    <div className="flex items-center gap-2 bg-black/40 p-3 rounded-xl border border-white/10"><Key className="text-gray-400" size={18} /><code className="flex-1 text-white font-mono select-all text-sm">{showPassword['view'] ? viewingCred.login_password : '••••••••••••'}</code><button onClick={() => setShowPassword(p => ({...p, view: !p.view}))} className="text-gray-400 hover:text-white mx-1">{showPassword['view'] ? <EyeOff size={16}/> : <Eye size={16}/>}</button><button onClick={() => copy(viewingCred.login_password)}><Copy size={16} className="text-gray-400 hover:text-white"/></button></div>
                 </div>
                 <div className="pt-4 flex justify-center"><a href="https://www.google.com" target="_blank" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"><ExternalLink size={14} /> Abrir site do serviço (Google)</a></div>
              </div>
           </div>
        </div>
      )}

      {/* MODAL USUÁRIO */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-lg p-6 rounded-3xl animate-float border border-white/20 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-4"><h3 className="text-white font-bold">{editingId ? 'Editar Usuário' : 'Novo Usuário'}</h3><button onClick={() => setIsUserModalOpen(false)}><X className="text-gray-400"/></button></div>
            <form onSubmit={saveUser} className="space-y-3">
              <input required placeholder="Nome" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="glass-input w-full p-3 rounded-xl" />
              <div className="grid grid-cols-2 gap-3">
                 <div><label className="text-xs text-gray-400 ml-1 mb-1 block">Login</label><div className="relative"><Mail className="absolute left-3 top-3 text-gray-500" size={16} /><input placeholder="email@login.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="glass-input w-full pl-9 p-2.5 rounded-xl text-sm" /></div></div>
                 <div><label className="text-xs text-gray-400 ml-1 mb-1 block">Senha</label><div className="relative"><Lock className="absolute left-3 top-3 text-gray-500" size={16} /><input placeholder="1234" value={formData.password_key} onChange={e => setFormData({...formData, password_key: e.target.value})} className="glass-input w-full pl-9 p-2.5 rounded-xl text-sm" /></div></div>
              </div>
              <input required type="number" step="0.01" placeholder="Valor (R$)" value={formData.plan_total} onChange={e => setFormData({...formData, plan_total: e.target.value})} className="glass-input w-full p-3 rounded-xl" />
              <input required placeholder="Celular" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="glass-input w-full p-3 rounded-xl" />
              <div className="py-2"><label className="text-sm text-gray-400 block mb-2">Quais serviços?</label><div className="grid grid-cols-2 gap-2">{availableServices.length > 0 ? availableServices.map(service => { const isSelected = formData.services.includes(service); return (<div key={service} onClick={() => toggleServiceInForm(service)} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border ${isSelected ? 'bg-blue-500/20 border-blue-500 text-white' : 'bg-black/20 border-transparent text-gray-400 hover:bg-white/5'}`}>{isSelected ? <CheckSquare size={18} className="text-blue-400"/> : <Square size={18} />}<span className="text-sm">{service}</span></div>) }) : <p className="text-xs text-gray-500 col-span-2">Cadastre senhas primeiro.</p>}</div></div>
              <button disabled={processing} type="submit" className="w-full bg-blue-600 p-3 rounded-xl text-white font-bold mt-2">Salvar</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREDENCIAIS */}
      {isCredModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-lg p-6 rounded-3xl animate-float border border-white/20">
            <div className="flex justify-between mb-4"><h3 className="text-white font-bold">{editingId ? 'Editar Senha' : 'Nova Senha'}</h3><button onClick={() => setIsCredModalOpen(false)}><X className="text-gray-400"/></button></div>
            <form onSubmit={saveCred} className="space-y-3">
              <div className="space-y-1"><label className="text-xs text-gray-400 ml-1">Dono</label><select value={credData.subscriber_id} onChange={e => setCredData({...credData, subscriber_id: e.target.value})} className="glass-input w-full p-3 rounded-xl bg-black/40"><option value="global">🌍 Global</option>{subscribersList.map(sub => (<option key={sub.id} value={sub.id}>👤 {sub.name}</option>))}</select></div>
              <input required placeholder="Serviço (Ex: Netflix)" value={credData.service_name} onChange={e => setCredData({...credData, service_name: e.target.value})} className="glass-input w-full p-3 rounded-xl" />
              <input required placeholder="Login" value={credData.login_email} onChange={e => setCredData({...credData, login_email: e.target.value})} className="glass-input w-full p-3 rounded-xl" />
              <input required placeholder="Senha" value={credData.login_password} onChange={e => setCredData({...credData, login_password: e.target.value})} className="glass-input w-full p-3 rounded-xl" />
              <button disabled={processing} type="submit" className="w-full bg-yellow-600 p-3 rounded-xl text-white font-bold mt-2">Salvar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}