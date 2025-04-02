import { FC } from 'react';
import { useTranslation } from 'react-i18next';

interface AboutProps {
  isDarkMode: boolean;
}

const About: FC<AboutProps> = ({ isDarkMode }) => {
  const { t } = useTranslation('about');

  // Função auxiliar para garantir que o valor retornado por t seja um array
  const getArray = (key: string) => {
    const value = t(key, { returnObjects: true });
    return Array.isArray(value) ? value : [value];
  };

  return (
    <div className={`max-w-5xl mx-auto p-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      <h1 className="text-3xl font-bold mb-4">{t('title')}</h1>
      <p className="text-lg" dangerouslySetInnerHTML={{ __html: t('description') }} />
      <p className="mt-4 text-lg" dangerouslySetInnerHTML={{ __html: t('apiDescription') }} />

      <div className="my-8">
        <div className="border-t-2 border-gray-400/50 dark:border-gray-600/50"></div>
      </div>

      <h2 className="text-2xl font-semibold mt-6" dangerouslySetInnerHTML={{ __html: t('searchTitle') }} />
      <p className="mt-2 text-lg" dangerouslySetInnerHTML={{ __html: t('searchDescription') }} />
      <ul className="mt-4 text-lg list-disc list-inside">
        {getArray('searchFeatures').map((feature, index) => (
          <li key={index} dangerouslySetInnerHTML={{ __html: feature }} />
        ))}
      </ul>

      <div className="my-8">
        <div className="border-t-2 border-gray-400/50 dark:border-gray-600/50"></div>
      </div>

      <h2 className="text-2xl font-semibold mt-6" dangerouslySetInnerHTML={{ __html: t('detailsTitle') }} />
      <p className="mt-2 text-lg" dangerouslySetInnerHTML={{ __html: t('detailsDescription') }} />
      <ul className="mt-4 text-lg list-disc list-inside">
        {getArray('detailsFeatures').map((feature, index) => (
          <li key={index} dangerouslySetInnerHTML={{ __html: feature }} />
        ))}
      </ul>

      <div className="my-8">
        <div className="border-t-2 border-gray-400/50 dark:border-gray-600/50"></div>
      </div>

      <h2 className="text-2xl font-semibold mt-6" dangerouslySetInnerHTML={{ __html: t('statsTitle') }} />
      <p className="mt-2 text-lg" dangerouslySetInnerHTML={{ __html: t('statsDescription') }} />
      <ul className="mt-4 text-lg list-disc list-inside">
        {getArray('statsFeatures').map((feature, index) => (
          <li key={index} dangerouslySetInnerHTML={{ __html: feature }} />
        ))}
      </ul>

      <div className="my-8">
        <div className="border-t-2 border-gray-400/50 dark:border-gray-600/50"></div>
      </div>

      <h2 className="text-2xl font-semibold mt-6" dangerouslySetInnerHTML={{ __html: t('performanceTitle') }} />
      <p className="mt-2 text-lg" dangerouslySetInnerHTML={{ __html: t('performanceDescription') }} />
      <ul className="mt-4 text-lg list-disc list-inside">
        {getArray('performanceFeatures').map((feature, index) => (
          <li key={index} dangerouslySetInnerHTML={{ __html: feature }} />
        ))}
      </ul>

      <div className="my-8">
        <div className="border-t-2 border-gray-400/50 dark:border-gray-600/50"></div>
      </div>
    </div>
  );
};

export default About;
