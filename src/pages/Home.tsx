// Home.tsx 
import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import { SearchBar } from '../components/SearchBar';
import { CountryDetails } from '../components/CountryDetails';
import type { Country } from '../types/country';
import { useTranslation } from 'react-i18next'; 
import Tooltip from '../components/Tooltip';
import { useTranslatedCountryNames } from '../utils/translateCountryNames'; 
import { useBulkEconomicData } from '../hooks/useEnhancedCountryData';
import { FaGlobe } from 'react-icons/fa'; 

interface HomeProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  handleGoBack: () => void;
}

function Home({ isDarkMode }: HomeProps) {
  const { t } = useTranslation('home'); 
  const { getTranslatedName } = useTranslatedCountryNames(); 
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [regionFilter, setRegionFilter] = useState('');
  const [populationFilter, setPopulationFilter] = useState(0);
  const [populationSizeFilter, setPopulationSizeFilter] = useState('');
  const [tldFilter, setTldFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Scroll para o topo quando selecionar um país
  useEffect(() => {
    if (selectedCountry) {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [selectedCountry]);

  // Query para obter todos os países - SISTEMA HÍBRIDO COMPLETO
  const { data: countries, isLoading: isLoadingCountries, isError: isCountriesError, error: countriesError } = useQuery(
    'allCountries',
    async () => {
      console.log('🌍 Iniciando busca de países...');
      
      // 🌍 SISTEMA DUAL-API HÍBRIDO
      console.log('🔄 Buscando dados de múltiplas fontes em paralelo...');
      
      // Buscar ambas as APIs simultaneamente
      const [restData, graphqlData] = await Promise.allSettled([
        // REST Countries API
        axios.get(
          'https://restcountries.com/v3.1/all?fields=name,cca2,flags,capital,region,population,languages,currencies,area,timezones',
          {
            timeout: 15000,
            headers: { 'Accept': 'application/json' }
          }
        ).then(res => {
          console.log(`✅ REST Countries: ${res.data.length} países`);
          return res.data;
        }).catch(err => {
          console.warn('⚠️ REST Countries indisponível:', err.message);
          return null;
        }),
        
        // GraphQL Countries API
        axios.post(
          'https://countries.trevorblades.com/',
          {
            query: `{
              countries {
                code
                name
                native
                capital
                emoji
                currency
                continent { name }
                languages { code name }
                phone
                states { name }
              }
            }`
          },
          {
            timeout: 15000,
            headers: { 'Content-Type': 'application/json' }
          }
        ).then(res => {
          console.log(`✅ GraphQL Countries: ${res.data.data.countries.length} países`);
          return res.data.data.countries;
        }).catch(err => {
          console.warn('⚠️ GraphQL Countries indisponível:', err.message);
          return null;
        })
      ]);

      // Extrair dados das promises
      const restCountries = restData.status === 'fulfilled' ? restData.value : null;
      const graphqlCountries = graphqlData.status === 'fulfilled' ? graphqlData.value : null;

      // Se ambas as APIs falharam
      if (!restCountries && !graphqlCountries) {
        throw new Error('❌ Todas as APIs de países estão indisponíveis. Tente novamente mais tarde.');
      }

      // Criar mapa de países do GraphQL para fácil acesso
      const graphqlMap = new Map();
      if (graphqlCountries) {
        graphqlCountries.forEach((country: any) => {
          graphqlMap.set(country.code, country);
        });
      }

      let finalData: Country[];

      // Se temos dados da REST Countries, usamos como base e complementamos com GraphQL
      if (restCountries) {
        console.log('🔀 Mesclando dados: REST Countries (base) + GraphQL (complemento)');
        finalData = restCountries.map((restCountry: any) => {
          const graphqlCountry = graphqlMap.get(restCountry.cca2);
          
          return {
            ...restCountry,
            name: {
              ...restCountry.name,
              native: graphqlCountry?.native || restCountry.name.common
            },
            idd: graphqlCountry?.phone 
              ? { root: graphqlCountry.phone, suffixes: [''] }
              : restCountry.idd,
            emoji: graphqlCountry?.emoji || '',
            states: graphqlCountry?.states?.map((s: any) => s.name) || []
          };
        });
      } 
      // Se REST Countries falhou, usar GraphQL como única fonte
      else {
        console.log('🔀 Usando GraphQL Countries como fonte única');
        finalData = graphqlCountries.map((country: any) => ({
          name: {
            common: country.name,
            official: country.name,
            nativeName: { [country.code.toLowerCase()]: { official: country.native, common: country.native } },
            native: country.native
          },
          cca2: country.code,
          cca3: country.code,
          flags: {
            svg: `https://flagcdn.com/${country.code.toLowerCase()}.svg`,
            png: `https://flagcdn.com/w320/${country.code.toLowerCase()}.png`
          },
          capital: country.capital ? [country.capital] : [],
          region: country.continent?.name || 'Unknown',
          population: 0,
          languages: country.languages?.reduce((acc: any, lang: any) => {
            acc[lang.code] = lang.name;
            return acc;
          }, {}) || {},
          currencies: country.currency ? { 
            [country.currency]: { name: country.currency, symbol: country.currency } 
          } : {},
          tld: [`.${country.code.toLowerCase()}`],
          continents: country.continent ? [country.continent.name] : [],
          idd: { root: country.phone || '', suffixes: [''] },
          emoji: country.emoji || '',
          states: country.states?.map((s: any) => s.name) || [],
          area: 0
        }));
      }

      console.log(`🎉 Sistema híbrido: ${finalData.length} países com dados mesclados de ${restCountries ? 'REST+GraphQL' : 'GraphQL'}`);
      return finalData as Country[];
    },
    {
      retry: (failureCount) => {
        if (failureCount < 2) {
          console.log(`🔄 Tentativa ${failureCount + 1} de 2...`);
          return true;
        }
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      staleTime: 10 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      onError: (err) => {
        console.error('❌ Erro ao carregar países após todas as tentativas:', err);
      },
      onSuccess: (data) => {
        console.log(`🎉 Dados dos países carregados com sucesso: ${data?.length} países`);
      }
    }
  );

  // Pré-carregar dados econômicos para países principais
  useBulkEconomicData(countries || [], !!countries && countries.length > 0);

  // Função para buscar sugestões de países (com throttling)
  const handleSearch = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      // Usar dados locais para sugestões quando possível
      if (countries && countries.length > 0) {
        const localSuggestions = countries
          .filter(c => c.name?.common?.toLowerCase().includes(query.toLowerCase()))
          .map(c => c.name.common)
          .slice(0, 10);
        
        if (localSuggestions.length > 0) {
          setSuggestions(localSuggestions);
          return;
        }
      }

      // Fallback para API apenas se necessário
      try {
        const response = await axios.get(`https://restcountries.com/v3.1/name/${query}?fields=name`, {
          timeout: 5000
        });
        const names = response.data.map((c: Country) => c.name.common).slice(0, 10);
        setSuggestions(names);
      } catch (apiError) {
        console.log('API de sugestões indisponível, usando fallback local');
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
      setSuggestions([]);
    }
  };

  // Query para buscar um país específico
  const { data: country, isLoading: isLoadingSearch } = useQuery(
    ["country", searchQuery],
    async () => {
      if (!searchQuery) return null;
      try {
        const searchUrls = [
          `https://restcountries.com/v3.1/name/${searchQuery}`,
          `https://restcountries.com/v2/name/${searchQuery}`
        ];
        
        for (const url of searchUrls) {
          try {
            const response = await axios.get(url, {
              timeout: 10000,
              headers: {
                'Accept': 'application/json'
              }
            });
            setErrorMessage("");
            return response.data[0] as Country;
          } catch (error) {
            console.warn(`Busca falhou com ${url}:`, error);
            continue;
          }
        }
        
        throw new Error('Todos os endpoints de busca falharam');
      } catch (error) {
        console.error('Search error:', error);
        setErrorMessage(t('noCountryFound'));
        return null;
      }
    },
    { 
      enabled: !!searchQuery && searchQuery.length > 2, 
      retry: 1,
      retryDelay: 2000,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false
    }
  );

  // Função para buscar dados completos de um país ao clicar no card
  const handleCountryClick = async (country: Country) => {
    try {
      const response = await axios.get(
        `https://restcountries.com/v3.1/name/${country.name.common}?fullText=true`,
        {
          timeout: 10000,
          headers: { 'Accept': 'application/json' }
        }
      );
      
      if (response.data && response.data.length > 0) {
        setSelectedCountry(response.data[0]);
      } else {
        setSelectedCountry(country);
      }
    } catch (error) {
      console.warn('Erro ao buscar dados completos, usando dados disponíveis:', error);
      setSelectedCountry(country);
    }
  };

  // Função para limpar todos os filtros
  const clearAllFilters = () => {
    setRegionFilter('');
    setPopulationFilter(0);
    setPopulationSizeFilter('');
    setTldFilter('');
    setLanguageFilter('');
  };

  // Função para retornar ao estado inicial
  const handleGoBack = () => {
    setSelectedCountry(null);
    setSearchQuery("");
    setErrorMessage("");
    clearAllFilters();
  };

  // Filtrar países com base nos filtros aplicados
  const filteredCountries = countries?.filter((c) => {
    const population = c.population ?? 0;
    
    const matchesRegion = !regionFilter || c.region === regionFilter;
    const matchesMaxPopulation = !populationFilter || (population <= populationFilter);
    const matchesPopulationSize = !populationSizeFilter || 
      (populationSizeFilter === 'small' && population < 1000000) ||
      (populationSizeFilter === 'medium' && population >= 1000000 && population < 50000000) ||
      (populationSizeFilter === 'large' && population >= 50000000);
    const matchesTLD = !tldFilter || (c.tld && c.tld.includes(tldFilter));
    const matchesLanguage = !languageFilter || 
      (c.languages && Object.values(c.languages).some(lang => 
        lang.toLowerCase().includes(languageFilter.toLowerCase())
      ));
    
    return matchesRegion && matchesMaxPopulation && matchesPopulationSize && matchesTLD && matchesLanguage;
  });

  const sortedCountries = filteredCountries?.sort((a, b) => {
    const nameA = a.name?.common || '';
    const nameB = b.name?.common || '';
    return nameA.localeCompare(nameB);
  });

  const filteredCount = filteredCountries?.length || 0;
  const totalCountries = countries?.length || 0;

  // Verificar se há filtros ativos
  const hasActiveFilters = regionFilter || populationFilter > 0 || populationSizeFilter || tldFilter || languageFilter;

  // Atualiza as sugestões de pesquisa com debounce
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      handleSearch(searchQuery);
    }, 1000);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, countries]);

  return (
    // NOVO: Design system moderno com classes semânticas
    <div className="min-h-screen non-selectable">
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16"> {/* NOVO: Padding aumentado e espaçamento */}
        
        {/* NOVA HERO SECTION MODERNA */}
        {!searchQuery && !selectedCountry && (
          <>
            <div className="relative overflow-hidden rounded-3xl"> {/* NOVO: Container com bordas arredondadas */}
              {/* Background com Gradiente e Elementos Gráficos Modernos */}
              <div className="absolute inset-0 -z-10">
                {/* Gradiente de fundo dinâmico */}
                <div className={`absolute inset-0 ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950' 
                    : 'bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30'
                }`} />
                
                {/* Mapa pontilhado abstrato - fundo principal moderno */}
                <motion.div
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ 
                    opacity: isDarkMode ? 0.15 : 0.22, 
                    scale: 1,
                    x: [0, 10, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    ease: "easeOut",
                    x: {
                      duration: 20,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{
                    backgroundImage: 'url(/Abstract_dotted_world_map_905c1347.png)',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center center',
                    filter: isDarkMode ? 'brightness(0.7) saturate(0.8)' : 'brightness(1.1) saturate(1.2)'
                  }}
                />
                
                {/* Efeitos de luz sutis e modernos */}
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.15, 0.25, 0.15]
                  }}
                  transition={{ 
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className={`absolute top-1/4 left-1/5 w-[500px] h-[500px] rounded-full blur-3xl ${
                    isDarkMode 
                      ? 'bg-blue-600/10' 
                      : 'bg-blue-400/20'
                  }`} 
                />
                <motion.div 
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.1, 0.2, 0.1]
                  }}
                  transition={{ 
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                  }}
                  className={`absolute bottom-1/4 right-1/5 w-[500px] h-[500px] rounded-full blur-3xl ${
                    isDarkMode 
                      ? 'bg-purple-600/8' 
                      : 'bg-purple-400/15'
                  }`} 
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative text-center pt-32 pb-24 px-4" // NOVO: Padding vertical aumentado
              >
                {/* Badge superior moderno */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border backdrop-blur-sm glass" // NOVO: Efeito glass
                  style={{
                    borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    background: isDarkMode 
                      ? 'linear-gradient(135deg, rgba(14,165,233,0.1), rgba(90,109,141,0.1))' 
                      : 'linear-gradient(135deg, rgba(14,165,233,0.05), rgba(90,109,141,0.05))'
                  }}
                >
                  <FaGlobe className={`w-4 h-4 ${isDarkMode ? 'text-accent-400' : 'text-accent-600'}`} /> {/* NOVO: Ícone moderno */}
                  <span className={`text-sm font-semibold ${
                    isDarkMode ? 'text-neutral-300' : 'text-neutral-700'
                  }`}>
                    {t('instantSearch') || 'Busca Instantânea'}
                  </span>
                </motion.div>

                {/* Título Principal com Tipografia Moderna */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className={`font-display text-6xl md:text-8xl font-bold mb-8 leading-[1.1] tracking-tight max-w-6xl mx-auto ${
                    isDarkMode ? 'text-white' : 'text-neutral-900'
                  }`}
                >
                  {t('title')}
                </motion.h1>

                {/* Subtítulo Elegante */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className={`text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed font-light ${
                    isDarkMode ? 'text-neutral-400' : 'text-neutral-600'
                  }`}
                >
                  {t('description')}
                </motion.p>

                {/* Barra de Pesquisa na Hero Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="max-w-2xl mx-auto"
                >
                  <SearchBar
                    onSearch={setSearchQuery}
                    suggestions={suggestions}
                    isLoading={isLoadingSearch}
                    isDarkMode={isDarkMode}
                  />
                </motion.div>
              </motion.div>
            </div>
          </>
        )}

        {/* Filtros Modernos - ATUALIZADO com design system */}
        {!searchQuery && !selectedCountry && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-4"
          >
            {/* Primary filters row */}
            <div className="flex flex-wrap gap-4 justify-center">
              {/* Region filter */}
              <div className="relative">
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className={`appearance-none px-8 py-3 pr-10 rounded-2xl font-medium transition-all duration-200 cursor-pointer border-none outline-none focus:ring-2 focus:ring-primary-500/20 ${
                    isDarkMode 
                      ? 'bg-neutral-800/80 text-white glass border border-neutral-700/50 hover:bg-neutral-700/80' 
                      : 'bg-white/80 text-neutral-700 glass border border-neutral-200/50 hover:bg-neutral-50/80'
                  } shadow-gentle hover:shadow-elegant`}
                >
                  <option value="">{t('allRegions')}</option>
                  <option value="Africa">{t('regions.africa')}</option>
                  <option value="Americas">{t('regions.americas')}</option>
                  <option value="Asia">{t('regions.asia')}</option>
                  <option value="Europe">{t('regions.europe')}</option>
                  <option value="Oceania">{t('regions.oceania')}</option>
                  <option value="Antarctic">{t('regions.antarctic')}</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className={`w-4 h-4 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Population size filter */}
              <div className="relative">
                <select
                  value={populationSizeFilter}
                  onChange={(e) => setPopulationSizeFilter(e.target.value)}
                  className={`appearance-none px-8 py-3 pr-10 rounded-2xl font-medium transition-all duration-200 cursor-pointer border-none outline-none focus:ring-2 focus:ring-primary-500/20 ${
                    isDarkMode 
                      ? 'bg-neutral-800/80 text-white glass border border-neutral-700/50 hover:bg-neutral-700/80' 
                      : 'bg-white/80 text-neutral-700 glass border border-neutral-200/50 hover:bg-neutral-50/80'
                  } shadow-gentle hover:shadow-elegant`}
                >
                  <option value="">{t('allSizes') || 'Todos os Tamanhos'}</option>
                  <option value="small">{t('populationSizes.small') || 'Pequeno (< 1M)'}</option>
                  <option value="medium">{t('populationSizes.medium') || 'Médio (1M - 50M)'}</option>
                  <option value="large">{t('populationSizes.large') || 'Grande (> 50M)'}</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className={`w-4 h-4 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Language filter */}
              <input
                type="text"
                placeholder={t('languagePlaceholder') || "Filtrar por idioma..."}
                className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 border-none outline-none focus:ring-2 focus:ring-primary-500/20 ${
                  isDarkMode 
                    ? 'bg-neutral-800/80 text-white placeholder-neutral-400 glass border border-neutral-700/50 hover:bg-neutral-700/80' 
                    : 'bg-white/80 text-neutral-700 placeholder-neutral-500 glass border border-neutral-200/50 hover:bg-neutral-50/80'
                } shadow-gentle hover:shadow-elegant`}
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
              />
            </div>

            {/* Secondary filters row */}
            <div className="flex flex-wrap gap-4 justify-center">
              {/* Population filter */}
              <input
                type="number"
                placeholder={t('maxPopulation')}
                className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 border-none outline-none focus:ring-2 focus:ring-primary-500/20 ${
                  isDarkMode 
                    ? 'bg-neutral-800/80 text-white placeholder-neutral-400 glass border border-neutral-700/50 hover:bg-neutral-700/80' 
                    : 'bg-white/80 text-neutral-700 placeholder-neutral-500 glass border border-neutral-200/50 hover:bg-neutral-50/80'
                } shadow-gentle hover:shadow-elegant`}
                onChange={(e) => setPopulationFilter(Number(e.target.value))}
              />

              {/* Domain filter */}
              <input
                type="text"
                placeholder={t('domainPlaceholder')}
                className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 border-none outline-none focus:ring-2 focus:ring-primary-500/20 ${
                  isDarkMode 
                    ? 'bg-neutral-800/80 text-white placeholder-neutral-400 glass border border-neutral-700/50 hover:bg-neutral-700/80' 
                    : 'bg-white/80 text-neutral-700 placeholder-neutral-500 glass border border-neutral-200/50 hover:bg-neutral-50/80'
                } shadow-gentle hover:shadow-elegant`}
                value={tldFilter}
                onChange={(e) => setTldFilter(e.target.value)}
              />

              {/* Clear filters button */}
              {hasActiveFilters && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearAllFilters}
                  className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 border-none outline-none ${
                    isDarkMode 
                      ? 'bg-red-900/50 text-red-300 hover:bg-red-800/50 border border-red-700/50' 
                      : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                  } shadow-gentle hover:shadow-elegant`}
                >
                  {t('clearFilters') || 'Limpar Filtros'}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* Status Display Moderno */}
        {!searchQuery && !selectedCountry && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className={`p-8 rounded-3xl glass shadow-elegant ${
              isDarkMode 
                ? 'bg-neutral-800/60 border border-neutral-700/30' 
                : 'bg-white/60 border border-neutral-200/30'
            }`}
          >
            <div className="text-center space-y-2">
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                {t('showing')} <span className="text-primary-600">{filteredCount}</span> {t('of')}{' '}
                <span className="text-primary-600">{totalCountries}</span> {t('countries')}
              </p>
              
              {hasActiveFilters && (
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {regionFilter && (
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                      isDarkMode 
                        ? 'bg-primary-900/50 text-primary-300 border border-primary-700/50' 
                        : 'bg-primary-50 text-primary-700 border border-primary-200'
                    }`}>
                      {t('filteredByRegion')}: {regionFilter}
                    </span>
                  )}
                  {populationFilter > 0 && (
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                      isDarkMode 
                        ? 'bg-accent-900/50 text-accent-300 border border-accent-700/50' 
                        : 'bg-accent-50 text-accent-700 border border-accent-200'
                    }`}>
                      {t('filteredByPopulation')}: ≤ {populationFilter.toLocaleString()}
                    </span>
                  )}
                  {populationSizeFilter && (
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                      isDarkMode 
                        ? 'bg-green-900/50 text-green-300 border border-green-700/50' 
                        : 'bg-green-50 text-green-700 border border-green-200'
                    }`}>
                      {t('filteredBySize') || 'Tamanho'}: {
                        populationSizeFilter === 'small' ? (t('populationSizes.small') || 'Pequeno') : 
                        populationSizeFilter === 'medium' ? (t('populationSizes.medium') || 'Médio') : 
                        (t('populationSizes.large') || 'Grande')
                      }
                    </span>
                  )}
                  {languageFilter && (
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                      isDarkMode 
                        ? 'bg-purple-900/50 text-purple-300 border border-purple-700/50' 
                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}>
                      {t('filteredByLanguage') || 'Idioma'}: {languageFilter}
                    </span>
                  )}
                  {tldFilter && (
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                      isDarkMode 
                        ? 'bg-neutral-700/50 text-neutral-300 border border-neutral-600/50' 
                        : 'bg-neutral-100 text-neutral-700 border border-neutral-300'
                    }`}>
                      {t('filteredByDomain')}: {tldFilter}
                    </span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Exibição de Países */}
        {!searchQuery && !selectedCountry && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
            {isLoadingCountries ? (
              <div className="col-span-full flex justify-center items-center py-8">
                <div className="text-center">
                  <div className={`w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2 ${
                    isDarkMode ? 'border-blue-800 border-t-blue-400' : ''
                  }`}></div>
                  <p className="text-neutral-500">{t('loadingCountries')}</p>
                </div>
              </div>
            ) : isCountriesError ? (
              <div className="col-span-full text-center py-8">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-50 text-red-600'
                }`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-neutral-300' : 'text-gray-700'}`}>
                  Erro ao carregar países
                </p>
                <p className={`text-sm mb-4 ${isDarkMode ? 'text-neutral-400' : 'text-gray-500'}`}>
                  {(countriesError as Error)?.message || 'Verifique sua conexão e tente novamente'}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode 
                      ? 'bg-neutral-700 hover:bg-neutral-600 text-white' 
                      : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-700'
                  }`}
                >
                  Tentar novamente
                </button>
              </div>
            ) : (
              sortedCountries?.map((c) => (
                <Tooltip
                  key={c.cca3 || c.cca2}
                  content={
                    <div className="space-y-2 p-2">
                      <p className="font-semibold text-sm">{c.capital?.[0] || t("translationsTooltip:countryDetails.notAvailable")}</p>
                      <div className="space-y-1 text-xs">
                        <p><span className="font-medium">{t("translationsTooltip:countryDetails.region")}:</span> {c.region ? t(`translationsTooltip:regions.${c.region.toLowerCase()}`) : t("translationsTooltip:countryDetails.notAvailable")}</p>
                        <p><span className="font-medium">{t("translationsTooltip:countryDetails.population")}:</span> {(c.population ?? 0).toLocaleString() || t("translationsTooltip:countryDetails.notAvailable")}</p>
                        <p><span className="font-medium">{t("translationsTooltip:countryDetails.area")}:</span> {c.area?.toLocaleString() || t("translationsTooltip:countryDetails.notAvailable")} km²</p>
                        {c.languages && (
                          <p><span className="font-medium">{t("translationsTooltip:countryDetails.languages")}:</span> {Object.values(c.languages).slice(0, 3).join(", ")}</p>
                        )}
                      </div>
                    </div>
                  }
                  position="top"
                >
                  <motion.div
                    className={`p-6 border-2 rounded-xl cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 ease-in-out ${
                      isDarkMode 
                        ? "bg-neutral-800 border-neutral-700 hover:border-neutral-600" 
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                    whileHover={{ scale: 1.03, y: -2 }}
                    onClick={() => handleCountryClick(c)}
                  >
                    <img 
                      src={c.flags?.svg || c.flags?.png || '/earth.png'}
                      alt={c.name?.common || 'Country flag'} 
                      className="w-full h-48 object-cover rounded-lg opacity-90 hover:opacity-100 transition-opacity duration-300" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/earth.png';
                      }}
                    />
                    <div className="mt-4">
                      <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {getTranslatedName(c.cca3 || c.cca2, 'common') || c.name?.common || 'Unknown'} 
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-gray-600'} mb-2`}>
                        {c.region ? t(`translationsTooltip:regions.${c.region.toLowerCase()}`) : 'Unknown Region'}
                      </p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          (c.population ?? 0) < 1000000 
                            ? isDarkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'
                            : (c.population ?? 0) < 50000000
                            ? isDarkMode ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-700'
                            : isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700'
                        }`}>
                          {(c.population ?? 0) > 1000000 
                            ? `${((c.population ?? 0) / 1000000).toFixed(1)}M` 
                            : (c.population ?? 0) > 1000
                            ? `${((c.population ?? 0) / 1000).toFixed(0)}K`
                            : (c.population ?? 0).toLocaleString()}
                        </span>
                        
                        {c.emoji && (
                          <span className="text-lg">{c.emoji}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </Tooltip>
              ))
            )}
          </div>
        )}

        {/* Detalhes do País Selecionado */}
        {(selectedCountry || country) && (
          <CountryDetails
            country={(selectedCountry || country) as Country}
            isDarkMode={isDarkMode}
            onGoBack={handleGoBack}
          />
        )}

        {/* Mensagem de Erro */}
        {errorMessage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-neutral-300' : 'text-gray-800'}`}>
              {errorMessage}
            </h2>
            <button
              onClick={handleGoBack}
              className={`mt-4 px-4 py-2 rounded-lg ${isDarkMode ? 'bg-neutral-700 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              {t('goBack')}
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default Home;