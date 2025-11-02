// Home.tsx - ATUALIZADO (Commit 2)
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
import { useBulkEconomicData } from '../hooks/useEnhancedCountryData'; // NOVO

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
  const [tldFilter, setTldFilter] = useState('');
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
        
        // GraphQL Countries API - NOVA FONTE
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
          
          // Mesclar dados das duas APIs
          return {
            ...restCountry,
            // Se GraphQL tem nome nativo mais completo, usar
            name: {
              ...restCountry.name,
              native: graphqlCountry?.native || restCountry.name.common
            },
            // GraphQL tem phone codes mais confiáveis
            idd: graphqlCountry?.phone 
              ? { root: graphqlCountry.phone, suffixes: [''] }
              : restCountry.idd,
            // Adicionar emoji do GraphQL (REST não tem)
            emoji: graphqlCountry?.emoji || '',
            // Adicionar estados/províncias do GraphQL (REST não tem)
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
          population: 0, // GraphQL não tem população
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
          area: 0 // GraphQL não tem área
        }));
      }

      console.log(`🎉 Sistema híbrido: ${finalData.length} países com dados mesclados de ${restCountries ? 'REST+GraphQL' : 'GraphQL'}`);
      return finalData as Country[];
    },
    {
      retry: (failureCount) => {
        // Retry até 2 vezes apenas
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

  // NOVO: Pré-carregar dados econômicos para países principais
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
        // Para busca por nome, a API não limita campos
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
      // Buscar dados completos do país usando o nome
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
        // Se falhar, usa os dados que já temos
        setSelectedCountry(country);
      }
    } catch (error) {
      console.warn('Erro ao buscar dados completos, usando dados disponíveis:', error);
      setSelectedCountry(country);
    }
  };

  // Função para retornar ao estado inicial
  const handleGoBack = () => {
    setSelectedCountry(null);
    setSearchQuery("");
    setErrorMessage("");
  };

  // Filtrar países com base nos filtros aplicados
  const filteredCountries = countries?.filter((c) => {
    return (
      (!regionFilter || c.region === regionFilter) &&
      (!populationFilter || ((c.population ?? 0) <= populationFilter)) && // MELHORADO: null safety
      (!tldFilter || (c.tld && c.tld.includes(tldFilter)))
    );
  });

  const sortedCountries = filteredCountries?.sort((a, b) => {
    const nameA = a.name?.common || ''; // MELHORADO: null safety
    const nameB = b.name?.common || '';
    return nameA.localeCompare(nameB);
  });

  const filteredCount = filteredCountries?.length || 0;
  const totalCountries = countries?.length || 0;

  // Atualiza as sugestões de pesquisa com debounce
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      handleSearch(searchQuery);
    }, 1000);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, countries]);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? "bg-neutral-900" : "bg-gray-50"} non-selectable`}>
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Exibição inicial quando não há pesquisa ou país selecionado */}
        {!searchQuery && !selectedCountry && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
           <img
             src="/earth.png"
             alt="Earth"
             className={`w-16 h-16 ${isDarkMode ? 'filter brightness' : 'filter brightness-90'} mx-auto mb-4`}
             style={{ pointerEvents: "none" }}
           />
            <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-neutral-300' : 'text-gray-800'} non-selectable`}>
              {t('title')}
            </h2>
            <p className={`mt-2 text-lg ${isDarkMode ? 'text-neutral-400' : 'text-gray-500'} non-selectable`}>
              {t('description')}
            </p>
            <p className={`mt-4 text-sm italic ${isDarkMode ? 'text-neutral-500' : 'text-gray-400'} non-selectable`}>
              {t('adventure')}
            </p>
          </motion.div>
        )}

        {/* Barra de Pesquisa */}
        <SearchBar
          onSearch={setSearchQuery}
          suggestions={suggestions}
          isLoading={isLoadingSearch}
          isDarkMode={isDarkMode}
        />

        {/* Filtros de Pesquisa */}
        {!searchQuery && !selectedCountry && (
          <div className="flex flex-wrap gap-4 mb-6">
            <select
              onChange={(e) => setRegionFilter(e.target.value)}
              className={`border p-2 rounded ${isDarkMode ? 'bg-neutral-800 text-white' : 'bg-white text-gray-900'}`}
            >
              <option value="">{t('allRegions')}</option>
              {Object.entries(t('regions', { returnObjects: true })).map(([key, value]) => (
                <option key={key} value={value}>{value}</option>
              ))}
            </select>

            <input
              type="number"
              placeholder={t('maxPopulation')}
              className={`border p-2 rounded ${isDarkMode ? 'bg-neutral-800 text-white' : 'bg-white text-gray-900'}`}
              onChange={(e) => setPopulationFilter(Number(e.target.value))}
            />

            <input
              type="text"
              placeholder={t('domainPlaceholder')}
              className={`border p-2 rounded ${isDarkMode ? 'bg-neutral-800 text-white' : 'bg-white text-gray-900'}`}
              value={tldFilter}
              onChange={(e) => setTldFilter(e.target.value)}
            />
          </div>
        )}

        {/* Filtro de Exibição */}
        {!searchQuery && !selectedCountry && (
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-neutral-800' : 'bg-white'} shadow-sm`}>
            <p className={`text-lg font-medium ${isDarkMode ? 'text-neutral-300' : 'text-gray-700'}`}>
              {t('showing')} <span className="font-bold">{filteredCount}</span> {t('of')}{' '}
              <span className="font-bold">{totalCountries}</span> {t('countries')}
            </p>
            {regionFilter && (
              <p className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-gray-500'}`}>
                {t('filteredByRegion')} <span className="font-bold">{regionFilter}</span>
              </p>
            )}
            {populationFilter > 0 && (
              <p className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-gray-500'}`}>
                {t('filteredByPopulation')} <span className="font-bold">≤ {populationFilter.toLocaleString()}</span>
              </p>
            )}
            {tldFilter && (
              <p className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-gray-500'}`}>
                {t('filteredByDomain')} <span className="font-bold">{tldFilter}</span>
              </p>
            )}
            
            {/* NOVO: Indicador de fonte de dados */}
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-neutral-500' : 'text-gray-400'}`}>
              Dados carregados de: {countries && countries[0]?.emoji ? 'REST + GraphQL' : 'REST Countries'}
            </p>
          </div>
        )}

        {/* Exibição de Países - MELHORADO com fallback de imagem */}
        {!searchQuery && !selectedCountry && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
            {isLoadingCountries ? (
              <div className="col-span-full flex justify-center items-center py-8">
                <div className="text-center">
                  <div className={`w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-2 ${
                    isDarkMode ? 'border-primary-800 border-t-primary-400' : ''
                  }`}></div>
                  <p className="text-neutral-500">Carregando países...</p>
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
                  key={c.cca3 || c.cca2} // MELHORADO: fallback para cca2
                  content={
                    <div className="space-y-1">
                      <p><strong>{t("translationsTooltip:countryDetails.capital")}:</strong> {c.capital?.[0] || t("translationsTooltip:countryDetails.notAvailable")}</p>
                      <p><strong>{t("translationsTooltip:countryDetails.region")}:</strong> {c.region ? t(`translationsTooltip:regions.${c.region.toLowerCase()}`) : t("translationsTooltip:countryDetails.notAvailable")}</p>
                      <p><strong>{t("translationsTooltip:countryDetails.population")}:</strong> {(c.population ?? 0).toLocaleString() || t("translationsTooltip:countryDetails.notAvailable")}</p>
                      <p><strong>{t("translationsTooltip:countryDetails.area")}:</strong> {c.area?.toLocaleString() || t("translationsTooltip:countryDetails.notAvailable")} km²</p>
                      {c.emoji && ( // NOVO: mostrar emoji se disponível
                        <p><strong>Emoji:</strong> {c.emoji}</p>
                      )}
                    </div>
                  }
                  position="top"
                >
                  <motion.div
                    className={`p-6 border rounded-xl cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 ease-in-out ${isDarkMode ? "bg-neutral-800" : "bg-white"}`}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => handleCountryClick(c)}
                  >
                    <img 
                      src={c.flags?.svg || c.flags?.png || '/earth.png'} // MELHORADO: fallback de imagem
                      alt={c.name?.common || 'Country flag'} 
                      className="w-full h-48 object-cover rounded-lg opacity-90 hover:opacity-100 transition-opacity duration-300" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/earth.png';
                      }}
                    />
                    <h3 className={`mt-4 text-xl font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {getTranslatedName(c.cca3 || c.cca2, 'common') || c.name?.common || 'Unknown'} 
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-gray-600'}`}>
                      {c.region ? t(`translationsTooltip:regions.${c.region.toLowerCase()}`) : 'Unknown Region'}
                    </p>
                    {c.emoji && ( // NOVO: mostrar emoji do país
                      <p className="text-2xl mt-2">{c.emoji}</p>
                    )}
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