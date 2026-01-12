import { Minus, Trash2, X } from 'lucide-react';

interface ItemActionsOverlayProps {
  onConsume?: () => void;
  onDelete: () => void;
  onClose: () => void;
  showConsume?: boolean;
  consumeDisabled?: boolean;
  deleteDisabled?: boolean;
}

export function ItemActionsOverlay({
  onConsume,
  onDelete,
  onClose,
  showConsume = false,
  consumeDisabled = false,
  deleteDisabled = false,
}: ItemActionsOverlayProps) {
  return (
    <div
      className="absolute inset-0 bg-card/95 backdrop-blur-sm rounded-lg flex items-center justify-center gap-2 z-10"
      onClick={(e) => e.stopPropagation()}
    >
      {showConsume && (
        <button
          onClick={onConsume}
          disabled={consumeDisabled}
          className="flex items-center gap-2 px-4 py-3 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors touch-manipulation active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus className="w-4 h-4" />
          <span className="text-sm font-[var(--font-merriweather)]">Consommer</span>
        </button>
      )}
      <button
        onClick={onDelete}
        disabled={deleteDisabled}
        className="flex items-center gap-2 px-4 py-3 bg-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg transition-colors touch-manipulation active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Trash2 className="w-4 h-4" />
        <span className="text-sm font-[var(--font-merriweather)]">Supprimer</span>
      </button>
      <button
        onClick={onClose}
        className="flex items-center justify-center p-3 bg-muted/50 hover:bg-muted/70 text-muted-light rounded-lg transition-colors touch-manipulation active:scale-95"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
