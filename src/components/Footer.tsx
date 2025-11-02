import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaGlobe, FaHeart, FaCode, FaRocket, FaShieldAlt } from 'react-icons/fa';

interface FooterProps {
  isDarkMode: boolean;
}

export function Footer({ isDarkMode }: FooterProps) {
  const { t } = useTranslation('footer');

  const socialLinks = [
    { icon: <FaGithub className="w-5 h-5" />, href: "https://github.com/rwbe", label: "GitHub" },
    { icon: <FaLinkedin className="w-5 h-5" />, href: "https://linkedin.com/in/rwbe", label: "LinkedIn" },
    { icon: <FaGlobe className="w-5 h-5" />, href: "https://devricky.com.br", label: "Website" }
  ];

  const quickLinks = [
    { name: t('home'), href: "/" },
    { name: t('about'), href: "/about" },
    { name: t('feedback'), href: "/feedback" },
    { name: "API REST Countries", href: "https://restcountries.com", external: true }
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className={`relative overflow-hidden ${
      isDarkMode 
        ? 'bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 border-t border-neutral-800' 
        : 'bg-gradient-to-br from-neutral-50 via-white to-neutral-100 border-t border-neutral-200'
    }`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${isDarkMode ? 'ffffff' : '000000'}' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Main Footer Content */}
        <div className="py-16">
          {/* Middle Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <div className="flex items-center mb-6">
                <img
                  src={isDarkMode ? '/logo-dark.png' : '/logo-light.png'}
                  alt="GlobeWay"
                  className="h-10 w-auto"
                  style={{ pointerEvents: "none" }}
                />
              </div>
              <p className={`text-lg leading-relaxed mb-6 max-w-md ${
                isDarkMode ? 'text-neutral-300' : 'text-neutral-600'
              }`}>
                {t('description')}
              </p>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((link, index) => (
                  <motion.a
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-neutral-800/80 hover:bg-blue-600/20 text-neutral-400 hover:text-blue-400 border border-neutral-700/50' 
                        : 'bg-white/80 hover:bg-blue-50 text-neutral-600 hover:text-blue-600 border border-neutral-200/50 shadow-sm'
                    }`}
                    aria-label={link.label}
                  >
                    {link.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className={`text-lg font-semibold mb-6 ${
                isDarkMode ? 'text-white' : 'text-neutral-900'
              }`}>
                {t('quickLinks')}
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <motion.a
                      href={link.href}
                      target={link.external ? "_blank" : "_self"}
                      rel={link.external ? "noopener noreferrer" : ""}
                      whileHover={{ x: 4 }}
                      className={`inline-flex items-center text-sm font-medium transition-colors duration-200 ${
                        isDarkMode 
                          ? 'text-neutral-400 hover:text-blue-400' 
                          : 'text-neutral-600 hover:text-blue-600'
                      }`}
                    >
                      {link.name}
                      {link.external && (
                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      )}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h4 className={`text-lg font-semibold mb-6 ${
                isDarkMode ? 'text-white' : 'text-neutral-900'
              }`}>
                {t('technologies')}
              </h4>
              <div className="space-y-4">
                <div className="flex items-center">
                  <FaCode className={`w-4 h-4 mr-3 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <span className={`text-sm ${
                    isDarkMode ? 'text-neutral-400' : 'text-neutral-600'
                  }`}>
                    React + TypeScript
                  </span>
                </div>
                <div className="flex items-center">
                  <FaRocket className={`w-4 h-4 mr-3 ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`} />
                  <span className={`text-sm ${
                    isDarkMode ? 'text-neutral-400' : 'text-neutral-600'
                  }`}>
                    Framer Motion
                  </span>
                </div>
                <div className="flex items-center">
                  <FaShieldAlt className={`w-4 h-4 mr-3 ${
                    isDarkMode ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                  <span className={`text-sm ${
                    isDarkMode ? 'text-neutral-400' : 'text-neutral-600'
                  }`}>
                    REST Countries API
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className={`py-8 border-t ${
            isDarkMode ? 'border-neutral-800' : 'border-neutral-200'
          }`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className={`flex items-center text-sm ${
              isDarkMode ? 'text-neutral-400' : 'text-neutral-600'
            }`}>
              <span>© {currentYear} GlobeWay. {t('madeWith')}</span>
              <FaHeart className="w-4 h-4 mx-2 text-red-500 animate-pulse" />
              <span>{t('by')}</span>
              <motion.a
                href="https://github.com/rwbe"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                className={`ml-1 font-semibold hover:text-blue-500 transition-colors ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}
              >
                Rwbe
              </motion.a>
            </div>
            <div className={`text-sm ${
              isDarkMode ? 'text-neutral-500' : 'text-neutral-500'
            }`}>
              {t('apiSource')}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600"></div>
    </footer>
  );
}