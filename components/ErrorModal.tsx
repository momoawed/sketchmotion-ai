import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface ErrorModalProps {
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ onClose }) => {
  const { t } = useLanguage();
  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" 
        aria-modal="true" 
        role="dialog"
    >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-lg w-full transform transition-all animate-fade-in-up">
            <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-600/20 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">{t('quota_error_title')}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-center">
                {t('quota_error_message')}
            </p>

            <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg text-sm text-gray-700 dark:text-gray-300 space-y-3 text-start">
                <p>
                    <strong>{t('quota_error_what_it_means_title')}</strong>
                    <br />
                    {t('quota_error_what_it_means_body')}
                </p>
                <p>
                    <strong>{t('quota_error_how_to_fix_title')}</strong>
                    <br />
                    {t('quota_error_how_to_fix_body')}
                </p>
            </div>
            
            <div className="flex justify-center mt-8">
                <button
                    onClick={onClose}
                    className="px-8 py-3 text-md font-bold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
                >
                    {t('i_understand')}
                </button>
            </div>
        </div>
    </div>
  );
};

export default ErrorModal;