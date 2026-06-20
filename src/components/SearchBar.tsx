import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Loader2, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Country } from '../types/country';
import { useTranslatedCountryNames } from '../utils/translateCountryNames';
import { detectBrowser, getBrowserSpecificMessage } from '../utils/browserDetector';

declare global {
  interface SpeechRecognition extends EventTarget {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    start(): void;
    stop(): void;
    abort(): void;
    onstart: ((ev: Event) => unknown) | null;
    onend: ((ev: Event) => unknown) | null;
    onresult: ((ev: SpeechRecognitionEvent) => unknown) | null;
    onerror: ((ev: SpeechRecognitionErrorEvent) => unknown) | null;
  }

  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  onQueryChange?: (query: string) => void;
  suggestions: Country[];
  isLoading: boolean;
  isDarkMode: boolean;
  countries?: Country[];
  onCountryFound?: (country: Country) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onQueryChange,
  suggestions,
  isLoading,
  isDarkMode,
  countries = [],
  onCountryFound,
}) => {
  const { t, i18n } = useTranslation('home');
  const { getTranslatedName, findCountryByTranslatedName } = useTranslatedCountryNames();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Notificar mudanças de query para gerar sugestões (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (onQueryChange) {
        onQueryChange(query);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, onQueryChange]);

  const stableOnSearch = useCallback(onSearch, [onSearch]);

  // Usar o utility para buscar país por nome (em qualquer idioma)
  const findCountryByName = useCallback(
    (spokenName: string): Country | null => {
      return findCountryByTranslatedName(countries, spokenName);
    },
    [countries, findCountryByTranslatedName]
  );

  const handleVoiceSearch = async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Detectar navegador e mostrar mensagem específica
      const browserInfo = detectBrowser();
      const specificMessage = getBrowserSpecificMessage(browserInfo.type, i18n.language);

      if (specificMessage) {
        setErrorMessage(specificMessage);
        setTimeout(() => setErrorMessage(''), 8000); // Mais tempo para ler a mensagem
      } else {
        const messages = {
          pt: 'Reconhecimento de voz não disponível neste navegador.',
          en: 'Voice recognition not available in this browser.',
          es: 'Reconocimiento de voz no disponible en este navegador.',
        };
        setErrorMessage(messages[i18n.language as keyof typeof messages] || messages.en);
        setTimeout(() => setErrorMessage(''), 4000);
      }
      return;
    }

    // Solicitar permissão do microfone primeiro
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      const messages = {
        pt: 'Permissão de microfone negada. Permita nas configurações do navegador.',
        en: 'Microphone permission denied. Allow in browser settings.',
        es: 'Permiso de micrófono denegado. Permite en configuraciones del navegador.',
      };
      setErrorMessage(messages[i18n.language as keyof typeof messages] || messages.en);
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    const languageMap = {
      pt: 'pt-BR',
      en: 'en-US',
      es: 'es-ES',
    };

    // Configuração simplificada e confiável
    recognition.lang = languageMap[i18n.language as keyof typeof languageMap] || 'pt-BR';
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    recognition.continuous = false; // Simplificado

    let fullTranscript = '';

    recognition.onstart = () => {
      console.log('🎤 Escutando...');
      setIsListening(true);
      setRecognizedText('');
      setErrorMessage('');
      fullTranscript = '';
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      console.log('📝 Resultado recebido');
      let interim = '';
      let final = '';

      for (let i = 0; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += text;
        } else {
          interim += text;
        }
      }

      const current = final || interim;
      console.log('🗣️ Capturado:', current);
      fullTranscript = final || fullTranscript;
      setRecognizedText(current);
      setQuery(current);
    };

    recognition.onend = () => {
      console.log('🛑 Finalizado. Texto:', fullTranscript);
      setIsListening(false);

      if (fullTranscript.trim()) {
        const found = findCountryByName(fullTranscript);
        if (found && onCountryFound) {
          onCountryFound(found);
          setQuery('');
          setRecognizedText('');
        } else {
          stableOnSearch(fullTranscript);
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('❌ Erro:', event.error);
      setIsListening(false);

      // Detectar navegador para mensagens específicas em caso de erro de rede
      const browserInfo = detectBrowser();

      const messages = {
        'not-allowed': {
          pt: 'Permissão de microfone negada.',
          en: 'Microphone permission denied.',
          es: 'Permiso de micrófono denegado.',
        },
        'no-speech': {
          pt: 'Nenhuma fala detectada. Tente novamente.',
          en: 'No speech detected. Try again.',
          es: 'No se detectó habla. Inténtalo de nuevo.',
        },
        'audio-capture': {
          pt: 'Erro ao capturar áudio do microfone.',
          en: 'Error capturing audio from microphone.',
          es: 'Error al capturar audio del micrófono.',
        },
        network: {
          pt:
            browserInfo.type === 'brave'
              ? '⚠️ Erro de rede. Se estiver usando Brave, desative os Shields (🛡️) para busca por voz.'
              : 'Erro de rede. Verifique sua conexão ou tente outro navegador.',
          en:
            browserInfo.type === 'brave'
              ? '⚠️ Network error. If using Brave, disable Shields (🛡️) for voice search.'
              : 'Network error. Check your connection or try another browser.',
          es:
            browserInfo.type === 'brave'
              ? '⚠️ Error de red. Si usas Brave, desactiva los Shields (🛡️) para búsqueda por voz.'
              : 'Error de red. Verifica tu conexión o prueba otro navegador.',
        },
      };

      const lang = i18n.language as 'pt' | 'en' | 'es';
      const errorType = event.error as keyof typeof messages;
      const message =
        messages[errorType]?.[lang] ||
        (lang === 'pt'
          ? 'Erro ao reconhecer voz.'
          : lang === 'es'
            ? 'Error al reconocer voz.'
            : 'Voice recognition error.');

      setErrorMessage(message);
      setTimeout(() => setErrorMessage(''), 8000); // Mais tempo para mensagens longas
    };

    try {
      recognition.start();
    } catch (error) {
      setIsListening(false);
      console.error('Erro ao iniciar:', error);
      const messages = {
        pt: 'Não foi possível iniciar.',
        en: 'Could not start.',
        es: 'No se pudo iniciar.',
      };
      setErrorMessage(messages[i18n.language as keyof typeof messages] || messages.en);
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const stopVoiceSearch = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleSuggestionClick = (country: Country) => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    if (onCountryFound) {
      onCountryFound(country);
    }
    setQuery('');
    setSelectedIndex(-1);
    setIsFocused(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();

        // Verifica se há uma sugestão exatamente igual ao texto digitado
        const exactMatch = suggestions.find(
          suggestion =>
            getTranslatedName(suggestion, 'common').toLowerCase() === query.toLowerCase()
        );

        if (exactMatch) {
          // Se houver uma correspondência exata, chama o país encontrado e faz a busca
          if (onCountryFound) {
            onCountryFound(exactMatch);
          }
          const countryName = getTranslatedName(exactMatch, 'common');
          stableOnSearch(countryName);
          setQuery('');
          setSelectedIndex(-1);
          setIsFocused(false);
        } else if (query.trim()) {
          // Caso contrário, realiza a busca com o texto digitado
          stableOnSearch(query.trim());
        }
      }

      if (suggestions.length === 0) return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev =>
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
  }, [query, suggestions, selectedIndex, stableOnSearch, getTranslatedName, onCountryFound]);

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
      {/* Voice recognition feedback - SEMPRE mostrar quando estiver ouvindo */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute -top-20 left-0 right-0 mx-auto rounded-2xl shadow-elegant text-center p-4 glass ${
              isDarkMode
                ? 'bg-red-900/90 text-white border border-red-700/50'
                : 'bg-red-50/90 text-red-900 border border-red-200/50'
            }`}
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div
                    className={`w-1 h-6 rounded-full animate-pulse ${isDarkMode ? 'bg-red-400' : 'bg-red-500'}`}
                    style={{ animationDelay: '0s' }}
                  ></div>
                  <div
                    className={`w-1 h-8 rounded-full animate-pulse ${isDarkMode ? 'bg-red-400' : 'bg-red-500'}`}
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className={`w-1 h-6 rounded-full animate-pulse ${isDarkMode ? 'bg-red-400' : 'bg-red-500'}`}
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
                <span className="text-sm font-semibold">{t('listening') || 'Escutando...'}</span>
              </div>
              {recognizedText && (
                <div
                  className={`text-base font-medium px-4 py-2 rounded-lg ${
                    isDarkMode ? 'bg-neutral-800' : 'bg-white/50'
                  }`}
                >
                  "{recognizedText}"
                </div>
              )}
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
        <div
          className={`relative rounded-3xl overflow-hidden shadow-elegant ${
            isDarkMode
              ? 'bg-neutral-800/80 border border-neutral-700/50'
              : 'bg-white/80 border border-neutral-200/50'
          } glass transition-all duration-300 ${
            isFocused ? 'ring-2 ring-primary-500/20 shadow-luxurious' : 'hover:shadow-modern'
          }`}
        >
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              const newValue = e.target.value;
              setQuery(newValue);
            }}
            onFocus={() => {
              if (blurTimeoutRef.current) {
                clearTimeout(blurTimeoutRef.current);
              }
              setIsFocused(true);
            }}
            onBlur={() => {
              blurTimeoutRef.current = setTimeout(() => {
                setIsFocused(false);
              }, 200);
            }}
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
              title={
                isListening
                  ? t('stopVoiceSearch') || 'Parar busca por voz'
                  : t('startVoiceSearch') || 'Clique para buscar por voz'
              }
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
              <Loader2
                size={20}
                className={`${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'} animate-spin`}
              />
            </motion.div>
          )}
        </div>

        {/* Modern autocomplete dropdown */}
        <AnimatePresence>
          {isFocused && suggestions.length > 0 && query.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={`absolute w-full mt-3 rounded-2xl overflow-hidden shadow-2xl ${
                isDarkMode
                  ? 'bg-neutral-800/98 border border-neutral-700/60'
                  : 'bg-white/98 border border-neutral-200/60'
              } glass backdrop-blur-xl`}
              style={{
                top: '100%',
                zIndex: 9999,
              }}
            >
              <div
                className={`px-4 py-2.5 text-xs font-medium border-b ${
                  isDarkMode
                    ? 'text-neutral-500 border-neutral-700/50 bg-neutral-800/50'
                    : 'text-neutral-500 border-neutral-200/50 bg-neutral-50/50'
                }`}
              >
                {suggestions.length}{' '}
                {suggestions.length === 1
                  ? t('countriesFound.singular') || 'país encontrado'
                  : t('countriesFound.plural') || 'países encontrados'}
              </div>
              <ul className="max-h-80 overflow-y-auto overflow-x-hidden py-1">
                {suggestions.map((country, index) => {
                  const countryName = getTranslatedName(country, 'common');
                  const matchIndex = countryName.toLowerCase().indexOf(query.toLowerCase());
                  const beforeMatch = countryName.slice(0, matchIndex);
                  const match = countryName.slice(matchIndex, matchIndex + query.length);
                  const afterMatch = countryName.slice(matchIndex + query.length);

                  return (
                    <motion.li
                      key={country.cca3}
                      onClick={() => handleSuggestionClick(country)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      whileHover={{
                        backgroundColor: isDarkMode
                          ? 'rgba(82, 82, 91, 0.4)'
                          : 'rgba(244, 244, 245, 0.6)',
                      }}
                      className={`px-5 py-3.5 cursor-pointer transition-all duration-150 ${
                        index === selectedIndex
                          ? isDarkMode
                            ? 'bg-blue-600/20 text-white'
                            : 'bg-blue-50/80 text-neutral-900'
                          : isDarkMode
                            ? 'text-neutral-300 hover:text-white'
                            : 'text-neutral-700 hover:text-neutral-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          {country.flags?.svg ? (
                            <img
                              src={country.flags.svg}
                              alt={`Flag of ${countryName}`}
                              className="flex-shrink-0 w-9 h-6 object-cover rounded shadow-sm"
                            />
                          ) : (
                            <div
                              className={`flex-shrink-0 w-9 h-6 rounded flex items-center justify-center ${
                                isDarkMode ? 'bg-neutral-700/50' : 'bg-neutral-100/80'
                              }`}
                            >
                              <Search
                                size={12}
                                className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}
                              />
                            </div>
                          )}
                          <span className="font-medium text-base">
                            {matchIndex >= 0 ? (
                              <>
                                {beforeMatch}
                                <span
                                  className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'} font-semibold`}
                                >
                                  {match}
                                </span>
                                {afterMatch}
                              </>
                            ) : (
                              countryName
                            )}
                          </span>
                        </div>
                        {index === selectedIndex && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`w-1.5 h-1.5 rounded-full ${
                              isDarkMode ? 'bg-blue-400' : 'bg-blue-600'
                            }`}
                          />
                        )}
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
};
