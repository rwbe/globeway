import { useTranslation } from 'react-i18next';
import { FaGithub, FaLinkedin, FaGlobe } from 'react-icons/fa';

interface FooterProps {
  isDarkMode: boolean;
}

export function Footer({ isDarkMode }: FooterProps) {
  const { t } = useTranslation('footer'); // Namespace para tradução do footer

  return (
    <footer className={`py-8 text-center mt-10 border-t ${isDarkMode ? 'border-neutral-700 text-neutral-400' : 'border-gray-200 text-gray-600'}`}>
      <div className="max-w-7xl mx-auto px-4">

        {/* Ícones Sociais */}
        <div className="flex justify-center gap-6 mt-4">
          <a
            href="https://github.com/rwbe"
            target="_blank"
            rel="noopener noreferrer"
            className={`hover:text-blue-500 transition-colors ${isDarkMode ? 'text-neutral-400' : 'text-gray-600'}`}
            aria-label="GitHub"
          >
            <FaGithub className="w-6 h-6" />
          </a>
          <a
            href="https://linkedin.com/in/rwbe"
            target="_blank"
            rel="noopener noreferrer"
            className={`hover:text-blue-500 transition-colors ${isDarkMode ? 'text-neutral-400' : 'text-gray-600'}`}
            aria-label="LinkedIn"
          >
            <FaLinkedin className="w-6 h-6" />
          </a>
          <a
            href="https://devricky.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className={`hover:text-blue-500 transition-colors ${isDarkMode ? 'text-neutral-400' : 'text-gray-600'}`}
            aria-label="Website"
          >
            <FaGlobe className="w-6 h-6" />
          </a>
        </div>

        {/* Créditos */}
        <p className="text-sm mt-4">
          {t('madeWith')} ❤️ {t('by')}{' '}
          <a
            href="https://github.com/rwbe"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-500 transition-colors"
          >
            Rwbe
          </a>
        </p>
      </div>
    </footer>
  );
}