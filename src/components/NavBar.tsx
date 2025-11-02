import { Link } from "react-router-dom";
import { Sun, Moon, Github, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from 'react-i18next';

interface NavbarProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  handleGoBack: () => void;
}

const Navbar = ({ isDarkMode, toggleDarkMode, handleGoBack }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, i18n } = useTranslation('navbar');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isDarkMode 
          ? "bg-black/60 backdrop-blur-2xl border-b border-neutral-800/30" 
          : "bg-white/60 backdrop-blur-2xl border-b border-neutral-200/30"
      }`}
      style={{
        background: isDarkMode 
          ? 'linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.6))' 
          : 'linear-gradient(to bottom, rgba(255,255,255,0.8), rgba(255,255,255,0.6))'
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group" 
            onClick={handleGoBack}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex items-center justify-center"
            >
              <img 
                src={isDarkMode ? "/logo-dark.png" : "/logo-light.png"}
                alt="GlobeWay Logo"
                className="h-10 w-auto object-contain"
              />
            </motion.div>
          </Link>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            {[
              { to: "/", label: t('home'), onClick: handleGoBack },
              { to: "/about", label: t('about') },
              { to: "/feedback", label: t('feedback') }
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={item.onClick}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                  isDarkMode 
                    ? "text-neutral-300 hover:text-white hover:bg-neutral-800/50" 
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-2">
            {/* Language Toggle (PT <-> EN) */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const languages = ['pt', 'en'];
                const currentIndex = languages.indexOf(i18n.language);
                const nextIndex = (currentIndex + 1) % languages.length;
                changeLanguage(languages[nextIndex]);
              }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                isDarkMode 
                  ? "bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700" 
                  : "bg-neutral-100/50 hover:bg-neutral-200/50 border border-neutral-200"
              }`}
              title="Alternar idioma / Change language"
            >
              <img 
                src={`/languages/${i18n.language}.png`}
                alt={i18n.language === 'pt' ? "Português" : "English"} 
                className="w-5 h-5 rounded-sm object-cover"
              />
            </motion.button>

            {/* GitHub Link */}
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="https://github.com/rwbe"
              target="_blank"
              rel="noopener noreferrer"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                isDarkMode 
                  ? "bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700" 
                  : "bg-neutral-100/50 hover:bg-neutral-200/50 border border-neutral-200"
              }`}
            >
              <Github className={`w-4 h-4 ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`} />
            </motion.a>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                isDarkMode 
                  ? "bg-gradient-to-br from-yellow-600 to-orange-600 text-white shadow-lg" 
                  : "bg-gradient-to-br from-neutral-700 to-neutral-900 text-white shadow-lg"
              }`}
            >
              <motion.div
                initial={false}
                animate={{ rotate: isDarkMode ? 0 : 180 }}
                transition={{ duration: 0.3 }}
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </motion.div>
            </motion.button>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleMenu}
              className={`md:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                isDarkMode 
                  ? "bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700" 
                  : "bg-neutral-100/50 hover:bg-neutral-200/50 border border-neutral-200"
              }`}
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </motion.div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`md:hidden border-t ${
              isDarkMode 
                ? "bg-neutral-950/95 border-neutral-800/50" 
                : "bg-white/95 border-neutral-200/50"
            } backdrop-blur-xl`}
          >
            <div className="max-w-7xl mx-auto px-6 py-4 space-y-2">
              {[
                { to: "/", label: t('home'), onClick: () => { handleGoBack(); toggleMenu(); } },
                { to: "/about", label: t('about'), onClick: toggleMenu },
                { to: "/feedback", label: t('feedback'), onClick: toggleMenu }
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={item.onClick}
                  className={`block px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isDarkMode 
                      ? "text-neutral-300 hover:text-white hover:bg-neutral-800/50" 
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
