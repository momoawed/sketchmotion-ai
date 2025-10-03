import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { generateElevationSketch } from '../services/geminiService';
import { PencilRulerIcon, DownloadIcon } from './icons';

interface ElevationModalProps {
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
    link.download = `elevation-sketch-${viewName}-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const SketchView: React.FC<{ title: string; svgCode: string | null; onDownload: () => void; }> = ({ title, svgCode, onDownload }) => {
    const { t } = useLanguage();
    const svgDataUrl = useMemo(() => {
        if (!svgCode) return '';
        // FIX: Ensure special characters in SVG code are properly encoded for the data URL.
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgCode)}`;
    }, [svgCode]);

    return (
        <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg flex flex-col gap-3">
            <h4 className="text-lg font-semibold text-center text-gray-800 dark:text-gray-200">{title}</h4>
            <div className="flex-grow flex items-center justify-center bg-white dark:bg-gray-800 rounded-md aspect-square overflow-hidden border border-gray-200 dark:border-gray-700">
                {svgCode ? (
                    <img src={svgDataUrl} alt={`${title} sketch`} className="max-w-full max-h-full object-contain p-2" />
                ) : <div className="text-sm text-gray-400">{t('generating')}</div>}
            </div>
            <button
                onClick={onDownload}
                disabled={!svgCode}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
            >
                <DownloadIcon className="w-4 h-4" />
                <span>{t('download_svg')}</span>
            </button>
        </div>
    );
};

const ElevationModal: React.FC<ElevationModalProps> = ({ isOpen, onClose, generatedImageUrl }) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sketches, setSketches] = useState<{ front: string | null; left: string | null; top: string | null }>({ front: null, left: null, top: null });

  useEffect(() => {
    if (isOpen && generatedImageUrl && !sketches.front && !isLoading) {
      const generate = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const result = await generateElevationSketch(generatedImageUrl);
          setSketches(result);
        } catch (e) {
          if (e instanceof Error) {
            setError(e.message);
          } else {
            setError('An unexpected error occurred while generating sketches.');
          }
        } finally {
          setIsLoading(false);
        }
      };
      generate();
    }
  }, [isOpen, generatedImageUrl, sketches.front, isLoading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8 max-w-4xl w-full transform transition-all animate-fade-in-up max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600/20 rounded-full">
                       <PencilRulerIcon className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{t('elevation_sketch_modal_title')}</h2>
                </div>
                 <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
            </div>
            
            <div className="overflow-y-auto flex-grow pr-2 -mr-2 space-y-6">
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('elevation_sketch_modal_description')}</p>
                 {isLoading && (
                    <div className="flex flex-col items-center justify-center h-64">
                        <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">{t('generating_sketch')}</p>
                    </div>
                )}
                {error && (
                    <div className="p-4 text-center text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <h4 className="font-bold mb-2">{t('sketch_generation_failed')}</h4>
                      <p className="text-sm">{error}</p>
                    </div>
                )}
                {!isLoading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <SketchView title={t('view_front')} svgCode={sketches.front} onDownload={() => downloadSvg(sketches.front || '', 'front')} />
                        <SketchView title={t('view_left')} svgCode={sketches.left} onDownload={() => downloadSvg(sketches.left || '', 'left')} />
                        <SketchView title={t('view_top')} svgCode={sketches.top} onDownload={() => downloadSvg(sketches.top || '', 'top')} />
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <button
                    onClick={onClose}
                    className="px-6 py-2 text-md font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                    {t('close')}
                </button>
            </div>
        </div>
    </div>
  );
};

export default ElevationModal;