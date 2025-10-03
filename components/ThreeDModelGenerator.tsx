import React, { useState, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ModelViews } from '../types';
import { generate3DModelViews } from '../services/geminiService';
import { UploadIcon, XCircleIcon, CubeIcon, DownloadIcon } from './icons';

const downloadResource = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const ThreeDModelGenerator: React.FC = () => {
    const { t } = useLanguage();
    const [objectImage, setObjectImage] = useState<File | null>(null);
    const [objectPreviewUrl, setObjectPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedViews, setGeneratedViews] = useState<ModelViews | null>(null);
    const [selectedView, setSelectedView] = useState<string>('front');
    const [isDragging, setIsDragging] = useState(false);

    const viewOrder = ['front', 'leftSide', 'rightSide', 'back', 'top', 'isometric'];
    const viewLabels: { [key: string]: string } = {
        front: t('view_front'),
        leftSide: t('view_left_side'),
        rightSide: t('view_right_side'),
        back: t('view_back'),
        top: t('view_top'),
        isometric: t('view_isometric'),
    };

    const handleFileChange = (files: FileList | null) => {
        if (files && files.length > 0) {
            const file = files[0];
            const acceptedTypes = ['image/png', 'image/jpeg', 'image/webp'];
            if (acceptedTypes.includes(file.type)) {
                setObjectImage(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setObjectPreviewUrl(reader.result as string);
                };
                reader.readAsDataURL(file);
                setError(null);
                setGeneratedViews(null);
            } else {
                alert(t('unsupported_file_type_alert'));
            }
        }
    };
    
    const onDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }, []);
    const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }, []);
    const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); }, []);
    const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFileChange(e.dataTransfer.files);
    }, [handleFileChange]);


    const handleClear = () => {
        setObjectImage(null);
        setObjectPreviewUrl(null);
        setError(null);
        setGeneratedViews(null);
    };
    
    const handleGenerate = async () => {
        if (!objectImage) {
            setError("Please upload an object image first.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedViews(null);
        try {
            const views = await generate3DModelViews(objectImage);
            setGeneratedViews(views);
            setSelectedView('front');
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError('An unexpected error occurred while generating 3D views.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownloadView = () => {
        if (generatedViews && generatedViews[selectedView]) {
            downloadResource(generatedViews[selectedView], `view-${selectedView}-${Date.now()}.png`);
        }
    }

    return (
        <div className="mt-12">
            <h2 className="text-3xl font-bold mb-2 text-gray-800 dark:text-gray-200">{t('generate_3d_model_title')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-3xl">{t('generate_3d_model_description')}</p>

            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                    <div className="flex flex-col gap-4">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{t('object_image_label')}</h3>
                        <div
                            className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-300 min-h-[200px] flex flex-col justify-center items-center ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-gray-700/50' : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500'}`}
                            onDragEnter={onDragEnter} onDragLeave={onDragLeave} onDragOver={onDragOver} onDrop={onDrop}
                            onClick={() => !objectPreviewUrl && document.getElementById('object-file-input')?.click()}
                        >
                            <input type="file" id="object-file-input" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={(e) => handleFileChange(e.target.files)} />
                            {objectPreviewUrl ? (
                                <>
                                    <img src={objectPreviewUrl} alt="Object Preview" className="max-h-48 mx-auto rounded-md object-contain" />
                                    <button onClick={(e) => { e.stopPropagation(); handleClear(); }} className="absolute top-2 right-2 p-1 bg-gray-800/50 rounded-full text-white hover:bg-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-white" aria-label={t('clear')} title={t('clear')}>
                                        <XCircleIcon className="w-6 h-6" />
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                                    <UploadIcon className="w-10 h-10 mb-3 text-gray-400 dark:text-gray-500" />
                                    <p className="font-semibold">{t('upload_prompt_object')}</p>
                                    <p className="text-sm mt-1">{t('upload_formats')}</p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={!objectImage || isLoading}
                            className="w-full flex items-center justify-center gap-3 px-6 py-3 text-md font-bold text-white bg-green-600 rounded-lg shadow-lg hover:bg-green-700 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300"
                        >
                            <CubeIcon className={`w-6 h-6 ${isLoading ? 'animate-pulse' : ''}`} />
                            <span>{isLoading ? t('generating_3d_views') : t('generate_3d_model_button')}</span>
                        </button>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="relative bg-white/50 dark:bg-gray-900/50 rounded-lg aspect-square flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 overflow-hidden">
                           {isLoading && (
                                <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex flex-col items-center justify-center z-10 p-4 text-center">
                                    <CubeIcon className="w-16 h-16 text-green-500 animate-pulse"/>
                                    <p className="text-lg mt-4 text-green-600 dark:text-green-400 font-semibold">{t('generating_3d_views')}</p>
                                </div>
                           )}
                           {error && (
                                <div className="p-4 text-center text-red-500 dark:text-red-400">
                                    <h4 className="font-bold mb-2">{t('three_d_generation_failed')}</h4>
                                    <p className="text-sm max-w-xs mx-auto">{error}</p>
                                </div>
                           )}
                           {!isLoading && !error && !generatedViews && (
                                <p className="text-center text-gray-500 p-4">{t('three_d_placeholder')}</p>
                           )}
                           {generatedViews && generatedViews[selectedView] && (
                                <>
                                    <img src={generatedViews[selectedView]} alt={`View: ${selectedView}`} className="max-w-full max-h-full object-contain transition-all duration-300" />
                                    <button onClick={handleDownloadView} className="absolute top-3 right-3 z-20 p-2 bg-gray-200/50 dark:bg-gray-900/50 text-gray-800 dark:text-gray-300 rounded-full hover:bg-blue-600 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label={t('download_view')} title={t('download_view')}>
                                        <DownloadIcon className="w-5 h-5" />
                                    </button>
                                </>
                           )}
                        </div>
                        {generatedViews && (
                             <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                {viewOrder.map(key => generatedViews[key] ? (
                                    <div key={key} className="flex flex-col items-center gap-1.5" onClick={() => setSelectedView(key)}>
                                        <div className={`relative rounded-md overflow-hidden cursor-pointer transition-all duration-200 w-full aspect-square ${selectedView === key ? 'ring-2 ring-green-500' : 'ring-2 ring-transparent hover:ring-green-400'}`}>
                                            <img src={generatedViews[key]} alt={`Thumbnail ${key}`} className="w-full h-full object-cover" />
                                        </div>
                                        <span className={`text-xs font-medium ${selectedView === key ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>{viewLabels[key] || key}</span>
                                    </div>
                                ) : null)}
                            </div>
                        )}
                         {generatedViews && (
                             <p className="text-xs text-center text-gray-500 dark:text-gray-400 italic mt-2">{t('three_d_disclaimer')}</p>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThreeDModelGenerator;
