'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { isIOS, isIOSSafari, isSafari, isStandalone } from '@/lib/browser-detection';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window {
    MSStream?: unknown;
  }
}

export default function Home() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [stars, setStars] = useState<Array<{left: number; top: number; delay: number}>>([]);
  const [isIOSSafariDetected, setIsIOSSafariDetected] = useState(false);
  const [isSafariDesktop, setIsSafariDesktop] = useState(false);
  const [isStandaloneDetected, setIsStandaloneDetected] = useState(false);

  useEffect(() => {
    // Détecter le navigateur et le mode standalone côté client uniquement
    setIsIOSSafariDetected(isIOSSafari());
    setIsSafariDesktop(isSafari() && !isIOS());
    setIsStandaloneDetected(isStandalone());

    // Générer les étoiles côté client uniquement
    const generatedStars = [...Array(20)].map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 2
    }));

    // Utiliser setTimeout pour éviter le setState dans l'effet
    const timer = setTimeout(() => setStars(generatedStars), 0);

    // Écouter l'événement beforeinstallprompt (Chrome, Edge, etc.)
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handler as EventListener);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOSSafariDetected) {
      alert('Sur iOS Safari : Appuyez sur le bouton de partage (⬆️) puis "Sur l\'écran d\'accueil" (➕)');
      return;
    }

    if (isSafariDesktop) {
      alert('Sur Safari Mac : Allez dans le menu Fichier > Ajouter au Dock (File > Add to Dock)');
      return;
    }

    if (!deferredPrompt) {
      alert('Pour installer l\'application :\n\n1. Cliquez sur le menu ⋮ (3 points) en haut à droite\n2. Sélectionnez "Installer Adventure Tome" ou "Ajouter à l\'écran d\'accueil"\n\nOu utilisez le raccourci : Ctrl+Shift+A (Windows) ou Cmd+Shift+A (Mac)');
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } catch (error) {
      console.error('Error during install:', error);
    }
  };

  return (
    <>
      <main className="relative flex min-h-screen flex-col items-center justify-center p-4 overflow-hidden">
        {/* Fond sombre uniforme */}
        <div className="absolute inset-0 bg-background">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/8 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-amber-700/10 via-transparent to-transparent" />
        </div>

        {/* Étoiles scintillantes */}
        <div className="absolute inset-0 overflow-hidden">
          {stars.map((star, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-primary rounded-full animate-magic shadow-[0_0_8px_hsl(var(--primary)/1),0_0_12px_hsl(var(--primary)/0.6)]"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                animationDelay: `${star.delay}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-md w-full space-y-8">
          {/* En-tête héroïque */}
          <div className="text-center space-y-4">
            <div className="inline-block animate-float">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/30 to-amber-600/30 border-2 border-primary overflow-hidden backdrop-blur-sm shadow-lg">
                <Image 
                  src="/icon-adventure-tome.jpg" 
                  alt="Adventure Tome" 
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            </div>
            
            <h1 className="font-[var(--font-uncial)] text-5xl sm:text-6xl tracking-wider animate-gold-shimmer mb-2">
              Adventure Tome
            </h1>
            
            <p className="font-[var(--font-merriweather)] text-lg text-light max-w-sm mx-auto">
              Entrez dans la légende de <span className="text-primary font-semibold">La Saga de Dagda</span>
            </p>
          </div>

          {/* Cartes de fonctionnalités */}
          <div className="space-y-4">
            <div className="group relative bg-card backdrop-blur-sm glow-border glow-border-hover rounded-lg p-6 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">📖</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-[var(--font-uncial)] text-lg tracking-wide text-light">
                    Gérez vos héros
                  </h3>
                  <p className="font-[var(--font-merriweather)] text-sm text-muted-light leading-relaxed">
                    Créez et suivez vos personnages avec leurs statistiques, inventaire et progression
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative bg-card backdrop-blur-sm glow-border glow-border-hover rounded-lg p-6 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">⚔️</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-[var(--font-uncial)] text-lg tracking-wide text-light">
                    Système de combat
                  </h3>
                  <p className="font-[var(--font-merriweather)] text-sm text-muted-light leading-relaxed">
                    Affrontez vos ennemis avec le système officiel de Force d&apos;Attaque
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative bg-card backdrop-blur-sm glow-border glow-border-hover rounded-lg p-6 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🎲</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-[var(--font-uncial)] text-lg tracking-wide text-light">
                    Hors ligne
                  </h3>
                  <p className="font-[var(--font-merriweather)] text-sm text-muted-light leading-relaxed">
                    Jouez partout, même sans connexion. Vos données sont sauvegardées localement
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bouton d'action principal */}
          <div className="space-y-4">
            <Link
              href="/characters"
              className="block w-full bg-primary hover:bg-primary/90 text-primary-foreground font-[var(--font-uncial)] font-bold tracking-wider py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_hsl(var(--primary)/0.6)] hover:scale-[1.02] active:scale-[0.98] text-center text-lg"
            >
              Commencer l&apos;aventure
            </Link>

            {!isStandaloneDetected && (isIOSSafariDetected || !isIOS()) && (
              <div className="space-y-2">
                <p className="text-center text-xs text-muted-light">
                  💡 Installez l&apos;app sur votre écran d&apos;accueil pour une expérience optimale
                </p>
                <button
                  onClick={handleInstall}
                  className="mx-auto block w-auto bg-gray-600 hover:bg-gray-500 text-white font-[var(--font-uncial)] font-bold tracking-wider py-2 px-6 rounded transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] text-center text-sm"
                >
                  {isIOSSafariDetected ? 'Installer sur iOS' : 'Installer l\'application'}
                </button>
              </div>
            )}

            {isIOS() && !isIOSSafariDetected && !isStandaloneDetected && (
              <p className="text-center text-xs text-muted-light">
                ℹ️ Pour installer sur iOS, ouvrez l&apos;application dans Safari
              </p>
            )}
          </div>

          {/* Mention légale */}
          <div className="text-center pt-4 border-t border-border/50 space-y-2">
            <p className="text-xs text-muted-light">
              Basé sur les livres <span className="text-primary">Le jeu dont tu es le héro</span>
              <br />
              <a 
                href="https://www.lasagadedagda.fr/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                La Saga de Dagda
              </a>
            </p>
            <p className="text-[10px] text-muted-light/50">
              <a 
                href="https://github.com/bertrandgressier/adventure-tome/issues/new" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                <span>🐛</span> Signaler un bug
              </a>
              {' • '}
              <a 
                href="https://www.paypal.com/donate/?hosted_button_id=Q5EPDFZEEXQHJ" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                <span>☕</span> Offrez-moi un café
              </a>
            </p>
            <p className="text-[10px] text-muted-light/50">
              <a 
                href="https://github.com/bertrandgressier/adventure-tome/blob/main/CHANGELOG_USER.md" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors inline-flex items-center gap-1"
                title="Voir les nouveautés"
              >
                <span>📝</span> v{process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0'}
              </a>
            </p>
            <p className="text-[10px] text-muted-light/50">
              Fait avec ❤️ • Merci pour votre soutien
            </p>
          </div>
        </div>
      </main>
      
    </>
  );
}
