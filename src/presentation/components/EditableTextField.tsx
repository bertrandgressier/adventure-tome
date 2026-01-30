'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface EditableTextFieldProps {
  label: string;
  value: string;
  onSave: (value: string | null) => Promise<void>;
  icon?: React.ReactNode;
  placeholder?: string;
  emptyDisplay?: string; // Text to show when value is empty (e.g., "-")
  maxLength?: number;
}

export default function EditableTextField({
  label,
  value,
  onSave,
  icon,
  placeholder = '',
  emptyDisplay = '-',
  maxLength = 100,
}: EditableTextFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const startEdit = () => {
    setInputValue(typeof value === 'string' ? value : '');
    setIsEditing(true);
  };

  const save = async () => {
    try {
      const trimmedValue = inputValue.trim();
      await onSave(trimmedValue || null);
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

  return (
    <div className="bg-background border border-primary/20 rounded-lg p-2 text-center flex flex-col items-center justify-center min-h-[80px]">
      <div className="flex items-center gap-1.5 text-muted-light mb-1">
        {icon}
        <span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
      </div>

      {isEditing ? (
        <div className="flex items-center justify-center gap-1 w-full">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-card border border-primary/50 rounded px-1 py-0.5 text-center text-sm text-primary focus:outline-none focus:border-primary"
            placeholder={placeholder}
            maxLength={maxLength}
          />
          <button onClick={save} className="text-green-400 hover:text-green-300 text-lg">✓</button>
          <button onClick={cancel} className="text-red-400 hover:text-red-300 text-lg">✕</button>
        </div>
      ) : (
        <div
          onClick={startEdit}
          className={cn(
            "w-full text-sm text-primary hover:text-yellow-300 cursor-pointer transition-colors truncate",
            !value && "text-muted-light/50"
          )}
          title="Cliquer pour modifier"
        >
          {typeof value === 'string' ? (value || emptyDisplay) : emptyDisplay}
        </div>
      )}
    </div>
  );
}
