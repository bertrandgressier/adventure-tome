'use client';

import { useState, useMemo } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CatalogItem, ItemType } from '@/src/domain/types/items';
import { ItemTypeBadge } from './ItemTypeBadge';
import { useCharacterStore } from '@/src/presentation/providers/character-store-provider';
import { AddCustomItemModal } from './AddCustomItemModal';

type AddItemModalMode = 'inventory' | 'equipped';

interface AddItemModalProps {
  onAddItem: (catalogItem: CatalogItem, quantity?: number) => void;
  disabled?: boolean;
  currentTome: 1 | 2 | 3;
  presentItemIds?: string[];
  mode?: AddItemModalMode;
  filterType?: ItemType;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddItemModal({
  onAddItem,
  disabled,
  currentTome,
  presentItemIds = [],
  mode = 'inventory',
  filterType,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: AddItemModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setInternalOpen;

  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<ItemType | 'all'>(filterType || 'all');
  const [selectedTome, setSelectedTome] = useState<1 | 2 | 3 | 'all'>(currentTome);

  const catalog = useCharacterStore((state) => state.catalog);

  const handleAddCustomItem = async (catalogItem: CatalogItem, quantity?: number) => {
    await onAddItem(catalogItem, quantity);
  };

  const canAddItem = (item: CatalogItem): boolean => {
    if (mode === 'equipped') return true;
    const isPresent = presentItemIds.includes(item.id);
    if (!isPresent) return true;
    return item.stackable === true;
  };

  const availableItems = useMemo(() => {
    const allItems = Object.values(catalog);
    return allItems.filter((item) => {
      const isBourse = item.name === 'Bourse';
      const isWeapon = item.type === ItemType.WEAPON;
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase());
      const matchesType =
        filterType ? item.type === filterType : (selectedType === 'all' || item.type === selectedType);
      const matchesTome =
        selectedTome === 'all' || item.tome === selectedTome;
      return !isBourse && (mode === 'equipped' ? true : !isWeapon) && matchesSearch && matchesType && matchesTome;
    });
  }, [search, selectedType, selectedTome, catalog, filterType, mode]);

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
      {mode === 'inventory' && controlledOpen === undefined ? (
        <DialogTrigger asChild>
          <Button disabled={disabled} className="shrink-0 whitespace-nowrap">
            + Ajouter un item
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'equipped' ? 'Équiper une arme' : 'Ajouter un item depuis le catalogue'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'equipped'
              ? 'Sélectionnez une arme dans le catalogue pour l\'équiper'
              : 'Sélectionnez un item dans le catalogue pour l\'ajouter à votre inventaire'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col max-h-[70vh]">
          <Input
            placeholder="Rechercher"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />

          <Select
            value={selectedTome === 'all' ? 'all' : selectedTome.toString()}
            onValueChange={(value) => setSelectedTome(value === 'all' ? 'all' : (parseInt(value) as 1 | 2 | 3))}
          >
            <SelectTrigger className="w-[180px] mb-4">
              <SelectValue placeholder="Sélectionner un tome" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Tome 1</SelectItem>
              <SelectItem value="2">Tome 2</SelectItem>
              <SelectItem value="3">Tome 3</SelectItem>
              <SelectItem value="all">Tous</SelectItem>
            </SelectContent>
          </Select>

          {!filterType && (
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
          )}

          <ScrollArea className="flex-1 pr-4 min-h-0">
            <div className="grid gap-2">
              {availableItems.map((item) => {
                const canAdd = canAddItem(item);
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 border rounded-lg ${
                      canAdd ? 'hover:bg-accent cursor-pointer' : 'opacity-50 cursor-not-allowed bg-muted'
                    }`}
                    onClick={() => canAdd && handleAddItem(item)}
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
                    <Button
                      size="sm"
                      className="shrink-0 ml-2"
                      disabled={!canAdd}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (canAdd) handleAddItem(item);
                      }}
                    >
                      {mode === 'equipped' ? 'Équiper' : 'Ajouter'}
                    </Button>
                  </div>
                );
              })}

              {availableItems.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  Aucun item trouvé
                </div>
              )}
            </div>
          </ScrollArea>

          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => {
              setCustomModalOpen(true);
              setOpen(false);
            }}
          >
            {mode === 'equipped' ? 'Créer une nouvelle arme' : 'Créer un item personnalisé'}
          </Button>
        </div>
      </DialogContent>

      <AddCustomItemModal
        open={customModalOpen}
        onOpenChange={setCustomModalOpen}
        onAddCustomItem={handleAddCustomItem}
        currentTome={currentTome}
        defaultType={filterType}
      />
    </Dialog>
  );
}
