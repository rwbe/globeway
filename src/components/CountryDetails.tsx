import React from 'react';
import { motion } from 'framer-motion';
import {
  FaUsers,
  FaMapMarkerAlt,
  FaClock,
  FaPhone,
  FaDollarSign,
  FaLanguage,
  FaMountain,
  FaMoneyBillAlt,
  FaBuilding,
  FaGlobe,
  FaHashtag,
  FaArrowLeft,
  FaMap,
  FaChartLine,
  FaPercentage,
  FaGraduationCap,
} from 'react-icons/fa';
import type { Country } from '../types/country';
import { useTranslation } from 'react-i18next';
import { useEnhancedCountryData } from '../hooks/useEnhancedCountryData';

interface CountryDetailsProps {
  country: Country;
  isDarkMode: boolean;
  onGoBack: () => void;
}

export const CountryDetails: React.FC<CountryDetailsProps> = ({ country, isDarkMode, onGoBack }) => {
  const { t } = useTranslation(['details', 'countryNames']);
  
  // Fetch enhanced economic data
  const { data: enhancedCountry, isLoading: isLoadingEconomic } = useEnhancedCountryData(country);
  const displayCountry = enhancedCountry || country;

  // Safe number formatting with error handling
  const formatNumber = (num: number | undefined, style: 'decimal' | 'currency' = 'decimal', currency: string = 'USD') => {
    if (!num || isNaN(num)) return t('notAvailable');
    try {
      return new Intl.NumberFormat('en-US', {
        style,
        currency,
        minimumFractionDigits: style === 'currency' ? 2 : 0,
        maximumFractionDigits: style === 'currency' ? 2 : 0,
      }).format(num);
    } catch (error) {
      return num.toString();
    }
  };

  // Safe percentage formatting
  const formatPercentage = (num: number | undefined) => {
    if (!num || isNaN(num)) return t('notAvailable');
    return `${num.toFixed(1)}%`;
  };

  // Safe calculations with error handling
  const populationDensity = displayCountry.population && displayCountry.area ? 
    (displayCountry.population / displayCountry.area).toFixed(2) : undefined;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Safe function to get translated names with fallback
  const getTranslatedName = (code: string, type: 'common' | 'official') => {
    try {
      const names = t(code, { ns: 'countryNames', returnObjects: true }) as { common: string; official: string };
      if (names && typeof names === 'object' && names[type]) {
        return names[type];
      }
    } catch (error) {
      console.warn('Translation error for country:', code, error);
    }
    // Fallback to original country name
    return displayCountry.name?.[type] || displayCountry.name?.common || 'Unknown';
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      className={`min-h-screen ${isDarkMode ? 'bg-neutral-950' : 'bg-neutral-50'}`}
    >
      {/* Fixed minimalist header with backdrop blur */}
      <div className={`fixed top-[72px] left-0 right-0 z-40 backdrop-blur-2xl border-b ${
        isDarkMode ? 'bg-black/60 border-neutral-800/30' : 'bg-white/60 border-neutral-200/30'
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.button
            onClick={onGoBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center space-x-3 px-4 py-2 rounded-full transition-all duration-200 ${
              isDarkMode 
                ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white' 
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <FaArrowLeft className="w-4 h-4" />
            <span className="font-medium">{t('back')}</span>
          </motion.button>
          
          <div className="flex items-center space-x-4">
            {displayCountry.flags?.svg && (
              <img 
                src={displayCountry.flags.svg} 
                alt={`Flag of ${displayCountry.name?.common}`}
                className="w-8 h-6 object-cover rounded shadow-sm"
              />
            )}
          </div>
        </div>
      </div>

      {/* Main content container */}
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-12 space-y-12">
        {/* Hero Section with Large Flag Display */}
        <motion.div
          variants={cardVariants}
          className="text-center space-y-8"
        >
          {/* Large Flag Display with Elegant Styling */}
          {displayCountry.flags?.svg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center"
            >
              <div className={`relative rounded-3xl overflow-hidden shadow-2xl ${
                isDarkMode ? 'ring-4 ring-neutral-800/50' : 'ring-4 ring-neutral-200/50'
              }`}
                style={{ maxWidth: '400px', width: '100%' }}
              >
                <img 
                  src={displayCountry.flags.svg} 
                  alt={`Flag of ${displayCountry.name?.common}`}
                  className="w-full h-auto object-cover"
                  style={{ aspectRatio: '3/2' }}
                />
              </div>
            </motion.div>
          )}

          {/* Country Names Section */}
          <div className="space-y-3">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-5xl md:text-6xl font-light tracking-tight ${
                isDarkMode ? 'text-white' : 'text-neutral-900'
              }`}
            >
              {getTranslatedName(displayCountry.cca3 || '', 'common')}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-xl font-light ${
                isDarkMode ? 'text-neutral-400' : 'text-neutral-600'
              }`}
            >
              {getTranslatedName(displayCountry.cca3 || '', 'official')}
            </motion.p>
          </div>
          
          {/* Capital City Badge */}
          {displayCountry.capital?.[0] && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className={`inline-flex items-center space-x-2 px-6 py-3 rounded-full ${
                isDarkMode ? 'bg-neutral-900 text-neutral-300' : 'bg-neutral-100 text-neutral-700'
              }`}
            >
              <FaBuilding className="w-4 h-4" />
              <span className="font-medium">{displayCountry.capital[0]}</span>
            </motion.div>
          )}
        </motion.div>

        {/* Core Statistics Cards */}
        <motion.div
          variants={cardVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <StatCard
            icon={<FaUsers className="w-6 h-6" />}
            label={t('population')}
            value={formatNumber(displayCountry.population)}
            isDarkMode={isDarkMode}
          />
          <StatCard
            icon={<FaMountain className="w-6 h-6" />}
            label={t('area')}
            value={displayCountry.area ? `${formatNumber(displayCountry.area)} km²` : t('notAvailable')}
            isDarkMode={isDarkMode}
          />
          <StatCard
            icon={<FaHashtag className="w-6 h-6" />}
            label={t('populationDensity')}
            value={populationDensity ? `${populationDensity} /km²` : t('notAvailable')}
            isDarkMode={isDarkMode}
          />
        </motion.div>

        {/* Economic Data Section - Only show if available */}
        {(displayCountry.gdp || displayCountry.economics || displayCountry.demographics) && (
          <motion.div
            variants={cardVariants}
            className="space-y-6"
          >
            <h2 className={`text-2xl font-light ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
              {t('economicData')}
            </h2>
            
            {/* Loading state for economic data */}
            {isLoadingEconomic && (
              <div className="flex items-center justify-center py-8">
                <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                  isDarkMode ? 'border-white' : 'border-neutral-900'
                }`}></div>
              </div>
            )}
            
            {/* Economic Data Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayCountry.gdp?.total && (
                <StatCard
                  icon={<FaChartLine className="w-5 h-5" />}
                  label={t('gdpTotal')}
                  value={formatNumber(displayCountry.gdp.total, 'currency')}
                  isDarkMode={isDarkMode}
                />
              )}
              {displayCountry.gdp?.perCapita && (
                <StatCard
                  icon={<FaMoneyBillAlt className="w-5 h-5" />}
                  label={t('gdpPerCapita')}
                  value={formatNumber(displayCountry.gdp.perCapita, 'currency')}
                  isDarkMode={isDarkMode}
                />
              )}
              {displayCountry.gdp?.growthRate && (
                <StatCard
                  icon={<FaPercentage className="w-5 h-5" />}
                  label={t('gdpGrowth')}
                  value={formatPercentage(displayCountry.gdp.growthRate)}
                  isDarkMode={isDarkMode}
                />
              )}
              {displayCountry.economics?.inflationRate && (
                <StatCard
                  icon={<FaPercentage className="w-5 h-5" />}
                  label={t('inflationRate')}
                  value={formatPercentage(displayCountry.economics.inflationRate)}
                  isDarkMode={isDarkMode}
                />
              )}
              {displayCountry.economics?.unemploymentRate && (
                <StatCard
                  icon={<FaPercentage className="w-5 h-5" />}
                  label={t('unemploymentRate')}
                  value={formatPercentage(displayCountry.economics.unemploymentRate)}
                  isDarkMode={isDarkMode}
                />
              )}
              {displayCountry.demographics?.lifeExpectancy && (
                <StatCard
                  icon={<FaGraduationCap className="w-5 h-5" />}
                  label={t('lifeExpectancy')}
                  value={`${displayCountry.demographics.lifeExpectancy.toFixed(1)} anos`}
                  isDarkMode={isDarkMode}
                />
              )}
            </div>
          </motion.div>
        )}

        {/* Basic Country Information Grid */}
        <motion.div
          variants={cardVariants}
          className="space-y-6"
        >
          <h2 className={`text-2xl font-light ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            {t('countryInformation')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoCard
              icon={<FaMapMarkerAlt className="w-5 h-5" />}
              label={t('continent')}
              value={displayCountry.continents?.join(', ') || t('notAvailable')}
              isDarkMode={isDarkMode}
            />
            <InfoCard
              icon={<FaMap className="w-5 h-5" />}
              label={t('region')}
              value={displayCountry.region || t('notAvailable')}
              isDarkMode={isDarkMode}
            />
            <InfoCard
              icon={<FaLanguage className="w-5 h-5" />}
              label={t('languages')}
              value={displayCountry.languages ? Object.values(displayCountry.languages).join(', ') : t('notAvailable')}
              isDarkMode={isDarkMode}
            />
            <InfoCard
              icon={<FaDollarSign className="w-5 h-5" />}
              label={t('currencies')}
              value={displayCountry.currencies ? 
                Object.values(displayCountry.currencies).map(c => `${c.name} (${c.symbol || 'N/A'})`).join(', ') : t('notAvailable')}
              isDarkMode={isDarkMode}
            />
            <InfoCard
              icon={<FaClock className="w-5 h-5" />}
              label={t('timeZones')}
              value={displayCountry.timezones?.slice(0, 3).join(', ') || t('notAvailable')}
              isDarkMode={isDarkMode}
            />
            <InfoCard
              icon={<FaPhone className="w-5 h-5" />}
              label={t('callingCode')}
              value={displayCountry.idd ? `${displayCountry.idd.root}${displayCountry.idd.suffixes?.[0] || ''}` : t('notAvailable')}
              isDarkMode={isDarkMode}
            />
            <InfoCard
              icon={<FaGlobe className="w-5 h-5" />}
              label={t('domain')}
              value={displayCountry.tld?.[0] || t('notAvailable')}
              isDarkMode={isDarkMode}
            />
          </div>
        </motion.div>

        {/* Additional sections will be added in next commits */}
      </div>
    </motion.div>
  );
};

// Minimalist StatCard component
const StatCard: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  value: string | React.ReactNode; 
  isDarkMode: boolean 
}> = ({ icon, label, value, isDarkMode }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className={`p-8 rounded-2xl border transition-all duration-200 ${
      isDarkMode 
        ? 'bg-neutral-900 border-neutral-800 hover:border-neutral-700' 
        : 'bg-white border-neutral-200 hover:border-neutral-300'
    } shadow-sm hover:shadow-md`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
        {icon}
      </div>
    </div>
    <div className="space-y-2">
      <p className={`text-sm font-medium ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
        {label}
      </p>
      <p className={`text-2xl font-light ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
        {value}
      </p>
    </div>
  </motion.div>
);

// Minimalist InfoCard component
const InfoCard: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  value: string | React.ReactNode; 
  isDarkMode: boolean 
}> = ({ icon, label, value, isDarkMode }) => (
  <motion.div
    whileHover={{ y: -1 }}
    className={`p-6 rounded-xl border transition-all duration-200 ${
      isDarkMode 
        ? 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700' 
        : 'bg-white/50 border-neutral-200 hover:border-neutral-300'
    } backdrop-blur-sm`}
  >
    <div className="flex items-start space-x-3">
      <div className={`mt-1 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
          {label}
        </p>
        <div className={`font-light leading-relaxed break-words ${isDarkMode ? 'text-neutral-200' : 'text-neutral-800'}`}>
          {value}
        </div>
      </div>
    </div>
  </motion.div>
);