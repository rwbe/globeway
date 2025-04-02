import { useTranslation } from 'react-i18next';

export const useTranslatedCountryNames = () => {
  const { t } = useTranslation('countryNames');

  const getTranslatedName = (code: string, type: 'common' | 'official') => {
    const names = t(code, { returnObjects: true }) as { common: string; official: string };
    return names ? names[type] : null; // Retorna o nome traduzido ou null se não houver tradução
  };

  return { getTranslatedName };
};