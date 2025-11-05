import React from 'react';
import { motion } from 'framer-motion';
import {
  FaArrowLeft,
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
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-12">
        {/* Content sections will be added in subsequent commits */}
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