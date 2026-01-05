'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ITEMS_CATALOG } from "@/src/data/items-catalog";
import { ItemType } from "@/src/domain/types/items";

interface AddWeaponModalProps {
  onAdd: (name: string, attackPoints: number) => Promise<void>;
  onClose: () => void;
}

export default function AddWeaponModal({ onAdd, onClose }: AddWeaponModalProps) {
  const [mode, setMode] = useState<'catalog' | 'manual'>('catalog');
  const [search, setSearch] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualAttackPoints, setManualAttackPoints] = useState('');

  const filteredWeapons = useMemo(() => {
    return ITEMS_CATALOG
      .filter((item) => item.type === ItemType.WEAPON)
      .filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
  }, [search]);

  const handleCatalogWeapon = async (weapon: { name: string; attackPoints?: number }) => {
    await onAdd(weapon.name, weapon.attackPoints || 0);
    setSearch('');
    onClose();
  };

  const handleManualSubmit = async () => {
    const attack = parseInt(manualAttackPoints);

    if (!manualName.trim()) {
      alert('Veuillez entrer un nom d\'arme');
      return;
    }

    if (isNaN(attack) || attack < 0) {
      alert('Les points d\'attaque doivent être un nombre positif ou nul');
      return;
    }

    await onAdd(manualName.trim(), attack);
    setManualName('');
    setManualAttackPoints('');
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-2 border-primary/50 rounded-lg p-6 max-w-md w-full" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="font-[var(--font-uncial)] text-3xl tracking-wide text-primary mb-6 text-center">
            ⚔️ Nouvelle arme
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button
            variant={mode === 'catalog' ? 'default' : 'outline'}
            onClick={() => setMode('catalog')}
            size="sm"
            className="flex-1 font-[var(--font-merriweather)]"
          >
            Catalogue
          </Button>
          <Button
            variant={mode === 'manual' ? 'default' : 'outline'}
            onClick={() => setMode('manual')}
            size="sm"
            className="flex-1 font-[var(--font-merriweather)]"
          >
            Manuel
          </Button>
        </div>

        {mode === 'catalog' ? (
          <>
            <Input
              placeholder="Rechercher une arme (ex: épée, arc...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-4 font-[var(--font-merriweather)]"
              autoFocus
            />

            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {filteredWeapons.map((weapon) => (
                  <div
                    key={weapon.id}
                    className="flex items-center justify-between p-3 border border-primary/20 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handleCatalogWeapon(weapon)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium font-[var(--font-merriweather)] text-light truncate">
                        {weapon.name}
                      </div>
                      <div className="text-xs text-muted-foreground font-[var(--font-geist-mono)]">
                        +{weapon.attackPoints || 0} dégâts
                      </div>
                    </div>
                    <Button size="sm" className="font-[var(--font-merriweather)] shrink-0 ml-2">
                      Ajouter
                    </Button>
                  </div>
                ))}

                {filteredWeapons.length === 0 && (
                  <div className="text-center text-muted-foreground py-8 font-[var(--font-merriweather)]">
                    Aucune arme trouvée. Essayez le mode manuel.
                  </div>
                )}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="space-y-4 mb-6">
            <div>
              <label className="font-[var(--font-merriweather)] text-muted-light text-sm mb-2 block">
                Nom de l&apos;arme
              </label>
              <input
                type="text"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="Ex: Épée longue, Arc, Dague..."
                className="w-full bg-background border border-primary/20 rounded px-4 py-2 font-[var(--font-merriweather)] text-light placeholder:text-muted-light focus:outline-none focus:border-primary"
                autoFocus
              />
            </div>

            <div>
              <label className="font-[var(--font-merriweather)] text-muted-light text-sm mb-2 block">
                Points d&apos;attaque
              </label>
              <input
                type="number"
                value={manualAttackPoints}
                onChange={(e) => setManualAttackPoints(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full bg-background border border-primary/20 rounded px-4 py-2 font-[var(--font-geist-mono)] text-light placeholder:text-muted-light focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-muted hover:bg-muted/80 text-light font-[var(--font-merriweather)] font-bold px-6 py-3 rounded-lg transition-colors border border-primary/20"
              >
                Annuler
              </button>
              <button
                onClick={handleManualSubmit}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-[var(--font-uncial)] font-bold px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-[0_0_20px_hsl(var(--primary)/0.6)] hover:scale-[1.02] active:scale-[0.98]"
              >
                Ajouter
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
