import Link from 'next/link';

export default function CharactersPage() {
  return (
    <main className="min-h-screen bg-[#1a140f] p-4">
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-[var(--font-uncial)] text-3xl sm:text-4xl tracking-wider text-primary mb-2">
              Vos héros
            </h1>
            <p className="font-[var(--font-merriweather)] text-muted-light">
              Gérez vos personnages d&apos;aventure
            </p>
          </div>
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors text-xl"
          >
            <span className="sr-only">Retour</span>
            ←
          </Link>
        </div>

        {/* État vide */}
        <div className="relative bg-[#2a1e17] glow-border rounded-lg p-12 text-center">
          <div className="max-w-sm mx-auto space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-amber-600/20 border-2 border-primary/50 flex items-center justify-center">
              <span className="text-4xl">📜</span>
            </div>
            
            <div className="space-y-2">
              <h2 className="font-[var(--font-uncial)] text-xl tracking-wide text-light">
                Aucun héros créé
              </h2>
              <p className="font-[var(--font-merriweather)] text-sm text-muted-light">
                Créez votre premier personnage pour commencer votre aventure
              </p>
            </div>

            <button className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-[var(--font-uncial)] tracking-wider py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(255,191,0,0.6)] hover:scale-[1.02] active:scale-[0.98]">
              <span className="text-xl">+</span>
              Créer un héros
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#2a1e17]/60 backdrop-blur-sm border border-border/50 rounded-lg p-4 text-center space-y-2">
            <div className="text-2xl">1️⃣</div>
            <h3 className="font-[var(--font-uncial)] text-sm tracking-wide text-light">
              Créez
            </h3>
            <p className="font-[var(--font-merriweather)] text-xs text-muted-light">
              Lancez les dés pour générer vos statistiques
            </p>
          </div>

          <div className="bg-[#2a1e17]/60 backdrop-blur-sm border border-border/50 rounded-lg p-4 text-center space-y-2">
            <div className="text-2xl">2️⃣</div>
            <h3 className="font-[var(--font-uncial)] text-sm tracking-wide text-light">
              Jouez
            </h3>
            <p className="font-[var(--font-merriweather)] text-xs text-muted-light">
              Gérez combat, inventaire et progression
            </p>
          </div>

          <div className="bg-[#2a1e17]/60 backdrop-blur-sm border border-border/50 rounded-lg p-4 text-center space-y-2">
            <div className="text-2xl">3️⃣</div>
            <h3 className="font-[var(--font-uncial)] text-sm tracking-wide text-light">
              Sauvegardez
            </h3>
            <p className="font-[var(--font-merriweather)] text-xs text-muted-light">
              Vos données sont stockées localement
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
