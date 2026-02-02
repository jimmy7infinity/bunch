'use client';

import { useState } from 'react';
import { Button } from './ui/button';

const REACTION_EMOJIS = ['❤️', '👍', '😂', '👎', '🔥', '😮', '🤬', '🔫'];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  return (
    <div className="absolute bottom-full mb-2 right-0 bg-[var(--color-card)] border-2 border-[var(--color-border)] rounded-lg p-2 shadow-xl z-50">
      <div className="grid grid-cols-4 gap-1">
        {REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              onSelect(emoji);
              onClose();
            }}
            className="w-8 h-8 flex items-center justify-center hover:bg-[var(--color-muted)] rounded text-lg transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
