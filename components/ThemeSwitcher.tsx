import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon, SystemIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();

  const options = [
    { value: 'light', label: t('theme_light'), icon: <SunIcon className="w-5 h-5" /> },
    { value: 'dark', label: t('theme_dark'), icon: <MoonIcon className="w-5 h-5" /> },
    { value: 'system', label: t('theme_system'), icon: <SystemIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="flex items-center p-1 bg-gray-200 dark:bg-gray-700 rounded-full">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => setTheme(option.value as 'light' | 'dark' | 'system')}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-200 dark:focus:ring-offset-gray-700 focus:ring-blue-500 ${
            theme === option.value
              ? 'bg-white dark:bg-gray-900 text-blue-500 dark:text-blue-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
          aria-label={`Switch to ${option.label} theme`}
          title={option.label}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
};

export default ThemeSwitcher;