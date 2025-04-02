import { FC } from 'react';
import { useTranslation } from 'react-i18next'; 
import { FaGithub, FaEnvelope } from 'react-icons/fa'; 

interface FeedbackProps {
  isDarkMode: boolean;
}

const Feedback: FC<FeedbackProps> = ({ isDarkMode }) => {
  const { t } = useTranslation('feedback'); 
  return (
    <div className={`max-w-5xl mx-auto p-12 rounded-lg transition-colors duration-200 ${isDarkMode ? 'bg-neutral-900 text-neutral-300' : 'text-gray-900'}`}>
      <h1 className="text-3xl font-bold mb-4" dangerouslySetInnerHTML={{ __html: t('title') }} />
      
      <p className="text-lg" dangerouslySetInnerHTML={{ __html: t('description') }} />

      <div className="my-8">
        <div className="border-t-2 border-gray-400/50 dark:border-gray-600/50"></div>
      </div>

      <p className="mt-4 text-lg" dangerouslySetInnerHTML={{ __html: t('shareOpinion') }} />

      <ul className="list-disc ml-6 mt-2 text-lg">
        {(t('shareList', { returnObjects: true }) as string[]).map((item: string, index: number) => (
          <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
        ))}
      </ul>

      <div className="my-8">
        <div className="border-t-2 border-gray-400/50 dark:border-gray-600/50"></div>
      </div>

      <p className="mt-4 text-lg" dangerouslySetInnerHTML={{ __html: t('teamMessage') }} />

      <h2 className="text-2xl font-semibold mt-6" dangerouslySetInnerHTML={{ __html: t('connectWithUs') }} />
      <p className="mt-2 text-lg" dangerouslySetInnerHTML={{ __html: t('connectWithUsDescription') }} />

      <div className="flex space-x-6 mt-4">
        <a href="https://github.com/rwbe" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-gray-800">
          <FaGithub />
        </a>
        <a href="mailto:rwbemiliano@email.com" className="text-2xl hover:text-gray-700">
          <FaEnvelope />
        </a>
      </div>

      <div className="my-8">
        <div className="border-t-2 border-gray-400/50 dark:border-gray-600/50"></div>
      </div>

      <p className="mt-6 text-lg italic" dangerouslySetInnerHTML={{ __html: t('finalMessage') }} />
    </div>
  );
};

export default Feedback;
