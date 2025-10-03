import React, { useState, useCallback } from 'react';
import { UploadIcon, XCircleIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface DropzoneProps {
  onFileUpload: (file: File) => void;
  previewUrl: string | null;
  onClear: () => void;
  promptText: string;
  fileInputId: string;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFileUpload, previewUrl, onClear, promptText, fileInputId }) => {
    const [isDragging, setIsDragging] = useState(false);
    const { t } = useLanguage();

    const handleFileChange = (files: FileList | null) => {
        if (files && files.length > 0) {
            const file = files[0];
            const acceptedTypes = ['image/png', 'image/jpeg', 'image/webp'];
            if (acceptedTypes.includes(file.type)) {
                onFileUpload(file);
            } else {
                alert(t('unsupported_file_type_alert'));
            }
        }
    };

    const onDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFileChange(e.dataTransfer.files);
    }, [handleFileChange]);

    return (
        <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-300 h-full flex flex-col justify-center items-center ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-gray-700/50' : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500'}`}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onClick={() => !previewUrl && document.getElementById(fileInputId)?.click()}
        >
            <input
                type="file"
                id={fileInputId}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={(e) => handleFileChange(e.target.files)}
            />
            {previewUrl ? (
                <>
                    <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-md object-contain" />
                    <button
                        onClick={(e) => { e.stopPropagation(); onClear(); }}
                        className="absolute top-2 right-2 p-1 bg-gray-800/50 rounded-full text-white hover:bg-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                        aria-label={t('clear')}
                        title={t('clear')}
                    >
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                    <UploadIcon className="w-10 h-10 mb-3 text-gray-400 dark:text-gray-500" />
                    <p className="font-semibold">{promptText}</p>
                    <p className="text-sm mt-1">{t('upload_formats')}</p>
                </div>
            )}
        </div>
    );
};

interface ImageUploaderProps {
  onSketchUpload: (file: File) => void;
  sketchPreviewUrl: string | null;
  onClearSketch: () => void;
  onReferenceUpload: (file: File) => void;
  referencePreviewUrl: string | null;
  onClearReference: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onSketchUpload, sketchPreviewUrl, onClearSketch,
  onReferenceUpload, referencePreviewUrl, onClearReference 
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{t('upload_files_title')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">{t('sketch_title')}</h3>
          <Dropzone
            onFileUpload={onSketchUpload}
            previewUrl={sketchPreviewUrl}
            onClear={onClearSketch}
            promptText={t('upload_prompt_sketch')}
            fileInputId="sketch-file-input"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">{t('reference_title')}</h3>
          <Dropzone
            onFileUpload={onReferenceUpload}
            previewUrl={referencePreviewUrl}
            onClear={onClearReference}
            promptText={t('upload_prompt_reference')}
            fileInputId="reference-file-input"
          />
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;