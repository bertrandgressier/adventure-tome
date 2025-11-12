'use client';

import { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Détecter iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Vérifier si déjà installé
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Écouter l'événement beforeinstallprompt (Chrome, Edge, etc.)
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    
    setDeferredPrompt(null);
  };

  // Ne rien afficher si déjà installé
  if (isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#1a140f] border-t border-primary/30 shadow-lg">
      <div className="max-w-md mx-auto">
        {showPrompt && !isIOS && (
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-light">Installer l'application</h3>
              <p className="text-sm text-muted-light">
                Ajoutez Adventure Hero à votre écran d'accueil
              </p>
            </div>
            <button
              onClick={handleInstall}
              className="ml-4 bg-primary hover:bg-yellow-400 text-[#000000] font-bold py-2 px-4 rounded transition duration-200"
            >
              Installer
            </button>
          </div>
        )}

        {isIOS && (
          <div className="text-center">
            <h3 className="font-semibold text-light mb-2">
              Installer sur iOS
            </h3>
            <p className="text-sm text-muted-light">
              Appuyez sur le bouton de partage{' '}
              <span className="inline-block" role="img" aria-label="share icon">
                ⎋
              </span>{' '}
              puis "Sur l'écran d'accueil"{' '}
              <span className="inline-block" role="img" aria-label="plus icon">
                ➕
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
