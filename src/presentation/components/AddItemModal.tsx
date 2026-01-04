'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CatalogItem, ItemType } from '@/src/domain/types/items';
import { ItemTypeBadge } from './ItemTypeBadge';
import { ITEMS_CATALOG } from '@/src/data/items-catalog';

interface AddItemModalProps {
  onAddItem: (catalogItem: CatalogItem, quantity?: number) => void;
  disabled?: boolean;
  currentTome: 1 | 2 | 3;
}

export function AddItemModal({ onAddItem, disabled, currentTome }: AddItemModalProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<ItemType | 'all'>('all');
  const [selectedTome, setSelectedTome] = useState<1 | 2 | 3 | 'all'>(currentTome);

  useEffect(() => {
    setSelectedTome(currentTome);
  }, [currentTome]);

  const filteredItems = useMemo(() => {
    return ITEMS_CATALOG.filter((item) => {
      const isBourse = item.name === 'Bourse';
      const isWeapon = item.type === ItemType.WEAPON;
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase());
      const matchesType =
        selectedType === 'all' || item.type === selectedType;
      const matchesTome =
        selectedTome === 'all' || item.tome === selectedTome;
      return !isBourse && !isWeapon && matchesSearch && matchesType && matchesTome;
    });
  }, [search, selectedType, selectedTome]);

  const handleAddItem = (catalogItem: CatalogItem) => {
    onAddItem(catalogItem);
    setOpen(false);
    setSearch('');
    setSelectedType('all');
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (open) {
      setSelectedTome(currentTome);
      setSearch('');
      setSelectedType('all');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={disabled} className="shrink-0 whitespace-nowrap">
          + Ajouter un item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ajouter un item depuis le catalogue</DialogTitle>
          <DialogDescription>
            Sélectionnez un item dans le catalogue pour l&apos;ajouter à votre inventaire
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col max-h-[70vh]">
          <Input
            placeholder="Rechercher un item (ex: potion, collier...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />

          <div className="flex gap-2 mb-2 flex-wrap">
            <Button
              variant={selectedTome === 1 ? 'default' : 'outline'}
              onClick={() => setSelectedTome(1)}
              size="sm"
            >
              Tome 1
            </Button>
            <Button
              variant={selectedTome === 2 ? 'default' : 'outline'}
              onClick={() => setSelectedTome(2)}
              size="sm"
            >
              Tome 2
            </Button>
            <Button
              variant={selectedTome === 3 ? 'default' : 'outline'}
              onClick={() => setSelectedTome(3)}
              size="sm"
            >
              Tome 3
            </Button>
            <Button
              variant={selectedTome === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedTome('all')}
              size="sm"
            >
              Tous
            </Button>
          </div>

          <div className="flex gap-2 mb-4 flex-wrap">
            <Button
              variant={selectedType === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedType('all')}
              size="sm"
            >
              Tous
            </Button>
            <Button
              variant={selectedType === ItemType.ACTIVE ? 'default' : 'outline'}
              onClick={() => setSelectedType(ItemType.ACTIVE)}
              size="sm"
            >
              Actifs
            </Button>
            <Button
              variant={selectedType === ItemType.PASSIVE ? 'default' : 'outline'}
              onClick={() => setSelectedType(ItemType.PASSIVE)}
              size="sm"
            >
              Passifs
            </Button>
            <Button
              variant={selectedType === ItemType.BASIC ? 'default' : 'outline'}
              onClick={() => setSelectedType(ItemType.BASIC)}
              size="sm"
            >
              Basiques
            </Button>
            <Button
              variant={selectedType === ItemType.SPECIAL ? 'default' : 'outline'}
              onClick={() => setSelectedType(ItemType.SPECIAL)}
              size="sm"
            >
              Spéciaux
            </Button>
          </div>

          <ScrollArea className="flex-1 pr-4 min-h-0">
            <div className="grid gap-2">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => handleAddItem(item)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{item.name}</span>
                      <ItemTypeBadge type={item.type} showLabel={false} />
                    </div>
                    {item.effect && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {item.effect}
                      </p>
                    )}
                  </div>
                  <Button size="sm" className="shrink-0 ml-2">Ajouter</Button>
                </div>
              ))}

              {filteredItems.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  Aucun item trouvé
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
