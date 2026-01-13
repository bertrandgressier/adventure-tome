'use client';

import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
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
          <button
            disabled={disabled}
            className="text-primary hover:text-yellow-300 transition-colors bg-primary/10 hover:bg-primary/20 rounded-lg p-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Ajouter un item"
          >
            <Plus className="w-5 h-5" />
          </button>
        </DialogTrigger>
      ) : null}
      <DialogContent 
        className="max-w-2xl h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] sm:h-[85vh] sm:max-h-[85vh] p-0 flex flex-col overflow-hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col h-full">
          <DialogHeader className="shrink-0 px-4 pt-4 sm:px-6 sm:pt-6">
            <DialogTitle className="text-base sm:text-lg">
              {mode === 'equipped' ? 'Équiper une arme' : 'Ajouter un item depuis le catalogue'}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {mode === 'equipped'
                ? 'Sélectionnez une arme dans le catalogue pour l\'équiper'
                : 'Sélectionnez un item dans le catalogue pour l\'ajouter à votre inventaire'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 shrink-0 px-4 pt-4 sm:px-6 sm:pt-4">
            <Input
              placeholder="Rechercher"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 text-base"
              autoFocus={false}
            />

            <div className="flex gap-2">
              <Select
                value={selectedTome === 'all' ? 'all' : selectedTome.toString()}
                onValueChange={(value) => setSelectedTome(value === 'all' ? 'all' : (parseInt(value) as 1 | 2 | 3))}
              >
                <SelectTrigger className="flex-1 sm:flex-none sm:w-[180px] h-11">
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
                <Select
                  value={selectedType}
                  onValueChange={(value) => setSelectedType(value as ItemType | 'all')}
                >
                  <SelectTrigger className="flex-1 sm:flex-none sm:w-[180px] h-11">
                    <SelectValue placeholder="Type d'item" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value={ItemType.ACTIVE}>Actifs</SelectItem>
                    <SelectItem value={ItemType.PASSIVE}>Passifs</SelectItem>
                    <SelectItem value={ItemType.BASIC}>Basiques</SelectItem>
                    <SelectItem value={ItemType.SPECIAL}>Spéciaux</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden px-4 pt-3 sm:px-6 sm:pt-3">
            <ScrollArea className="h-full">
              <div className="grid gap-2 pr-4">
              {availableItems.map((item) => {
                const canAdd = canAddItem(item);
                return (
                  <div
                    key={item.id}
                    className={`flex items-start sm:items-center gap-2 p-3 border rounded-lg ${
                      canAdd ? 'hover:bg-accent active:bg-accent cursor-pointer' : 'opacity-50 cursor-not-allowed bg-muted'
                    }`}
                    onClick={() => canAdd && handleAddItem(item)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm sm:text-base">{item.name}</span>
                        <ItemTypeBadge type={item.type} showLabel={false} />
                      </div>
                      {item.effect && (
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                          {item.effect}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="shrink-0 h-11 px-3 sm:px-4 text-xs sm:text-sm"
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
                <div className="text-center text-muted-foreground py-8 text-sm">
                  Aucun item trouvé
                </div>
              )}
              </div>
            </ScrollArea>
          </div>

          <div className="shrink-0 px-4 pb-4 pt-3 sm:px-6 sm:pb-6 sm:pt-4">
            <Button
              variant="outline"
              className="w-full h-11 text-xs sm:text-sm"
              onClick={() => {
                setCustomModalOpen(true);
                setOpen(false);
              }}
            >
              {mode === 'equipped' ? 'Créer une nouvelle arme' : 'Créer un item personnalisé'}
            </Button>
          </div>
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
