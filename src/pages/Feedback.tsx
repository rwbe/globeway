import { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaHeart, FaBug, FaLightbulb } from 'react-icons/fa';

interface FeedbackProps {
  isDarkMode: boolean;
}

const Feedback: FC<FeedbackProps> = ({ isDarkMode }) => {
  const [selectedFeedbackType, setSelectedFeedbackType] = useState<'bug' | 'feature' | 'general' | ''>('');
  const [rating, setRating] = useState(0);

  // Garantir scroll no topo ao montar o componente
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const feedbackTypes = [
    { id: 'bug', icon: <FaBug />, title: 'Reportar Bug', description: 'Encontrou um problema?' },
    { id: 'feature', icon: <FaLightbulb />, title: 'Sugerir Feature', description: 'Tem uma ideia?' },
    { id: 'general', icon: <FaHeart />, title: 'Feedback Geral', description: 'Compartilhe sua opinião' },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-neutral-900' : 'bg-neutral-50'}`}>
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className={`text-5xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            Deixe seu feedback
          </h1>
          <p className={`text-xl leading-relaxed max-w-2xl mx-auto ${isDarkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>
            No GlobeWay, acreditamos que a melhor forma de evoluir é ouvindo você! Seu feedback é essencial para continuarmos melhorando e tornando a plataforma ainda mais intuitiva e completa.
          </p>
        </motion.div>

        {/* Rating Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`p-8 rounded-3xl mb-8 ${
            isDarkMode ? 'bg-neutral-800/60 border border-neutral-700/30' : 'bg-white/60 border border-neutral-200/30'
          } glass shadow-elegant`}
        >
          <h2 className={`text-2xl font-bold mb-6 text-center ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            Como foi sua experiência?
          </h2>
          <div className="flex justify-center space-x-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                aria-label={`Avaliar com ${star} estrelas`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setRating(star)}
                className={`text-3xl transition-colors duration-200 ${
                  star <= rating ? 'text-yellow-400' : isDarkMode ? 'text-neutral-600' : 'text-neutral-300'
                }`}
              >
                <FaStar />
              </motion.button>
            ))}
          </div>
          {rating > 0 && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center font-medium ${isDarkMode ? 'text-neutral-300' : 'text-neutral-600'}`}
            >
              {rating === 5 && 'Fantástico! 🎉'}
              {rating === 4 && 'Muito bom! 👍'}
              {rating === 3 && 'Bom! 😊'}
              {rating === 2 && 'Pode melhorar 😐'}
              {rating === 1 && 'Precisa melhorar 😞'}
            </motion.p>
          )}
        </motion.div>

        {/* Feedback Types */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {feedbackTypes.map((type, index) => (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              onClick={() => setSelectedFeedbackType(type.id)}
              className={`p-6 rounded-3xl cursor-pointer transition-all duration-300 hover:scale-105 ${
                selectedFeedbackType === type.id
                  ? isDarkMode
                    ? 'bg-primary-900/50 border-2 border-primary-600'
                    : 'bg-primary-50 border-2 border-primary-500'
                  : isDarkMode
                  ? 'bg-neutral-800/80 border border-neutral-700/50 hover:border-neutral-600/70'
                  : 'bg-white/80 border border-neutral-200/50 hover:border-neutral-300/70'
              } glass shadow-gentle hover:shadow-elegant`}
            >
              <div
                className={`text-2xl mb-3 ${
                  selectedFeedbackType === type.id
                    ? 'text-primary-500'
                    : isDarkMode
                    ? 'text-neutral-400'
                    : 'text-neutral-500'
                }`}
              >
                {type.icon}
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                {type.title}
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>
                {type.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Feedback;
