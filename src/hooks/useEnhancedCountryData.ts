import { useQuery } from 'react-query';
import { EconomicDataService } from '../services/economicDataService';
import type { Country } from '../types/country';

/**
 * Hook para buscar dados econômicos complementares de um país
 */
export const useEnhancedCountryData = (country: Country | null) => {
  return useQuery(
    ['economicData', country?.cca3],
    async () => {
      if (!country?.cca3) return null;
      
      console.log(`📊 Buscando dados econômicos para ${country.name.common}...`);
      const economicData = await EconomicDataService.fetchEconomicData(country.cca3);
      
      // Combinar dados do país com dados econômicos
      const enhancedCountry: Country = {
        ...country,
        ...economicData
      };

      return enhancedCountry;
    },
    {
      enabled: !!country?.cca3,
      staleTime: 30 * 60 * 1000, // 30 minutos
      cacheTime: 60 * 60 * 1000, // 1 hora
      retry: 1,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        if (data) {
          console.log(`✅ Dados econômicos integrados para ${data.name.common}`);
        }
      },
      onError: (error) => {
        console.warn('Erro ao carregar dados econômicos:', error);
      }
    }
  );
};

/**
 * Hook para pré-carregar dados econômicos de múltiplos países
 */
export const useBulkEconomicData = (countries: Country[], enabled: boolean = false) => {
  return useQuery(
    ['bulkEconomicData', countries?.length],
    async () => {
      if (!countries || countries.length === 0) return {};
      
      console.log(`📊 Pré-carregando dados econômicos para ${countries.length} países...`);
      
      // Selecionar apenas países principais para não sobrecarregar
      const majorCountries = countries
        .filter(c => c.population && c.population > 1000000) // Apenas países com mais de 1M habitantes
        .slice(0, 20) // Limitar a 20 países principais
        .map(c => c.cca3);

      const economicData = await EconomicDataService.fetchMultipleCountriesData(majorCountries);
      
      console.log(`✅ Dados econômicos pré-carregados para ${Object.keys(economicData).length} países`);
      return economicData;
    },
    {
      enabled: enabled && !!countries && countries.length > 0,
      staleTime: 60 * 60 * 1000, // 1 hora
      cacheTime: 2 * 60 * 60 * 1000, // 2 horas
      retry: 1,
      refetchOnWindowFocus: false
    }
  );
};