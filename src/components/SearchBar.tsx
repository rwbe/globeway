import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Loader2, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

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
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const stableOnSearch = useCallback(onSearch, [onSearch]);

  const handleVoiceSearch = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      const messages = {
        pt: 'Seu navegador não suporta reconhecimento de voz.',
        en: 'Your browser does not support voice recognition.',
      };
      setErrorMessage(messages[i18n.language as keyof typeof messages] || messages.en);
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    const languageMap = {
      pt: 'pt-BR',
      en: 'en-US',
    };
    recognition.lang = languageMap[i18n.language as keyof typeof languageMap] || 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    recognition.continuous = false;

    let finalTranscript = '';

    recognition.onstart = () => {
      setIsListening(true);
      setRecognizedText('');
      setErrorMessage('');
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
        setQuery(finalTranscript);
        stableOnSearch(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      
      const errorMessages = {
        'not-allowed': {
          pt: 'Permissão de microfone negada',
          en: 'Microphone permission denied',
        },
        'no-speech': {
          pt: 'Nenhuma fala detectada',
          en: 'No speech detected',
        },
        'network': {
          pt: 'Erro de rede',
          en: 'Network error',
        },
        'audio-capture': {
          pt: 'Erro ao capturar áudio',
          en: 'Audio capture error',
        }
      };

      const lang = i18n.language as 'pt' | 'en';
      const errorType = event.error as keyof typeof errorMessages;
      const message = errorMessages[errorType]?.[lang] || 
        (lang === 'pt' ? 'Erro no reconhecimento de voz' :
         'Voice recognition error');
      
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(''), 4000);
    };

    try {
      recognition.start();
    } catch (error) {
      setIsListening(false);
      const messages = {
        pt: 'Não foi possível iniciar o reconhecimento de voz',
        en: 'Could not start voice recognition',
      };
      setErrorMessage(messages[i18n.language as keyof typeof messages] || messages.en);
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  const stopVoiceSearch = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    stableOnSearch(suggestion);
    setSelectedIndex(-1); 
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
          stableOnSearch(query.trim());
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
      stableOnSearch(query.trim());
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.6 }}
      className="relative w-full max-w-3xl mx-auto"
    >
      {/* Voice recognition feedback */}
      <AnimatePresence>
        {isListening && recognizedText && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute -top-16 left-0 right-0 mx-auto rounded-2xl shadow-elegant text-center p-4 glass ${
              isDarkMode 
                ? 'bg-neutral-800/90 text-white border border-neutral-700/50' 
                : 'bg-white/90 text-neutral-900 border border-neutral-200/50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">{recognizedText}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute -top-16 left-0 right-0 mx-auto rounded-2xl shadow-elegant text-center p-4 glass ${
              isDarkMode 
                ? 'bg-red-900/90 text-red-100 border border-red-700/50' 
                : 'bg-red-50/90 text-red-900 border border-red-200/50'
            }`}
          >
            <span className="text-sm font-medium">{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="relative">
        {/* Modern search input */}
        <div className={`relative rounded-3xl overflow-hidden shadow-elegant ${
          isDarkMode 
            ? 'bg-neutral-800/80 border border-neutral-700/50' 
            : 'bg-white/80 border border-neutral-200/50'
        } glass transition-all duration-300 ${
          isFocused 
            ? 'ring-2 ring-primary-500/20 shadow-luxurious' 
            : 'hover:shadow-modern'
        }`}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={t('searchPlaceholder')}
            className={`w-full px-8 py-6 text-lg bg-transparent border-none outline-none pr-32 font-medium placeholder:font-normal ${
              isDarkMode 
                ? 'text-white placeholder-neutral-400' 
                : 'text-neutral-900 placeholder-neutral-500'
            }`}
          />

          {/* Action buttons */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
            {/* Voice button */}
            <motion.button
              type="button"
              onClick={isListening ? stopVoiceSearch : handleVoiceSearch}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-3 rounded-2xl transition-all duration-200 ${
                isListening 
                  ? 'bg-red-500 text-white shadow-md animate-pulse' 
                  : isDarkMode 
                    ? 'text-neutral-400 hover:text-white hover:bg-neutral-700/50' 
                    : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100/50'
              }`}
            >
              <Mic size={20} />
            </motion.button>

            {/* Search button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-3 rounded-2xl transition-all duration-200 ${
                isDarkMode 
                  ? 'text-neutral-400 hover:text-white hover:bg-neutral-700/50' 
                  : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100/50'
              }`}
            >
              <Search size={20} />
            </motion.button>
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute right-20 top-1/2 -translate-y-1/2"
            >
              <Loader2 size={20} className={`${
                isDarkMode ? 'text-neutral-400' : 'text-neutral-500'
              } animate-spin`} />
            </motion.div>
          )}
        </div>

        {/* Modern suggestions dropdown */}
        <AnimatePresence>
          {isFocused && suggestions.length > 0 && (
            <motion.ul
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`absolute z-50 w-full mt-2 rounded-2xl overflow-hidden shadow-luxurious ${
                isDarkMode 
                  ? 'bg-neutral-800/95 border border-neutral-700/50' 
                  : 'bg-white/95 border border-neutral-200/50'
              } glass backdrop-blur-md`}
            >
              {suggestions.map((suggestion, index) => (
                <motion.li
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  whileHover={{ x: 4 }}
                  className={`px-6 py-4 cursor-pointer transition-all duration-150 border-b border-opacity-10 ${
                    isDarkMode ? 'border-neutral-600' : 'border-neutral-200'
                  } ${
                    index === selectedIndex 
                      ? isDarkMode 
                        ? 'bg-neutral-700/50 text-white' 
                        : 'bg-neutral-50/50 text-neutral-900'
                      : isDarkMode
                        ? 'text-neutral-300 hover:bg-neutral-700/30 hover:text-white'
                        : 'text-neutral-700 hover:bg-neutral-50/30 hover:text-neutral-900'
                  } ${index === suggestions.length - 1 ? 'border-b-0' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <Search size={16} className="opacity-40" />
                    <span className="font-medium">{suggestion}</span>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
};