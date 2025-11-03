import { FC, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaGlobe, FaSearch, FaLanguage, FaMicrophone, FaChartBar, FaMobile } from 'react-icons/fa';

interface AboutProps {
  isDarkMode: boolean;
}

const About: FC<AboutProps> = ({ isDarkMode }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const features = [
    {
      icon: <FaGlobe className="w-8 h-8" />,
      title: "Explore Países",
      description: "Descubra informações detalhadas sobre todos os países do mundo com dados atualizados."
    },
    {
      icon: <FaSearch className="w-8 h-8" />,
      title: "Busca Inteligente",
      description: "Sistema de busca avançado com sugestões em tempo real e filtros personalizados."
    },
    {
      icon: <FaMicrophone className="w-8 h-8" />,
      title: "Busca por Voz",
      description: "Use comandos de voz para encontrar países de forma rápida e intuitiva."
    },
    {
      icon: <FaLanguage className="w-8 h-8" />,
      title: "Multilíngue",
      description: "Interface disponível em português e inglês com traduções automáticas."
    },
    {
      icon: <FaChartBar className="w-8 h-8" />,
      title: "Dados Estatísticos",
      description: "Visualize estatísticas detalhadas como população, área, economia e muito mais."
    },
    {
      icon: <FaMobile className="w-8 h-8" />,
      title: "Design Responsivo",
      description: "Experiência otimizada para desktop, tablet e dispositivos móveis."
    }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-neutral-900' : 'bg-neutral-50'}`}>
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-24">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className={`text-5xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-neutral-900'
          }`}>
            Sobre o <span className="text-gradient">GlobeWay</span>
          </h1>
          <p className={`text-xl leading-relaxed max-w-3xl mx-auto ${
            isDarkMode ? 'text-neutral-300' : 'text-neutral-600'
          }`}>
            Uma aplicação moderna e intuitiva para explorar informações sobre países ao redor do mundo, 
            desenvolvida com as mais recentes tecnologias web.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className={`p-8 rounded-3xl transition-all duration-300 hover:scale-105 ${
                isDarkMode 
                  ? 'bg-neutral-800/80 border border-neutral-700/50 hover:border-neutral-600/70' 
                  : 'bg-white/80 border border-neutral-200/50 hover:border-neutral-300/70'
              } glass shadow-gentle hover:shadow-elegant`}
            >
              <div className={`mb-4 ${isDarkMode ? 'text-primary-400' : 'text-primary-600'}`}>
                {feature.icon}
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${
                isDarkMode ? 'text-white' : 'text-neutral-900'
              }`}>
                {feature.title}
              </h3>
              <p className={`leading-relaxed ${
                isDarkMode ? 'text-neutral-300' : 'text-neutral-600'
              }`}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Technology Stack */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className={`p-10 rounded-3xl mb-16 ${
            isDarkMode 
              ? 'bg-neutral-800/60 border border-neutral-700/30' 
              : 'bg-white/60 border border-neutral-200/30'
          } glass shadow-elegant`}
        >
          <h2 className={`text-3xl font-bold mb-8 text-center ${
            isDarkMode ? 'text-white' : 'text-neutral-900'
          }`}>
            Tecnologias Utilizadas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'React Query', 'Vite', 'REST Countries API', 'i18next'].map((tech, index) => (
              <motion.div
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.05 * index }}
                className={`p-4 rounded-2xl text-center font-medium transition-colors duration-200 ${
                  isDarkMode 
                    ? 'bg-neutral-700/50 text-neutral-200 hover:bg-neutral-600/50' 
                    : 'bg-neutral-100/50 text-neutral-700 hover:bg-neutral-200/50'
                }`}
              >
                {tech}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* API Information */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className={`p-10 rounded-3xl ${
            isDarkMode 
              ? 'bg-neutral-800/60 border border-neutral-700/30' 
              : 'bg-white/60 border border-neutral-200/30'
          } glass shadow-elegant`}
        >
          <h2 className={`text-3xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-neutral-900'
          }`}>
            Fonte de Dados
          </h2>
          <p className={`text-lg leading-relaxed mb-6 ${
            isDarkMode ? 'text-neutral-300' : 'text-neutral-600'
          }`}>
            Utilizamos a <span className="font-semibold text-primary-600">REST Countries API</span>, 
            uma API gratuita e confiável que fornece informações atualizadas sobre todos os países do mundo, 
            incluindo dados demográficos, geográficos, econômicos e culturais.
          </p>
          <div className="flex flex-wrap gap-4">
            {['195 Países', 'Dados Atualizados', 'API Gratuita', 'JSON Format'].map((tag, index) => (
              <span
                key={index}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  isDarkMode 
                    ? 'bg-primary-900/50 text-primary-300 border border-primary-700/50' 
                    : 'bg-primary-50 text-primary-700 border border-primary-200'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
