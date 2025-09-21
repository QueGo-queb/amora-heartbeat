import { useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ht", name: "Kreyòl", flag: "🇭🇹" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "ptBR", name: "Português", flag: "🇧🇷" },
];

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

export function LanguageSelector({ selectedLanguage, onLanguageChange }: LanguageSelectorProps) {
  const currentLang = languages.find(lang => lang.code === selectedLanguage) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="language-selector gap-2">
          <Globe className="w-4 h-4" />
          <span className="flex items-center gap-1">
            <span>{currentLang.flag}</span>
            <span className="hidden sm:inline">{currentLang.name}</span>
          </span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1 text-xs text-gray-500 border-b">
          🌐 Sélectionnez votre langue
        </div>
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => {
              console.log('🌐 Language selected:', language.code, language.name);
              onLanguageChange(language.code);
            }}
            className={`flex items-center gap-2 cursor-pointer ${
              selectedLanguage === language.code ? 'bg-blue-50' : ''
            }`}
          >
            <span>{language.flag}</span>
            <span>{language.name}</span>
            {selectedLanguage === language.code && (
              <span className="ml-auto text-blue-600">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}