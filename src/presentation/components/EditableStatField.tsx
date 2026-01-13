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
  size?: 'sm' | 'lg';
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
      <div className={cn("bg-background border border-primary/20 rounded-lg p-2 text-center flex flex-col items-center justify-center min-h-[80px]", containerClassName)}>
        <div className="flex items-center gap-1.5 text-muted-light mb-1">
          {icon}
          <span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
        </div>
        
        {isEditing ? (
          <div className="flex items-center justify-center gap-1">
            <input
              ref={inputRef}
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className={cn(
                "bg-card border border-primary/50 rounded px-1 py-0.5 text-center font-[var(--font-geist-mono)] text-xl text-primary focus:outline-none focus:border-primary",
                size === 'lg' ? "w-16" : "w-12"
              )}
              min={min}
            />
            <button onClick={save} className="text-green-400 hover:text-green-300 text-lg">✓</button>
            <button onClick={cancel} className="text-red-400 hover:text-red-300 text-lg">✕</button>
          </div>
        ) : (
          <div
            onClick={startEdit}
            className={`font-[var(--font-geist-mono)] text-2xl font-bold hover:text-yellow-300 cursor-pointer transition-colors ${colorClass}`}
            title={title}
          >
            {value ?? placeholder}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("bg-background glow-border rounded-lg p-4 text-center", containerClassName)}>
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
            className="w-16 bg-card border border-primary/50 rounded px-2 py-1 text-center font-[var(--font-geist-mono)] text-2xl text-primary focus:outline-none focus:border-primary"
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
          className={`font-[var(--font-geist-mono)] text-4xl hover:text-yellow-300 cursor-pointer transition-colors ${colorClass}`}
          title={title}
        >
          {value ?? placeholder}
        </div>
      )}
    </div>
  );
}
