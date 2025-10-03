import React from 'react';
import { HistoryItem } from '../types';
import { DownloadIcon, FilmIcon, PhotoIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';
import { RENDER_STYLE_KEYS } from '../constants';

const downloadResource = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const HistoryItemCard: React.FC<{ item: HistoryItem }> = ({ item }) => {
    const { t } = useLanguage();
    const handleDownload = () => {
        const extension = item.type === 'video' ? 'mp4' : 'png';
        downloadResource(item.outputUrl, `ai-generated-${item.id}.${extension}`);
    };
    
    const styleKey = RENDER_STYLE_KEYS.find(key => key.replace(/_/g, ' ').toLowerCase() === item.style.toLowerCase()) || item.style;
    const translatedStyle = t(`style_${styleKey}` as any, item.style);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden group transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
            <div className="relative">
                <img src={item.imageUrl} alt={`Generated content for prompt: ${item.prompt}`} className="w-full h-48 object-cover" />
                <div className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full">
                    {item.type === 'video' ? <FilmIcon className="w-5 h-5 text-purple-300" /> : <PhotoIcon className="w-5 h-5 text-blue-300" />}
                </div>
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 group-hover:opacity-100 transition-opacity flex items-end">
                    <div className="p-4 text-white w-full">
                        <p className="text-xs font-semibold bg-gray-900/50 px-2 py-1 rounded inline-block mb-2">{translatedStyle}</p>
                        <p className="text-sm line-clamp-2" title={item.prompt}>{item.prompt}</p>
                    </div>
                </div>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-700/50 flex justify-between items-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(item.timestamp).toLocaleString()}</p>
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                    <DownloadIcon className="w-4 h-4" />
                    {t('download')}
                </button>
            </div>
        </div>
    );
};


const History: React.FC<{ history: HistoryItem[] }> = ({ history }) => {
    const { t } = useLanguage();

    if (history.length === 0) {
        return null;
    }

    return (
        <section className="container mx-auto p-4 md:p-8 mt-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200 border-b-2 border-gray-200 dark:border-gray-700 pb-2">{t('history_title')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {history.map(item => (
                    <HistoryItemCard key={item.id} item={item} />
                ))}
            </div>
        </section>
    );
};

export default History;