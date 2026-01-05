'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ItemType } from '@/src/domain/types/items';
import { CatalogItem } from '@/src/domain/types/items';
import { useCustomItemsCatalog } from '@/src/presentation/stores/customItemsCatalogStore';

interface AddCustomItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCustomItem: (item: CatalogItem, quantity?: number) => void;
  currentTome: 1 | 2 | 3;
}

export function AddCustomItemModal({
  open,
  onOpenChange,
  onAddCustomItem,
  currentTome,
}: AddCustomItemModalProps) {
  const addCustomItemToCatalog = useCustomItemsCatalog((state) => state.addCustomItem);
  const [name, setName] = useState('');
  const [type, setType] = useState<ItemType>(ItemType.BASIC);
  const [effect, setEffect] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [stackable, setStackable] = useState(false);
  const [unique, setUnique] = useState(false);
  const [disappearsOnTimeLoop, setDisappearsOnTimeLoop] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) {
      return;
    }

    const customItem = addCustomItemToCatalog({
      name: name.trim(),
      type,
      effect: effect.trim() || undefined,
      stackable,
      unique,
      disappearsOnTimeLoop,
      tome: currentTome,
    });

    onAddCustomItem(customItem, quantity);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setType(ItemType.BASIC);
    setEffect('');
    setQuantity(1);
    setStackable(false);
    setUnique(false);
    setDisappearsOnTimeLoop(false);
    onOpenChange(false);
  };

  const showQuantityField = type === ItemType.ACTIVE && stackable;
  const showUniqueField =
    type === ItemType.SPECIAL || type === ItemType.PASSIVE;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Créer un item personnalisé</DialogTitle>
          <DialogDescription>
            Ajoutez un item qui n&apos;est pas dans le catalogue officiel
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="item-name">Nom de l&apos;item *</Label>
            <Input
              id="item-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Épée flamboyante"
            />
          </div>

          <div>
            <Label htmlFor="item-type">Type d&apos;item</Label>
            <Select value={type} onValueChange={(v) => setType(v as ItemType)}>
              <SelectTrigger id="item-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ItemType.BASIC}>Objet basique</SelectItem>
                <SelectItem value={ItemType.PASSIVE}>Passif (bonus)</SelectItem>
                <SelectItem value={ItemType.ACTIVE}>Actif (consommable)</SelectItem>
                <SelectItem value={ItemType.WEAPON}>Arme</SelectItem>
                <SelectItem value={ItemType.SPECIAL}>Spécial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="item-effect">Description / Effet</Label>
            <Textarea
              id="item-effect"
              value={effect}
              onChange={(e) => setEffect(e.target.value)}
              placeholder="Ex: Donne +2 en CHANCE tant qu&apos;il est porté"
              rows={3}
            />
          </div>

          {showQuantityField && (
            <div>
              <Label htmlFor="item-quantity">Quantité initiale</Label>
              <Input
                id="item-quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
          )}

          <div className="space-y-2">
            {type === ItemType.ACTIVE && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="stackable"
                  checked={stackable}
                  onCheckedChange={(checked) => setStackable(checked as boolean)}
                />
                <Label htmlFor="stackable">Stackable (ex: potions)</Label>
              </div>
            )}

            {showUniqueField && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="unique"
                  checked={unique}
                  onCheckedChange={(checked) => setUnique(checked as boolean)}
                />
                <Label htmlFor="unique">Unique (ex: bague de la 2ème chance)</Label>
              </div>
            )}

            {(type === ItemType.BASIC || type === ItemType.PASSIVE) && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="disappears"
                  checked={disappearsOnTimeLoop}
                  onCheckedChange={(checked) => setDisappearsOnTimeLoop(checked as boolean)}
                />
                <Label htmlFor="disappears">Disparaît lors des resets temporels (Tome 3)</Label>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Annuler
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={!name.trim()}>
              Créer l&apos;item
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
