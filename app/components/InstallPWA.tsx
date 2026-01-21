'use client';

import { useEffect, useState } from 'react';
import { X, Download, Share } from 'lucide-react';

export default function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Detecta se é iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    // Detecta Android/Chrome (Evento beforeinstallprompt)
    const handler = (e: any) => {
      e.preventDefault();
      setPromptInstall(e);
      setSupportsPWA(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Se já estiver instalado (Standalone), não mostra nada
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setSupportsPWA(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = (e: any) => {
    e.preventDefault();
    if (isIOS) {
      // No iOS mostramos as instruções
      setShowInstructions(true);
    } else if (promptInstall) {
      // No Android forçamos o prompt nativo
      promptInstall.prompt();
    }
  };

  // Se não suportar instalação ou já estiver instalado, não mostra nada (exceto se for iOS na web)
  if (!supportsPWA && !isIOS) return null;

  // Verifica se está rodando no navegador (não instalado) para mostrar no iOS
  if (isIOS && (window.navigator as any).standalone) return null; 

  return (
    <>
      {/* BARRA FIXA NO RODAPÉ CONVIDANDO PARA INSTALAR */}
      {(!showInstructions) && (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-float">
          <div className="glass-card p-4 rounded-2xl border border-blue-500/30 bg-black/80 backdrop-blur-md shadow-2xl flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <p className="text-white font-bold text-sm">Instalar Aplicativo</p>
              <p className="text-gray-400 text-xs">Acesse suas senhas mais rápido!</p>
            </div>
            <div className="flex gap-2">
               <button 
                onClick={() => setSupportsPWA(false)} // Fecha temporariamente
                className="p-2 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
              <button 
                onClick={handleInstallClick}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg"
              >
                <Download size={16} /> Instalar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE INSTRUÇÕES PARA IPHONE (iOS) */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-end pb-10 justify-center p-4 backdrop-blur-sm" onClick={() => setShowInstructions(false)}>
           <div className="glass-card w-full max-w-sm p-6 rounded-3xl border border-white/20 animate-bounce-up" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Instalar no iPhone</h3>
                <button onClick={() => setShowInstructions(false)}><X className="text-gray-400" /></button>
              </div>
              <div className="space-y-4 text-sm text-gray-300">
                 <p className="flex items-center gap-2">1. Toque no botão de <strong>Compartilhar</strong> <Share size={16} className="text-blue-400" /></p>
                 <p className="flex items-center gap-2">2. Role para baixo e toque em <span className="bg-white/20 px-2 py-0.5 rounded text-white font-bold text-xs">Adicionar à Tela de Início</span></p>
                 <p className="flex items-center gap-2">3. Confirme clicando em <strong>Adicionar</strong>.</p>
              </div>
              <div className="mt-6 text-center text-xs text-gray-500">
                 Toque em qualquer lugar para fechar
              </div>
           </div>
           {/* Setinha apontando para baixo (geralmente onde fica o botão share no safari) */}
           <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white animate-bounce">
              ⬇️
           </div>
        </div>
      )}
    </>
  );
}