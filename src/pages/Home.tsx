import axios from 'axios';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaExclamationTriangle, FaGlobe, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import { useQuery } from 'react-query';
import { CountryDetails } from '../components/CountryDetails';
import { SearchBar } from '../components/SearchBar';
import Tooltip from '../components/Tooltip';
import { useBulkEconomicData } from '../hooks/useEnhancedCountryData';
import type { Country } from '../types/country';
import { useTranslatedCountryNames } from '../utils/translateCountryNames';

// Interfaces para os tipos GraphQL
interface GraphQLCountry {
  code: string;
  name: string;
  native: string;
  capital: string;
  emoji: string;
  currency: string;
  continent: { name: string };
  languages: Array<{ code: string; name: string }>;
  phone: string;
  states: Array<{ name: string }>;
}

interface MledozeCountry {
  cca2?: string;
  cca3?: string;
  name?: {
    official?: string;
    nativeName?: Record<string, { official: string; common: string }>;
  };
  independent?: boolean;
  unMember?: boolean;
  status?: string;
  capital?: string[];
  altSpellings?: string[];
  region?: string;
  subregion?: string;
  languages?: Record<string, string>;
  translations?: Record<string, { common: string; official: string }>;
  currencies?: Record<string, { name: string; symbol: string }>;
  tld?: string[];
  idd?: { root: string; suffixes: string[] };
  area?: number;
  borders?: string[];
  latlng?: number[];
  landlocked?: boolean;
  flag?: string;
}

interface WorldBankRecord {
  country?: { id: string };
  value: number | null;
}

interface GraphQLResponse {
  data: {
    countries: GraphQLCountry[];
  };
}

interface HomeProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  handleGoBack: () => void;
}

function Home({ isDarkMode }: HomeProps) {
  const { t } = useTranslation('home');
  const { getTranslatedName, findCountryByTranslatedName } = useTranslatedCountryNames();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [regionFilter, setRegionFilter] = useState('');
  const [populationFilter, setPopulationFilter] = useState('');
  const [populationSizeFilter, setPopulationSizeFilter] = useState('');
  const [tldFilter, setTldFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showOnlyIndependent, setShowOnlyIndependent] = useState(false);

  // Scroll para o topo quando selecionar um país
  useEffect(() => {
    if (selectedCountry) {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [selectedCountry]);

  // Query para obter todos os países - SISTEMA HÍBRIDO COMPLETO
  const {
    data: countries,
    isLoading: isLoadingCountries,
    isError: isCountriesError,
    error: countriesError,
  } = useQuery(
    'allCountries',
    async () => {
      console.log('🌍 Iniciando busca de países...');

      // 🌍 ESTRATÉGIA 1: Tentar REST Countries completo primeiro
      try {
        const restResponse = await axios.get<Country[]>('https://restcountries.com/v3.1/all', {
          timeout: 20000,
          headers: { Accept: 'application/json' },
        });

        if (restResponse.data && restResponse.data.length > 0) {
          console.log(
            `✅ REST Countries carregado com sucesso: ${restResponse.data.length} países`
          );

          // Buscar GraphQL para complementar
          try {
            const graphqlResponse = await axios.post<GraphQLResponse>(
              'https://countries.trevorblades.com/',
              {
                query: `{
                  countries {
                    code
                    native
                    emoji
                    phone
                    states { name }
                  }
                }`,
              },
              { timeout: 10000 }
            );

            const graphqlMap = new Map();
            graphqlResponse.data.data.countries.forEach((c: GraphQLCountry) => {
              graphqlMap.set(c.code, c);
            });

            // Mesclar dados
            return restResponse.data.map((country: Country) => {
              const graphqlData = graphqlMap.get(country.cca2) as GraphQLCountry | undefined;
              return {
                ...country,
                name: {
                  ...country.name,
                  native: graphqlData?.native || country.name.common,
                },
                emoji: graphqlData?.emoji || '',
                states: graphqlData?.states?.map((s: { name: string }) => s.name) || [],
              };
            });
          } catch {
            console.log('⚠️ GraphQL indisponível, usando apenas REST Countries');
            return restResponse.data;
          }
        }
      } catch {
        console.warn('⚠️ REST Countries falhou, usando estratégia híbrida');
      }

      // 🌍 ESTRATÉGIA 2: GraphQL + mledoze (jsDelivr) + World Bank Population
      console.log(
        '🔄 Carregando dados via fontes alternativas (GraphQL + mledoze + World Bank)...'
      );

      // Buscar as 3 fontes em paralelo
      const [graphqlResult, mledozeResult, populationResult] = await Promise.allSettled([
        // GraphQL Countries: nome, capital, emoji, idiomas, continente, etc.
        axios.post<GraphQLResponse>(
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
            }`,
          },
          { timeout: 15000 }
        ),
        // mledoze/countries via jsDelivr: área, independência, traduções, tld, fronteiras, etc.
        axios.get<MledozeCountry[]>(
          'https://cdn.jsdelivr.net/gh/mledoze/countries@master/countries.json',
          { timeout: 15000 }
        ),
        // World Bank: população de todos os países
        axios.get<[unknown, WorldBankRecord[]]>(
          'https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json&per_page=300&mrv=1',
          { timeout: 15000 }
        ),
      ]);

      const graphqlCountries =
        graphqlResult.status === 'fulfilled' ? graphqlResult.value.data.data.countries : [];
      console.log(`✅ GraphQL: ${graphqlCountries.length} países`);

      // Mapear mledoze por cca2
      const mledozeMap = new Map<string, MledozeCountry>();
      if (mledozeResult.status === 'fulfilled') {
        mledozeResult.value.data.forEach((c: MledozeCountry) => {
          if (c.cca2) mledozeMap.set(c.cca2, c);
        });
        console.log(`✅ mledoze: ${mledozeMap.size} países (área, independência, traduções)`);
      } else {
        console.warn('⚠️ mledoze indisponível');
      }

      // Mapear população por código ISO2
      const populationMap = new Map<string, number>();
      if (populationResult.status === 'fulfilled') {
        const records: WorldBankRecord[] = populationResult.value.data[1] || [];
        records.forEach((r: WorldBankRecord) => {
          if (r.country?.id && r.value != null) {
            populationMap.set(r.country.id, r.value);
          }
        });
        console.log(`✅ World Bank population: ${populationMap.size} países`);
      } else {
        console.warn('⚠️ World Bank population indisponível');
      }

      // Mesclar todas as fontes
      const finalData = graphqlCountries.map((graphql: GraphQLCountry) => {
        const ml = mledozeMap.get(graphql.code) || {};
        const population = populationMap.get(graphql.code) ?? 0;

        return {
          name: {
            common: graphql.name,
            official: ml.name?.official || graphql.name,
            nativeName: ml.name?.nativeName || {},
            native: graphql.native,
          },
          cca2: graphql.code,
          cca3: ml.cca3 || graphql.code,
          independent: ml.independent,
          unMember: ml.unMember,
          status: ml.status,
          flags: {
            svg: `https://flagcdn.com/${graphql.code.toLowerCase()}.svg`,
            png: `https://flagcdn.com/w320/${graphql.code.toLowerCase()}.png`,
            alt: `Flag of ${graphql.name}`,
          },
          capital: ml.capital || (graphql.capital ? [graphql.capital] : []),
          altSpellings: ml.altSpellings || [],
          region: ml.region || graphql.continent?.name || 'Unknown',
          subregion: ml.subregion || '',
          languages:
            ml.languages ||
            graphql.languages?.reduce(
              (acc: Record<string, string>, lang: { code: string; name: string }) => {
                acc[lang.code] = lang.name;
                return acc;
              },
              {} as Record<string, string>
            ) ||
            {},
          translations: ml.translations || {
            por: { common: graphql.name, official: graphql.name },
            spa: { common: graphql.name, official: graphql.name },
          },
          currencies:
            ml.currencies ||
            (graphql.currency
              ? {
                  [graphql.currency]: { name: graphql.currency, symbol: '' },
                }
              : {}),
          tld: ml.tld || [`.${graphql.code.toLowerCase()}`],
          continents: ml.region ? [ml.region] : graphql.continent ? [graphql.continent.name] : [],
          idd: ml.idd || {
            root: graphql.phone ? `+${graphql.phone.replace('+', '')}` : '',
            suffixes: [''],
          },
          population,
          area: ml.area ?? 0,
          borders: ml.borders || [],
          latlng: ml.latlng || [],
          landlocked: ml.landlocked || false,
          flag: ml.flag || graphql.emoji || '',
          emoji: graphql.emoji || '',
          states: graphql.states?.map((s: { name: string }) => s.name) || [],
        };
      });

      console.log(`🎉 Sistema híbrido finalizado: ${finalData.length} países`);
      return finalData;
    },
    {
      retry: (failureCount: number) => {
        if (failureCount < 2) {
          console.log(`🔄 Tentativa ${failureCount + 1} de 2...`);
          return true;
        }
        return false;
      },
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
      staleTime: 10 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      onError: (err: Error) => {
        console.error('❌ Erro ao carregar países após todas as tentativas:', err);
      },
      onSuccess: (data: Country[] | undefined) => {
        console.log(`🎉 Dados dos países carregados com sucesso: ${data?.length} países`);
      },
    }
  );

  // Pré-carregar dados econômicos para países principais
  useBulkEconomicData(countries || [], !!countries && countries.length > 0);

  // Função para buscar sugestões de países
  const handleSearch = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      // Usar dados locais para sugestões quando possível
      if (countries && countries.length > 0) {
        const queryLower = query.toLowerCase();

        // Separar países que começam com a query dos que apenas contêm
        const startsWithQuery = countries.filter((c: Country) =>
          c.name?.common?.toLowerCase().startsWith(queryLower)
        );

        const containsQuery = countries.filter((c: Country) => {
          const name = c.name?.common?.toLowerCase();
          return name && name.includes(queryLower) && !name.startsWith(queryLower);
        });

        // Priorizar os que começam com a query
        const localSuggestions = [...startsWithQuery, ...containsQuery].slice(0, 10);

        if (localSuggestions.length > 0) {
          setSuggestions(localSuggestions);
          return;
        }
      }

      // Fallback para API apenas se necessário
      try {
        const response = await axios.get<Country[]>(
          `https://restcountries.com/v3.1/name/${query}?fields=name,flags,cca2,cca3,translations,tld,altSpellings`,
          {
            timeout: 5000,
          }
        );
        setSuggestions(response.data.slice(0, 10));
      } catch {
        setSuggestions([]);
      }
    } catch {
      setSuggestions([]);
    }
  };

  // Query para buscar um país específico com busca assertiva (suporta nomes traduzidos)
  const { data: country, isLoading: isLoadingSearch } = useQuery(
    ['country', searchQuery],
    async () => {
      if (!searchQuery) return null;
      try {
        // 1º: Buscar nos dados locais usando o utility (suporta traduções)
        if (countries && countries.length > 0) {
          const foundCountry = findCountryByTranslatedName(countries, searchQuery);
          if (foundCountry) {
            setErrorMessage('');
            return foundCountry;
          }
        }

        // 2º: Fallback para API se não encontrar localmente
        const response = await axios.get<Country[]>(
          `https://restcountries.com/v3.1/name/${searchQuery}`,
          {
            timeout: 10000,
            headers: {
              Accept: 'application/json',
            },
          }
        );

        if (response.data && response.data.length > 0) {
          const normalizedQuery = searchQuery.toLowerCase().trim();
          // Priorizar match exato
          const exactMatch = response.data.find(
            c => c.name?.common?.toLowerCase() === normalizedQuery
          );

          setErrorMessage('');
          return exactMatch || response.data[0];
        }

        throw new Error('Nenhum país encontrado');
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
      refetchOnWindowFocus: false,
    }
  );

  // Função para buscar dados completos de um país ao clicar no card
  const handleCountryClick = async (country: Country) => {
    try {
      // Tentar buscar por código alpha (mais confiável)
      const response = await axios.get<Country[]>(
        `https://restcountries.com/v3.1/alpha/${country.cca2}`,
        {
          timeout: 10000,
          headers: { Accept: 'application/json' },
        }
      );

      if (response.data && response.data.length > 0) {
        setSelectedCountry(response.data[0]);
      } else {
        setSelectedCountry(country);
      }
    } catch {
      // Fallback: usar dados que já temos
      setSelectedCountry(country);
    }
  };

  // Função para converter entrada de população (ex: "49K" -> 49000, "2.4M" -> 2400000)
  const parsePopulationInput = (input: string): number => {
    if (!input || input.trim() === '') return 0;

    const normalized = input.trim().toUpperCase();

    // Detectar sufixo K (milhares) ou M (milhões)
    if (normalized.endsWith('K')) {
      const value = parseFloat(normalized.slice(0, -1));
      return isNaN(value) ? 0 : value * 1000;
    } else if (normalized.endsWith('M')) {
      const value = parseFloat(normalized.slice(0, -1));
      return isNaN(value) ? 0 : value * 1000000;
    } else {
      // Número puro
      const value = parseFloat(normalized);
      return isNaN(value) ? 0 : value;
    }
  };

  // Função para limpar todos os filtros
  const clearAllFilters = () => {
    setRegionFilter('');
    setPopulationFilter('');
    setPopulationSizeFilter('');
    setTldFilter('');
    setLanguageFilter('');
    setShowOnlyIndependent(false);
  };

  // Função para retornar ao estado inicial
  const handleGoBack = () => {
    setSelectedCountry(null);
    setSearchQuery('');
    setErrorMessage('');
    clearAllFilters();
  };

  // Filtrar países com base nos filtros aplicados
  const filteredCountries = countries?.filter((c: Country) => {
    const population = c.population ?? 0;

    // Filtro de independência
    const matchesIndependence =
      !showOnlyIndependent || c.independent === true || c.unMember === true;

    const matchesRegion = !regionFilter || c.region === regionFilter;

    // Filtro de população máxima com suporte a K/M
    const maxPopulation = parsePopulationInput(populationFilter);
    const matchesMaxPopulation =
      !populationFilter || maxPopulation === 0 || population <= maxPopulation;

    const matchesPopulationSize =
      !populationSizeFilter ||
      (populationSizeFilter === 'small' && population < 1000000) ||
      (populationSizeFilter === 'medium' && population >= 1000000 && population < 50000000) ||
      (populationSizeFilter === 'large' && population >= 50000000);

    // Filtro de TLD - Match exato apenas
    const matchesTLD =
      !tldFilter ||
      (c.tld &&
        Array.isArray(c.tld) &&
        c.tld.some((tld: string) => {
          if (!tld) return false;

          const normalizedTld = tld.toLowerCase().trim().replace(/\./g, '');
          const normalizedFilter = tldFilter.toLowerCase().trim().replace(/\./g, '');

          // Match exato apenas - .br deve pegar apenas Brasil, não Brunei (.bn)
          return normalizedTld === normalizedFilter;
        }));

    const matchesLanguage =
      !languageFilter ||
      (c.languages &&
        Object.values(c.languages).some((lang: string) =>
          lang.toLowerCase().includes(languageFilter.toLowerCase())
        ));

    return (
      matchesIndependence &&
      matchesRegion &&
      matchesMaxPopulation &&
      matchesPopulationSize &&
      matchesTLD &&
      matchesLanguage
    );
  });

  const sortedCountries = filteredCountries?.sort((a: Country, b: Country) => {
    const nameA = a.name?.common || '';
    const nameB = b.name?.common || '';
    return nameA.localeCompare(nameB);
  });

  const filteredCount = filteredCountries?.length || 0;
  const totalCountries = countries?.length || 0;

  // Função para formatar população para exibição
  const formatPopulationDisplay = (input: string): string => {
    if (!input) return '';
    const value = parsePopulationInput(input);

    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  // Verificar se há filtros ativos
  const hasActiveFilters =
    regionFilter ||
    populationFilter !== '' ||
    populationSizeFilter ||
    tldFilter ||
    languageFilter ||
    showOnlyIndependent;

  return (
    <div className="min-h-screen non-selectable">
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {/* HERO SECTION MODERNA */}
        {!searchQuery && !selectedCountry && (
          <>
            <div className="relative overflow-hidden rounded-3xl">
              {/* Background com Gradiente e Elementos Gráficos Modernos */}
              <div className="absolute inset-0 z-0">
                <div
                  className={`absolute inset-0 z-0 {
                }`}
                />

                <motion.div
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{
                    opacity: isDarkMode ? 0.15 : 0.13,
                    scale: 1,
                    x: [0, 10, 0],
                  }}
                  transition={{
                    duration: 2,
                    ease: 'easeOut',
                    x: {
                      duration: 20,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  }}
                  className="absolute inset-0 w-full h-full pointer-events-none z-0"
                  style={{
                    backgroundImage: 'url(/mundi-light.png)',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center center',
                  }}
                />

                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.15, 0.25, 0.15],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.1, 0.2, 0.1],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 2,
                  }}
                  className={`absolute bottom-1/4 right-1/5 w-[500px] h-[500px] rounded-full blur-3xl ${
                    isDarkMode ? 'bg-purple-600/8' : 'bg-purple-400/15'
                  }`}
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="relative z-10 text-center pt-32 pb-24 px-4"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border backdrop-blur-sm glass"
                  style={{
                    borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    background: isDarkMode
                      ? 'linear-gradient(135deg, rgba(14,165,233,0.1), rgba(90,109,141,0.1))'
                      : 'linear-gradient(135deg, rgba(14,165,233,0.05), rgba(90,109,141,0.05))',
                  }}
                >
                  <FaGlobe
                    className={`w-4 h-4 ${isDarkMode ? 'text-accent-400' : 'text-accent-600'}`}
                  />
                  <span
                    className={`text-sm font-semibold ${
                      isDarkMode ? 'text-neutral-300' : 'text-neutral-700'
                    }`}
                  >
                    {t('instantSearch') || 'Busca Instantânea'}
                  </span>
                </motion.div>

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

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="max-w-2xl mx-auto relative z-50"
                >
                  <SearchBar
                    onSearch={setSearchQuery}
                    onQueryChange={handleSearch}
                    suggestions={suggestions}
                    isLoading={isLoadingSearch}
                    isDarkMode={isDarkMode}
                    countries={countries}
                    onCountryFound={handleCountryClick}
                  />
                </motion.div>
              </motion.div>
            </div>
          </>
        )}

        {/* FILTROS MODERNOS */}
        {!searchQuery && !selectedCountry && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="relative">
                <select
                  value={regionFilter}
                  onChange={e => setRegionFilter(e.target.value)}
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
                  <svg
                    className={`w-4 h-4 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              <div className="relative">
                <select
                  value={populationSizeFilter}
                  onChange={e => setPopulationSizeFilter(e.target.value)}
                  className={`appearance-none px-8 py-3 pr-10 rounded-2xl font-medium transition-all duration-200 cursor-pointer border-none outline-none focus:ring-2 focus:ring-primary-500/20 ${
                    isDarkMode
                      ? 'bg-neutral-800/80 text-white glass border border-neutral-700/50 hover:bg-neutral-700/80'
                      : 'bg-white/80 text-neutral-700 glass border border-neutral-200/50 hover:bg-neutral-50/80'
                  } shadow-gentle hover:shadow-elegant`}
                >
                  <option value="">{t('allSizes') || 'Todos os Tamanhos'}</option>
                  <option value="small">{t('populationSizes.small') || 'Pequeno (< 1M)'}</option>
                  <option value="medium">
                    {t('populationSizes.medium') || 'Médio (1M - 50M)'}
                  </option>
                  <option value="large">{t('populationSizes.large') || 'Grande (> 50M)'}</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className={`w-4 h-4 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              <input
                type="text"
                placeholder={t('languagePlaceholder') || 'Filtrar por idioma...'}
                className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 border-none outline-none focus:ring-2 focus:ring-primary-500/20 ${
                  isDarkMode
                    ? 'bg-neutral-800/80 text-white placeholder-neutral-400 glass border border-neutral-700/50 hover:bg-neutral-700/80'
                    : 'bg-white/80 text-neutral-700 placeholder-neutral-500 glass border border-neutral-200/50 hover:bg-neutral-50/80'
                } shadow-gentle hover:shadow-elegant`}
                value={languageFilter}
                onChange={e => setLanguageFilter(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <input
                type="text"
                placeholder={t('maxPopulation') || 'População máxima (ex: 49K, 2.4M)'}
                className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 border-none outline-none focus:ring-2 focus:ring-primary-500/20 ${
                  isDarkMode
                    ? 'bg-neutral-800/80 text-white placeholder-neutral-400 glass border border-neutral-700/50 hover:bg-neutral-700/80'
                    : 'bg-white/80 text-neutral-700 placeholder-neutral-500 glass border border-neutral-200/50 hover:bg-neutral-50/80'
                } shadow-gentle hover:shadow-elegant`}
                value={populationFilter}
                onChange={e => setPopulationFilter(e.target.value)}
              />

              <input
                type="text"
                placeholder={t('domainPlaceholder')}
                className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 border-none outline-none focus:ring-2 focus:ring-primary-500/20 ${
                  isDarkMode
                    ? 'bg-neutral-800/80 text-white placeholder-neutral-400 glass border border-neutral-700/50 hover:bg-neutral-700/80'
                    : 'bg-white/80 text-neutral-700 placeholder-neutral-500 glass border border-neutral-200/50 hover:bg-neutral-50/80'
                } shadow-gentle hover:shadow-elegant`}
                value={tldFilter}
                onChange={e => setTldFilter(e.target.value)}
              />

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

        {/* COMPONENTE INFORMATIVO SOBRE 250 PAÍSES */}
        {!searchQuery && !selectedCountry && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className={`p-6 rounded-3xl glass shadow-elegant ${
              isDarkMode
                ? 'bg-blue-900/20 border border-blue-700/30'
                : 'bg-blue-50/60 border border-blue-200/30'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-blue-500/20' : 'bg-blue-500/10'
                }`}
              >
                <FaGlobe className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div className="flex-1 space-y-2">
                <h3
                  className={`text-lg font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}
                >
                  {t('countriesInfo.title')}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  {t('countriesInfo.explanation')}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  {t('countriesInfo.examples')}
                </p>
                <div className="pt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={showOnlyIndependent}
                        onChange={e => setShowOnlyIndependent(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-14 h-7 rounded-full transition-colors ${
                          showOnlyIndependent
                            ? isDarkMode
                              ? 'bg-blue-600'
                              : 'bg-blue-500'
                            : isDarkMode
                              ? 'bg-neutral-600'
                              : 'bg-neutral-300'
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                            showOnlyIndependent ? 'translate-x-7' : 'translate-x-0'
                          }`}
                        ></div>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isDarkMode ? 'text-neutral-200' : 'text-neutral-800'
                      }`}
                    >
                      {showOnlyIndependent ? t('showOnlyIndependent') : t('showAllTerritories')}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STATUS DISPLAY MODERNO */}
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
                <span className="text-primary-600">{totalCountries}</span>{' '}
                {showOnlyIndependent ? t('independentCountries') : t('allTerritories')}
              </p>

              {hasActiveFilters && (
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {showOnlyIndependent && (
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium ${
                        isDarkMode
                          ? 'bg-blue-900/50 text-blue-300 border border-blue-700/50'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {t('showOnlyIndependent')}
                    </span>
                  )}
                  {regionFilter && (
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium ${
                        isDarkMode
                          ? 'bg-primary-900/50 text-primary-300 border border-primary-700/50'
                          : 'bg-primary-50 text-primary-700 border border-primary-200'
                      }`}
                    >
                      {t('filteredByRegion')}: {regionFilter}
                    </span>
                  )}
                  {populationFilter && (
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium ${
                        isDarkMode
                          ? 'bg-accent-900/50 text-accent-300 border border-accent-700/50'
                          : 'bg-accent-50 text-accent-700 border border-accent-200'
                      }`}
                    >
                      {t('filteredByPopulation')}: ≤ {formatPopulationDisplay(populationFilter)}
                    </span>
                  )}
                  {populationSizeFilter && (
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium ${
                        isDarkMode
                          ? 'bg-green-900/50 text-green-300 border border-green-700/50'
                          : 'bg-green-50 text-green-700 border border-green-200'
                      }`}
                    >
                      {t('filteredBySize') || 'Tamanho'}:{' '}
                      {populationSizeFilter === 'small'
                        ? t('populationSizes.small') || 'Pequeno'
                        : populationSizeFilter === 'medium'
                          ? t('populationSizes.medium') || 'Médio'
                          : t('populationSizes.large') || 'Grande'}
                    </span>
                  )}
                  {languageFilter && (
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium ${
                        isDarkMode
                          ? 'bg-purple-900/50 text-purple-300 border border-purple-700/50'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}
                    >
                      {t('filteredByLanguage') || 'Idioma'}: {languageFilter}
                    </span>
                  )}
                  {tldFilter && (
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium ${
                        isDarkMode
                          ? 'bg-neutral-700/50 text-neutral-300 border border-neutral-600/50'
                          : 'bg-neutral-100 text-neutral-700 border border-neutral-300'
                      }`}
                    >
                      {t('filteredByDomain')}: {tldFilter}
                    </span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* NOVO: GRID DE PAÍSES MODERNO */}
        {!searchQuery && !selectedCountry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="grid gap-8"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, 360px)',
              justifyContent: 'center',
            }}
          >
            {isLoadingCountries ? (
              // NOVO: Loading State Aprimorado
              <div className="col-span-full flex justify-center items-center py-24">
                <div className="text-center space-y-4">
                  <div
                    className={`w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto ${
                      isDarkMode ? 'border-primary-800 border-t-primary-400' : ''
                    }`}
                  ></div>
                  <p
                    className={`text-lg font-medium ${
                      isDarkMode ? 'text-neutral-300' : 'text-neutral-600'
                    }`}
                  >
                    {t('loadingCountries')}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    Carregando dados de múltiplas fontes...
                  </p>
                </div>
              </div>
            ) : isCountriesError ? (
              // NOVO: Error State Aprimorado
              <div className="col-span-full flex justify-center items-center py-24">
                <div className="text-center space-y-4">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-50 text-red-600'
                    }`}
                  >
                    <FaExclamationTriangle className="w-8 h-8" />
                  </div>
                  <div>
                    <p
                      className={`text-lg font-medium mb-2 ${
                        isDarkMode ? 'text-neutral-300' : 'text-neutral-600'
                      }`}
                    >
                      Erro ao carregar países
                    </p>
                    <p
                      className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}
                    >
                      {(countriesError as Error)?.message ||
                        'Verifique sua conexão e tente novamente'}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => window.location.reload()}
                      className={`mt-4 px-6 py-3 rounded-xl font-medium transition-colors ${
                        isDarkMode
                          ? 'bg-neutral-700 hover:bg-neutral-600 text-white'
                          : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-700'
                      }`}
                    >
                      Tentar novamente
                    </motion.button>
                  </div>
                </div>
              </div>
            ) : (
              // NOVO: Cards de Países Modernizados
              sortedCountries?.map((c: Country, index: number) => (
                <motion.div
                  key={c.cca3}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.05, duration: 0.5 }}
                >
                  <Tooltip
                    content={
                      <div className="space-y-2 p-2">
                        <p className="font-semibold text-sm">
                          {c.capital?.[0] || t('translationsTooltip:countryDetails.notAvailable')}
                        </p>
                        <div className="space-y-1 text-xs">
                          <p>
                            <span className="font-medium">
                              {t('translationsTooltip:countryDetails.region')}:
                            </span>{' '}
                            {c.region
                              ? t(`translationsTooltip:regions.${c.region.toLowerCase()}`)
                              : t('translationsTooltip:countryDetails.notAvailable')}
                          </p>
                          <p>
                            <span className="font-medium">
                              {t('translationsTooltip:countryDetails.population')}:
                            </span>{' '}
                            {(c.population ?? 0).toLocaleString() ||
                              t('translationsTooltip:countryDetails.notAvailable')}
                          </p>
                          <p>
                            <span className="font-medium">
                              {t('translationsTooltip:countryDetails.area')}:
                            </span>{' '}
                            {c.area?.toLocaleString() ||
                              t('translationsTooltip:countryDetails.notAvailable')}{' '}
                            km²
                          </p>
                        </div>
                      </div>
                    }
                    position="top"
                  >
                    <motion.div
                      className={`group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                        isDarkMode
                          ? 'bg-gradient-to-br from-neutral-800/90 to-neutral-900/90 hover:from-neutral-800 hover:to-neutral-900'
                          : 'bg-gradient-to-br from-white to-neutral-50/50 hover:from-white hover:to-white'
                      } shadow-lg hover:shadow-2xl border ${
                        isDarkMode ? 'border-neutral-700/30' : 'border-neutral-200/50'
                      } backdrop-blur-sm`}
                      style={{
                        width: '360px',
                        height: '440px',
                        minWidth: '360px',
                        maxWidth: '360px',
                        minHeight: '440px',
                        maxHeight: '440px',
                      }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCountryClick(c)}
                    >
                      {/* Flag container */}
                      <div
                        className={`relative overflow-hidden ${
                          isDarkMode ? 'bg-neutral-900' : 'bg-neutral-100'
                        }`}
                        style={{
                          width: '360px',
                          height: '180px',
                          minHeight: '180px',
                          maxHeight: '180px',
                        }}
                      >
                        <img
                          src={
                            c.flags?.svg ||
                            c.flags?.png ||
                            `https://flagcdn.com/${c.cca2.toLowerCase()}.svg`
                          }
                          alt={`Bandeira de ${c.name?.common || 'país'}`}
                          className={`w-full h-full transition-transform duration-700 group-hover:scale-105 ${
                            ['CH', 'NP', 'VA', 'MC'].includes(c.cca2)
                              ? 'object-contain'
                              : 'object-cover'
                          }`}
                          loading="lazy"
                          onError={e => {
                            const target = e.target as HTMLImageElement;
                            if (target.src !== '/earth.png') {
                              target.src = `https://flagcdn.com/${c.cca2.toLowerCase()}.svg`;
                              target.onerror = () => {
                                target.src = '/earth.png';
                              };
                            }
                          }}
                        />
                        <div
                          className={`absolute inset-0 bg-gradient-to-t ${
                            isDarkMode
                              ? 'from-neutral-900/40 via-transparent to-transparent'
                              : 'from-black/20 via-transparent to-transparent'
                          } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                        ></div>
                      </div>

                      {/* Content área */}
                      <div
                        className="p-5"
                        style={{
                          height: '260px',
                          minHeight: '260px',
                          maxHeight: '260px',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        {/* Nome do país */}
                        <div
                          style={{
                            height: '56px',
                            minHeight: '56px',
                            maxHeight: '56px',
                            marginBottom: '16px',
                          }}
                        >
                          <h3
                            className={`text-lg font-bold leading-tight line-clamp-2 ${
                              isDarkMode ? 'text-white' : 'text-neutral-900'
                            }`}
                          >
                            {getTranslatedName(c, 'common') || c.name?.common || 'Unknown'}
                          </h3>
                        </div>

                        {/* Informações */}
                        <div
                          style={{ height: '132px', minHeight: '132px', maxHeight: '132px' }}
                          className="space-y-2.5"
                        >
                          <div className="flex items-center gap-2.5" style={{ height: '36px' }}>
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                isDarkMode ? 'bg-blue-500/10' : 'bg-blue-500/5'
                              }`}
                            >
                              <FaMapMarkerAlt
                                className={`w-3.5 h-3.5 ${
                                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-xs font-medium ${
                                  isDarkMode ? 'text-neutral-500' : 'text-neutral-400'
                                }`}
                              >
                                {t('capital')}
                              </p>
                              <p
                                className={`text-sm font-medium truncate ${
                                  isDarkMode ? 'text-neutral-200' : 'text-neutral-700'
                                }`}
                              >
                                {c.capital?.[0] || 'N/A'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5" style={{ height: '36px' }}>
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                isDarkMode ? 'bg-green-500/10' : 'bg-green-500/5'
                              }`}
                            >
                              <FaUsers
                                className={`w-3.5 h-3.5 ${
                                  isDarkMode ? 'text-green-400' : 'text-green-600'
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-xs font-medium ${
                                  isDarkMode ? 'text-neutral-500' : 'text-neutral-400'
                                }`}
                              >
                                {t('population')}
                              </p>
                              <p
                                className={`text-sm font-medium ${
                                  isDarkMode ? 'text-neutral-200' : 'text-neutral-700'
                                }`}
                              >
                                {(c.population ?? 0) > 1000000
                                  ? `${((c.population ?? 0) / 1000000).toFixed(1)}M`
                                  : (c.population ?? 0) > 1000
                                    ? `${((c.population ?? 0) / 1000).toFixed(0)}K`
                                    : (c.population ?? 0).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5" style={{ height: '36px' }}>
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                isDarkMode ? 'bg-purple-500/10' : 'bg-purple-500/5'
                              }`}
                            >
                              <FaGlobe
                                className={`w-3.5 h-3.5 ${
                                  isDarkMode ? 'text-purple-400' : 'text-purple-600'
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-xs font-medium ${
                                  isDarkMode ? 'text-neutral-500' : 'text-neutral-400'
                                }`}
                              >
                                {t('region')}
                              </p>
                              <p
                                className={`text-sm font-medium truncate ${
                                  isDarkMode ? 'text-neutral-200' : 'text-neutral-700'
                                }`}
                              >
                                {c.region
                                  ? t(`translationsTooltip:regions.${c.region.toLowerCase()}`) ||
                                    c.region
                                  : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div
                          className={`flex items-center justify-center pt-3 border-t ${
                            isDarkMode ? 'border-neutral-700/50' : 'border-neutral-200/50'
                          }`}
                          style={{
                            height: '48px',
                            minHeight: '48px',
                            maxHeight: '48px',
                            marginTop: '12px',
                          }}
                        >
                          <span
                            className={`text-xs font-bold tracking-wider ${
                              isDarkMode ? 'text-neutral-400' : 'text-neutral-500'
                            }`}
                          >
                            {c.cca3}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </Tooltip>
                </motion.div>
              ))
            )}
          </motion.div>
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
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center min-h-[60vh]"
          >
            <div
              className={`max-w-md mx-auto text-center space-y-6 p-8 rounded-3xl ${
                isDarkMode
                  ? 'bg-neutral-800/50 border border-neutral-700/30'
                  : 'bg-white/50 border border-neutral-200/30'
              } glass shadow-elegant`}
            >
              {/* Ícone */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'
                }`}
              >
                <FaGlobe className="w-10 h-10" />
              </motion.div>

              {/* Mensagem */}
              <div className="space-y-2">
                <h2
                  className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}
                >
                  {errorMessage}
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  {t('tryAnotherSearch') ||
                    'Tente pesquisar por outro país ou use os filtros abaixo'}
                </p>
              </div>

              {/* Botão */}
              <motion.button
                onClick={() => {
                  setErrorMessage('');
                  setSearchQuery('');
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-3 rounded-2xl font-medium transition-all duration-200 ${
                  isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } shadow-lg hover:shadow-xl`}
              >
                {t('clearSearch') || 'Limpar Pesquisa'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default Home;
