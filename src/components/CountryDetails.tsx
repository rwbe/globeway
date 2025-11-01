import React from 'react';
import { motion } from 'framer-motion';
import {
  FaUsers, FaMapMarkerAlt, FaClock, FaPhone, FaDollarSign, FaLanguage,
  FaMountain, FaLandmark, FaMoneyBillAlt, FaNetworkWired, FaBuilding,
  FaGlobe, FaHashtag, FaArrowLeft, FaCar, FaMap, FaCalendarAlt,
  FaBookOpen, FaSmile
} from 'react-icons/fa';
import { MdNavigation } from 'react-icons/md';
import type { Country } from '../types/country';
import { useTranslation } from 'react-i18next';

interface CountryDetailsProps {
  country: Country;
  isDarkMode: boolean;
  onGoBack: () => void;
}

export const CountryDetails: React.FC<CountryDetailsProps> = ({ country, isDarkMode, onGoBack }) => {
  const { t } = useTranslation(['details', 'countryNames']);

  // Função para formatar números
  const formatNumber = (num?: number, style: 'decimal' | 'currency' = 'decimal', currency = 'USD') => {
    if (!num && num !== 0) return 'N/A';
    return new Intl.NumberFormat('en-US', { style, currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  };

  const populationDensity = country.area ? (country.population / country.area).toFixed(2) : 'N/A';
  const gdpPerCapita = country.area ? ((country.population * 10000) / country.area).toFixed(2) : 'N/A';
  const formattedGdpPerCapita = gdpPerCapita !== 'N/A'
    ? formatNumber(parseFloat(gdpPerCapita), 'currency')
    : 'N/A';

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const getTranslatedName = (code?: string, type: 'common' | 'official' = 'common') => {
    if (!code) return country.name?.[type] ?? 'N/A';
    const names = t(code, { ns: 'countryNames', returnObjects: true }) as { common: string; official: string };
    return names ? names[type] : country.name?.[type];
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className={`p-6 ${isDarkMode ? 'bg-neutral-900 text-white' : 'bg-gray-50 text-gray-900'}`}
    >
      {/* Botão Voltar */}
      <motion.button
        onClick={onGoBack}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center space-x-2 mb-8 p-2 rounded-lg ${
          isDarkMode ? 'bg-neutral-900 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'
        } transition-colors duration-200`}
      >
        <FaArrowLeft className="w-6 h-6" />
        <span className="text-lg font-medium">{t('back')}</span>
      </motion.button>

      {/* Banner com Nome e Bandeira */}
      <motion.div variants={cardVariants} className={`relative rounded-2xl overflow-hidden shadow-lg mb-8 ${isDarkMode ? 'bg-neutral-900' : 'bg-white'}`}>
        <div className="aspect-video relative">
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            src={country.flags?.svg ?? country.flags?.png ?? '/fallback-flag.png'}
            alt={`Flag of ${country.name?.common ?? 'Unknown'}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col justify-end p-8">
            <h1 className="text-4xl font-bold text-white">
              {getTranslatedName(country.cca3, 'common')}
            </h1>
            <h2 className="text-lg text-gray-200">
              {getTranslatedName(country.cca3, 'official')}
            </h2>
          </div>
        </div>
      </motion.div>

      {/* Informações Principais */}
      <motion.div variants={cardVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <InfoCard icon={<FaUsers className="w-6 h-6" />} title={t('population')} value={formatNumber(country.population)} isDarkMode={isDarkMode} />
        <InfoCard icon={<FaMountain className="w-6 h-6" />} title={t('area')} value={`${formatNumber(country.area)} km²`} isDarkMode={isDarkMode} />
        <InfoCard icon={<FaBuilding className="w-6 h-6" />} title={t('capital')} value={country.capital?.[0] ?? 'N/A'} isDarkMode={isDarkMode} />
      </motion.div>

      {/* Brasão e Dados Avançados */}
      <motion.div variants={cardVariants} className={`grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 ${isDarkMode ? 'bg-neutral-900' : 'bg-white'} rounded-2xl p-8 shadow-lg`}>
        <div className="flex flex-col items-center">
          <FaLandmark className="w-12 h-12 mb-4 text-blue-500" />
          <h2 className="text-2xl font-semibold mb-4">{t('coatOfArms')}</h2>
          {country.coatOfArms?.svg ? (
            <motion.img src={country.coatOfArms.svg} alt={`Coat of Arms of ${country.name?.common ?? 'N/A'}`} className="w-48 h-48 object-contain" />
          ) : (
            <p className="text-neutral-400">N/A</p>
          )}
        </div>
        <div className="space-y-6">
          <InfoCard icon={<FaHashtag className="w-6 h-6" />} title={t('populationDensity')} value={`${populationDensity} people/km²`} isDarkMode={isDarkMode} />
          <InfoCard icon={<FaMoneyBillAlt className="w-6 h-6" />} title={t('gdpPerCapita')} value={formattedGdpPerCapita} isDarkMode={isDarkMode} />
        </div>
      </motion.div>

      {/* Informações Detalhadas */}
      <motion.div variants={cardVariants} className={`${isDarkMode ? 'bg-neutral-900' : 'bg-white'} rounded-2xl p-8 shadow-lg`}>
        <h2 className="text-2xl font-semibold mb-6 flex items-center space-x-3">
          <FaNetworkWired className="w-6 h-6 text-blue-500" />
          <span>{t('countryInformation')}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: <FaMapMarkerAlt />, title: t('continent'), value: country.continents?.join(', ') ?? 'N/A' },
            { icon: <FaClock />, title: t('timeZones'), value: country.timezones?.join(', ') ?? 'N/A' },
            { icon: <FaLanguage />, title: t('languages'), value: Object.values(country.languages ?? {}).join(', ') || 'N/A' },
            { icon: <FaDollarSign />, title: t('currencies'), value: Object.values(country.currencies ?? {}).map((c: any) => `${c.name} (${c.symbol})`).join(', ') || 'N/A' },
            { icon: <FaPhone />, title: t('callingCode'), value: `${country.idd?.root ?? ''}${country.idd?.suffixes?.[0] ?? ''}` || 'N/A' },
            { icon: <FaGlobe />, title: t('domain'), value: country.tld?.[0] ?? 'N/A' },
            { icon: <FaCar />, title: t('drivingSide'), value: country.car?.side ?? 'N/A' },
            { icon: <FaMap />, title: t('region'), value: country.region ?? 'N/A' },
            { icon: <MdNavigation />, title: t('latitudeLongitude'), value: country.latlng ? `${country.latlng[0]}, ${country.latlng[1]}` : 'N/A' },
            { icon: <FaCalendarAlt />, title: t('startOfWeek'), value: country.startOfWeek ?? 'N/A' },
            { icon: <FaBookOpen />, title: t('nativeName'), value: Object.values(country.name?.nativeName ?? {}).map((n: any) => n.common).join(', ') || 'N/A' },
            { icon: <FaSmile />, title: t('demonym'), value: country.demonyms?.eng?.m ?? 'N/A' },
          ].map((item, index) => (
            <InfoCard key={index} icon={item.icon} title={item.title} value={item.value} isDarkMode={isDarkMode} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

const InfoCard: React.FC<{ icon: React.ReactNode; title: string; value: string; isDarkMode: boolean }> = ({ icon, title, value, isDarkMode }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className={`flex items-start space-x-4 p-6 rounded-xl transition-colors duration-200 ${
      isDarkMode ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-neutral-200 hover:bg-neutral-300'
    }`}
  >
    <div className={`${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>{icon}</div>
    <div className="flex-1">
      <h3 className={`text-sm font-medium ${isDarkMode ? 'text-neutral-300' : 'text-neutral-500'}`}>{title}</h3>
      <p className={`mt-1 text-lg font-medium ${isDarkMode ? 'text-neutral-100' : 'text-gray-900'}`}>{value}</p>
    </div>
  </motion.div>
);
