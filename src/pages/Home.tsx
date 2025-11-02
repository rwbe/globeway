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

  // Scroll para o topo quando selecionar um país - NOVO
  useEffect(() => {
    if (selectedCountry) {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [selectedCountry]);

  // Query para obter todos os países - MELHORADO
  const { data: countries, isLoading: isLoadingCountries, isError: isCountriesError, error: countriesError } = useQuery(
    'allCountries',
    async () => {
      const response = await axios.get<Country[]>(
        'https://restcountries.com/v3.1/all?fields=name,cca2,flags,capital,region,population,languages,currencies,area,timezones',
        {
          timeout: 15000, // NOVO: timeout de 15 segundos
          headers: { 'Accept': 'application/json' }
        }
      );
      return response.data;
    },
    {
      retry: 2, // NOVO: tenta 2 vezes antes de falhar
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // NOVO: delay exponencial
      staleTime: 10 * 60 * 1000, // NOVO: 10 minutos
      cacheTime: 30 * 60 * 1000, // NOVO: 30 minutos
      refetchOnWindowFocus: false, // NOVO: não recarregar ao focar na janela
    }
  );

  // Função para buscar sugestões de países - MELHORADA com fallback local
  const handleSearch = async (query: string) => {
    if (!query.trim() || query.length < 2) { // NOVO: mínimo 2 caracteres
      setSuggestions([]);
      return;
    }

    try {
      // NOVO: Usar dados locais para sugestões quando possível
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
      const response = await axios.get<Country[]>(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(query)}?fields=name`,
        { timeout: 5000 } // NOVO: timeout de 5 segundos
      );
      const names = response.data.map((c) => c.name.common).slice(0, 10);
      setSuggestions(names);
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
      setSuggestions([]);
    }
  };

  // Query para buscar um país específico - MELHORADA
  const { data: country, isLoading: isLoadingSearch } = useQuery(
    ["country", searchQuery],
    async () => {
      if (!searchQuery) return null;
      try {
        // NOVO: Tentar múltiplos endpoints
        const searchUrls = [
          `https://restcountries.com/v3.1/name/${searchQuery}`,
          `https://restcountries.com/v2/name/${searchQuery}`
        ];
        
        for (const url of searchUrls) {
          try {
            const response = await axios.get<Country[]>(url, {
              timeout: 10000, // NOVO: timeout de 10 segundos
              headers: { 'Accept': 'application/json' }
            });
            setErrorMessage("");
            return response.data.length > 0 ? response.data[0] : null;
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
      enabled: !!searchQuery && searchQuery.length > 2, // NOVO: mínimo 2 caracteres
      retry: 1, // NOVO: tenta apenas 1 vez
      retryDelay: 2000, // NOVO: delay de 2 segundos
      staleTime: 5 * 60 * 1000, // NOVO: 5 minutos
      refetchOnWindowFocus: false // NOVO: não recarregar ao focar
    }
  );

  // NOVA FUNÇÃO: Buscar dados completos ao clicar no card
  const handleCountryClick = async (country: Country) => {
    try {
      // Buscar dados completos do país usando o nome
      const response = await axios.get<Country[]>(
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
      (!populationFilter || (c.population && c.population <= populationFilter)) &&
      (!tldFilter || (c.tld?.includes(tldFilter)))
    );
  });

  const sortedCountries = filteredCountries?.sort((a, b) =>
    a.name.common.localeCompare(b.name.common)
  );

  const filteredCount = filteredCountries?.length || 0;
  const totalCountries = countries?.length || 0;

  // Atualiza as sugestões de pesquisa com debounce MELHORADO
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      handleSearch(searchQuery);
    }, 1000); // AUMENTADO: 500ms → 1000ms

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, countries]); // NOVO: adicionado countries como dependência

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
          </div>
        )}

        {/* Exibição de Países - ATUALIZADO com nova função de clique */}
        {!searchQuery && !selectedCountry && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
            {isLoadingCountries ? (
              <p className="text-center text-neutral-500">{t('loadingCountries')}</p>
            ) : isCountriesError ? ( // NOVO: tratamento de erro
              <div className="col-span-full text-center py-8">
                <p className="text-red-500 mb-4">Erro ao carregar países</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
                  Tentar novamente
                </button>
              </div>
            ) : (
              sortedCountries?.map((c) => (
                <Tooltip
                  key={c.cca2}
                  content={
                    <div className="space-y-1">
                      <p><strong>{t("translationsTooltip:countryDetails.capital")}:</strong> {c.capital?.[0] || t("translationsTooltip:countryDetails.notAvailable")}</p>
                      <p><strong>{t("translationsTooltip:countryDetails.region")}:</strong> {t(`translationsTooltip:regions.${c.region.toLowerCase()}`)}</p>
                      <p><strong>{t("translationsTooltip:countryDetails.subregion")}:</strong> {c.subregion || t("translationsTooltip:countryDetails.notAvailable")}</p>
                      <p><strong>{t("translationsTooltip:countryDetails.population")}:</strong> {c.population?.toLocaleString()}</p>
                      <p><strong>{t("translationsTooltip:countryDetails.area")}:</strong> {c.area?.toLocaleString()} km²</p>
                      <p><strong>{t("translationsTooltip:countryDetails.languages")}:</strong> {c.languages ? Object.values(c.languages).join(", ") : t("translationsTooltip:countryDetails.notAvailable")}</p>
                      <p><strong>{t("translationsTooltip:countryDetails.currencies")}:</strong> {c.currencies ? Object.values(c.currencies).map((curr) => curr.name).join(", ") : t("translationsTooltip:countryDetails.notAvailable")}</p>
                    </div>
                  }
                  position="top"
                >
                  <motion.div
                    className={`p-6 border rounded-xl cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 ease-in-out ${isDarkMode ? "bg-neutral-800" : "bg-white"}`}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => handleCountryClick(c)} // ATUALIZADO: nova função
                  >
                    <img 
                      src={c.flags.svg} 
                      alt={c.name.common} 
                      className="w-full h-48 object-cover rounded-lg opacity-90 hover:opacity-100 transition-opacity duration-300" 
                    />
                    <h3 className={`mt-4 text-xl font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {getTranslatedName(c.cca2, 'common') || c.name.common} 
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-gray-600'}`}>
                      {t(`translationsTooltip:regions.${c.region.toLowerCase()}`)}
                    </p>
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