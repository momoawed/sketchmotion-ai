import React from 'react';
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../contexts/LanguageContext';

const Header: React.FC = () => {
  const { t } = useLanguage();

  return (
    <header className="relative text-center py-8 px-4 border-b border-gray-200 dark:border-gray-800">
      <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">
        {t('app_title')}
      </h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
        {t('app_description')}
      </p>
    </header>
  );
};

export default Header;