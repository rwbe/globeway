import { TFunction } from 'i18next';

// Função para traduzir sub-regiões
export const translateSubregion = (subregion: string | undefined, t: TFunction): string => {
  if (!subregion) return t("countryDetails.notAvailable"); // Retorna "N/A" se subregion for undefined ou null
  const key = `subregions.${subregion.toLowerCase().replace(/ /g, '_')}`;
  return t(key) || subregion; // Retorna a tradução ou o valor original
};

// Função para traduzir idiomas
export const translateLanguages = (languages: { [key: string]: string } | undefined, t: TFunction): string => {
  if (!languages) return t("countryDetails.notAvailable"); // Retorna "N/A" se languages for undefined ou null
  return Object.values(languages)
    .map((lang) => {
      const key = `languages.${lang.toLowerCase().replace(/ /g, '_')}`;
      return t(key) || lang; // Retorna a tradução ou o valor original
    })
    .join(", ");
};
