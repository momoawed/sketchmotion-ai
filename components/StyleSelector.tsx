import React from 'react';
import { RENDER_STYLE_KEYS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

interface StyleSelectorProps {
  selectedStyle: string;
  setSelectedStyle: (style: string) => void;
  isLoading: boolean;
  numberOfVariations: number;
  setNumberOfVariations: (n: number) => void;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ 
    selectedStyle, 
    setSelectedStyle, 
    isLoading,
    numberOfVariations,
    setNumberOfVariations,
}) => {
  const { t } = useLanguage();

  const variationOptions = [
      { value: 1, label: t('variations_1') },
      { value: 2, label: t('variations_2') },
      { value: 4, label: t('variations_4') }
  ];

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{t('select_style_title')}</h2>
            <div className="flex flex-wrap gap-3">
                {RENDER_STYLE_KEYS.map((styleKey) => (
                <button
                    key={styleKey}
                    onClick={() => setSelectedStyle(styleKey)}
                    disabled={isLoading}
                    className={`px-4 py-2 text-md font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedStyle === styleKey
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                    {t(`style_${styleKey}` as any, styleKey)}
                </button>
                ))}
            </div>
        </div>
        <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{t('variations_title')}</h2>
             <div className="flex flex-wrap gap-3">
                {variationOptions.map(option => (
                    <button
                        key={option.value}
                        onClick={() => setNumberOfVariations(option.value)}
                        disabled={isLoading}
                        className={`px-4 py-2 text-md font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                            numberOfVariations === option.value
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default StyleSelector;
