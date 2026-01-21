'use client'; // <--- ISSO É OBRIGATÓRIO NA PRIMEIRA LINHA

import { useEffect, useState } from 'react';
import { X, Download, Share } from 'lucide-react';

export default function InstallPWA() {
  // Começamos com null para não quebrar no servidor
  const [isMounted, setIsMounted] = useState(false);
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    setIsMounted(true); // Só agora sabemos que estamos no navegador

    // Detecta iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Detecta Android/Chrome
    const handler = (e: any) => {
      e.preventDefault();
      setPromptInstall(e);
      setSupportsPWA(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (isIOS) {
      setShowInstructions(true);
    } else if (promptInstall) {
      promptInstall.prompt();
    }
  };

  // Se não carregou ainda, não mostra nada (evita tela preta)
  if (!isMounted) return null;

  // Se já estiver instalado (Standalone), esconde o botão
  if (window.matchMedia('(display-mode: standalone)').matches) return null;

  // Se não for PWA e nem iOS, tchau
  if (!supportsPWA && !isIOS) return null;

  return (
    <>
      {/* BARRA FIXA */}
      {!showInstructions && (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-float">
          <div className="glass-card p-4 rounded-2xl border border-blue-500/30 bg-black/90 backdrop-blur-md shadow-2xl flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <p className="text-white font-bold text-sm">Instalar App</p>
              <p className="text-gray-400 text-xs">Acesso rápido e sem erros</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSupportsPWA(false)} className="p-2 text-gray-400 hover:text-white">
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

      {/* MODAL IOS */}
      {showInstructions && (
        <div 
          className="fixed inset-0 bg-black/90 z-[60] flex items-end pb-10 justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowInstructions(false)}
        >
           <div className="glass-card w-full max-w-sm p-6 rounded-3xl border border-white/20 animate-bounce-up" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Instalar no iPhone</h3>
                <button onClick={() => setShowInstructions(false)}><X className="text-gray-400" /></button>
              </div>
              <div className="space-y-4 text-sm text-gray-300">
                 <p className="flex items-center gap-2">1. Toque em <strong>Compartilhar</strong> <Share size={16} className="text-blue-400" /></p>
                 <p className="flex items-center gap-2">2. Role e toque em <span className="bg-white/20 px-2 py-0.5 rounded text-white font-bold text-xs">Adicionar à Tela de Início</span></p>
                 <p className="flex items-center gap-2">3. Clique em <strong>Adicionar</strong>.</p>
              </div>
           </div>
        </div>
      )}
    </>
  );
}