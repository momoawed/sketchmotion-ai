import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { generateTechnicalDrawing } from '../services/geminiService';
import { BuildingStorefrontIcon, DownloadIcon } from './icons';

interface TechnicalDrawingModalProps {
  isOpen: boolean;
  onClose: () => void;
  generatedImageUrl: string | null;
}

const downloadSvg = (svgString: string, viewName: string) => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `technical-drawing-${viewName}-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const TechnicalDrawingModal: React.FC<TechnicalDrawingModalProps> = ({ isOpen, onClose, generatedImageUrl }) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && generatedImageUrl && !svgContent && !isLoading) {
      const generate = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const result = await generateTechnicalDrawing(generatedImageUrl);
          setSvgContent(result);
        } catch (e) {
          if (e instanceof Error) {
            setError(e.message);
          } else {
            setError('An unexpected error occurred while generating the technical drawing.');
          }
        } finally {
          setIsLoading(false);
        }
      };
      generate();
    }
  }, [isOpen, generatedImageUrl, svgContent, isLoading]);

  const svgDataUrl = useMemo(() => {
    if (!svgContent) return '';
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
  }, [svgContent]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8 max-w-4xl w-full transform transition-all animate-fade-in-up max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-600/20 rounded-full">
                       <BuildingStorefrontIcon className="w-6 h-6 text-orange-400" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{t('drafting_modal_title')}</h2>
                </div>
                 <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
            </div>
            
            <div className="overflow-y-auto flex-grow pr-2 -mr-2 space-y-4">
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('drafting_modal_description')}</p>
                <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg flex items-center justify-center min-h-[400px]">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center text-center">
                            <svg className="animate-spin h-10 w-10 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">{t('calibrating_and_drafting')}</p>
                        </div>
                    )}
                    {error && (
                        <div className="p-4 text-center text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <h4 className="font-bold mb-2">{t('drafting_generation_failed')}</h4>
                        <p className="text-sm">{error}</p>
                        </div>
                    )}
                    {svgContent && !isLoading && !error && (
                        <img src={svgDataUrl} alt="Generated Technical Drawing" className="max-w-full max-h-[50vh] object-contain bg-white dark:bg-gray-800 p-2 rounded-md" />
                    )}
                </div>
                 <p className="text-xs text-gray-500 dark:text-gray-400 italic text-center px-4">{t('drafting_disclaimer')}</p>
            </div>

            <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <button
                    onClick={onClose}
                    className="px-6 py-2 text-md font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                    {t('close')}
                </button>
                 <button
                    onClick={() => downloadSvg(svgContent || '', 'front-elevation')}
                    disabled={!svgContent || isLoading}
                    className="px-6 py-2 text-md font-bold text-white bg-orange-600 rounded-lg shadow-md hover:bg-orange-700 transition-colors disabled:bg-orange-600/50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <DownloadIcon className="w-5 h-5" />
                    <span>{t('download_drawing')}</span>
                </button>
            </div>
        </div>
    </div>
  );
};

export default TechnicalDrawingModal;
