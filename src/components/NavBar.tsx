import { Link } from "react-router-dom";
import { Sun, Moon, Github, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from 'react-i18next'; // Importe o useTranslation

interface NavbarProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  handleGoBack: () => void;
}

const Navbar = ({ isDarkMode, toggleDarkMode, handleGoBack }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, i18n } = useTranslation('navbar'); // Use o namespace 'navbar'

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Função para mudar o idioma
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header
      className={`${
        isDarkMode ? "bg-neutral-800/90 text-neutral-300" : "bg-white/90 text-black"
      } shadow-sm backdrop-blur-md`}
    >
       <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
         {/* Logo */}
         <Link to="/" className="flex items-center" onClick={handleGoBack}>
         {/* Alternando a logo conforme o tema */}
         <img
           src={isDarkMode ? "/logo-dark.png" : "/logo-light.png"} 
           alt="GlobeWay Logo"
           className="w-40 h-26 object-contain mb-2.5" 
         />
       </Link>

        {/* Links de navegação (Desktop) */}
        <nav className="hidden md:flex space-x-6">
          <Link
            to="/"
            onClick={handleGoBack}
            className={`text-lg font-medium transition hover:text-blue-500 ${
              isDarkMode ? "text-neutral-300 hover:text-neutral-100" : "text-gray-700"
            }`}
          >
            {t('home')}
          </Link>
          <Link
            to="/about"
            className={`text-lg font-medium transition hover:text-blue-500 ${
              isDarkMode ? "text-neutral-300 hover:text-neutral-100" : "text-gray-700"
            }`}
          >
            {t('about')}
          </Link>
          <Link
            to="/feedback"
            className={`text-lg font-medium transition hover:text-blue-500 ${
              isDarkMode ? "text-neutral-300 hover:text-neutral-100" : "text-gray-700"
            }`}
          >
            {t('feedback')}
          </Link>
        </nav>

        {/* Ícones de Ação */}
        <div className="flex items-center space-x-4">
          {/* Seletor de Idioma com Imagens */}
          <button
            onClick={() => changeLanguage(i18n.language === 'pt' ? 'en' : 'pt')}
            className="p-1 rounded-full w-12 h-12 flex items-center justify-center border-1 border-blue-500 hover:bg-blue-500 hover:border-blue-500 transition"
          >
            {i18n.language === 'pt' ? (
              <img src="/languages/pt.png" alt="Brasil" className="w-7 h-7" />
            ) : (
              <img src="/languages/en.png" alt="Estados Unidos" className="w-7 h-7" />
            )}
          </button>

          {/* Link do GitHub */}
          <a
            href="https://github.com/rwbe"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 transition hover:text-blue-500 hover:scale-110"
          >
            <Github size={23} />
          </a>

          {/* Botão de alternância de tema */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded transition hover:scale-110"
          >
            {isDarkMode ? (
              <Sun size={24} className="hover:text-blue-500 text-yellow-400" />
            ) : (
              <Moon size={24} className="hover:text-blue-500 text-gray-800" />
            )}
          </button>

          {/* Botão do Menu Mobile */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded transition hover:bg-neutral-700/50"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Menu Mobile */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`md:hidden ${isDarkMode ? "bg-neutral-900 text-neutral-300" : "bg-white text-gray-900"} shadow-md`}
          >
            <Link
              to="/"
              onClick={() => {
                handleGoBack();
                toggleMenu();
              }}
              className={`block px-4 py-3 text-lg font-medium transition ${
                isDarkMode
                  ? "hover:bg-neutral-800 hover:text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {t('home')}
            </Link>
            <Link
              to="/about"
              onClick={toggleMenu}
              className={`block px-4 py-3 text-lg font-medium transition ${
                isDarkMode
                  ? "hover:bg-neutral-800 hover:text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {t('about')}
            </Link>
            <Link
              to="/feedback"
              onClick={toggleMenu}
              className={`block px-4 py-3 text-lg font-medium transition ${
                isDarkMode
                  ? "hover:bg-neutral-800 hover:text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {t('feedback')}
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
