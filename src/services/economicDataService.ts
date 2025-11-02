import axios from 'axios';

interface WorldBankResponse {
  [0]: any; // metadata
  [1]: Array<{
    indicator: {
      id: string;
      value: string;
    };
    country: {
      id: string;
      value: string;
    };
    countryiso3code: string;
    date: string;
    value: number | null;
    unit: string;
    obs_status: string;
    decimal: number;
  }>;
}

interface EconomicData {
  gdp?: {
    total?: number;
    perCapita?: number;
    growthRate?: number;
  };
  economics?: {
    inflationRate?: number;
    unemploymentRate?: number;
    giniIndex?: number;
  };
  demographics?: {
    lifeExpectancy?: number;
    literacyRate?: number;
    urbanization?: number;
  };
}

export class EconomicDataService {
  private static readonly BASE_URL = 'https://api.worldbank.org/v2/country';
  private static readonly INDICATORS = {
    GDP_TOTAL: 'NY.GDP.MKTP.CD', // GDP (current US$)
    GDP_PER_CAPITA: 'NY.GDP.PCAP.CD', // GDP per capita (current US$)
    GDP_GROWTH: 'NY.GDP.MKTP.KD.ZG', // GDP growth (annual %)
    INFLATION: 'FP.CPI.TOTL.ZG', // Inflation, consumer prices (annual %)
    UNEMPLOYMENT: 'SL.UEM.TOTL.ZS', // Unemployment, total (% of total labor force)
    GINI: 'SI.POV.GINI', // GINI index (World Bank estimate)
    LIFE_EXPECTANCY: 'SP.DYN.LE00.IN', // Life expectancy at birth, total (years)
    LITERACY: 'SE.ADT.LITR.ZS', // Literacy rate, adult total (% of people ages 15 and above)
    URBAN_POPULATION: 'SP.URB.TOTL.IN.ZS' // Urban population (% of total population)
  };

  /**
   * Busca dados econômicos de um país específico
   */
  static async fetchEconomicData(countryCode: string): Promise<EconomicData> {
    const economicData: EconomicData = {};

    try {
      // Buscar dados dos últimos 3 anos para ter dados mais recentes disponíveis
      const currentYear = new Date().getFullYear();
      const years = `${currentYear-3}:${currentYear}`;

      // Construir URLs para diferentes indicadores
      const indicators = Object.values(this.INDICATORS).join(';');
      const url = `${this.BASE_URL}/${countryCode}/indicator/${indicators}?format=json&date=${years}&per_page=100`;

      console.log(`🏦 Buscando dados econômicos para ${countryCode}...`);
      
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'GlobeWay-App/1.0'
        }
      });

      if (response.data && Array.isArray(response.data) && response.data[1]) {
        const data = response.data[1] as WorldBankResponse[1];
        
        // Processar dados por indicador
        const latestData = this.processWorldBankData(data);
        
        // Organizar dados por categoria
        economicData.gdp = {
          total: latestData[this.INDICATORS.GDP_TOTAL],
          perCapita: latestData[this.INDICATORS.GDP_PER_CAPITA],
          growthRate: latestData[this.INDICATORS.GDP_GROWTH]
        };

        economicData.economics = {
          inflationRate: latestData[this.INDICATORS.INFLATION],
          unemploymentRate: latestData[this.INDICATORS.UNEMPLOYMENT],
          giniIndex: latestData[this.INDICATORS.GINI]
        };

        economicData.demographics = {
          lifeExpectancy: latestData[this.INDICATORS.LIFE_EXPECTANCY],
          literacyRate: latestData[this.INDICATORS.LITERACY],
          urbanization: latestData[this.INDICATORS.URBAN_POPULATION]
        };

        console.log(`✅ Dados econômicos carregados para ${countryCode}`);
      }
    } catch (error) {
      console.warn(`⚠️ Erro ao buscar dados econômicos para ${countryCode}:`, error);
      // Não quebrar a aplicação se os dados econômicos falharem
    }

    return economicData;
  }

  /**
   * Processa dados do World Bank e retorna os valores mais recentes disponíveis
   */
  private static processWorldBankData(data: WorldBankResponse[1]): Record<string, number> {
    const result: Record<string, number> = {};

    // Agrupar por indicador
    const groupedByIndicator: Record<string, typeof data> = {};
    
    data.forEach(item => {
      if (!groupedByIndicator[item.indicator.id]) {
        groupedByIndicator[item.indicator.id] = [];
      }
      groupedByIndicator[item.indicator.id].push(item);
    });

    // Para cada indicador, pegar o valor mais recente disponível
    Object.keys(groupedByIndicator).forEach(indicatorId => {
      const indicatorData = groupedByIndicator[indicatorId]
        .filter(item => item.value !== null && item.value !== undefined)
        .sort((a, b) => parseInt(b.date) - parseInt(a.date)); // Ordenar por ano decrescente

      if (indicatorData.length > 0) {
        result[indicatorId] = indicatorData[0].value!;
      }
    });

    return result;
  }

  /**
   * Busca dados econômicos para múltiplos países (otimizado para cache)
   */
  static async fetchMultipleCountriesData(countryCodes: string[]): Promise<Record<string, EconomicData>> {
    const results: Record<string, EconomicData> = {};
    
    // Processar em lotes para não sobrecarregar a API
    const batchSize = 5;
    for (let i = 0; i < countryCodes.length; i += batchSize) {
      const batch = countryCodes.slice(i, i + batchSize);
      const batchPromises = batch.map(code => 
        this.fetchEconomicData(code).then(data => ({ code, data }))
      );
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        batchResults.forEach(result => {
          if (result.status === 'fulfilled') {
            results[result.value.code] = result.value.data;
          }
        });
        
        // Pequeno delay entre lotes para ser respeitoso com a API
        if (i + batchSize < countryCodes.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.warn('Erro ao processar lote de dados econômicos:', error);
      }
    }

    return results;
  }
}