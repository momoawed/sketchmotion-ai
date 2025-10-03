import React from 'react';
import { useLanguage, Language } from '../contexts/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const options: { value: Language; label: string }[] = [
    { value: 'en', label: 'EN' },
    { value: 'ar', label: 'AR' },
  ];

  return (
    <div className="flex items-center p-1 bg-gray-200 dark:bg-gray-700 rounded-full">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => setLanguage(option.value)}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-200 dark:focus:ring-offset-gray-700 focus:ring-blue-500 ${
            language === option.value
              ? 'bg-white dark:bg-gray-900 text-blue-500 dark:text-blue-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
          aria-label={`Switch to ${option.label} language`}
          title={`Switch to ${option.label === 'EN' ? 'English' : 'Arabic'}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
