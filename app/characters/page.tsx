import Link from 'next/link';

export default function CharactersPage() {
  return (
    <main className="min-h-screen bg-[#1a140f] p-4">
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-[var(--font-uncial)] text-3xl sm:text-4xl tracking-wider text-[#FFBF00] mb-2">
              Vos héros
            </h1>
            <p className="font-[var(--font-merriweather)] text-muted-light">
              Gérez vos personnages d&apos;aventure
            </p>
          </div>
          <Link
            href="/"
            className="text-muted-light hover:text-primary transition-colors text-2xl"
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
                Aucun héro créé
              </h2>
              <p className="font-[var(--font-merriweather)] text-sm text-muted-light">
                Créez votre premier personnage pour commencer votre aventure
              </p>
            </div>

            <button className="inline-flex items-center gap-2 bg-[#FFBF00] hover:bg-yellow-400 text-[#000000] font-[var(--font-uncial)] font-bold tracking-wider py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(255,191,0,0.6)] hover:scale-[1.02] active:scale-[0.98]">
              <span className="text-xl">+</span>
              <Link href="/characters/new">Créer un héros</Link>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
