import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Loader2, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import countryMappings from '../locales/countryMappings.json';

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  suggestions: string[];
  isLoading: boolean;
  isDarkMode: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  suggestions,
  isLoading,
  isDarkMode,
}) => {
  const { t, i18n } = useTranslation('home');
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const stableOnSearch = useCallback(onSearch, [onSearch]);

  const translateCountryName = (name: string): string => {
    const mappings = countryMappings as Record<string, string>;
    return mappings[name] || name;
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Seu navegador não suporta reconhecimento de voz.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = i18n.language === 'pt' ? 'pt-BR' : 'en-US';
    recognition.interimResults = true;

    let finalTranscript = '';

    recognition.onstart = () => {
      setIsListening(true);
      setRecognizedText('');
    };

    recognition.onresult = (event) => {
      finalTranscript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('');
      setRecognizedText(finalTranscript);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (finalTranscript.trim()) {
        const translatedQuery = translateCountryName(finalTranscript);
        setQuery(translatedQuery);
        stableOnSearch(translatedQuery);
      }
    };

    recognition.onerror = (event) => {
      console.error('Erro no reconhecimento de voz:', event.error);
      setIsListening(false);
      alert(`Erro no reconhecimento de voz: ${event.error}`);
    };

    recognition.start();
  };

  const stopVoiceSearch = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    const translatedSuggestion = translateCountryName(suggestion);
    setQuery(translatedSuggestion);
    stableOnSearch(translatedSuggestion);
    setSelectedIndex(-1); // Reseta o índice selecionado
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();

        // Verifica se há uma sugestão exatamente igual ao texto digitado
        const exactMatch = suggestions.find(
          (suggestion) => suggestion.toLowerCase() === query.toLowerCase()
        );

        if (exactMatch) {
          // Se houver uma correspondência exata, seleciona essa sugestão
          setQuery(exactMatch);
          stableOnSearch(exactMatch);
        } else if (query.trim()) {
          // Caso contrário, realiza a busca com o texto digitado
          const translatedQuery = translateCountryName(query.trim());
          stableOnSearch(translatedQuery);
        }
      }

      if (suggestions.length === 0) return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          e.key === 'ArrowDown'
            ? (prev + 1) % suggestions.length
            : prev > 0
            ? prev - 1
            : suggestions.length - 1
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [query, suggestions, selectedIndex, stableOnSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const translatedQuery = translateCountryName(query.trim());
      stableOnSearch(translatedQuery);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <AnimatePresence>
        {isListening && recognizedText && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-[-40px] left-0 right-0 mx-auto bg-gray-800 text-white text-center p-2 rounded-md shadow-lg"
          >
            {recognizedText}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={t('searchPlaceholder')}
          className={`w-full px-6 py-3 text-lg rounded-lg border-2 transition-all pr-28 shadow-md
            ${isDarkMode ? 'text-white bg-neutral-900 border-neutral-600' : 'text-neutral-900 bg-white border-neutral-300'}
            ${isFocused ? 'border-blue-500' : ''}
          `}
        />

        {/* Lista de sugestões */}
        {isFocused && suggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg">
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                  index === selectedIndex ? 'bg-gray-100' : ''
                }`}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}

        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex space-x-2">
          <button
            type="button"
            onClick={isListening ? stopVoiceSearch : handleVoiceSearch}
            className={`p-2 rounded-full transition-colors duration-200 
              ${isListening ? 'bg-red-500 text-white animate-pulse' : isDarkMode ? 'text-white hover:bg-neutral-700' : 'text-gray-700 hover:bg-gray-200'}
            `}
          >
            <Mic size={24} />
          </button>

          <button
            type="submit"
            className={`p-2 rounded-full transition-colors duration-200 
              ${isDarkMode ? 'text-white hover:bg-neutral-700' : 'text-gray-700 hover:bg-gray-200'}
            `}
          >
            <Search size={24} />
          </button>
        </div>

        {isLoading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute right-24 top-1/2 -translate-y-1/2"
          >
            <Loader2 size={24} className={`${isDarkMode ? 'text-white' : 'text-gray-700'} animate-spin`} />
          </motion.div>
        )}
      </form>
    </div>
  );
};