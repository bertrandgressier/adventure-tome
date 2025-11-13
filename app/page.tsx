import InstallPrompt from './components/InstallPrompt';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <main className="relative flex min-h-screen flex-col items-center justify-center p-4 overflow-hidden">
        {/* Fond sombre uniforme */}
        <div className="absolute inset-0 bg-[#1a140f]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/8 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-amber-700/10 via-transparent to-transparent" />
        </div>

        {/* Étoiles scintillantes */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary rounded-full animate-magic"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-md w-full space-y-8">
          {/* En-tête héroïque */}
          <div className="text-center space-y-4">
            <div className="inline-block animate-float">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/30 to-amber-600/30 border-2 border-primary flex items-center justify-center backdrop-blur-sm shadow-lg">
                <span className="text-5xl">⚔️</span>
              </div>
            </div>
            
            <h1 className="font-[var(--font-uncial)] text-5xl sm:text-6xl tracking-wider animate-gold-shimmer mb-2">
              Adventure Hero
            </h1>
            
            <p className="font-[var(--font-merriweather)] text-lg text-light max-w-sm mx-auto">
              Entrez dans la légende de <span className="text-primary font-semibold">La Saga de Dagda</span>
            </p>
          </div>

          {/* Cartes de fonctionnalités */}
          <div className="space-y-4">
            <div className="group relative bg-[#2a1e17] backdrop-blur-sm glow-border glow-border-hover rounded-lg p-6 transition-all duration-300">
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

            <div className="group relative bg-[#2a1e17] backdrop-blur-sm glow-border glow-border-hover rounded-lg p-6 transition-all duration-300">
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

            <div className="group relative bg-[#2a1e17] backdrop-blur-sm glow-border glow-border-hover rounded-lg p-6 transition-all duration-300">
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
              className="block w-full bg-[#FFBF00] hover:bg-yellow-400 text-[#000000] font-[var(--font-uncial)] font-bold tracking-wider py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(255,191,0,0.6)] hover:scale-[1.02] active:scale-[0.98] text-center text-lg"
            >
              Commencer l&apos;aventure
            </Link>

            <p className="text-center text-xs text-muted-light">
              💡 Installez l&apos;app sur votre écran d&apos;accueil pour une expérience optimale
            </p>
          </div>

          {/* Mention légale */}
          <div className="text-center pt-4 border-t border-border/50">
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
          </div>
        </div>
      </main>
      
      <InstallPrompt />
    </>
  );
}
