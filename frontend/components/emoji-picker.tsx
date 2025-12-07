"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EmojiPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
}

const EMOJI_CATEGORIES = {
  "자주 사용": ["🔥", "⚡", "✨", "💥", "🎉", "🎁", "💰", "💵", "💎", "⭐"],
  "시간/긴급": ["⏰", "⏱️", "⌛", "⏳", "🔔", "📢", "📣", "🚨", "⚠️", "❗"],
  "감정": ["❤️", "💕", "💖", "😍", "🥰", "😊", "😎", "🤩", "🎊", "🙌"],
  "사물": ["🎯", "🎖️", "🏆", "🥇", "🎪", "🎨", "📦", "🎀", "💌", "📌"],
};

export default function EmojiPicker({ open, onClose, onSelect }: EmojiPickerProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleEmojiClick = (emoji: string) => {
    onSelect(emoji);
    onClose();
  };

  const filteredCategories = Object.entries(EMOJI_CATEGORIES).reduce((acc, [category, emojis]) => {
    if (!searchTerm) {
      acc[category] = emojis;
    } else {
      const filtered = emojis.filter((emoji) => emoji.includes(searchTerm));
      if (filtered.length > 0) {
        acc[category] = filtered;
      }
    }
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>이모지 선택</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="이모지 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white"
          />

          <div className="max-h-96 overflow-y-auto space-y-4">
            {Object.entries(filteredCategories).map(([category, emojis]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">{category}</h3>
                <div className="grid grid-cols-10 gap-2">
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => handleEmojiClick(emoji)}
                      className="text-2xl p-2 hover:bg-gray-100 rounded transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {Object.keys(filteredCategories).length === 0 && (
            <p className="text-center text-gray-500 py-8">검색 결과가 없습니다.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
