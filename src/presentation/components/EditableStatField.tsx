'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface EditableStatFieldProps {
  label: string;
  value: number | null;
  onSave: (value: number | null) => Promise<void>;
  min?: number;
  colorClass?: string;
  title?: string;
  icon?: React.ReactNode;
  containerClassName?: string;
  placeholder?: string;
  size?: 'xs' | 'sm' | 'lg';
}

/**
 * Composant réutilisable pour afficher/éditer une stat.
 * 
 * - Clic pour éditer
 * - Enter pour valider, Escape pour annuler
 * - Validation du min
 */
export default function EditableStatField({
  label,
  value,
  onSave,
  min = 0,
  colorClass = 'text-primary',
  title = 'Cliquer pour modifier',
  icon,
  containerClassName,
  placeholder = '-',
  size = 'sm',
}: EditableStatFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus et sélection au début de l'édition
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const startEdit = () => {
    setInputValue(value?.toString() ?? '');
    setIsEditing(true);
  };

  const save = async () => {
    // Si vide, sauvegarder null
    if (inputValue.trim() === '') {
      try {
        await onSave(null);
        setIsEditing(false);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        alert('Erreur lors de la sauvegarde');
      }
      return;
    }
    
    const newValue = parseInt(inputValue);
    
    if (isNaN(newValue)) {
      alert(`${label} doit être un nombre`);
      return;
    }
    
    if (newValue < min) {
      alert(`${label} doit être au minimum ${min}`);
      return;
    }
    
    try {
      await onSave(newValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const cancel = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') cancel();
  };

  if (icon) {
    return (
      <div className={cn("bg-background border border-primary/20 rounded-lg p-1 text-center flex flex-col items-center justify-center min-h-[60px]", containerClassName)}>
        <div className="flex items-center gap-1 text-muted-light mb-0.5">
          {size === 'xs' ? <span className="text-[8px] uppercase font-bold tracking-wider">{label}</span> : (
            <>
              {icon}
              <span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
            </>
          )}
        </div>

        {isEditing ? (
          <div className="flex items-center justify-center gap-0.5">
            <input
              ref={inputRef}
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className={cn(
                "bg-card border border-primary/50 rounded px-1 py-0.5 text-center font-[var(--font-geist-mono)] text-primary focus:outline-none focus:border-primary",
                size === 'lg' ? "text-3xl w-20" : size === 'sm' ? "text-2xl w-16" : size === 'xs' ? "text-lg w-12" : "text-3xl w-20"
              )}
              min={min}
            />
            <button onClick={save} className="text-green-400 hover:text-green-300 text-sm">✓</button>
            <button onClick={cancel} className="text-red-400 hover:text-red-300 text-sm">✕</button>
          </div>
        ) : (
          <div
            onClick={startEdit}
            className={cn(
              "font-[var(--font-geist-mono)] font-bold hover:text-yellow-300 cursor-pointer transition-colors",
              size === 'lg' ? "text-2xl" : size === 'sm' ? "text-xl" : size === 'xs' ? "text-base" : "text-2xl",
              colorClass
            )}
            title={title}
          >
            {value ?? placeholder}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("bg-background glow-border rounded-lg text-center", containerClassName)}>
      <div className="font-[var(--font-merriweather)] text-sm text-muted-light mb-2">
        {label}
      </div>

      {isEditing ? (
        <div className="flex items-center justify-center gap-2">
          <input
            ref={inputRef}
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
              className={cn(
                "bg-card border border-primary/50 rounded px-2 py-1 text-center font-[var(--font-geist-mono)] text-primary focus:outline-none focus:border-primary",
                size === 'lg' ? "text-4xl w-24" : size === 'sm' ? "text-2xl w-20" : size === 'xs' ? "text-lg w-16" : "text-4xl w-24"
              )}
            min={min}
          />
          <button
            onClick={save}
            className="text-green-400 hover:text-green-300 text-xl"
            title="Valider"
          >
            ✓
          </button>
          <button
            onClick={cancel}
            className="text-red-400 hover:text-red-300 text-xl"
            title="Annuler"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          onClick={startEdit}
          className={cn(
            "font-[var(--font-geist-mono)] hover:text-yellow-300 cursor-pointer transition-colors",
            size === 'lg' ? "text-4xl" : size === 'sm' ? "text-2xl" : size === 'xs' ? "text-lg" : "text-4xl",
            colorClass
          )}
          title={title}
        >
          {value ?? placeholder}
        </div>
      )}
    </div>
  );
}
